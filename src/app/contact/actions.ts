'use server'

import { headers } from 'next/headers'

import { getBrand } from '@/brand/resolve'
import { projectEnquirySchema, type EnquiryState } from '@/domain/project-enquiry'
import {
  buildEnquiryHtml,
  buildEnquiryText,
  EmailNotConfiguredError,
  getTransporter,
  SMTP_FROM,
  type MailField,
} from '@/lib/email'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

/**
 * Limitation en mémoire du processus.
 *
 * Suffisante contre un envoi répété depuis un même poste. Elle ne survit pas à un redémarrage
 * et n'est pas partagée entre instances : sur un hébergement multi-instances, la remplacer par
 * un compteur externe.
 */
const attempts = new Map<string, { count: number; firstAt: number }>()

function withinRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now - entry.firstAt > RATE_WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count += 1
  return true
}

async function clientKey(): Promise<string> {
  const headerStore = await headers()
  return (
    headerStore.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headerStore.get('x-real-ip') ??
    'inconnu'
  )
}

/**
 * Traite une soumission de projet.
 *
 * Le destinataire suit l'entité active : une demande envoyée depuis le site Advisors arrive sur
 * contact@argentum-advisors.ch, avec la raison sociale correspondante en objet.
 */
export async function submitEnquiry(
  _previous: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const parsed = projectEnquirySchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Certains champs doivent être corrigés.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data

  // Piège à robots : on accepte sans rien envoyer, pour ne pas signaler la détection.
  if (data.website) return { status: 'success' }

  if (!withinRateLimit(await clientKey())) {
    return {
      status: 'error',
      message: 'Trop de demandes envoyées depuis cet appareil. Réessayez dans une heure.',
    }
  }

  const brand = await getBrand()

  const fields: MailField[] = [
    { label: 'Entité destinataire', value: brand.legalName },
    { label: 'Nom', value: `${data.firstName} ${data.lastName}` },
    { label: 'E-mail', value: data.email },
    ...(data.phone ? [{ label: 'Téléphone', value: data.phone }] : []),
    { label: 'Société / projet', value: data.company },
    ...(data.country ? [{ label: 'Pays', value: data.country }] : []),
    { label: 'Domaine', value: data.domain },
    { label: 'Besoin en capitaux', value: data.capital },
    { label: 'Utilisation prévue des fonds', value: data.useOfFunds },
    { label: 'Présentation du projet', value: data.message },
  ]

  const title = `Nouvelle soumission de projet — ${data.company}`

  try {
    await getTransporter().sendMail({
      from: SMTP_FROM(),
      to: brand.email,
      replyTo: data.email,
      subject: `[${brand.distinctive}] ${data.company} — ${data.capital}`,
      text: buildEnquiryText(title, fields),
      html: buildEnquiryHtml(title, fields),
    })
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) {
      console.error('[contact] SMTP non configuré :', error.message)
      return {
        status: 'error',
        message: `L’envoi du formulaire n’est pas encore actif. Écrivez-nous directement à ${brand.email}.`,
      }
    }
    console.error('[contact] échec de l’envoi :', error)
    return {
      status: 'error',
      message: `L’envoi a échoué. Réessayez dans quelques instants ou écrivez-nous à ${brand.email}.`,
    }
  }

  return { status: 'success' }
}
