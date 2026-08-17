import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { getPage, type PageSlug } from '@/content/fr'

/**
 * Renvois vers d'autres pages du site.
 *
 * Chaque carte reprend le premier intertitre de la fiche visée : rien n'est rédigé ici. Utilisé
 * pour clore une page dont le client n'a livré qu'un texte d'introduction — la fiche Notre Équipe,
 * dont la grille des partenaires a été retirée faute de données.
 */
export function RelatedLinks({
  title,
  slugs,
}: {
  title: string
  slugs: { slug: PageSlug; href: string }[]
}) {
  return (
    <section className="border-t border-line bg-page-alt py-16 sm:py-20">
      <Container>
        <div className="mb-10 flex flex-col gap-5">
          <span aria-hidden="true" className="h-px w-14 bg-accent" />
          <h2 className="text-[1.5rem] leading-[1.2] sm:text-[1.75rem]">{title}</h2>
        </div>

        <ul className="grid gap-px sm:grid-cols-3">
          {slugs.map(({ slug, href }) => {
            const page = getPage(slug)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex h-full flex-col gap-3 border-t border-line p-7 transition-colors duration-200 hover:border-accent hover:bg-page"
                >
                  <h3 className="font-(family-name:--font-display) text-[1.25rem] leading-snug">
                    {page.menu}
                  </h3>
                  {page.sections[0]?.title ? (
                    <p className="text-[0.9375rem] leading-snug text-text-muted">
                      {page.sections[0].title}
                    </p>
                  ) : null}
                  <span
                    aria-hidden="true"
                    className="mt-auto pt-3 text-[0.8125rem] text-text-muted transition-transform duration-200 ease-(--ease-out-quart) group-hover:translate-x-1 group-hover:text-accent-contrast"
                  >
                    Consulter →
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}
