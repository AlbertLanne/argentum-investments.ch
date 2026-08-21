import type { Metadata } from 'next'
import Link from 'next/link'

import image from '@/assets/images/finance.png'
import { resolveBrandText } from '@/brand/brands'
import { getBrand } from '@/brand/resolve'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { FINANCE_LINKS } from '@/config/navigation'
import { getPage } from '@/content/fr'

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  return {
    title: 'Finance',
    description: resolveBrandText(
      'Domaines d’investissement de %BRAND% : financement immobilier, capital-investissement, ' +
        'capital-risque, mezzanine, énergies renouvelables, médecine et technologies.',
      brand,
    ),
  }
}

/**
 * Sommaire des dix domaines d'investissement.
 *
 * Le client n'a pas livré de fiche pour cette page : chaque carte reprend donc le sous-titre et
 * la première phrase de la fiche correspondante, sans texte ajouté. L'ordre est celui du
 * sous-menu, classé par priorité commerciale décroissante.
 */
export default async function FinancePage() {
  const brand = await getBrand()

  const domains = FINANCE_LINKS.map((link) => {
    const page = getPage(link.content!)
    return {
      href: link.href,
      label: link.label,
      /** Le premier intertitre de la fiche fait office d'accroche. */
      claim: page.sections[0]?.title ?? null,
      summary: page.lead[0] ?? null,
    }
  })

  return (
    <>
      <PageHero
        eyebrow="Finance"
        title="Dix domaines d’investissement, une même exigence de substance économique"
        lead={[
          'Chaque domaine fait l’objet d’une évaluation individuelle. %BRAND% engage ses propres ' +
            'capitaux et, lorsque cela est approprié, ceux de partenaires privés sélectionnés au ' +
            'sein de son réseau.',
        ]}
        brand={brand}
        image={image}
        imageAlt="Le massif du Salève au-dessus du bassin genevois"
      />

      <section className="bg-page py-16 sm:py-20 lg:py-(--spacing-section)">
        <Container>
          <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {domains.map((domain, index) => (
              <li key={domain.href} className="h-full">
                <Reveal direction="left" delayMs={(index % 3) * 120} className="h-full">
                  <Link
                    href={domain.href}
                    className="group flex h-full flex-col gap-4 border-t border-line p-7 transition-colors duration-200 hover:border-accent hover:bg-page-alt"
                  >
                    <span className="font-(family-name:--font-display) text-[0.875rem] tabular-nums text-accent-contrast">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-(family-name:--font-display) text-[1.3125rem] leading-snug">
                      {domain.label}
                    </h2>
                    {domain.claim ? (
                      <p className="text-[0.9375rem] leading-snug text-text">
                        {resolveBrandText(domain.claim, brand)}
                      </p>
                    ) : null}
                    {domain.summary ? (
                      <p className="line-clamp-4 text-[0.875rem] leading-[1.7] text-text-muted">
                        {resolveBrandText(domain.summary, brand)}
                      </p>
                    ) : null}
                    <span
                      aria-hidden="true"
                      className="mt-auto pt-3 text-[0.8125rem] text-text-muted transition-transform duration-200 ease-(--ease-out-quart) group-hover:translate-x-1 group-hover:text-accent-contrast"
                    >
                      Découvrir →
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-band py-16 text-band-text sm:py-20">
        <Container>
          <div className="flex flex-col gap-6">
            <span aria-hidden="true" className="h-px w-14 bg-band-accent" />
            <h2 className="max-w-[32ch] text-[1.75rem] leading-[1.2] text-band-text sm:text-[2.125rem]">
              Votre projet n’entre dans aucune de ces catégories&nbsp;?
            </h2>
            <p className="max-w-(--container-prose) text-[1.0625rem] leading-[1.75] text-band-muted">
              {resolveBrandText(
                'Chaque opportunité est examinée selon ses caractéristiques propres. Présentez ' +
                  'votre projet à %BRAND% : une première évaluation déterminera s’il correspond ' +
                  'au profil d’investissement recherché.',
                brand,
              )}
            </p>
            <div className="pt-2">
              <Button href="/contact" variant="onBand">
                Présentez votre projet
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
