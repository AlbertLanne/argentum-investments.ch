import type { Metadata } from 'next'

import image from '@/assets/images/services.jpg'
import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('services')
}

export default function ServicesPage() {
  return (
    <ContentPage
      slug="services"
      eyebrow="Services"
      image={image}
      imageAlt="Deux personnes consultent un téléphone au bord d’un lac suisse"
    />
  )
}
