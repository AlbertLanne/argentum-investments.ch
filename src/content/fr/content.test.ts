import { describe, expect, it } from 'vitest'

import { FINANCE_LINKS, LEGAL_NAV, MAIN_NAV } from '@/config/navigation'

import { pages } from './index'

/**
 * Le contenu est généré depuis les .odt du client. Ces tests protègent les invariants que la
 * génération doit préserver, et signalent les régressions de contenu qu'aucun type ne peut voir.
 */

const allPages = Object.values(pages)

/** Toutes les chaînes d'une fiche, y compris les intitulés de listes et d'étapes. */
function allStrings(page: (typeof allPages)[number]): string[] {
  const out: string[] = [page.title ?? '', ...page.lead]
  for (const section of page.sections) {
    if (section.title) out.push(section.title)
    for (const block of section.blocks) {
      switch (block.type) {
        case 'prose':
        case 'disclaimer':
          out.push(...block.paragraphs)
          break
        case 'items':
        case 'definitions':
          out.push(...block.items.flatMap((item) => [item.label, item.text]))
          break
        case 'steps':
          out.push(...block.items.flatMap((item) => [item.label, item.text]))
          break
        case 'bullets':
          out.push(...block.items)
          break
        case 'quote':
          out.push(block.text)
          break
        case 'button':
          out.push(block.label)
          break
      }
    }
  }
  return out.filter(Boolean)
}

describe('intégrité des fiches', () => {
  it('couvre les 19 fiches livrées par le client', () => {
    expect(allPages).toHaveLength(19)
  })

  it('donne un titre et du contenu à chaque fiche', () => {
    for (const page of allPages) {
      expect(page.title, page.slug).toBeTruthy()
      // La fiche Notre Équipe se réduit à son chapeau : sa grille de partenaires a été retirée,
      // le client n'ayant livré que des placeholders. Le contenu peut donc tenir dans le chapeau.
      expect(page.lead.length + page.sections.length, page.slug).toBeGreaterThan(0)
    }
  })

  it('n’écrit jamais la raison sociale en dur', () => {
    // Une occurrence en dur produirait une mention fausse sur l'autre domaine.
    for (const page of allPages) {
      for (const text of allStrings(page)) {
        expect(text, `${page.slug} : « ${text.slice(0, 70)}… »`).not.toMatch(
          /Argentum\s+(Investments|Advisors)/,
        )
      }
    }
  })

  it('ne laisse aucun placeholder du document source', () => {
    // Le client a livré des « [Insérer …] » et « [Prénom Nom] » qui ne doivent pas être publiés.
    for (const page of allPages) {
      for (const text of allStrings(page)) {
        expect(text, `${page.slug} : « ${text.slice(0, 70)}… »`).not.toMatch(
          /\[(Insérer|Prénom|Fonction|Adresse|Mois)/,
        )
      }
    }
  })

  it('a traduit la seule fiche livrée en anglais', () => {
    const mezzanine = allStrings(pages['mezzanine-capital']).join(' ')
    for (const marker of ['Flexible Capital', 'from EUR', 'SUBMIT YOUR', 'What Matters']) {
      expect(mezzanine).not.toContain(marker)
    }
    expect(mezzanine).toContain('millions d’euros')
  })

  it('a retiré la grille des partenaires, non fournie', () => {
    const equipe = pages['notre-equipe']
    expect(equipe.lead.length).toBeGreaterThan(0)
    expect(equipe.sections.flatMap((s) => s.blocks).filter((b) => b.type === 'items')).toHaveLength(0)
  })

  it('rend l’identité légale depuis la config sur les pages qui la portent', () => {
    for (const slug of ['impressum', 'politique-de-confidentialite'] as const) {
      const blocks = pages[slug].sections.flatMap((section) => section.blocks)
      expect(blocks.some((block) => block.type === 'legalIdentity'), slug).toBe(true)
    }
  })
})

describe('cohérence de la navigation', () => {
  it('associe chaque entrée de menu à une fiche existante', () => {
    const links = [...MAIN_NAV, ...MAIN_NAV.flatMap((l) => l.children ?? []), ...LEGAL_NAV]
    for (const link of links) {
      if (!link.content) continue
      expect(pages[link.content], `${link.label} -> ${link.content}`).toBeDefined()
    }
  })

  it('expose les dix domaines Finance, chacun avec sa fiche', () => {
    expect(FINANCE_LINKS).toHaveLength(10)
    for (const link of FINANCE_LINKS) {
      expect(link.content, link.label).toBeDefined()
      expect(pages[link.content!], link.label).toBeDefined()
    }
  })

  it('place Crowdfunding en dernier et le financement immobilier en premier', () => {
    // Arbitrage documenté : la fiche Crowdfunding dit elle-même que la levée de fonds publique
    // n'est pas au cœur de l'approche.
    expect(FINANCE_LINKS[0].content).toBe('financement-immobilier')
    expect(FINANCE_LINKS.at(-1)!.content).toBe('crowdfunding')
  })

  it('ne propose aucune URL en double', () => {
    const hrefs = [...MAIN_NAV, ...MAIN_NAV.flatMap((l) => l.children ?? []), ...LEGAL_NAV].map(
      (l) => l.href,
    )
    expect(new Set(hrefs).size).toBe(hrefs.length)
  })
})
