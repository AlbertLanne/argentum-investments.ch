import type { MetadataRoute } from 'next'

/**
 * Le client demande un site entièrement exclu de l'indexation.
 *
 * Aucun sitemap n'est déclaré : il n'y a rien à proposer aux moteurs. Ce fichier complète la
 * balise meta du layout et l'en-tête `X-Robots-Tag` posé par `src/proxy.ts`.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', disallow: '/' },
  }
}
