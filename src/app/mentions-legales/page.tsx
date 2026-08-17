import type { Metadata } from 'next'

import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('mentions-legales')
}

export default function MentionsLegalesPage() {
  return <ContentPage slug="mentions-legales" eyebrow="Mentions légales" compact />
}
