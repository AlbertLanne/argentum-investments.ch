import type { StaticImageData } from 'next/image'
import type { Metadata } from 'next'

import { resolveBrandText } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { PageBody } from '@/components/PageBody'
import { PageHero } from '@/components/PageHero'
import { getPage, type PageSlug } from '@/content/fr'

export type ContentPageProps = {
  slug: PageSlug
  eyebrow?: string
  image?: StaticImageData
  imageAlt?: string
  /** Destination des appels à l'action de la fiche. */
  ctaHref?: string
  /** Colonne continue plutôt que sections pleine largeur. Pour les pages juridiques. */
  compact?: boolean
}

/**
 * Rend une fiche client complète : ouverture puis sections.
 *
 * Les 19 fiches livrées en .odt partagent la même structure — titre, chapeau, sections,
 * appel à l'action, avertissement — ce qui permet de n'avoir qu'un seul gabarit.
 */
export async function ContentPage({
  slug,
  eyebrow,
  image,
  imageAlt,
  ctaHref,
  compact,
}: ContentPageProps) {
  const brand = await getBrand()
  const page = getPage(slug)

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={page.title ?? page.menu}
        lead={page.lead}
        brand={brand}
        image={image}
        imageAlt={imageAlt}
      />
      <PageBody page={page} brand={brand} ctaHref={ctaHref} compact={compact} />
    </>
  )
}

/** Balise title et description d'une fiche, avec la raison sociale de l'entité active. */
export async function contentMetadata(slug: PageSlug): Promise<Metadata> {
  const brand = await getBrand()
  const page = getPage(slug)
  const description = page.lead[0] ?? page.title ?? undefined

  return {
    title: page.menu,
    description: description ? resolveBrandText(description, brand).slice(0, 300) : undefined,
  }
}
