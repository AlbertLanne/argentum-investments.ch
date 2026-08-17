import Link from 'next/link'
import type { ReactNode } from 'react'

type Variant = 'solid' | 'outline' | 'onBand' | 'solidOnDark' | 'ghostOnDark'

const BASE =
  'group inline-flex items-center justify-center gap-3 rounded-(--radius-md) px-7 py-4 ' +
  'text-[0.8125rem] font-medium uppercase tracking-[0.12em] no-underline ' +
  'transition-colors duration-200'

const VARIANTS: Record<Variant, string> = {
  solid: 'bg-brand text-on-brand hover:bg-brand-hover',
  outline: 'border border-line-strong text-text hover:border-accent hover:text-accent-contrast',
  onBand: 'bg-band-accent text-band hover:opacity-90',
  // Pour les fonds photographiques et vidéo, où aucun jeton de thème ne s'applique.
  solidOnDark: 'bg-white text-navy-900 hover:bg-navy-100',
  ghostOnDark: 'border border-white/45 text-white hover:border-white hover:bg-white/12',
}

/** Flèche qui avance au survol : seul mouvement autorisé sur les appels à l'action. */
function Arrow() {
  return (
    <span
      aria-hidden="true"
      className="transition-transform duration-200 ease-(--ease-out-quart) group-hover:translate-x-1"
    >
      →
    </span>
  )
}

export function Button({
  href,
  children,
  variant = 'solid',
  className = '',
  withArrow = true,
}: {
  href: string
  children: ReactNode
  variant?: Variant
  className?: string
  withArrow?: boolean
}) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      <span>{children}</span>
      {withArrow ? <Arrow /> : null}
    </Link>
  )
}

export function SubmitButton({
  children,
  variant = 'solid',
  className = '',
  disabled = false,
}: {
  children: ReactNode
  variant?: Variant
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`${BASE} ${VARIANTS[variant]} ${className} disabled:cursor-not-allowed disabled:opacity-55`}
    >
      <span>{children}</span>
    </button>
  )
}
