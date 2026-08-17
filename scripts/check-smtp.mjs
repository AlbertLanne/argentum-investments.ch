/**
 * Diagnostic SMTP : vérifie la connexion, l'authentification, puis envoie un message d'essai.
 *
 *   pnpm email:test                      # connexion + authentification seulement
 *   pnpm email:test -- moi@exemple.com   # + envoi d'un message d'essai à cette adresse
 *
 * Les variables sont lues dans .env.local via --env-file (voir package.json).
 * Aucun secret n'est affiché : seuls l'hôte, le port et l'utilisateur le sont.
 */
import nodemailer from 'nodemailer'

const REQUIRED = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM']

const missing = REQUIRED.filter((name) => !process.env[name])
if (missing.length > 0) {
  console.error(`\n✗ Variables manquantes : ${missing.join(', ')}`)
  console.error('  Copiez .env.example en .env.local et renseignez-les.\n')
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
console.log(`  destinataire ${process.env.SMTP_TO ?? 'adresse de l’entité active (pas de redirection)'}`)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  connectionTimeout: 15_000,
  greetingTimeout: 15_000,
  socketTimeout: 20_000,
})

/** Traduit les codes d'erreur SMTP en cause probable et geste correctif. */
function explain(error) {
  const code = error?.code ?? error?.responseCode
  const hints = {
    EAUTH: 'Identifiants refusés. Vérifiez SMTP_USER et SMTP_PASSWORD. Sur Gmail et Outlook, un mot de passe d’application est requis, pas le mot de passe du compte.',
    ECONNREFUSED: 'Connexion refusée. Hôte ou port erroné, ou port bloqué par le réseau.',
    ETIMEDOUT: 'Délai dépassé. Souvent un port sortant filtré : essayez 587 si vous êtes en 465, ou l’inverse.',
    ENOTFOUND: 'Hôte introuvable. Vérifiez l’orthographe de SMTP_HOST.',
    ESOCKET: 'Négociation TLS échouée. Le port 465 exige TLS implicite, le 587 STARTTLS : vérifiez la correspondance.',
    EENVELOPE: 'Enveloppe refusée. SMTP_FROM doit appartenir au domaine autorisé par le serveur.',
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
