import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { BRAND_COOKIE, brandFromHost, isBrandKey } from '@/brand/brands'
import { BRAND_HEADER } from '@/brand/resolve'

/**
 * Déduit l'entité active du nom d'hôte et la transmet au rendu via un en-tête.
 *
 * Le site est déployé sur deux domaines : argentum-investments.ch et argentum-advisors.ch.
 * Chaque visiteur doit arriver sur la bonne entité sans rien cliquer. Le cookie de bascule
 * manuelle, quand il existe, reste prioritaire — il est lu directement par `getBrandKey()`.
 *
 * En Next.js 16 ce fichier remplace l'ancien `middleware.ts`.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  const fromHost = brandFromHost(request.headers.get('host'))

  if (fromHost) {
    requestHeaders.set(BRAND_HEADER, fromHost)
  } else {
    requestHeaders.delete(BRAND_HEADER)
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Le site entier est en no-index : l'en-tête double la balise meta et couvre les
  // réponses non HTML (documents, images) que la balise ne peut pas atteindre.
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex')

  // Un cookie corrompu ou périmé ferait basculer le site sur une entité inconnue.
  const cookie = request.cookies.get(BRAND_COOKIE)?.value
  if (cookie !== undefined && !isBrandKey(cookie)) {
    response.cookies.delete(BRAND_COOKIE)
  }

  return response
}

export const config = {
  // Tout sauf les assets statiques et l'optimiseur d'images.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
