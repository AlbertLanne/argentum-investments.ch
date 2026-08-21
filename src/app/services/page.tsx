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
      imageAlt="Le massif du Mont-Blanc vu depuis un pâturage suisse"
    />
  )
}
