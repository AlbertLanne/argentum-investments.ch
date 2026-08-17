import Image from 'next/image'

import logo from '@/assets/brand/argentum-logo.png'

/**
 * Signature Argentum.
 *
 * Le fichier fourni par le client est un PNG à fond transparent, dessiné en navy et bleu.
 * Sur le thème sombre d'Advisors ces teintes disparaissent dans le fond : la classe
 * `brand-logo` (voir globals.css) le retourne en blanc plein, qui est la version « reverse »
 * habituelle d'une signature de ce type.
 *
 * Le mot-symbole ne porte que « ARGENTUM », sans la raison sociale : il est donc valable pour
 * les deux entités et n'a pas à changer avec la bascule.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="Argentum"
      priority
      sizes="220px"
      className={`brand-logo h-auto w-[168px] sm:w-[196px] ${className}`}
    />
  )
}
