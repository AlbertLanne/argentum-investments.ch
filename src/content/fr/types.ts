/**
 * Modèle de contenu du site. Les fiches livrées par le client (19 fichiers .odt) sont
 * converties en blocs typés par `scripts/gen-content.py`, puis rendues par
 * `src/components/blocks/BlockRenderer.tsx`.
 *
 * Toute chaîne de ce modèle peut contenir le jeton `%BRAND%`, résolu à l'exécution en
 * « Argentum Investments SA » ou « Argentum Advisors SA » selon l'entité active.
 */

/** Paragraphes courants. */
export type ProseBlock = { type: 'prose'; paragraphs: string[] }

/** Liste de critères : un intitulé en gras suivi de son explication. */
export type ItemsBlock = {
  type: 'items'
  items: { label: string; text: string }[]
}

/** Processus numéroté « 01 – … » à « 05 – … ». */
export type StepsBlock = {
  type: 'steps'
  items: { num: string; label: string; text: string }[]
}

/** Puces simples, sans intitulé. */
export type BulletsBlock = { type: 'bullets'; items: string[] }

/** Accroche mise en exergue par le client. */
export type QuoteBlock = { type: 'quote'; text: string }

/** Libellé d'appel à l'action ; la cible est décidée par la page. */
export type ButtonBlock = { type: 'button'; label: string }

/** Avertissement juridique de bas de page. */
export type DisclaimerBlock = { type: 'disclaimer'; paragraphs: string[] }

/** Identité légale de l'entité active, rendue depuis la config de marque. */
export type LegalIdentityBlock = { type: 'legalIdentity' }

/** Couples intitulé / valeur (hébergeur, date de mise à jour…). */
export type DefinitionsBlock = {
  type: 'definitions'
  items: { label: string; text: string }[]
}

/** Donnée que le client n'a pas encore fournie. Invisible en production. */
export type TodoBlock = { type: 'todo'; note: string }

export type Block =
  | ProseBlock
  | ItemsBlock
  | StepsBlock
  | BulletsBlock
  | QuoteBlock
  | ButtonBlock
  | DisclaimerBlock
  | LegalIdentityBlock
  | DefinitionsBlock
  | TodoBlock

export type Section = {
  /** Absent quand le client a posé des blocs avant tout intertitre. */
  title: string | null
  level: number
  blocks: Block[]
}

export type PageContent = {
  slug: string
  /** Libellé du lien dans la navigation. */
  menu: string
  title: string | null
  /** Chapeau : les paragraphes qui précèdent le premier intertitre. */
  lead: string[]
  sections: Section[]
}
