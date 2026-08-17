'use client'

import { useEffect, useState, useTransition } from 'react'

import { switchBrand } from './actions'
import type { BrandKey } from './brands'

/**
 * Bascule entre les deux entités, partagé par le sélecteur de l'en-tête et la section
 * « deux sociétés » de l'accueil.
 *
 * Le thème est appliqué au `<html>` sans attendre le serveur, sinon la palette ne changerait
 * qu'au retour du rendu. L'écriture se fait dans un effet et non dans le gestionnaire de clic :
 * synchroniser le DOM avec un état React est précisément le rôle d'un effet.
 *
 * `shown` est l'entité que l'interface doit refléter : le choix du visiteur dès qu'il a cliqué,
 * l'entité rendue par le serveur sinon. Le choix n'a pas besoin d'être relâché quand le serveur
 * rattrape — les deux valeurs coïncident alors.
 */
export function useBrandSwitch(active: BrandKey) {
  const [chosen, setChosen] = useState<BrandKey | null>(null)
  const [isPending, startTransition] = useTransition()

  const shown = chosen ?? active

  useEffect(() => {
    if (chosen === null) return
    document.documentElement.dataset.brand = chosen
  }, [chosen])

  function select(key: BrandKey) {
    // Comparaison sur `shown` : un second clic pendant que le serveur travaille ne doit pas
    // relancer l'action.
    if (key === shown) return
    setChosen(key)
    startTransition(() => {
      void switchBrand(key)
    })
  }

  return { select, isPending, shown }
}
