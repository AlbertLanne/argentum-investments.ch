"""Genere les fichiers de contenu TypeScript du site Argentum a partir de blocks.json.

Chaque .odt du client devient un module `src/content/fr/<slug>.ts` exportant un PageContent.
Les mentions de la raison sociale deviennent le jeton %BRAND%, resolu a l'execution selon
l'entite active (Investments ou Advisors).
"""
import json
import os
import re
import sys

OUT = sys.argv[1]

BRAND_TOKEN = "%BRAND%"

# .odt source -> (slug, titre de menu). L'ordre fixe l'ordre du sous-menu Finance.
PAGES = [
    ("Acceuil.odt", "accueil", "Accueil"),
    ("Services.odt", "services", "Services"),
    ("Service.imobilier.odt", "services-immobilier", "Services immobilier"),
    ("Financement immobilier.odt", "financement-immobilier", "Financement immobilier"),
    ("Capital-investissement.odt", "capital-investissement", "Capital-investissement"),
    ("Ventuere Capital.odt", "capital-risque", "Capital-risque"),
    ("Investissements dans les start-up.odt", "investissements-start-up", "Investissements start-up"),
    ("Mezzanine Capital.odt", "mezzanine-capital", "Mezzanine Capital"),
    ("Développement de projets.odt", "developpement-de-projets", "Développement de projets"),
    ("Énergies renouvelables.odt", "energies-renouvelables", "Énergies renouvelables"),
    ("Médecine & Pharma.odt", "medecine-pharma", "Médecine & Pharma"),
    ("Solutions technologiques & E-Mobilité.odt", "solutions-technologiques-e-mobilite",
     "Solutions technologiques & E-Mobilité"),
    ("Crowdfunding.odt", "crowdfunding", "Crowdfunding"),
    ("a propos.odt", "a-propos", "À propos"),
    ("Discrétion & Confidentialité.odt", "discretion", "Discrétion"),
    ("Notre Équipe.odt", "notre-equipe", "Notre équipe"),
    ("Mentions légales.odt", "mentions-legales", "Mentions légales"),
    ("Mentions légales (Impressum).odt", "impressum", "Impressum"),
    ("Politique de confidentialité.odt", "politique-de-confidentialite", "Politique de confidentialité"),
]


def detokenize(text):
    """Remplace la raison sociale par un jeton resolu selon l'entite active."""
    text = re.sub(r"Argentum\s+Investments\s+SA", BRAND_TOKEN, text)
    return re.sub(r"\bArgentum\s+Investments\b", BRAND_TOKEN, text)


def clean(node):
    if isinstance(node, str):
        return detokenize(node)
    if isinstance(node, list):
        return [clean(x) for x in node]
    if isinstance(node, dict):
        return {k: clean(v) for k, v in node.items()}
    return node


def normalize_levels(blocks):
    """Le premier H1 est le titre de page ; les H1 suivants sont des sections de meme rang."""
    seen_title = False
    for b in blocks:
        if b["type"] != "heading":
            continue
        if b["level"] == 1 and not seen_title:
            seen_title = True
            b["level"] = 0  # titre de page
        elif b["level"] == 1:
            b["level"] = 2
    return blocks


def to_page(slug, menu, blocks):
    """Regroupe les blocs plats en titre + chapeau + sections."""
    blocks = normalize_levels(blocks)
    title, lead, sections = None, [], []
    for b in blocks:
        if b["type"] == "heading":
            if b["level"] == 0:
                title = b["title"]
            else:
                sections.append({"title": b["title"], "level": b["level"], "blocks": []})
            continue
        if sections:
            sections[-1]["blocks"].append(b)
        elif b["type"] == "prose":
            lead.extend(b["paragraphs"])
        else:
            sections.append({"title": None, "level": 2, "blocks": [b]})
    return {"slug": slug, "menu": menu, "title": title, "lead": lead, "sections": sections}


# --- Retouches ciblees ------------------------------------------------------

def patch_impressum(page):
    """L'identite legale vient de la config de marque, pas du texte figé du .odt."""
    for section in page["sections"]:
        section["blocks"] = [
            {"type": "legalIdentity"} if b["type"] == "items" else b
            for b in section["blocks"]
        ]
        # Le .odt titre la section avec la raison sociale, que le bloc d'identite repete
        # immediatement en dessous.
        if section["title"] == BRAND_TOKEN:
            section["title"] = None
    # Le dernier bloc reprend l'adresse en pied de page : le vrai footer s'en charge.
    last = page["sections"][-1]
    last["blocks"] = [b for b in last["blocks"] if b["type"] != "legalIdentity"]
    return page


