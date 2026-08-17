import type { Metadata } from 'next'

import { resolveBrandText } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { HeroVideo } from '@/components/HeroVideo'
import { PageBody } from '@/components/PageBody'
import { TwoEntities } from '@/components/TwoEntities'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { getPage } from '@/content/fr'

/**
 * Repères tirés du contenu client, non inventés :
 * le seuil de 1,5 M€ et les délais d'évaluation figurent dans Acceuil.odt et Services.odt,
 * les sept années d'expérience dans Acceuil.odt.
 */
const KEY_FIGURES = [
  { value: '1,5 M€', label: 'Besoin de financement minimum étudié' },
  { value: '3 à 4', label: 'Semaines pour l’évaluation d’un dossier complet' },
  { value: '7 ans', label: 'D’expérience dans l’évaluation et le financement' },
]

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  const page = getPage('accueil')
  return {
    // L'accueil porte la raison sociale seule, sans le gabarit « %s — … ».
    title: { absolute: `${brand.legalName} — Capital privé, Genève` },
    description: resolveBrandText(page.lead[0] ?? brand.tagline, brand).slice(0, 300),
  }
}

export default async function HomePage() {
  const brand = await getBrand()
  const page = getPage('accueil')

  return (
    <>
      <section className="relative isolate flex min-h-[38rem] items-end overflow-hidden sm:min-h-[44rem] lg:min-h-[calc(100dvh-2rem)]">
        <HeroVideo />

        <Container className="on-dark relative pt-[calc(var(--header-h)+5rem)] pb-20 sm:pb-28">
          <div className="flex flex-col gap-7">
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-14 bg-white/70" />
              <span className="text-[0.6875rem] uppercase tracking-[0.16em] text-white/80">
                Genève · Suisse
              </span>
            </div>

            <h1 className="max-w-[24ch] text-[2.125rem] leading-[1.1] text-white sm:text-[3.25rem] sm:leading-[1.08] lg:text-[4.25rem]">
              {resolveBrandText(page.title ?? brand.legalName, brand)}
            </h1>

            <div className="max-w-(--container-prose) space-y-4">
              {page.lead.map((paragraph, index) => (
                <p key={index} className="text-[1.0625rem] leading-[1.75] text-white/85 sm:text-[1.125rem]">
                  {resolveBrandText(paragraph, brand)}
                </p>
              ))}
            </div>

            <div className="mt-2 flex flex-wrap gap-4">
              {/* Sur la vidéo, aucun jeton de thème ne s'applique : les deux boutons sont
                  explicitement traités pour fond sombre. */}
              <Button href="/contact" variant="solidOnDark">
                Présentez votre projet
              </Button>
              <Button href="/finance" variant="ghostOnDark" withArrow={false}>
                Nos domaines d’investissement
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-page-alt py-12 sm:py-14">
        <Container>
          <dl className="grid gap-10 sm:grid-cols-3">
            {KEY_FIGURES.map((figure) => (
              <div key={figure.value} className="flex flex-col gap-2">
                <dt className="font-(family-name:--font-display) text-[2.25rem] leading-none text-text-strong sm:text-[2.75rem]">
                  {figure.value}
                </dt>
                <dd className="max-w-[24ch] text-[0.875rem] leading-snug text-text-muted">
                  {figure.label}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <TwoEntities active={brand.key} />

      <PageBody page={page} brand={brand} />
    </>
  )
}
