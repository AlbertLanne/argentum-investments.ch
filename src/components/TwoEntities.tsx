'use client'

import { BRANDS, BRAND_KEYS, type BrandKey } from '@/brand/brands'
import { useBrandSwitch } from '@/brand/useBrandSwitch'
import { Container } from '@/components/ui/Container'

/**
 * Présentation du groupe : les deux sociétés qui partagent ce site.
 *
 * Argentum Investments SA et Argentum Advisors SA sont deux sociétés anonymes genevoises
 * distinctes, inscrites au registre du commerce sous des numéros différents et actives dans des
 * secteurs différents. Le même site est déployé sur leurs deux domaines ; cette section permet
 * de passer de l'une à l'autre, ce qui change la raison sociale dans tout le contenu, les
 * mentions légales du pied de page, l'adresse de contact et le thème visuel.
 */
export function TwoEntities({ active }: { active: BrandKey }) {
  const { select, isPending, shown } = useBrandSwitch(active)

  return (
    <section className="border-y border-line bg-page py-16 sm:py-20 lg:py-(--spacing-section)">
      <Container>
        <div className="mb-12 flex flex-col gap-5">
          <span aria-hidden="true" className="h-px w-14 bg-accent" />
          <h2 className="max-w-[34ch] text-[1.75rem] leading-[1.2] sm:text-[2.125rem]">
            Deux sociétés, une même approche du capital privé
          </h2>
          <p className="max-w-(--container-prose) text-[1.0625rem] leading-[1.75] text-text-muted">
            Le groupe Argentum réunit deux sociétés anonymes genevoises aux périmètres
            complémentaires. Choisissez l’entité qui correspond à votre demande : le site,
            ses mentions légales et son adresse de contact s’adaptent aussitôt.
          </p>
        </div>

        <ul className="grid gap-px sm:grid-cols-2">
          {BRAND_KEYS.map((key) => {
            const brand = BRANDS[key]
            const isActive = key === shown
            return (
              <li key={key}>
                <article
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex h-full flex-col gap-6 border-t p-7 transition-colors duration-200 sm:p-8 ${
                    isActive ? 'border-accent bg-page-alt' : 'border-line bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-(family-name:--font-display) text-[1.375rem] leading-snug">
                      {brand.legalName}
                    </h3>
                    {isActive ? (
                      <span className="shrink-0 rounded-(--radius-sm) bg-brand px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.12em] text-on-brand">
                        Affichée
                      </span>
                    ) : null}
                  </div>

                  <dl className="space-y-3 text-[0.875rem]">
                    <div>
                      <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
                        Secteur d’activité
                      </dt>
                      <dd className="mt-1 leading-snug text-text">{brand.sector}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
                        Registre du commerce
                      </dt>
                      <dd className="mt-1 text-text">{brand.registryNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
                        Contact
                      </dt>
                      <dd className="mt-1 text-text">{brand.email}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto pt-2">
                    {isActive ? (
                      <p className="text-[0.8125rem] text-text-muted">
                        Vous consultez actuellement le site de cette société.
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => select(key)}
                        disabled={isPending}
                        className="group inline-flex items-center gap-3 rounded-(--radius-md) border border-line-strong px-6 py-3.5 text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200 hover:border-accent hover:text-accent-contrast disabled:opacity-55"
                      >
                        <span>Afficher {brand.distinctive}</span>
                        <span
                          aria-hidden="true"
                          className="transition-transform duration-200 ease-(--ease-out-quart) group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </button>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
