@AGENTS.md

> Les **standards EkoMedia** (plugin `ekomedia-os`) s'appliquent : réponses en français, aucun
> processus en arrière-plan, aucun secret commité, aucun contenu inventé. Les règles ci-dessous
> les complètent et priment en cas de conflit.
>
> Skills utiles ici : `nextjs-quality` avant livraison, `seo-ekomedia` si le no-index est un jour
> levé, `session-memory` en fin de session. Commandes : `/qa`, `/score`.

# Argentum — site double marque

Site vitrine d'un groupe d'investissement genevois. **Un seul code, deux noms de domaine, deux
sociétés anonymes réellement distinctes.** Français uniquement pour l'instant, d'autres langues
viendront. Site entièrement en no-index, à la demande du client.

Serveur de dev sur le port 3000.

## La règle qui structure tout le projet

Rien de ce qui identifie une société ne s'écrit en dur. Raison sociale, numéro de registre, UID,
adresse, e-mail, secteur d'activité, palette : tout vient de `src/brand/brands.ts`.

| | Investments | Advisors |
|---|---|---|
| Domaine | argentum-investments.ch | argentum-advisors.ch |
| Registre du commerce | CH-660.0.244.019-9 | CH-660.0.242.019-2 |
| UID | CHE-134.341.014 | **non communiqué** |
| Adresse | Avenue Marc-Doret 14A, 1224 Chêne-Bougeries | **non communiquée** |
| Secteur | Exploitation de sociétés d'investissement | Prestations de services pour banques et établissements de crédit |
| E-mail | contact@argentum-investments.ch | contact@argentum-advisors.ch |
| Thème | clair | sombre |

Aucune des deux sociétés n'a de numéro de téléphone : **ne jamais ajouter de champ téléphone**
pour l'entreprise. Le champ téléphone du formulaire concerne le visiteur, c'est différent.

Un champ à `null` dans la config est une donnée manquante : le rendu **omet la ligne**. Ne jamais
la remplir par déduction — une adresse supposée sur un Impressum suisse est une mention légale
fausse.

Écrire `Argentum Investments SA` dans une page produirait une mention fausse sur l'autre domaine.
Dans le contenu, la raison sociale est le jeton `%BRAND%`, résolu par `resolveBrandText()`.

### Comment l'entité active est déterminée

Cookie de bascule manuelle > nom de domaine > Investments. Voir `src/brand/resolve.ts` et
`src/proxy.ts` (en Next.js 16, `proxy.ts` remplace `middleware.ts`).

`pnpm check:brand` vérifie la chaîne complète dans un vrai navigateur : thème, raison sociale,
mentions légales, persistance. **À relancer après toute modification du système de marque.**

## Le contenu vient du client, il ne s'invente pas

Les 19 fiches livrées en `.odt` sont archivées dans `content-source/`. Elles sont converties en
modules TypeScript par un pipeline en deux étapes :

```
pnpm content:extract   # content-source/*.odt -> scripts/blocks.json
pnpm content:build     # scripts/blocks.json  -> src/content/fr/*.ts
```

**`src/content/fr/*.ts` est généré : ne pas l'éditer à la main.** Pour corriger un texte, corriger
le `.odt` puis relancer le pipeline, ou ajouter une retouche ciblée dans `PATCHES`
(`scripts/gen_content.py`).

Seule exception : `src/content/fr/mezzanine-capital.ts` est écrit à la main — c'est la seule fiche
livrée en anglais, traduite manuellement. Elle est listée dans `HAND_WRITTEN` et le générateur ne
l'écrase pas.

## Données que le client doit encore fournir

- **UID et adresse d'Argentum Advisors SA.** Arbitré : rien ne s'affiche tant qu'on ne les a pas.
- **Les partenaires.** La fiche Équipe ne livrait que des placeholders et la fiche À propos parle
  de « cinq partenaires » là où la fiche Équipe en prévoyait trois. Arbitré : la grille est retirée,
  la page tient sur son texte d'introduction.
- **Prestataire d'hébergement**, pour la politique de confidentialité (bloc `todo`, invisible en
  production).
- **Validation de la traduction** de Mezzanine Capital.
- **Identifiants SMTP** (`.env.example`), sans lesquels le formulaire invite à écrire directement.

## Décisions déjà arbitrées — ne pas les rouvrir

- **Les 6 images fournies sont utilisées telles quelles**, sur décision du client, malgré mon
  signalement qu'elles proviennent du tourisme genevois et de la banque de détail, et que les
  droits de deux d'entre elles ne sont pas vérifiables. La page Discrétion est volontairement la
  seule sans photographie : une image de lieu ou de foule y contredirait le propos.
- **Ordre du sous-menu Finance** : par priorité commerciale décroissante, Crowdfunding en dernier
  parce que la fiche dit elle-même que la levée de fonds publique n'est pas au cœur de l'approche.
- **La vidéo du hero (14 Mo) n'est jamais chargée d'office** : seulement sur écran large et hors
  `prefers-reduced-motion`. Ailleurs, l'image d'affiche suffit. À recompresser quand `ffmpeg` sera
  disponible.

## Pièges rencontrés sur ce projet

**Les règles d'éléments CSS doivent rester dans `@layer base`.** Écrites hors couche dans
`globals.css`, elles battent toutes les classes utilitaires de Tailwind : un `text-white` sur un
titre posé au-dessus d'une photographie n'a alors aucun effet, et les titres sortent navy sur
navy. Le bug a touché tous les fonds sombres du site avant correction.

**Ne pas passer une classe qui entre en conflit avec la base d'un composant.** `hidden` passé à un
composant dont la racine porte `inline-flex` ne masque rien — l'ordre dans la feuille décide. Pour
masquer, envelopper ; pour changer une couleur, ajouter une variante au composant. Les variantes
`solidOnDark` et `ghostOnDark` de `Button` existent pour les fonds photographiques, où aucun jeton
de thème ne s'applique.

## Pas de sitemap, volontairement

`fscore` signalera toujours l'absence de sitemap. C'est correct : le site est en no-index total,
un sitemap proposerait aux moteurs des URL qu'on leur interdit par ailleurs. Ne pas « corriger »
cet avertissement. `src/content/site-spec.json` documente la décision.

## Carte du site

`src/content/site-spec.json` est **généré** depuis la navigation et le registre de contenu
(`pnpm content:spec`), pour ne pas diverger du code. Le régénérer après toute modification de la
navigation.

## Contrôles avant livraison

```
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm check:brand     # bascule d'entité dans un vrai navigateur — serveur de dev requis
pnpm check:shots     # captures dans .screenshots/
```

`pnpm test` couvre la résolution d'entité et les invariants du contenu : aucune raison sociale en
dur, aucun placeholder du document source, traduction de Mezzanine effective, cohérence de la
navigation.
