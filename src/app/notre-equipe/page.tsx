import type { Metadata } from 'next'

import image from '@/assets/images/equipe.png'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { RelatedLinks } from '@/components/RelatedLinks'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('notre-equipe')
}

/**
 * La grille des partenaires a été retirée du contenu généré.
 *
 * Le client n'a livré que des blocs `[Prénom Nom] / [Fonction] / [Adresse e-mail]` non remplis, et
 * la fiche À propos parle de cinq partenaires là où la fiche Équipe n'en prévoyait que trois. La
 * fiche se réduisant à son introduction, la page est close par des renvois — construits depuis la
 * navigation, sans texte ajouté — plutôt que par un bloc rédigé de toutes pièces.
 */
export default function NotreEquipePage() {
  return (
    <>
      <ContentPage
        slug="notre-equipe"
        eyebrow="Notre équipe"
        image={image}
        imageAlt="Vue sur une ville suisse depuis une terrasse en hauteur"
      />
      <RelatedLinks
        title="Poursuivre"
        slugs={[
          { slug: 'a-propos', href: '/a-propos' },
          { slug: 'discretion', href: '/discretion' },
          { slug: 'services', href: '/services' },
        ]}
      />
    </>
  )
}
