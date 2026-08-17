import type { Metadata } from 'next'

import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('discretion')
}

/**
 * Seule page sans photographie d'ouverture, volontairement.
 *
 * La fiche traite de confidentialité et de retrait de la communication publique : une
 * photographie de lieu ou de foule y contredirait le propos. Le fond uni tient ce registre.
 */
export default function DiscretionPage() {
  return <ContentPage slug="discretion" eyebrow="Discrétion & confidentialité" />
}
