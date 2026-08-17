import { chromium } from 'playwright'

const OUT = process.argv[2]
const BASE = 'http://localhost:3000'

const SHOTS = [
  { name: '01-accueil-investments', path: '/', brand: 'investments', full: false },
  { name: '02-accueil-investments-full', path: '/', brand: 'investments', full: true },
  { name: '03-accueil-advisors', path: '/', brand: 'advisors', full: false },
  { name: '04-accueil-advisors-full', path: '/', brand: 'advisors', full: true },
  { name: '05-finance-hub', path: '/finance', brand: 'investments', full: true },
  { name: '06-finance-page', path: '/finance/financement-immobilier', brand: 'investments', full: true },
  { name: '07-finance-page-advisors', path: '/finance/financement-immobilier', brand: 'advisors', full: true },
  { name: '08-contact', path: '/contact', brand: 'investments', full: true },
  { name: '09-impressum-adv', path: '/impressum', brand: 'advisors', full: true },
  { name: '10-discretion', path: '/discretion', brand: 'investments', full: false },
  { name: '11-equipe', path: '/notre-equipe', brand: 'investments', full: true },
  { name: '12-services', path: '/services', brand: 'investments', full: false },
  { name: '13-mobile-accueil', path: '/', brand: 'investments', full: false, mobile: true },
  { name: '14-mobile-finance', path: '/finance', brand: 'advisors', full: true, mobile: true },
]

const browser = await chromium.launch()
const errors = []

for (const shot of SHOTS) {
  const context = await browser.newContext({
    viewport: shot.mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: 'fr-CH',
  })
  await context.addCookies([
    { name: 'argentum-brand', value: shot.brand, url: BASE },
  ])
  const page = await context.newPage()
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`${shot.name}: ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`${shot.name}: ${err.message}`))

  await page.goto(BASE + shot.path, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(900)
  await page.screenshot({ path: `${OUT}/${shot.name}.png`, fullPage: shot.full })
  await context.close()
  console.log('ok', shot.name)
}

await browser.close()

if (errors.length) {
  console.log('\n--- erreurs console ---')
  for (const line of errors) console.log(line)
} else {
  console.log('\naucune erreur console')
}
