import { resolveBrandText, type Brand } from '@/brand/brands'
import { Button } from '@/components/ui/Button'
import { LegalIdentity } from '@/components/LegalIdentity'
import type { Block } from '@/content/fr/types'

/** Contexte de rendu : sur un bandeau inversé, les jetons de couleur changent de rôle. */
export type Tone = 'page' | 'band'

type ToneClasses = {
  body: string
  strong: string
  muted: string
  rule: string
  cardBorder: string
  cardBg: string
}

const TONES: Record<Tone, ToneClasses> = {
  page: {
    body: 'text-text-muted',
    strong: 'text-text-strong',
    muted: 'text-text-muted',
    rule: 'bg-accent',
    cardBorder: 'border-line',
    cardBg: 'bg-surface',
  },
  band: {
    body: 'text-band-muted',
    strong: 'text-band-text',
    muted: 'text-band-muted',
    rule: 'bg-band-accent',
    cardBorder: 'border-band-muted/25',
    cardBg: 'bg-transparent',
  },
}

type RenderProps = {
  block: Block
  brand: Brand
  tone: Tone
  /** Destination des appels à l'action de la page. */
  ctaHref: string
}

function text(value: string, brand: Brand) {
  return resolveBrandText(value, brand)
}

function Prose({ paragraphs, brand, tone }: { paragraphs: string[]; brand: Brand; tone: Tone }) {
  const t = TONES[tone]
  return (
    <div className="space-y-5">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className={`text-[1.0625rem] leading-[1.75] ${t.body}`}>
          {text(paragraph, brand)}
        </p>
      ))}
    </div>
  )
}

function Quote({ value, brand, tone }: { value: string; brand: Brand; tone: Tone }) {
  const t = TONES[tone]
  return (
    <figure className="my-2 flex gap-6">
      <span aria-hidden="true" className={`mt-2 w-px shrink-0 self-stretch ${t.rule}`} />
      <blockquote
        className={`font-(family-name:--font-display) text-[1.5rem] leading-[1.4] tracking-[-0.02em] sm:text-[1.75rem] ${t.strong}`}
      >
        {text(value, brand)}
      </blockquote>
    </figure>
  )
}

function Items({
  items,
  brand,
  tone,
}: {
  items: { label: string; text: string }[]
  brand: Brand
  tone: Tone
}) {
  const t = TONES[tone]
  return (
    <ul className="grid gap-px sm:grid-cols-2">
      {items.map((item, index) => (
        <li
          key={index}
          className={`border-t ${t.cardBorder} ${t.cardBg} pt-6 pr-6 pb-7 sm:pt-7`}
        >
          <h3
            className={`font-(family-name:--font-display) text-[1.1875rem] leading-snug ${t.strong}`}
          >
            {text(item.label, brand)}
          </h3>
          {item.text ? (
            <p className={`mt-3 text-[0.9375rem] leading-[1.7] ${t.body}`}>
              {text(item.text, brand)}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function Steps({
  items,
  brand,
  tone,
}: {
  items: { num: string; label: string; text: string }[]
  brand: Brand
  tone: Tone
}) {
  const t = TONES[tone]
  return (
    <ol className="relative space-y-10 sm:space-y-12">
      {items.map((step, index) => (
        <li key={step.num} className="relative flex gap-6 sm:gap-10">
          <div className="flex flex-col items-center">
            <span
              className={`font-(family-name:--font-display) text-[1.375rem] leading-none tabular-nums ${
                tone === 'band' ? 'text-band-accent' : 'text-accent-contrast'
              }`}
            >
              {step.num}
            </span>
            {index < items.length - 1 ? (
              <span
                aria-hidden="true"
                className={`mt-3 w-px flex-1 ${
                  tone === 'band' ? 'bg-band-muted/30' : 'step-rail opacity-60'
                }`}
              />
            ) : null}
          </div>
          <div className="flex-1 pb-1">
            <h3
              className={`font-(family-name:--font-display) text-[1.25rem] leading-snug ${t.strong}`}
            >
              {text(step.label, brand)}
            </h3>
            {step.text ? (
              <p className={`mt-3 max-w-(--container-prose) text-[0.9375rem] leading-[1.7] ${t.body}`}>
                {text(step.text, brand)}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}

function Bullets({ items, brand, tone }: { items: string[]; brand: Brand; tone: Tone }) {
  const t = TONES[tone]
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className={`flex gap-4 text-[1rem] leading-[1.7] ${t.body}`}>
          <span
            aria-hidden="true"
            className={`mt-[0.6875rem] h-px w-4 shrink-0 ${t.rule}`}
          />
          <span>{text(item, brand)}</span>
        </li>
      ))}
    </ul>
  )
}

function Definitions({
  items,
  brand,
  tone,
}: {
  items: { label: string; text: string }[]
  brand: Brand
  tone: Tone
}) {
  const t = TONES[tone]
  return (
    <dl className="space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          <dt className={`text-[0.9375rem] font-medium ${t.strong}`}>{text(item.label, brand)}</dt>
          <dd className={`mt-1 text-[0.9375rem] leading-[1.7] ${t.body}`}>
            {text(item.text, brand)}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function Disclaimer({ paragraphs, brand }: { paragraphs: string[]; brand: Brand }) {
  return (
    <aside className="border-t border-line pt-6">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-[0.8125rem] leading-[1.7] text-text-muted">
          {text(paragraph, brand)}
        </p>
      ))}
    </aside>
  )
}

export function BlockRenderer({ block, brand, tone, ctaHref }: RenderProps) {
  switch (block.type) {
    case 'prose':
      return <Prose paragraphs={block.paragraphs} brand={brand} tone={tone} />
    case 'quote':
      return <Quote value={block.text} brand={brand} tone={tone} />
    case 'items':
      return <Items items={block.items} brand={brand} tone={tone} />
    case 'steps':
      return <Steps items={block.items} brand={brand} tone={tone} />
    case 'bullets':
      return <Bullets items={block.items} brand={brand} tone={tone} />
    case 'definitions':
      return <Definitions items={block.items} brand={brand} tone={tone} />
    case 'legalIdentity':
      return <LegalIdentity brand={brand} />
    case 'disclaimer':
      return <Disclaimer paragraphs={block.paragraphs} brand={brand} />
    case 'button':
      return (
        <div className="pt-2">
          <Button href={ctaHref} variant={tone === 'band' ? 'onBand' : 'solid'}>
            {text(block.label, brand)}
          </Button>
        </div>
      )
    case 'todo':
      // Donnée que le client n'a pas fournie : visible en développement uniquement.
      if (process.env.NODE_ENV === 'production') return null
      return (
        <p className="rounded-(--radius-md) border border-dashed border-line-strong px-4 py-3 text-[0.8125rem] text-text-muted">
          À compléter — {block.note}
        </p>
      )
  }
}
