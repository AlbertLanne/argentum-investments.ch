# Argentum — site double marque

Site vitrine d'un groupe d'investissement genevois. **Un seul code, deux noms de domaine, deux
sociétés anonymes réellement distinctes.** Next.js 16 (App Router), React 19, Tailwind v4, pnpm.

Français uniquement pour l'instant. Le site est **entièrement en no-index**, à la demande du
client, et il est en cours de validation : ne pas le diffuser.

| | Investments | Advisors |
|---|---|---|
| Domaine | argentum-investments.ch | argentum-advisors.ch |
| Thème | clair | sombre |
| Registre du commerce | CH-660.0.244.019-9 | CH-660.0.242.019-2 |

## Démarrer

```bash
pnpm install
cp .env.example .env.local   # renseigner les identifiants SMTP, voir plus bas
pnpm dev                     # http://localhost:3000
```

Pour voir la seconde entité sans changer de domaine, utiliser le bouton de bascule du pied de
page : il pose un cookie prioritaire sur le nom d'hôte.

## Commandes

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de développement, port 3000 |
| `pnpm build` | Build de production |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest (résolution de marque, invariants de contenu) |
| `pnpm check:brand` | Vérifie la bascule d'entité dans un vrai navigateur |
| `pnpm check:shots` | Captures d'écran de contrôle des 14 routes |
| `pnpm email:test` | Teste la connexion SMTP, puis l'envoi avec une adresse en argument |
| `pnpm check:delivery` | Acheminement complet du formulaire via une boîte jetable |
| `pnpm content:extract` + `pnpm content:build` | Régénère le contenu depuis les `.odt` |

## La règle qui structure le projet

Rien de ce qui identifie une société ne s'écrit en dur. Raison sociale, numéro de registre, UID,
adresse, e-mail, secteur, palette : tout vient de `src/brand/brands.ts`.

L'entité active est résolue dans cet ordre : **cookie de bascule > nom de domaine > Investments**
(`src/brand/resolve.ts`, `src/proxy.ts`). Dans le contenu, la raison sociale est le jeton
`%BRAND%`, résolu par `resolveBrandText()`.

Un champ à `null` est une donnée manquante : le rendu **omet la ligne** plutôt que de la déduire.
Une adresse supposée sur un Impressum suisse est une mention légale fausse.

Après toute modification du système de marque : `pnpm check:brand`.

## Le contenu vient du client

Les 19 fiches livrées en `.odt` sont archivées dans `content-source/` et converties en modules
TypeScript. **`src/content/fr/*.ts` est généré : ne pas l'éditer à la main** — corriger le `.odt`
puis relancer le pipeline, ou ajouter une retouche dans `PATCHES` (`scripts/gen_content.py`).

Seule exception : `src/content/fr/mezzanine-capital.ts`, écrit à la main (unique fiche livrée en
anglais, traduite manuellement).

## Formulaire de contact

Server Action + nodemailer. La messagerie du client est chez **IONOS** (`smtp.ionos.com`, port 465
en SSL/TLS, 587 en STARTTLS ; le port 25 est bloqué). Sans identifiants, le formulaire invite le
visiteur à écrire directement à l'adresse de l'entité. Voir `.env.example`.

## Suivi et protection

- **Google Tag Manager** (`GTM-N97NF5N`) est chargé sur toutes les pages, via
  `src/components/GoogleTagManager.tsx`. Un bandeau de consentement reste à mettre en place avant
  toute mise en ligne réelle (nLPD / RGPD).
- **`CopyGuard`** dissuade la copie pendant la validation : clic droit, glisser-déposer,
  sélection de texte et raccourcis d'inspection. Ce n'est **pas** une protection — le HTML est
  livré au navigateur, `curl` et les outils de développement y accèdent toujours. Désactiver avec
  `NEXT_PUBLIC_COPY_GUARD=off` à la mise en ligne.

## Données que le client doit encore fournir

- UID et adresse d'Argentum Advisors SA
- Identité des partenaires (la page Équipe tient sur son introduction en attendant)
- Prestataire d'hébergement, pour la politique de confidentialité
- Validation de la traduction de la fiche Mezzanine Capital
- Identifiants SMTP

Le détail des arbitrages déjà tranchés — à ne pas rouvrir — est dans `CLAUDE.md`.
