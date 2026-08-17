'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { BRAND_COOKIE, isBrandKey, type BrandKey } from './brands'

const ONE_YEAR = 60 * 60 * 24 * 365

/**
 * Mémorise la bascule manuelle entre les deux entités.
 *
 * Le cookie est prioritaire sur le nom de domaine : un visiteur qui a choisi Advisors
 * reste sur Advisors, y compris sur argentum-investments.ch.
 */
export async function switchBrand(key: BrandKey) {
  if (!isBrandKey(key)) return

  const cookieStore = await cookies()
  cookieStore.set(BRAND_COOKIE, key, {
    maxAge: ONE_YEAR,
    path: '/',
    sameSite: 'lax',
    httpOnly: false, // Lu au premier rendu client pour éviter un clignotement de thème.
  })

  // La raison sociale et les mentions légales sont rendues côté serveur sur toutes les pages.
  revalidatePath('/', 'layout')
}
