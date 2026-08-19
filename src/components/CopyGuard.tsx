'use client'

import { useEffect } from 'react'

/**
 * Dissuade la récupération du site pendant la validation par le client.
 *
 * CE QUE ÇA FAIT : supprime le menu contextuel, le glisser-déposer des images, la sélection de
 * texte, et les raccourcis d'enregistrement et d'inspection (F12, Ctrl+U, Ctrl+S, Ctrl+Maj+I).
 *
 * CE QUE ÇA NE FAIT PAS : empêcher la copie. Le HTML, le CSS et les images sont envoyés au
 * navigateur pour être affichés — `curl`, le menu du navigateur, le mode lecture et les outils
 * de développement lancés avant l'ouverture de la page y accèdent toujours. Aucun code exécuté
 * dans la page ne peut changer cela. Le seul verrou réel est de restreindre l'accès au site
 * lui-même : mot de passe sur la préproduction, à quoi s'ajoute le no-index déjà en place.
 *
 * Se désactive avec `NEXT_PUBLIC_COPY_GUARD=off`, à faire au passage en production : la
 * sélection de texte désactivée gêne un visiteur légitime qui veut copier une adresse e-mail.
 */
export function CopyGuard() {
  useEffect(() => {
    const stop = (event: Event) => event.preventDefault()

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const meta = event.ctrlKey || event.metaKey

      if (key === 'f12') return stop(event)
      if (meta && !event.shiftKey && (key === 'u' || key === 's')) return stop(event)
      if (meta && event.shiftKey && (key === 'i' || key === 'j' || key === 'c')) return stop(event)
    }

    document.documentElement.dataset.copyGuard = 'on'
    document.addEventListener('contextmenu', stop)
    document.addEventListener('dragstart', stop)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      delete document.documentElement.dataset.copyGuard
      document.removeEventListener('contextmenu', stop)
      document.removeEventListener('dragstart', stop)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return null
}
