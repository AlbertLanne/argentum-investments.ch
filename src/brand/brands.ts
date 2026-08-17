/**
 * Les deux entités juridiques du groupe Argentum.
 *
 * Un seul code est déployé sur deux noms de domaine. Les deux SA sont réellement distinctes :
 * numéros de registre différents, secteurs d'activité différents, adresses e-mail différentes.
 * Toute donnée propre à une entité vit ici et nulle part ailleurs — écrire une raison sociale
 * en dur dans une page produirait une mention légale fausse sur l'autre domaine.
 *
 * Champs à `null` = donnée que le client n'a pas encore fournie. Le rendu omet la ligne
 * plutôt que d'afficher une valeur supposée.
 */

export const BRAND_KEYS = ['investments', 'advisors'] as const

export type BrandKey = (typeof BRAND_KEYS)[number]

export type PostalAddress = {
  street: string
  postalCode: string
  city: string
  country: string
}

export type Brand = {
  key: BrandKey
  /** Raison sociale complète, substituée au jeton %BRAND% du contenu. */
  legalName: string
  /** Mot qui distingue les deux entités, pour le bouton de bascule. */
  distinctive: string
  /** Numéro au registre du commerce genevois. */
  registryNumber: string
  /** Numéro d'identification des entreprises. */
  uid: string | null
  address: PostalAddress | null
  /** Secteur tel qu'inscrit au registre du commerce. */
  sector: string
  /** Dernière publication au registre du commerce. */
  lastPublication: string
  representative: string | null
  email: string
  /** Aucune des deux entités n'a communiqué de numéro : ne jamais afficher de téléphone. */
  phone: null
  domain: string
  /** Différencie visuellement les deux entités sans sortir de la palette de marque. */
  theme: 'light' | 'dark'
  /** Résumé d'une ligne, utilisé en balise description et sur le sélecteur. */
  tagline: string
}

const GENEVA_ADDRESS: PostalAddress = {
  street: 'Avenue Marc-Doret 14A',
  postalCode: '1224',
  city: 'Chêne-Bougeries',
  country: 'Suisse',
}

export const BRANDS: Record<BrandKey, Brand> = {
  investments: {
    key: 'investments',
    legalName: 'Argentum Investments SA',
    distinctive: 'Investments',
    registryNumber: 'CH-660.0.244.019-9',
    uid: 'CHE-134.341.014',
    address: GENEVA_ADDRESS,
    sector: 'Exploitation de sociétés d’investissement',
    lastPublication: '14.03.2019',
    representative: 'Andrew Silver',
    email: 'contact@argentum-investments.ch',
    phone: null,
    domain: 'argentum-investments.ch',
    theme: 'light',
    tagline: 'Capital privé pour entreprises, projets et opportunités sélectionnés.',
  },
  advisors: {
    key: 'advisors',
    legalName: 'Argentum Advisors SA',
    distinctive: 'Advisors',
    registryNumber: 'CH-660.0.242.019-2',
    // Non communiqués par le client — voir la liste des données manquantes dans CLAUDE.md.
    uid: null,
    address: null,
    sector: 'Prestations de services pour banques et établissements de crédit',
    lastPublication: '07.02.2019',
    representative: null,
    email: 'contact@argentum-advisors.ch',
    phone: null,
    domain: 'argentum-advisors.ch',
    theme: 'dark',
    tagline: 'Prestations de services pour banques et établissements de crédit.',
  },
}

export const DEFAULT_BRAND: BrandKey = 'investments'

/** Nom du cookie qui mémorise la bascule manuelle du visiteur. */
export const BRAND_COOKIE = 'argentum-brand'

export function isBrandKey(value: unknown): value is BrandKey {
  return typeof value === 'string' && (BRAND_KEYS as readonly string[]).includes(value)
}

/** Déduit l'entité du nom d'hôte : argentum-advisors.ch ouvre sur Advisors. */
export function brandFromHost(host: string | null | undefined): BrandKey | null {
  if (!host) return null
  const normalized = host.toLowerCase()
  for (const key of BRAND_KEYS) {
    if (normalized.includes(BRANDS[key].domain)) return key
  }
  // Couvre les sous-domaines de préproduction du type `advisors.vercel.app`.
  for (const key of BRAND_KEYS) {
    if (normalized.includes(key)) return key
  }
  return null
}

export function otherBrand(key: BrandKey): BrandKey {
  return key === 'investments' ? 'advisors' : 'investments'
}

/** Remplace le jeton %BRAND% du contenu client par la raison sociale de l'entité active. */
export function resolveBrandText(text: string, brand: Brand): string {
  return text.replaceAll('%BRAND%', brand.legalName)
}
