import type { Metadata, Viewport } from 'next'
import { Inter, Newsreader } from 'next/font/google'

import { getBrand } from '@/brand/resolve'
import { CopyGuard } from '@/components/CopyGuard'
import { Footer } from '@/components/Footer'
import {
  GoogleTagManagerNoScript,
  GoogleTagManagerScript,
} from '@/components/GoogleTagManager'
import { Header } from '@/components/Header'
import { MAIN_NAV } from '@/config/navigation'

import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-newsreader',
  weight: ['400', '500'],
  style: ['normal'],
})

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

/**
 * Le site entier est exclu de l'indexation, à la demande du client.
 *
 * Trois verrous se cumulent : cette balise meta, l'en-tête `X-Robots-Tag` posé par
 * `src/proxy.ts` pour couvrir les réponses non HTML, et le `robots.txt` généré par
 * `src/app/robots.ts`.
 */
const NO_INDEX = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: { index: false, follow: false },
} as const

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand()
  return {
    title: {
      default: brand.legalName,
      template: `%s — ${brand.legalName}`,
    },
    description: brand.tagline,
    applicationName: brand.legalName,
    robots: NO_INDEX,
    metadataBase: new URL(`https://${brand.domain}`),
    openGraph: {
      title: brand.legalName,
      description: brand.tagline,
      locale: 'fr_CH',
      type: 'website',
      siteName: brand.legalName,
    },
    formatDetection: { telephone: false, email: false, address: false },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

/**
 * Le site est en validation chez le client : la copie est dissuadée par défaut. Voir la portée
 * réelle de cette protection dans `CopyGuard`. À passer à `off` lors de la mise en ligne.
 */
const COPY_GUARD = process.env.NEXT_PUBLIC_COPY_GUARD !== 'off'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = await getBrand()

  return (
    <html lang="fr" data-brand={brand.key} className={`${inter.variable} ${newsreader.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <GoogleTagManagerNoScript />

        {COPY_GUARD ? <CopyGuard /> : null}

        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded-(--radius-md) focus:bg-brand focus:px-4 focus:py-2 focus:text-on-brand"
        >
          Aller au contenu
        </a>

        <Header nav={MAIN_NAV} brandKey={brand.key} />

        <main id="contenu" className="flex-1">
          {children}
        </main>

        <Footer brand={brand} />

        <GoogleTagManagerScript />
      </body>
    </html>
  )
}
