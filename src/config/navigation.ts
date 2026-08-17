import type { PageSlug } from '@/content/fr'

export type NavLink = {
  label: string
  href: string
  /** Fiche de contenu associée, quand la page en a une. */
  content?: PageSlug
  children?: NavLink[]
}

/**
 * Sous-menu Finance, classé par priorité commerciale décroissante.
 *
 * Le financement immobilier et le capital-investissement portent le plus de demande et les
 * tickets les plus élevés. Le crowdfunding ferme la liste parce que la fiche du client dit
 * elle-même que la levée de fonds auprès du public n'est pas au cœur de l'approche : c'est une
 * page défensive, pas un produit d'appel.
 */
export const FINANCE_LINKS: NavLink[] = [
  { label: 'Financement immobilier', href: '/finance/financement-immobilier', content: 'financement-immobilier' },
  { label: 'Capital-investissement', href: '/finance/capital-investissement', content: 'capital-investissement' },
  { label: 'Capital-risque', href: '/finance/capital-risque', content: 'capital-risque' },
  { label: 'Investissements start-up', href: '/finance/investissements-start-up', content: 'investissements-start-up' },
  { label: 'Mezzanine Capital', href: '/finance/mezzanine-capital', content: 'mezzanine-capital' },
  { label: 'Développement de projets', href: '/finance/developpement-de-projets', content: 'developpement-de-projets' },
  { label: 'Énergies renouvelables', href: '/finance/energies-renouvelables', content: 'energies-renouvelables' },
  { label: 'Médecine & Pharma', href: '/finance/medecine-pharma', content: 'medecine-pharma' },
  {
    label: 'Solutions technologiques & E-Mobilité',
    href: '/finance/solutions-technologiques-e-mobilite',
    content: 'solutions-technologiques-e-mobilite',
  },
  { label: 'Crowdfunding', href: '/finance/crowdfunding', content: 'crowdfunding' },
]

export const MAIN_NAV: NavLink[] = [
  { label: 'Accueil', href: '/', content: 'accueil' },
  {
    label: 'Services',
    href: '/services',
    content: 'services',
    children: [
      { label: 'Services immobilier', href: '/services/immobilier', content: 'services-immobilier' },
    ],
  },
  { label: 'Finance', href: '/finance', children: FINANCE_LINKS },
  { label: 'À propos', href: '/a-propos', content: 'a-propos' },
  { label: 'Discrétion', href: '/discretion', content: 'discretion' },
  { label: 'Notre équipe', href: '/notre-equipe', content: 'notre-equipe' },
  { label: 'Contact', href: '/contact' },
]

export const LEGAL_NAV: NavLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales', content: 'mentions-legales' },
  { label: 'Impressum', href: '/impressum', content: 'impressum' },
  {
    label: 'Politique de confidentialité',
    href: '/politique-de-confidentialite',
    content: 'politique-de-confidentialite',
  },
]

/** Slug de fiche Finance -> URL, pour les liens croisés entre pages sectorielles. */
export const FINANCE_HREF_BY_CONTENT = new Map(
  FINANCE_LINKS.map((link) => [link.content, link.href] as const),
)
