import Link from 'next/link'

import type { Brand } from '@/brand/brands'
import { Logo } from '@/components/Logo'
import { Container } from '@/components/ui/Container'
import { FINANCE_LINKS, LEGAL_NAV, MAIN_NAV } from '@/config/navigation'

const CURRENT_YEAR = 2026

/** Entrées du menu principal qui relèvent de la société plutôt que de l'offre. */
const COMPANY_HREFS = ['/a-propos', '/discretion', '/notre-equipe', '/contact']

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="mb-4 font-(family-name:--font-sans) text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-muted">
        {title}
      </h2>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[0.875rem] leading-snug text-text transition-colors duration-150 hover:text-accent-contrast"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Pied de page.
 *
 * L'identité légale affichée suit l'entité active. Les lignes dont la donnée manque sont
 * omises : Argentum Advisors SA n'a pas encore communiqué son adresse ni son UID, et aucune
 * des deux entités n'a de numéro de téléphone.
 */
export function Footer({ brand }: { brand: Brand }) {
  const services = MAIN_NAV.find((link) => link.href === '/services')
  const company = MAIN_NAV.filter((link) => COMPANY_HREFS.includes(link.href))

  return (
    <footer className="border-t border-line bg-page-alt">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-[32ch] text-[0.9375rem] leading-[1.7] text-text-muted">
              {brand.tagline}
            </p>

            <address className="mt-8 space-y-1 text-[0.875rem] leading-[1.8] text-text-muted not-italic">
              <span className="block font-medium text-text-strong">{brand.legalName}</span>
              {brand.address ? (
                <>
                  <span className="block">{brand.address.street}</span>
                  <span className="block">
                    {brand.address.postalCode} {brand.address.city}, {brand.address.country}
                  </span>
                </>
              ) : null}
              <a
                href={`mailto:${brand.email}`}
                className="mt-2 inline-block text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent"
              >
                {brand.email}
              </a>
            </address>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <Column
              title="Services"
              links={[
                { label: 'Vue d’ensemble', href: '/services' },
                ...(services?.children ?? []),
              ]}
            />
            <Column
              title="Finance"
              links={[{ label: 'Vue d’ensemble', href: '/finance' }, ...FINANCE_LINKS.slice(0, 6)]}
            />
            <Column title="Société" links={company} />
          </div>
        </div>

        <div className="mt-14 space-y-6 border-t border-line pt-8">
          <p className="max-w-[92ch] text-[0.8125rem] leading-[1.7] text-text-muted">
            {brand.legalName} n’est ni une banque ni un établissement de crédit et n’exerce pas
            d’activité conventionnelle d’intermédiation en crédit. Le contenu de ce site ne
            constitue ni une offre publique, ni une recommandation d’investissement, ni une
            garantie de financement.
          </p>

          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-[0.8125rem] text-text-muted">
            <div className="flex gap-2">
              <dt>Registre du commerce&nbsp;:</dt>
              <dd className="text-text">{brand.registryNumber}</dd>
            </div>
            {brand.uid ? (
              <div className="flex gap-2">
                <dt>UID&nbsp;:</dt>
                <dd className="text-text">{brand.uid}</dd>
              </div>
            ) : null}
          </dl>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[0.8125rem] text-text-muted">
              © {CURRENT_YEAR} {brand.legalName}. Tous droits réservés.
            </p>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {LEGAL_NAV.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.8125rem] text-text-muted transition-colors duration-150 hover:text-accent-contrast"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  )
}
