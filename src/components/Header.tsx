'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import type { BrandKey } from '@/brand/brands'
import { BrandSwitcher } from '@/components/BrandSwitcher'
import { Logo } from '@/components/Logo'
import { Container } from '@/components/ui/Container'
import type { NavLink } from '@/config/navigation'

function isCurrent(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

/** Vrai si l'entrée ou l'une de ses sous-entrées correspond à la page courante. */
function isBranchActive(pathname: string, link: NavLink) {
  return isCurrent(pathname, link.href) || (link.children ?? []).some((c) => isCurrent(pathname, c.href))
}

/**
 * Classes du libellé de navigation.
 *
 * Au-dessus de la vidéo, aucun jeton de thème n'est lisible : les couleurs sont alors fixées en
 * blanc explicitement, et non par une variante utilitaire qui entrerait en conflit de spécificité
 * avec la couleur de thème.
 */
function entryClasses(onDark: boolean, active: boolean) {
  if (onDark) {
    return active ? 'text-white' : 'text-white/80 hover:text-white'
  }
  return active ? 'text-accent-contrast' : 'text-text hover:text-accent-contrast'
}

function DesktopEntry({
  link,
  pathname,
  onDark,
}: {
  link: NavLink
  pathname: string
  onDark: boolean
}) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const active = isBranchActive(pathname, link)

  // Un survol qui traverse le vide entre le libellé et le panneau ne doit pas le refermer.
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }
  function cancelClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }
  useEffect(() => cancelClose, [])

  if (!link.children) {
    return (
      <Link
        href={link.href}
        aria-current={active ? 'page' : undefined}
        className={`relative py-2 text-[0.8125rem] font-medium tracking-[0.04em] transition-colors duration-200 ${entryClasses(onDark, active)}`}
      >
        {link.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={link.href}
        aria-expanded={open}
        aria-current={active ? 'page' : undefined}
        onFocus={() => setOpen(true)}
        className={`flex items-center gap-1.5 py-2 text-[0.8125rem] font-medium tracking-[0.04em] transition-colors duration-200 ${entryClasses(onDark, active)}`}
      >
        {link.label}
        <span
          aria-hidden="true"
          className={`text-[0.5rem] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          ▾
        </span>
      </Link>

      <div
        hidden={!open}
        className="absolute top-full left-0 z-50 w-[22rem] pt-3"
        onMouseEnter={cancelClose}
        onMouseLeave={scheduleClose}
      >
        <ul className="overflow-hidden rounded-(--radius-md) border border-line bg-surface-raised py-2 shadow-(--shadow-card)">
          {link.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                onClick={() => setOpen(false)}
                aria-current={isCurrent(pathname, child.href) ? 'page' : undefined}
                className={`block border-l-2 px-5 py-2.5 text-[0.875rem] transition-colors duration-150 ${
                  isCurrent(pathname, child.href)
                    ? 'border-accent bg-page-alt text-accent-contrast'
                    : 'border-transparent text-text-muted hover:border-accent hover:bg-page-alt hover:text-text-strong'
                }`}
              >
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function MobileMenu({
  nav,
  pathname,
  brandKey,
  onClose,
}: {
  nav: NavLink[]
  pathname: string
  brandKey: BrandKey
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 top-[var(--header-h)] z-40 overflow-y-auto bg-page lg:hidden">
      <Container className="py-8">
        <nav>
          <ul className="divide-y divide-line">
            {nav.map((link) => (
              <li key={link.href} className="py-4">
                <Link
                  href={link.href}
                  onClick={onClose}
                  aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
                  className={`font-(family-name:--font-display) text-[1.375rem] ${
                    isBranchActive(pathname, link) ? 'text-accent-contrast' : 'text-text-strong'
                  }`}
                >
                  {link.label}
                </Link>
                {link.children ? (
                  <ul className="mt-3 space-y-2.5 border-l border-line pl-4">
                    {link.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          onClick={onClose}
                          className={`block text-[0.9375rem] ${
                            isCurrent(pathname, child.href)
                              ? 'text-accent-contrast'
                              : 'text-text-muted'
                          }`}
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-10 border-t border-line pt-8">
          <p className="mb-3 text-[0.6875rem] uppercase tracking-[0.14em] text-text-muted">
            Entité du groupe
          </p>
          <BrandSwitcher active={brandKey} />
        </div>
      </Container>
    </div>
  )
}

/** L'accueil est la seule page dont le hero est une vidéo plein écran. */
const HERO_ROUTES = new Set(['/'])

/**
 * En-tête du site.
 *
 * Sur l'accueil il démarre transparent au-dessus de la vidéo puis devient opaque au défilement.
 * Les pages intérieures ont un en-tête opaque dès le départ.
 */
export function Header({ nav, brandKey }: { nav: NavLink[]; brandKey: BrandKey }) {
  const pathname = usePathname()
  const overHero = HERO_ROUTES.has(pathname)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Pas d'effet sur `pathname` pour refermer le menu : chaque lien du tiroir appelle déjà
  // `onClose`, et fermer depuis un effet déclencherait un rendu en cascade.

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  const floating = overHero && !scrolled && !menuOpen

  return (
    <>
      <header
        data-floating={floating ? '' : undefined}
        className={`fixed top-0 right-0 left-0 z-50 h-[var(--header-h)] transition-colors duration-300 ${
          floating
            ? 'on-dark border-b border-white/10 bg-transparent'
            : 'border-b border-line bg-page/95 backdrop-blur-md'
        }`}
      >
        <Container className="flex h-full items-center justify-between gap-8">
          <Link href="/" aria-label="Argentum — accueil" className="flex shrink-0 items-center">
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-7">
              {nav.map((link) => (
                <li key={link.href}>
                  <DesktopEntry link={link} pathname={pathname} onDark={floating} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            {/* Le masquage est porté par ce conteneur : appliqué au composant, `hidden`
                entrerait en conflit avec son propre `inline-flex`. */}
            <div className="hidden sm:flex">
              <BrandSwitcher active={brandKey} onDark={floating} />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              className={`-mr-2 p-2 lg:hidden ${floating ? 'text-white' : 'text-text'}`}
            >
              <span aria-hidden="true" className="block text-lg leading-none">
                {menuOpen ? '✕' : '☰'}
              </span>
            </button>
          </div>
        </Container>
      </header>

      {menuOpen ? (
        <MobileMenu
          nav={nav}
          pathname={pathname}
          brandKey={brandKey}
          onClose={() => setMenuOpen(false)}
        />
      ) : null}
    </>
  )
}
