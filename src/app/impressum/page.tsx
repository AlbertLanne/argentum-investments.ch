import type { Metadata } from 'next'

import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('impressum')
}

export default function ImpressumPage() {
  return <ContentPage slug="impressum" eyebrow="Impressum" compact />
}
