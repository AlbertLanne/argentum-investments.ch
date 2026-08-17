import { resolveBrandText, type Brand } from '@/brand/brands'
import { BlockRenderer, type Tone } from '@/components/blocks/BlockRenderer'
import { Container } from '@/components/ui/Container'
import type { Block, PageContent, Section } from '@/content/fr/types'

/** Blocs qui portent une structure dense : ils justifient un fond teinté. */
const DENSE: Block['type'][] = ['items', 'steps', 'bullets']

/** Un bloc pleine largeur mérite la largeur de page ; le texte courant reste en colonne. */
const WIDE: Block['type'][] = ['items', 'steps', 'legalIdentity']

function isDense(section: Section) {
  return section.blocks.some((block) => DENSE.includes(block.type))
}

function hasButton(section: Section) {
  return section.blocks.some((block) => block.type === 'button')
}

/**
 * Décide du fond de chaque section.
 *
 * La dernière section porteuse d'un appel à l'action devient un bandeau à contraste inversé :
 * c'est le seul endroit de la page où le regard doit être forcé. Les sections denses
 * (grilles de critères, processus numérotés) reçoivent un fond teinté qui les encadre.
 */
function planTones(sections: Section[]): Tone[] {
  const lastCta = sections.reduce((found, section, index) => (hasButton(section) ? index : found), -1)
  return sections.map((section, index) => (index === lastCta ? 'band' : 'page'))
}

function sectionBackground(section: Section, tone: Tone) {
  if (tone === 'band') return 'bg-band text-band-text'
  return isDense(section) ? 'bg-page-alt' : 'bg-page'
}

function SectionHeading({
  title,
  tone,
  brand,
}: {
  title: string
  tone: Tone
  brand: Brand
}) {
  return (
    <div className="mb-10 flex flex-col gap-5">
      <span
        aria-hidden="true"
        className={`h-px w-14 ${tone === 'band' ? 'bg-band-accent' : 'bg-accent'}`}
      />
      <h2
        className={`max-w-[36ch] text-[1.75rem] leading-[1.2] sm:text-[2.125rem] ${
          tone === 'band' ? 'text-band-text' : 'text-text-strong'
        }`}
      >
        {resolveBrandText(title, brand)}
      </h2>
    </div>
  )
}

function SectionBlocks({
  section,
  brand,
  tone,
  ctaHref,
}: {
  section: Section
  brand: Brand
  tone: Tone
  ctaHref: string
}) {
  return (
    <div className="space-y-8">
      {section.blocks.map((block, index) => (
        <div
          key={index}
          className={WIDE.includes(block.type) ? '' : 'max-w-(--container-prose)'}
        >
          <BlockRenderer block={block} brand={brand} tone={tone} ctaHref={ctaHref} />
        </div>
      ))}
    </div>
  )
}

/**
 * Rend les sections d'une fiche en colonne continue.
 *
 * Les pages juridiques enchaînent une quinzaine de sections de deux paragraphes : leur donner
 * chacune l'espacement d'une section éditoriale étirerait la page sans rien apporter.
 */
function CompactBody({
  page,
  brand,
  ctaHref,
}: {
  page: PageContent
  brand: Brand
  ctaHref: string
}) {
  return (
    <section className="bg-page py-16 sm:py-20">
      <Container width="prose">
        <div className="space-y-12">
          {page.sections.map((section, index) => (
            <div key={index} className="space-y-5">
              {section.title && section.title !== page.title ? (
                <h2 className="text-[1.25rem] leading-snug sm:text-[1.375rem]">
                  {resolveBrandText(section.title, brand)}
                </h2>
              ) : null}
              {section.blocks.map((block, blockIndex) => (
                <BlockRenderer
                  key={blockIndex}
                  block={block}
                  brand={brand}
                  tone="page"
                  ctaHref={ctaHref}
                />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

/**
 * Rend une fiche de contenu client en sections mises en page.
 *
 * Un intertitre identique au titre de la page est ignoré : le cas se présente sur la fiche
 * Notre Équipe, dont le .odt ouvre sur un H2 homonyme.
 */
export function PageBody({
  page,
  brand,
  ctaHref = '/contact',
  compact = false,
}: {
  page: PageContent
  brand: Brand
  ctaHref?: string
  /** Colonne continue plutôt que sections pleine largeur. Pour les pages juridiques. */
  compact?: boolean
}) {
  if (compact) return <CompactBody page={page} brand={brand} ctaHref={ctaHref} />

  const sections = page.sections
  const tones = planTones(sections)

  return (
    <>
      {sections.map((section, index) => {
        const tone = tones[index]
        const skipTitle = section.title !== null && section.title === page.title
        return (
          <section
            key={index}
            className={`py-16 sm:py-20 lg:py-(--spacing-section) ${sectionBackground(section, tone)}`}
          >
            <Container>
              {section.title && !skipTitle ? (
                <SectionHeading title={section.title} tone={tone} brand={brand} />
              ) : null}
              <SectionBlocks section={section} brand={brand} tone={tone} ctaHref={ctaHref} />
            </Container>
          </section>
        )
      })}
    </>
  )
}
