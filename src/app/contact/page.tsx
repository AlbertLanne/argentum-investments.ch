import type { Metadata } from 'next'

import image from '@/assets/images/contact.png'
import { getBrand } from '@/brand/resolve'
import { LegalIdentity } from '@/components/LegalIdentity'
import { PageHero } from '@/components/PageHero'
import { ProjectEnquiryForm } from '@/components/ProjectEnquiryForm'
import { Container } from '@/components/ui/Container'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  return {
    title: 'Contact',
    description: `Présentez votre entreprise ou votre projet à ${brand.legalName}, en toute confidentialité.`,
  }
}

/**
 * Page Contact.
 *
 * Le client n'a livré aucune fiche pour cette page : son contenu reprend le vocabulaire des
 * autres fiches — évaluation individuelle, confidentialité, délais de trois à quatre semaines —
 * et l'identité légale vient de la configuration de marque.
 */
export default async function ContactPage() {
  const brand = await getBrand()

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Présentez votre projet"
        lead={[
          'Vous recherchez des capitaux privés pour une entreprise, un investissement ou un projet ' +
            'spécifique ? Transmettez-nous les informations principales. À l’issue d’une première ' +
            'évaluation, nous déterminerons si le projet correspond au profil d’investissement de ' +
            '%BRAND% et s’il peut faire l’objet d’une analyse approfondie.',
        ]}
        brand={brand}
        image={image}
        imageAlt="Rassemblement en plein air au bord du lac à Genève"
      />

      <section className="bg-page py-16 sm:py-20 lg:py-(--spacing-section)">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
            <div>
              <div className="mb-10 flex flex-col gap-5">
                <span aria-hidden="true" className="h-px w-14 bg-accent" />
                <h2 className="text-[1.75rem] leading-[1.2] sm:text-[2rem]">
                  Soumission confidentielle
                </h2>
                <p className="max-w-(--container-prose) text-[1rem] leading-[1.75] text-text-muted">
                  Les informations relatives à l’entreprise, les données financières et la
                  documentation d’investissement sont traitées de manière confidentielle tout au
                  long du processus d’évaluation.
                </p>
              </div>

              <ProjectEnquiryForm email={brand.email} />
            </div>

            <aside className="lg:border-l lg:border-line lg:pl-12">
              <h2 className="mb-8 text-[1.25rem] leading-snug">Coordonnées</h2>
              <LegalIdentity brand={brand} />

              <div className="mt-10 border-t border-line pt-8">
                <h3 className="mb-3 text-[1.0625rem]">Déroulement</h3>
                <ol className="space-y-3 text-[0.875rem] leading-[1.7] text-text-muted">
                  <li>
                    <span className="text-text">Présentation du projet</span> — informations
                    principales, capitaux recherchés, utilisation prévue des fonds.
                  </li>
                  <li>
                    <span className="text-text">Évaluation</span> — généralement trois à quatre
                    semaines lorsque la documentation est complète.
                  </li>
                  <li>
                    <span className="text-text">Décision et structuration</span> — après une
                    évaluation positive, les conditions du financement envisagé sont structurées.
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}
