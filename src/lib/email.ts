import nodemailer, { type Transporter } from 'nodemailer'

/**
 * Envoi des soumissions de projet par SMTP.
 *
 * Le transporteur est créé à la demande, pas à l'import : sans cela, un build sans variables
 * d'environnement échouerait alors que le formulaire est la seule partie du site qui en dépend.
 */

const REQUIRED_VARS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'] as const

export class EmailNotConfiguredError extends Error {
  constructor(missing: readonly string[]) {
    super(`Configuration SMTP incomplète : ${missing.join(', ')}`)
    this.name = 'EmailNotConfiguredError'
  }
}

let cached: Transporter | null = null

export function getTransporter(): Transporter {
  if (cached) return cached

  const missing = REQUIRED_VARS.filter((name) => !process.env[name])
  if (missing.length > 0) throw new EmailNotConfiguredError(missing)

  const port = Number(process.env.SMTP_PORT)
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 est le port TLS implicite ; 587 passe par STARTTLS.
    secure: port === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
  })
  return cached
}

export const SMTP_FROM = () => process.env.SMTP_FROM!

/** Neutralise les caractères actifs avant insertion dans le corps HTML de l'e-mail. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export type MailField = { label: string; value: string }

export function buildEnquiryText(title: string, fields: MailField[]): string {
  const lines = fields.map((field) => `${field.label} : ${field.value}`)
  return [title, '', ...lines].join('\n')
}

export function buildEnquiryHtml(title: string, fields: MailField[]): string {
  const rows = fields
    .map(
      (field) => `<tr>
      <th align="left" style="padding:10px 16px 10px 0;vertical-align:top;color:#4a5878;
        font:500 13px/1.5 Helvetica,Arial,sans-serif;white-space:nowrap">${escapeHtml(field.label)}</th>
      <td style="padding:10px 0;color:#0d1b3d;font:400 14px/1.7 Helvetica,Arial,sans-serif;
        border-bottom:1px solid #e6ecf6">${escapeHtml(field.value).replaceAll('\n', '<br>')}</td>
    </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="fr"><body style="margin:0;background:#f4f7fc;padding:32px 16px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e6ecf6">
    <tr><td style="background:#0d1b3d;padding:24px 32px">
      <p style="margin:0;color:#ffffff;font:400 19px/1.3 Georgia,serif">${escapeHtml(title)}</p>
    </td></tr>
    <tr><td style="padding:24px 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
  </table>
</body></html>`
}
