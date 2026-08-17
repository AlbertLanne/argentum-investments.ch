'use client'

import { BRANDS, BRAND_KEYS, type BrandKey } from '@/brand/brands'
import { useBrandSwitch } from '@/brand/useBrandSwitch'

/**
 * Bascule entre Argentum Investments SA et Argentum Advisors SA.
 *
 * Le thème change immédiatement, puis l'action serveur pose le cookie et rejoue le rendu pour
 * mettre à jour la raison sociale dans le corps du texte et les mentions légales du pied de page.
 */
export function BrandSwitcher({
  active,
  className = '',
  onDark = false,
}: {
  active: BrandKey
  className?: string
  /** Au-dessus de la vidéo du hero, les jetons de thème ne sont pas lisibles. */
  onDark?: boolean
}) {
  const { select, isPending, shown } = useBrandSwitch(active)

  return (
    <div
      role="group"
      aria-label="Entité du groupe Argentum"
      data-pending={isPending ? '' : undefined}
      className={`inline-flex items-center rounded-(--radius-md) border p-0.5 ${
        onDark ? 'border-white/35' : 'border-line'
      } ${className}`}
    >
      {BRAND_KEYS.map((key) => {
        const brand = BRANDS[key]
        const isActive = key === shown
        const tone = onDark
          ? isActive
            ? 'bg-white text-navy-900'
            : 'text-white/75 hover:text-white'
          : isActive
            ? 'bg-brand text-on-brand'
            : 'text-text-muted hover:text-accent-contrast'
        return (
          <button
            key={key}
            type="button"
            onClick={() => select(key)}
            aria-pressed={isActive}
            title={`${brand.legalName} — ${brand.tagline}`}
            className={`rounded-[calc(var(--radius-md)-1px)] px-3 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.1em] transition-colors duration-200 ${tone}`}
          >
            {brand.distinctive}
          </button>
        )
      })}
    </div>
  )
}
