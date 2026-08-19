import nodemailer, { type Transporter } from 'nodemailer'

import type { Brand } from '@/brand/brands'

/**
 * Acheminement SMTP des soumissions de projet.
 *
 * Le transporteur est créé à la demande, pas à l'import : sans cela, un build sans variables
 * d'environnement échouerait alors que le formulaire est la seule partie du site qui en dépend.
 */

const REQUIRED_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'] as const

/** Expéditeur propre à chaque entité, quand les deux domaines ont leur propre boîte. */
const FROM_BY_BRAND: Record<string, string> = {
  investments: 'SMTP_FROM_INVESTMENTS',
  advisors: 'SMTP_FROM_ADVISORS',
}

export class EmailNotConfiguredError extends Error {
  readonly missing: readonly string[]

  constructor(missing: readonly string[]) {
    super(`Configuration SMTP incomplète : ${missing.join(', ')}`)
    this.name = 'EmailNotConfiguredError'
    this.missing = missing
  }
}

export function missingSmtpVars(): string[] {
  return REQUIRED_VARS.filter((name) => !process.env[name])
}

let cached: Transporter | null = null

export function getTransporter(): Transporter {
  if (cached) return cached

  const missing = missingSmtpVars()
  if (missing.length > 0) throw new EmailNotConfiguredError(missing)

  const port = Number(process.env.SMTP_PORT)
  if (!Number.isInteger(port) || port <= 0) {
    throw new EmailNotConfiguredError(['SMTP_PORT (doit être un entier, p. ex. 465 ou 587)'])
  }

  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 est le port TLS implicite ; 587 et 25 passent par STARTTLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
    // Un formulaire ne doit jamais faire attendre le visiteur sur un serveur muet.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })
  return cached
}

/** Vérifie la connexion et l'authentification, sans envoyer de message. */
export async function verifyTransporter(): Promise<void> {
  await getTransporter().verify()
}

/**
 * Expéditeur des messages, propre à l'entité active quand il est défini.
 *
 * Les deux entités ont chacune leur domaine chez IONOS. Envoyer l'accusé de réception d'une
 * demande Advisors depuis une adresse `@argentum-investments.ch` désaligne l'expéditeur de la
 * marque affichée, et fait échouer les contrôles SPF et DMARC du domaine d'envoi.
 *
 * `SMTP_FROM` reste le repli : un seul expéditeur suffit tant que le client n'a qu'une boîte.
 */
export function smtpFrom(brand: Brand): string {
  const perBrand = process.env[FROM_BY_BRAND[brand.key]]?.trim()
  return perBrand || process.env.SMTP_FROM!
}

/**
 * Détermine la boîte qui reçoit les demandes.
 *
 * En principe l'adresse de l'entité active — une demande envoyée depuis le site Advisors arrive
 * chez Advisors. `SMTP_TO` permet de tout dérouter vers une seule boîte : indispensable en
 * préproduction, où l'on ne veut pas envoyer de vrais e-mails au client.
 */
export function resolveRecipient(brand: Brand): { to: string; redirected: boolean } {
  const override = process.env.SMTP_TO?.trim()
  if (override) return { to: override, redirected: true }
  return { to: brand.email, redirected: false }
}

/** Neutralise les caractères actifs avant insertion dans le corps HTML de l'e-mail. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/**
 * Retire les caractères de contrôle d'une valeur destinée à un en-tête d'e-mail.
 *
 * Un retour à la ligne dans un sujet ou un `Reply-To` permettrait d'injecter des en-têtes
 * supplémentaires. Les champs viennent d'un formulaire public : ils sont validés par Zod, mais
 * le nettoyage reste fait ici, au plus près de l'usage.
 */
export function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').trim()
}

export type MailField = { label: string; value: string }

const SHELL_STYLES = {
  page: 'margin:0;background:#f4f7fc;padding:32px 16px',
  card: 'max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6ecf6',
  header: 'background:#0d1b3d;padding:24px 32px',
  title: 'margin:0;color:#ffffff;font:400 19px/1.3 Georgia,serif',
  body: 'padding:24px 32px;color:#0d1b3d;font:400 14px/1.7 Helvetica,Arial,sans-serif',
  foot: 'padding:16px 32px 24px;color:#4a5878;font:400 12px/1.6 Helvetica,Arial,sans-serif',
}

