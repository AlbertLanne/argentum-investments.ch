import type { Metadata } from 'next'

import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('politique-de-confidentialite')
}

export default function PolitiqueConfidentialitePage() {
  return <ContentPage slug="politique-de-confidentialite" eyebrow="Politique de confidentialité" compact />
}
