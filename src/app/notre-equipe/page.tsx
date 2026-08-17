import type { Metadata } from 'next'

import image from '@/assets/images/equipe.png'
import { ContentPage, contentMetadata } from '@/components/ContentPage'

export function generateMetadata(): Promise<Metadata> {
  return contentMetadata('notre-equipe')
}

/**
 * La grille des partenaires a été retirée du contenu généré.
 *
 * Le client n'a livré que des blocs `[Prénom Nom] / [Fonction] / [Adresse e-mail]` non remplis,
 * et la fiche À propos indique cinq partenaires là où la fiche Équipe n'en prévoyait que trois.
 * La page se tient sur son texte d'introduction jusqu'à réception des données réelles.
 */
export default function NotreEquipePage() {
  return (
    <ContentPage
      slug="notre-equipe"
      eyebrow="Notre équipe"
      image={image}
      imageAlt="Vue sur une ville suisse depuis une terrasse en hauteur"
    />
  )
}
