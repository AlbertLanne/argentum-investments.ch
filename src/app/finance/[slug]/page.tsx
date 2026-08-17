import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { FINANCE_LINKS } from '@/config/navigation'
import type { PageSlug } from '@/content/fr'

type Params = { slug: string }

/** Slug d'URL -> fiche de contenu, restreint aux dix domaines du sous-menu Finance. */
const CONTENT_BY_SLUG = new Map(
  FINANCE_LINKS.map((link) => [link.href.replace('/finance/', ''), link.content as PageSlug]),
)

export function generateStaticParams(): Params[] {
  return [...CONTENT_BY_SLUG.keys()].map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const content = CONTENT_BY_SLUG.get(slug)
  if (!content) return {}
  return contentMetadata(content)
}

export default async function FinanceDomainPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const content = CONTENT_BY_SLUG.get(slug)
  if (!content) notFound()

  const label = FINANCE_LINKS.find((link) => link.content === content)?.label

  return <ContentPage slug={content} eyebrow={label ? `Finance · ${label}` : 'Finance'} />
}
