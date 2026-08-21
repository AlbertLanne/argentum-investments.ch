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
      imageAlt="Hall d’entrée en marbre et dorures d’un immeuble historique"
    />
  )
}
