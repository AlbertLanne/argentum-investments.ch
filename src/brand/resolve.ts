import { cookies, headers } from 'next/headers'

import {
  BRAND_COOKIE,
  BRANDS,
  DEFAULT_BRAND,
  brandFromHost,
  isBrandKey,
  type Brand,
  type BrandKey,
} from './brands'

/** En-tête posé par `src/proxy.ts` : l'entité déduite du nom d'hôte de la requête. */
export const BRAND_HEADER = 'x-argentum-brand'

/**
 * Détermine l'entité active côté serveur.
 *
 * Priorité : bascule manuelle du visiteur (cookie) > nom de domaine > Investments.
 * Le cookie l'emporte pour que le bouton de bascule fonctionne sur les deux domaines.
 */
export async function getBrandKey(): Promise<BrandKey> {
  const cookieStore = await cookies()
  const chosen = cookieStore.get(BRAND_COOKIE)?.value
  if (isBrandKey(chosen)) return chosen

  const headerStore = await headers()
  const fromProxy = headerStore.get(BRAND_HEADER)
  if (isBrandKey(fromProxy)) return fromProxy

  return brandFromHost(headerStore.get('host')) ?? DEFAULT_BRAND
}

export async function getBrand(): Promise<Brand> {
  return BRANDS[await getBrandKey()]
}
