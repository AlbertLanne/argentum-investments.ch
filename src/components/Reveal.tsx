'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Fait apparaître son contenu (fondu + léger déplacement) quand il entre dans le viewport.
 *
 * `direction="up"` sert aux sections qui s'enchaînent verticalement ; `direction="left"` sert
 * aux blocs d'une même rangée (grilles, listes), combiné à `delayMs` pour un effet décalé de
 * gauche à droite. `prefers-reduced-motion` est déjà géré globalement dans `globals.css`
 * (`@layer base`, transitions ramenées à 0.01ms) : rien de spécifique à faire ici.
 */
export function Reveal({
  children,
  className = '',
  delayMs = 0,
  direction = 'up',
}: {
  children: React.ReactNode
  className?: string
  delayMs?: number
  direction?: 'up' | 'left'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const hiddenOffset = direction === 'left' ? '-translate-x-8' : 'translate-y-8'

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delayMs}ms` : '0ms' }}
      className={`transition-all duration-700 ease-(--ease-out-quart) ${
        visible ? 'translate-x-0 translate-y-0 opacity-100' : `${hiddenOffset} opacity-0`
      } ${className}`}
    >
      {children}
    </div>
  )
}