def patch_privacy(page):
    """Responsable du traitement -> config de marque ; les autres trous sont documentes."""
    for section in page["sections"]:
        out = []
        for b in section["blocks"]:
            if b["type"] != "items":
                out.append(b)
                continue
            labels = " ".join(i["label"] for i in b["items"])
            if BRAND_TOKEN in labels:
                out.append({"type": "legalIdentity"})
            elif "hébergement" in labels:
                out.append({"type": "todo", "note": "Prestataire d’hébergement à confirmer"})
            elif "Services effectivement" in labels:
                out.append({"type": "definitions", "items": [{
                    "label": "Services tiers utilisés :",
                    "text": "Ce site n’utilise aucun service de mesure d’audience, aucune régie "
                            "publicitaire et aucun cookie de suivi. Seuls des cookies techniques "
                            "strictement nécessaires au fonctionnement du site sont déposés.",
                }]})
            elif "Dernière mise à jour" in labels:
                out.append({"type": "definitions", "items": [
                    {"label": "Dernière mise à jour :", "text": "août 2026"}]})
            else:
                out.append(b)
        section["blocks"] = out
    return page


def patch_team(page):
    """La grille des partenaires est retiree : le client n'a fourni que des placeholders."""
    page["title"] = page["title"] or "Notre équipe"
    page["sections"] = [s for s in page["sections"] if s["level"] < 3]
    if page["sections"] and page["sections"][0]["title"] == "Notre équipe":
        page["lead"] = [p for b in page["sections"][0]["blocks"]
                        if b["type"] == "prose" for p in b["paragraphs"]]
        page["sections"] = page["sections"][1:]
    return page


def patch_about(page):
    """Le .odt titre la page avec la raison sociale ; on garde un titre editorial."""
    page["title"] = "À propos"
    return page


PATCHES = {
    "impressum": patch_impressum,
    "politique-de-confidentialite": patch_privacy,
    "notre-equipe": patch_team,
    "a-propos": patch_about,
}

BANNER = ("// Généré depuis le contenu client (.odt) — ne pas éditer à la main.\n"
          "// Source : {src}\n"
          "// %BRAND% est résolu à l’exécution selon l’entité active.\n")

# Fiches maintenues a la main : la generation les laisse intactes.
# `mezzanine-capital` est la seule fiche livree en anglais ; sa traduction francaise a ete
# ecrite manuellement et serait perdue a chaque regeneration.
HAND_WRITTEN = {"mezzanine-capital"}


def main():
    data = json.load(open(os.path.join(os.path.dirname(__file__), "blocks.json")))
    os.makedirs(OUT, exist_ok=True)
    index = []
    skipped = []
    for src, slug, menu in PAGES:
        ident = re.sub(r"[^a-z0-9]+", "_", slug)
        index.append((slug, ident, menu))

        if slug in HAND_WRITTEN:
            skipped.append(slug)
            continue

        page = to_page(slug, menu, clean(data[src]))
        if slug in PATCHES:
            page = PATCHES[slug](page)
        body = json.dumps(page, ensure_ascii=False, indent=2)
        with open(os.path.join(OUT, f"{slug}.ts"), "w") as fh:
            fh.write(f"{BANNER.format(src=src)}import type {{ PageContent }} from './types'\n\n"
                     f"export const {ident}: PageContent = {body}\n")

    with open(os.path.join(OUT, "index.ts"), "w") as fh:
        fh.write("// Généré — registre des pages de contenu.\n")
        for slug, ident, _ in index:
            fh.write(f"import {{ {ident} }} from './{slug}'\n")
        fh.write("\nimport type { PageContent } from './types'\n\n")
        fh.write("export const pages = {\n")
        for slug, ident, _ in index:
            fh.write(f"  '{slug}': {ident},\n")
        fh.write("} satisfies Record<string, PageContent>\n\n")
        fh.write("export type PageSlug = keyof typeof pages\n\n")
        fh.write("export function getPage<S extends PageSlug>(slug: S): PageContent {\n")
        fh.write("  return pages[slug]\n}\n")
    print(f"{len(index) - len(skipped)} pages générées dans {OUT}")
    if skipped:
        print(f"conservées telles quelles (écrites à la main) : {', '.join(skipped)}")


if __name__ == "__main__":
    main()
