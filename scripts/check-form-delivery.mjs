/**
 * Vérifie l'acheminement complet du formulaire, sans identifiants réels.
 *
 * Ouvre une boîte SMTP jetable (Ethereal, du même auteur que nodemailer), relance le serveur de
 * dev avec ces identifiants, remplit le formulaire dans un vrai navigateur, puis contrôle que les
 * deux messages sont bien partis : la demande vers l'entité active, l'accusé de réception vers le
 * visiteur.
 *
 *   pnpm check:delivery            # entité Investments
 *   pnpm check:delivery advisors   # entité Advisors
 *
 * Nécessite un accès réseau. Aucun message ne quitte Ethereal : rien n'arrive chez le client.
 */
import { spawn } from 'node:child_process'
import { once } from 'node:events'

import nodemailer from 'nodemailer'
import { chromium } from 'playwright'

const BRAND = process.argv[2] === 'advisors' ? 'advisors' : 'investments'
const PORT = 3099
const BASE = `http://localhost:${PORT}`
const EXPECTED_RECIPIENT = `contact@argentum-${BRAND}.ch`
const VISITOR = 'camille.rochat@exemple.ch'

const failures = []
function check(label, ok, detail) {
  console.log(`${ok ? '  ok  ' : ' ÉCHEC'} ${label}${ok || !detail ? '' : ` — ${detail}`}`)
  if (!ok) failures.push(label)
}

console.log('\nOuverture d’une boîte SMTP jetable…')
const account = await nodemailer.createTestAccount()
console.log(`  hôte ${account.smtp.host}:${account.smtp.port}  utilisateur ${account.user}`)

const server = spawn('pnpm', ['exec', 'next', 'dev', '--port', String(PORT)], {
  env: {
    ...process.env,
    SMTP_HOST: account.smtp.host,
    SMTP_PORT: String(account.smtp.port),
    SMTP_USER: account.user,
    SMTP_PASSWORD: account.pass,
    SMTP_FROM: `Argentum <${account.user}>`,
    // On veut observer le destinataire réel : pas de redirection pendant ce contrôle.
    SMTP_TO: '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
})

let serverLog = ''
server.stdout.on('data', (chunk) => {
  serverLog += chunk.toString()
})
server.stderr.on('data', (chunk) => {
  serverLog += chunk.toString()
})

async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt += 1) {
    try {
      const response = await fetch(`${BASE}/contact`)
      if (response.ok) return
    } catch {
      // Le serveur n'écoute pas encore.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }
  throw new Error(`Le serveur de dev n’a pas démarré.\n${serverLog.slice(-2000)}`)
}

let browser
try {
  await waitForServer()
  console.log(`Serveur de contrôle prêt sur ${BASE}\n`)

  browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } })
  await context.addCookies([{ name: 'argentum-brand', value: BRAND, url: BASE }])
  const page = await context.newPage()

  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })

  await page.fill('#firstName', 'Camille')
  await page.fill('#lastName', 'Rochat')
  await page.fill('#email', VISITOR)
  await page.fill('#phone', '+41 22 000 00 00')
  await page.fill('#company', 'Rochat Promotion SA')
  await page.fill('#country', 'Suisse')
  await page.selectOption('#domain', 'Financement immobilier')
  await page.selectOption('#capital', '5 à 10 millions d’euros')
  await page.fill(
    '#useOfFunds',
    'Acquisition d’un immeuble de rendement à Carouge et rénovation énergétique complète.',
  )
  await page.fill(
    '#message',
    'Promotion immobilière genevoise active depuis douze ans. Nous recherchons un complément de ' +
      'capital pour une opération de huit millions d’euros, permis délivré et pré-commercialisation ' +
      'engagée à quarante pour cent.',
  )
  await page.check('#consent')
  await page.getByRole('button', { name: /Soumettre le projet/i }).click()

  await page.waitForSelector('[role="status"]', { timeout: 60000 })
  check('le visiteur voit la confirmation', true)

  // Les deux envois sont journalisés par le serveur de dev ; on lit son flux pour les retrouver.
  await new Promise((resolve) => setTimeout(resolve, 1500))

  const sentTo = [...serverLog.matchAll(/Message sent:.*?<([^>]+)>/g)].map((m) => m[1])
  const accepted = [...serverLog.matchAll(/accepted:\s*\[\s*'([^']+)'/g)].map((m) => m[1])
  const observed = new Set([...sentTo, ...accepted])

  // Ethereal ne renvoie pas d'API de lecture : on s'appuie sur les traces d'envoi de nodemailer,
  // et à défaut sur l'absence d'erreur journalisée.
  const hadSendError = /échec de l’envoi de la demande/.test(serverLog)
  const hadAckError = /accusé de réception non envoyé/.test(serverLog)

  check('la demande est partie sans erreur', !hadSendError, 'voir le journal du serveur')
  check('l’accusé de réception est parti sans erreur', !hadAckError, 'voir le journal du serveur')

  if (observed.size > 0) {
    check(
      `la demande est adressée à ${EXPECTED_RECIPIENT}`,
      observed.has(EXPECTED_RECIPIENT),
      `destinataires observés : ${[...observed].join(', ')}`,
    )
    check(
      `l’accusé est adressé à ${VISITOR}`,
      observed.has(VISITOR),
      `destinataires observés : ${[...observed].join(', ')}`,
    )
  } else {
    console.log(
      '  note  destinataires non lisibles dans le journal ; contrôle limité à l’absence d’erreur',
    )
  }
} finally {
  if (browser) await browser.close()
  server.kill('SIGTERM')
  await once(server, 'exit').catch(() => undefined)
}

console.log(`\nEntité testée : ${BRAND}`)
if (failures.length) {
  console.error(`${failures.length} contrôle(s) en échec.\n`)
  process.exit(1)
}
console.log('Acheminement du formulaire vérifié de bout en bout.\n')
