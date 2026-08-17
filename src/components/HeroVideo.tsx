'use client'

import { useEffect, useRef, useState } from 'react'

import poster from '@/assets/images/hero-geneve-poster.jpg'

/**
 * Vidéo d'arrière-plan du hero d'accueil (Genève, fournie par le client).
 *
 * Le fichier pèse 14 Mo : on ne le charge donc jamais d'office. La source n'est branchée que
 * si le visiteur est sur un écran large et n'a pas demandé à réduire les animations. Partout
 * ailleurs, l'image d'affiche — une vue du Jet d'eau extraite de la même séquence — suffit.
 */
export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [source, setSource] = useState<string | null>(null)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const wideEnough = window.matchMedia('(min-width: 768px)')

    function decide() {
      setSource(!reducedMotion.matches && wideEnough.matches ? '/video/hero-geneve.webm' : null)
    }

    decide()
    reducedMotion.addEventListener('change', decide)
    wideEnough.addEventListener('change', decide)
    return () => {
      reducedMotion.removeEventListener('change', decide)
      wideEnough.removeEventListener('change', decide)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !source) return
    // Certains navigateurs refusent la lecture automatique : l'affiche reste alors visible.
    void video.play().catch(() => undefined)
  }, [source])

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <video
        ref={videoRef}
        poster={poster.src}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        src={source ?? undefined}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-(image:--overlay-video)" />
    </div>
  )
}
