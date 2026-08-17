import type { Brand } from '@/brand/brands'

type Row = { label: string; value: string }

/**
 * Identité légale de l'entité active.
 *
 * Les lignes dont la donnée est absente sont omises, jamais remplies par supposition :
 * Argentum Advisors SA n'a pas encore communiqué son adresse ni son UID, et aucune des deux
 * entités n'a de numéro de téléphone.
 */
export function LegalIdentity({ brand }: { brand: Brand }) {
  const rows: Row[] = []

  if (brand.uid) rows.push({ label: 'Numéro d’identification de l’entreprise (UID)', value: brand.uid })
  rows.push({ label: 'Numéro du registre du commerce', value: brand.registryNumber })
  rows.push({ label: 'Forme juridique', value: 'Société anonyme (SA)' })
  rows.push({ label: 'Secteur d’activité', value: brand.sector })
  if (brand.representative) rows.push({ label: 'Représentant autorisé', value: brand.representative })

  return (
    // Le bloc sert à la fois dans la colonne étroite de la page Contact et sur toute la largeur
    // de l'Impressum : la mise en deux colonnes dépend de la place réelle, pas de la fenêtre.
    <div className="@container space-y-8">
      <address className="not-italic">
        <p className="font-(family-name:--font-display) text-[1.25rem] text-text-strong">
          {brand.legalName}
        </p>
        {brand.address ? (
          <p className="mt-2 text-[0.9375rem] leading-[1.8] text-text-muted">
            {brand.address.street}
            <br />
            {brand.address.postalCode} {brand.address.city}
            <br />
            {brand.address.country}
          </p>
        ) : null}
        <p className="mt-3 text-[0.9375rem]">
          <a
            href={`mailto:${brand.email}`}
            className="text-accent-contrast underline decoration-line-strong decoration-1 underline-offset-4 transition-colors hover:decoration-accent"
          >
            {brand.email}
          </a>
        </p>
      </address>

      <dl className="grid gap-x-10 gap-y-4 border-t border-line pt-6 @xl:grid-cols-[minmax(0,20rem)_1fr]">
        {rows.map((row) => (
          <div key={row.label} className="@xl:contents">
            <dt className="text-[0.75rem] uppercase tracking-[0.1em] text-text-muted">
              {row.label}
            </dt>
            <dd className="mt-1 text-[0.9375rem] text-text @xl:mt-0">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