/** Gabarit commun aux deux messages, pour rester lisible dans tous les clients de messagerie. */
function shell(title: string, inner: string, footer?: string): string {
  return `<!doctype html>
<html lang="fr"><body style="${SHELL_STYLES.page}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${SHELL_STYLES.card}">
    <tr><td style="${SHELL_STYLES.header}">
      <p style="${SHELL_STYLES.title}">${escapeHtml(title)}</p>
    </td></tr>
    <tr><td style="${SHELL_STYLES.body}">${inner}</td></tr>
    ${footer ? `<tr><td style="${SHELL_STYLES.foot}">${footer}</td></tr>` : ''}
  </table>
</body></html>`
}

export function buildEnquiryText(title: string, fields: MailField[]): string {
  return [title, '', ...fields.map((field) => `${field.label} : ${field.value}`)].join('\n')
}

export function buildEnquiryHtml(title: string, fields: MailField[]): string {
  const rows = fields
    .map(
      (field) => `<tr>
      <th align="left" style="padding:10px 16px 10px 0;vertical-align:top;color:#4a5878;
        font:500 13px/1.5 Helvetica,Arial,sans-serif;white-space:nowrap">${escapeHtml(field.label)}</th>
      <td style="padding:10px 0;border-bottom:1px solid #e6ecf6">${escapeHtml(field.value).replaceAll('\n', '<br>')}</td>
    </tr>`,
    )
    .join('')

  return shell(
    title,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>`,
  )
}

/**
 * Accusé de réception envoyé au visiteur.
 *
 * Message strictement transactionnel : il confirme la réception et reprend le délai d'évaluation
 * que le client annonce lui-même dans ses fiches. Rien n'y est promis au-delà.
 */
export function buildAcknowledgement(brand: Brand, firstName: string, company: string) {
  const subject = `${brand.legalName} — réception de votre demande`

  const text = [
    `Bonjour ${firstName},`,
    '',
    `Nous confirmons la réception de votre demande concernant « ${company} ».`,
    '',
    'Nous procédons à une première évaluation afin de déterminer si le projet correspond au',
    'profil d’investissement recherché. Sous réserve de la transmission complète des informations',
    'requises, l’évaluation est généralement réalisée dans un délai de trois à quatre semaines.',
    '',
    `Pour compléter votre dossier, vous pouvez répondre à ce message ou écrire à ${brand.email}.`,
    '',
    brand.legalName,
    ...(brand.address
      ? [
          brand.address.street,
          `${brand.address.postalCode} ${brand.address.city}, ${brand.address.country}`,
        ]
      : []),
    '',
    `${brand.legalName} n’est ni une banque ni un établissement de crédit. La soumission d’un`,
    'projet ne confère aucun droit à un financement et ne constitue ni un engagement ni une',
    'garantie de mise à disposition de capitaux.',
  ].join('\n')

  const address = brand.address
    ? `${escapeHtml(brand.address.street)}<br>${escapeHtml(brand.address.postalCode)} ${escapeHtml(brand.address.city)}, ${escapeHtml(brand.address.country)}`
    : ''

  const html = shell(
    subject,
    `<p style="margin:0 0 16px">Bonjour ${escapeHtml(firstName)},</p>
     <p style="margin:0 0 16px">Nous confirmons la réception de votre demande concernant
       « ${escapeHtml(company)} ».</p>
     <p style="margin:0 0 16px">Nous procédons à une première évaluation afin de déterminer si le
       projet correspond au profil d’investissement recherché. Sous réserve de la transmission
       complète des informations requises, l’évaluation est généralement réalisée dans un délai de
       trois à quatre semaines.</p>
     <p style="margin:0">Pour compléter votre dossier, vous pouvez répondre à ce message ou écrire à
       <a href="mailto:${brand.email}" style="color:#1e3a8a">${escapeHtml(brand.email)}</a>.</p>`,
    `<p style="margin:0 0 12px"><strong style="color:#0d1b3d">${escapeHtml(brand.legalName)}</strong><br>${address}</p>
     <p style="margin:0">${escapeHtml(brand.legalName)} n’est ni une banque ni un établissement de
       crédit. La soumission d’un projet ne confère aucun droit à un financement et ne constitue ni
       un engagement ni une garantie de mise à disposition de capitaux.</p>`,
  )

  return { subject, text, html }
}
