/**
 * Vérifie la bascule d'entité de bout en bout, dans un vrai navigateur.
 *
 * Trois choses doivent se produire au clic : le thème change immédiatement, la raison sociale
 * change dans le corps du texte, et le choix survit à une navigation puis à un rechargement.
 *
 * Usage : node scripts/check-brand-switch.mjs [url]
 */
import { chromium } from 'playwright'

const BASE = process.argv[2] ?? 'http://localhost:3000'

const checks = []
function check(label, actual, expected) {
  const ok = actual === expected
  checks.push({ label, ok, actual, expected })
  console.log(`${ok ? '  ok  ' : ' ÉCHEC'} ${label}${ok ? '' : ` — attendu « ${expected} », obtenu « ${actual} »`}`)
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'fr-CH' })
const page = await context.newPage()

const brandAttr = () => page.getAttribute('html', 'data-brand')
const legalNames = async () => {
  // La section « deux sociétés » nomme volontairement les deux entités : on mesure le footer,
  // qui ne doit porter que celle qui est active.
  const footer = await page.locator('footer').innerText()
  return {
    investments: (footer.match(/Argentum Investments SA/g) ?? []).length,
    advisors: (footer.match(/Argentum Advisors SA/g) ?? []).length,
  }
}

// --- État initial ----------------------------------------------------------
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
check('état initial : thème', await brandAttr(), 'investments')
const before = await legalNames()
check('état initial : footer nomme Investments', before.investments > 0, true)
check('état initial : footer ne nomme pas Advisors', before.advisors, 0)
check(
  'état initial : registre affiché',
  (await page.locator('footer').innerText()).includes('CH-660.0.244.019-9'),
  true,
)
check('état initial : UID affiché', (await page.locator('footer').innerText()).includes('CHE-134.341.014'), true)

// --- Bascule vers Advisors -------------------------------------------------
await page.getByRole('button', { name: 'Advisors', exact: true }).first().click()
await page.waitForFunction(() => document.documentElement.dataset.brand === 'advisors')
check('après clic : thème basculé', await brandAttr(), 'advisors')

await page.waitForFunction(
  () => !document.querySelector('footer')?.innerText.includes('Argentum Investments SA'),
  null,
  { timeout: 10000 },
)
const after = await legalNames()
check('après clic : footer nomme Advisors', after.advisors > 0, true)
check('après clic : footer ne nomme plus Investments', after.investments, 0)

const footerText = await page.locator('footer').innerText()
check('après clic : registre Advisors', footerText.includes('CH-660.0.242.019-2'), true)
check('après clic : UID masqué faute de donnée', footerText.includes('CHE-'), false)
check('après clic : adresse masquée faute de donnée', footerText.includes('Marc-Doret'), false)
check('après clic : e-mail Advisors', footerText.includes('contact@argentum-advisors.ch'), true)

// --- Persistance sur une autre page ---------------------------------------
await page.goto(`${BASE}/finance/capital-investissement`, { waitUntil: 'networkidle' })
check('navigation : thème conservé', await brandAttr(), 'advisors')
const bodyText = await page.locator('main').innerText()
check('navigation : contenu au nom d’Advisors', bodyText.includes('Argentum Advisors SA'), true)
check('navigation : plus aucune mention d’Investments', bodyText.includes('Argentum Investments SA'), false)

// --- Persistance après rechargement --------------------------------------
await page.reload({ waitUntil: 'networkidle' })
check('rechargement : thème conservé', await brandAttr(), 'advisors')

// --- Retour vers Investments ---------------------------------------------
await page.getByRole('button', { name: 'Investments', exact: true }).first().click()
await page.waitForFunction(() => document.documentElement.dataset.brand === 'investments')
await page.waitForFunction(
  () => document.querySelector('footer')?.innerText.includes('Argentum Investments SA'),
  null,
  { timeout: 10000 },
)
check('retour : thème', await brandAttr(), 'investments')
check(
  'retour : footer nomme Investments',
  (await page.locator('footer').innerText()).includes('Argentum Investments SA'),
  true,
)

await browser.close()

const failed = checks.filter((c) => !c.ok)
console.log(`\n${checks.length - failed.length}/${checks.length} vérifications passées`)
if (failed.length) process.exit(1)
