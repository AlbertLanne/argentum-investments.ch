import { describe, expect, it } from 'vitest'

import {
  BRANDS,
  BRAND_KEYS,
  brandFromHost,
  isBrandKey,
  otherBrand,
  resolveBrandText,
} from './brands'

/**
 * La résolution d'entité décide quelles mentions légales s'affichent. Une erreur ici publie le
 * numéro de registre d'une société sur le site de l'autre — d'où ces tests.
 */

describe('brandFromHost', () => {
  it('reconnaît les deux domaines de production', () => {
    expect(brandFromHost('argentum-investments.ch')).toBe('investments')
    expect(brandFromHost('argentum-advisors.ch')).toBe('advisors')
  })

  it('ignore la casse et le port', () => {
    expect(brandFromHost('WWW.Argentum-Advisors.CH:3000')).toBe('advisors')
  })

  it('reconnaît un sous-domaine de préproduction', () => {
    expect(brandFromHost('argentum-advisors-preview.vercel.app')).toBe('advisors')
  })

  it('ne tranche pas sur un hôte inconnu', () => {
    expect(brandFromHost('localhost:3000')).toBeNull()
    expect(brandFromHost(null)).toBeNull()
    expect(brandFromHost(undefined)).toBeNull()
    expect(brandFromHost('')).toBeNull()
  })

  it('ne confond pas les deux domaines entre eux', () => {
    // Les deux chaînes partagent le préfixe « argentum- » : la correspondance doit porter sur
    // le domaine entier, pas sur ce préfixe.
    expect(brandFromHost('argentum-investments.ch')).not.toBe('advisors')
    expect(brandFromHost('argentum-advisors.ch')).not.toBe('investments')
  })
})

describe('isBrandKey', () => {
  it('accepte les deux clés connues', () => {
    for (const key of BRAND_KEYS) expect(isBrandKey(key)).toBe(true)
  })

  it('rejette tout le reste', () => {
    // Un cookie falsifié ou périmé ne doit jamais produire une entité inconnue.
    for (const value of ['', 'Investments', 'advisor', 'null', null, undefined, 0, {}, []]) {
      expect(isBrandKey(value)).toBe(false)
    }
  })
})

describe('resolveBrandText', () => {
  it('remplace toutes les occurrences du jeton', () => {
    const source = '%BRAND% investit. %BRAND% n’est pas une banque.'
    expect(resolveBrandText(source, BRANDS.advisors)).toBe(
      'Argentum Advisors SA investit. Argentum Advisors SA n’est pas une banque.',
    )
  })

  it('laisse intact un texte sans jeton', () => {
    expect(resolveBrandText('Genève, Suisse', BRANDS.investments)).toBe('Genève, Suisse')
  })
})

describe('configuration des entités', () => {
  it('n’attribue aucun numéro de téléphone', () => {
    // Le client n'en a communiqué aucun : le rendu ne doit jamais avoir de valeur à afficher.
    for (const key of BRAND_KEYS) expect(BRANDS[key].phone).toBeNull()
  })

  it('donne à chaque entité un registre du commerce distinct', () => {
    const numbers = BRAND_KEYS.map((key) => BRANDS[key].registryNumber)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('donne à chaque entité une adresse de contact distincte sur son propre domaine', () => {
    for (const key of BRAND_KEYS) {
      const brand = BRANDS[key]
      expect(brand.email.endsWith(`@${brand.domain}`)).toBe(true)
    }
  })

  it('laisse à null les données non communiquées par le client', () => {
    // Documente l'arbitrage : plutôt une ligne absente qu'une mention légale supposée.
    expect(BRANDS.advisors.uid).toBeNull()
    expect(BRANDS.advisors.address).toBeNull()
  })

  it('distingue les deux entités par leur thème', () => {
    expect(BRANDS.investments.theme).not.toBe(BRANDS.advisors.theme)
  })
})

describe('otherBrand', () => {
  it('renvoie toujours l’autre entité', () => {
    expect(otherBrand('investments')).toBe('advisors')
    expect(otherBrand('advisors')).toBe('investments')
  })
})
