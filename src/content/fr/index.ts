// Généré — registre des pages de contenu.
import { accueil } from './accueil'
import { services } from './services'
import { services_immobilier } from './services-immobilier'
import { financement_immobilier } from './financement-immobilier'
import { capital_investissement } from './capital-investissement'
import { capital_risque } from './capital-risque'
import { investissements_start_up } from './investissements-start-up'
import { mezzanine_capital } from './mezzanine-capital'
import { developpement_de_projets } from './developpement-de-projets'
import { energies_renouvelables } from './energies-renouvelables'
import { medecine_pharma } from './medecine-pharma'
import { solutions_technologiques_e_mobilite } from './solutions-technologiques-e-mobilite'
import { crowdfunding } from './crowdfunding'
import { a_propos } from './a-propos'
import { discretion } from './discretion'
import { notre_equipe } from './notre-equipe'
import { mentions_legales } from './mentions-legales'
import { impressum } from './impressum'
import { politique_de_confidentialite } from './politique-de-confidentialite'

import type { PageContent } from './types'

export const pages = {
  'accueil': accueil,
  'services': services,
  'services-immobilier': services_immobilier,
  'financement-immobilier': financement_immobilier,
  'capital-investissement': capital_investissement,
  'capital-risque': capital_risque,
  'investissements-start-up': investissements_start_up,
  'mezzanine-capital': mezzanine_capital,
  'developpement-de-projets': developpement_de_projets,
  'energies-renouvelables': energies_renouvelables,
  'medecine-pharma': medecine_pharma,
  'solutions-technologiques-e-mobilite': solutions_technologiques_e_mobilite,
  'crowdfunding': crowdfunding,
  'a-propos': a_propos,
  'discretion': discretion,
  'notre-equipe': notre_equipe,
  'mentions-legales': mentions_legales,
  'impressum': impressum,
  'politique-de-confidentialite': politique_de_confidentialite,
} satisfies Record<string, PageContent>

export type PageSlug = keyof typeof pages

export function getPage<S extends PageSlug>(slug: S): PageContent {
  return pages[slug]
}
