import type { StaticImageData } from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import capitalInvestissement from '@/assets/images/finance/capital-investissement.png'
import capitalRisque from '@/assets/images/finance/capital-risque.png'
import crowdfunding from '@/assets/images/finance/crowdfunding.png'
import developpementDeProjets from '@/assets/images/finance/developpement-de-projets.png'
import energiesRenouvelables from '@/assets/images/finance/energies-renouvelables.png'
import financementImmobilier from '@/assets/images/finance/financement-immobilier.png'
import investissementsStartUp from '@/assets/images/finance/investissements-start-up.png'
import medecinePharma from '@/assets/images/finance/medecine-pharma.png'
import mezzanineCapital from '@/assets/images/finance/mezzanine-capital.png'
import solutionsTechnologiquesEMobilite from '@/assets/images/finance/solutions-technologiques-e-mobilite.png'
import { ContentPage, contentMetadata } from '@/components/ContentPage'
import { FINANCE_LINKS } from '@/config/navigation'
import type { PageSlug } from '@/content/fr'

type Params = { slug: string }

/** Slug d'URL -> fiche de contenu, restreint aux dix domaines du sous-menu Finance. */
const CONTENT_BY_SLUG = new Map(
  FINANCE_LINKS.map((link) => [link.href.replace('/finance/', ''), link.content as PageSlug]),
)

/**
 * Image de couverture par domaine, choisie pour correspondre au texte de la fiche.
 * Aucune personne visible sur ces photographies, à la demande du client.
 */
const IMAGE_BY_SLUG: Record<string, { image: StaticImageData; alt: string }> = {
  'financement-immobilier': {
    image: financementImmobilier,
    alt: "Immeuble de bureaux vitré au milieu d'un tissu urbain résidentiel",
  },
  'capital-investissement': {
    image: capitalInvestissement,
    alt: "Reflet d'un clocher historique dans la façade vitrée d'un immeuble de bureaux à Genève",
  },
  'capital-risque': {
    image: capitalRisque,
    alt: 'Vue en contre-plongée de tours de bureaux vitrées modernes',
  },
  'investissements-start-up': {
    image: investissementsStartUp,
    alt: 'Salle de réunion sobre avec une longue table blanche',
  },
  'mezzanine-capital': {
    image: mezzanineCapital,
    alt: 'Passerelle vitrée reliant deux immeubles de bureaux',
  },
  'developpement-de-projets': {
    image: developpementDeProjets,
    alt: 'Grue de chantier se détachant sur un ciel bleu',
  },
  'energies-renouvelables': {
    image: energiesRenouvelables,
    alt: 'Installation photovoltaïque sur un barrage alpin, avec pylône électrique',
  },
  'medecine-pharma': {
    image: medecinePharma,
    alt: 'Comprimé pharmaceutique isolé, éclairage en studio',
  },
  'solutions-technologiques-e-mobilite': {
    image: solutionsTechnologiquesEMobilite,
    alt: 'Câble de recharge branché sur une voiture électrique',
  },
  crowdfunding: {
    image: crowdfunding,
    alt: 'Skyline de Genève vu depuis le lac Léman',
  },
}

export function generateStaticParams(): Params[] {
  return [...CONTENT_BY_SLUG.keys()].map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const content = CONTENT_BY_SLUG.get(slug)
  if (!content) return {}
  return contentMetadata(content)
}

export default async function FinanceDomainPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const content = CONTENT_BY_SLUG.get(slug)
  if (!content) notFound()

  const label = FINANCE_LINKS.find((link) => link.content === content)?.label
  const cover = IMAGE_BY_SLUG[slug]

  return (
    <ContentPage
      slug={content}
      eyebrow={label ? `Finance · ${label}` : 'Finance'}
      image={cover?.image}
      imageAlt={cover?.alt}
    />
  )
}
