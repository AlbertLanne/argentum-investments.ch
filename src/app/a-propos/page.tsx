import type { Metadata } from 'next'

import image from '@/assets/images/a-propos.png'
import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('a-propos')
}

export default function AProposPage() {
  return (
    <ContentPage
      slug="a-propos"
      eyebrow="À propos"
      image={image}
      imageAlt="La fontaine du Jardin anglais à Genève"
    />
  )
}
