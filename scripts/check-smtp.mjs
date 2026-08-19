/**
 * Diagnostic SMTP : vérifie la connexion, l'authentification, puis envoie un message d'essai.
 *
 *   pnpm email:test                      # connexion + authentification seulement
 *   pnpm email:test -- moi@exemple.com   # + envoi d'un message d'essai à cette adresse
 *
 * Les variables sont lues dans .env.local via --env-file (voir package.json).
 * Aucun secret n'est affiché : seuls l'hôte, le port et l'utilisateur le sont.
 */
import { existsSync } from 'node:fs'

import nodemailer from 'nodemailer'

const REQUIRED = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']

const missing = REQUIRED.filter((name) => !process.env[name]?.trim())
if (missing.length > 0) {
  console.error(`\n✗ Variables manquantes ou vides : ${missing.join(', ')}`)
  console.error(
    existsSync('.env.local')
      ? '  Complétez ces lignes dans .env.local.\n'
      : '  Copiez .env.example en .env.local et renseignez-les.\n',
  )
  process.exit(1)
}

const port = Number(process.env.SMTP_PORT)
if (!Number.isInteger(port) || port <= 0) {
  console.error(`\n✗ SMTP_PORT invalide : « ${process.env.SMTP_PORT} ». Attendu 465, 587 ou 25.\n`)
  process.exit(1)
}

const secure = port === 465
console.log('\nConfiguration lue :')
console.log(`  hôte         ${process.env.SMTP_HOST}`)
console.log(`  port         ${port} (${secure ? 'TLS implicite' : 'STARTTLS'})`)
console.log(`  utilisateur  ${process.env.SMTP_USER}`)
console.log(`  expéditeur   ${process.env.SMTP_FROM}`)
for (const [label, name] of [
  ['Investments', 'SMTP_FROM_INVESTMENTS'],
  ['Advisors', 'SMTP_FROM_ADVISORS'],
]) {
  const value = process.env[name]?.trim()
  if (value) console.log(`   ↳ ${label.padEnd(12)}${value}`)
}
const redirect = process.env.SMTP_TO?.trim()
console.log(
  `  destinataire ${redirect ? `${redirect} (REDIRECTION ACTIVE)` : 'adresse de l’entité active'}`,
)
if (redirect) {
  console.log('               ⚠ SMTP_TO est renseigné : à vider avant la mise en ligne.')
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
})

/**
 * Traduit les codes d'erreur SMTP en cause probable et geste correctif.
 *
 * Les mentions IONOS correspondent au fournisseur retenu pour ce projet : la messagerie du client
 * y est hébergée, avec les deux domaines.
 */
function explain(error) {
  const code = error?.code ?? error?.responseCode
  const hints = {
    EAUTH:
      'Identifiants refusés. Chez IONOS, SMTP_USER est l’adresse e-mail COMPLÈTE de la boîte ' +
      '(par exemple no-reply@argentum-investments.ch), pas un login abrégé, et le mot de passe ' +
      'est celui de la boîte, pas celui du compte client IONOS.',
    ECONNREFUSED: 'Connexion refusée. Hôte ou port erroné, ou port bloqué par le réseau.',
    ETIMEDOUT:
      'Délai dépassé, souvent un port sortant filtré. Passez de 465 à 587, ou l’inverse. ' +
      'IONOS bloque le port 25 : ne l’utilisez pas.',
    ENOTFOUND: 'Hôte introuvable. Chez IONOS, l’hôte est smtp.ionos.com — vérifiez l’orthographe.',
    ESOCKET:
      'Négociation TLS échouée. Le port 465 exige TLS implicite, le 587 STARTTLS : vérifiez que ' +
      'SMTP_PORT correspond bien au mode attendu.',
    EENVELOPE:
      'Enveloppe refusée. SMTP_FROM doit être une boîte qui existe réellement sur le compte ' +
      'IONOS ; un expéditeur inconnu du serveur est rejeté.',
  }
  return hints[code] ?? `Code : ${code ?? 'inconnu'}`
}

try {
  await transporter.verify()
  console.log('\n✓ Connexion et authentification acceptées.')
} catch (error) {
  console.error('\n✗ Échec de la connexion.')
  console.error(`  ${error.message}`)
  console.error(`  → ${explain(error)}\n`)
  process.exit(1)
}

const target = process.argv[2]
if (!target) {
  console.log('\nPour envoyer un message d’essai :')
  console.log('  pnpm email:test -- votre@adresse.tld\n')
  process.exit(0)
}

try {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: target,
    subject: 'Argentum — essai de configuration SMTP',
    text: [
      'Ce message confirme que l’acheminement SMTP du formulaire de contact fonctionne.',
      '',
      `Hôte : ${process.env.SMTP_HOST}:${port}`,
      `Expéditeur : ${process.env.SMTP_FROM}`,
    ].join('\n'),
  })
  console.log(`\n✓ Message d’essai envoyé à ${target}`)
  console.log(`  identifiant : ${info.messageId}`)
  if (info.rejected?.length) console.log(`  rejeté pour : ${info.rejected.join(', ')}`)
  console.log('  Vérifiez la boîte de réception, et le dossier indésirables.\n')
} catch (error) {
  console.error('\n✗ Envoi refusé alors que l’authentification a réussi.')
  console.error(`  ${error.message}`)
  console.error(`  → ${explain(error)}\n`)
  process.exit(1)
}
