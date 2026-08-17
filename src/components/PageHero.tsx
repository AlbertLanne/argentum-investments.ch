import Image, { type StaticImageData } from 'next/image'

import { resolveBrandText, type Brand } from '@/brand/brands'
import { Container } from '@/components/ui/Container'

/**
 * Ouverture des pages intérieures : filet d'accent, surtitre, titre, chapeau.
 *
 * Avec `image`, le titre passe sur une photographie voilée en navy — les pages qui n'en ont pas
 * gardent un fond uni, ce qui est le cas de Discrétion & Confidentialité, où une photographie
 * de foule contredirait le propos.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  brand,
  image,
  imageAlt,
}: {
  eyebrow?: string
  title: string
  lead?: string[]
  brand: Brand
  image?: StaticImageData
  imageAlt?: string
}) {
  const onImage = Boolean(image)

  return (
    <section
      className={`relative isolate overflow-hidden ${
        onImage ? 'on-dark' : 'border-b border-line bg-page-alt'
      }`}
    >
      {image ? (
        <>
          <Image
            src={image}
            alt={imageAlt ?? ''}
            priority
            sizes="100vw"
            placeholder="blur"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-(image:--overlay-video)" />
        </>
      ) : null}

      <Container
        className={`pt-[calc(var(--header-h)+4rem)] pb-16 sm:pt-[calc(var(--header-h)+6rem)] sm:pb-24 ${
          onImage ? 'min-h-[26rem] sm:min-h-[32rem]' : ''
        }`}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className={`h-px w-14 ${onImage ? 'bg-white/70' : 'bg-accent'}`}
            />
            {eyebrow ? (
              <span
                className={`text-[0.6875rem] uppercase tracking-[0.16em] ${
                  onImage ? 'text-white/80' : 'text-text-muted'
                }`}
              >
                {eyebrow}
              </span>
            ) : null}
          </div>

          <h1
            className={`max-w-[26ch] text-[2.25rem] leading-[1.1] sm:text-[3rem] lg:text-[3.5rem] ${
              onImage ? 'text-white' : 'text-text-strong'
            }`}
          >
            {resolveBrandText(title, brand)}
          </h1>

          {lead?.length ? (
            <div className="max-w-(--container-prose) space-y-4">
              {lead.map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-[1.0625rem] leading-[1.75] sm:text-[1.125rem] ${
                    onImage ? 'text-white/85' : 'text-text-muted'
                  }`}
                >
                  {resolveBrandText(paragraph, brand)}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
