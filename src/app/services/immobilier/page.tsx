import type { Metadata } from 'next'

import image from '@/assets/images/immobilier.png'
import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('services-immobilier')
}

export default function ServicesImmobilierPage() {
  return (
    <ContentPage
      slug="services-immobilier"
      eyebrow="Services · Immobilier"
      image={image}
      imageAlt="Terrasse au bord du lac Léman avec le Jet d’eau en arrière-plan"
    />
  )
}
