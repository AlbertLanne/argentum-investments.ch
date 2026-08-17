import { z } from 'zod'

import { FINANCE_LINKS } from '@/config/navigation'

/**
 * Soumission de projet — le seul formulaire du site.
 *
 * Le contenu client répète le même appel à l'action sur chaque page : présenter une entreprise
 * ou un projet en vue d'une évaluation. Les champs reprennent ce que les fiches annoncent
 * analyser : besoin en capitaux, utilisation prévue des fonds, domaine concerné.
 */

/** Domaines proposés au visiteur, dans l'ordre du sous-menu Finance. */
export const ENQUIRY_DOMAINS = [
  ...FINANCE_LINKS.map((link) => link.label),
  'Immobilier — acquisition directe',
  'Autre domaine',
] as const

/**
 * Tranches de besoin en capitaux. Le seuil bas correspond au minimum annoncé par le client
 * (1,5 M€ sur l'accueil, 2 M€ sur les fiches sectorielles).
 */
export const CAPITAL_RANGES = [
  '1,5 à 2 millions d’euros',
  '2 à 5 millions d’euros',
  '5 à 10 millions d’euros',
  '10 à 25 millions d’euros',
  'Plus de 25 millions d’euros',
] as const

const required = (label: string) => `${label} est requis.`

export const projectEnquirySchema = z.object({
  firstName: z.string().trim().min(1, required('Le prénom')).max(100),
  lastName: z.string().trim().min(1, required('Le nom')).max(100),
  email: z.string().trim().toLowerCase().email('L’adresse e-mail n’est pas valide.').max(200),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().min(1, required('La société ou le nom du projet')).max(160),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  domain: z.enum(ENQUIRY_DOMAINS, { message: 'Sélectionnez un domaine.' }),
  capital: z.enum(CAPITAL_RANGES, { message: 'Sélectionnez un besoin en capitaux.' }),
  useOfFunds: z
    .string()
    .trim()
    .min(20, 'Décrivez l’utilisation prévue des fonds en quelques lignes.')
    .max(3000),
  message: z
    .string()
    .trim()
    .min(40, 'Décrivez le projet en quelques lignes (40 caractères minimum).')
    .max(6000),
  consent: z.literal('on', { message: 'Votre accord est nécessaire pour traiter la demande.' }),
  /** Piège à robots : rempli automatiquement, jamais par un humain. */
  website: z.string().max(0).optional().or(z.literal('')),
})

export type ProjectEnquiry = z.infer<typeof projectEnquirySchema>

export type EnquiryState =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[]> }
