"""Genere src/content/site-spec.json : la carte du site, derivee des sources reelles.

La spec n'est pas saisie a la main — elle est reconstruite depuis la navigation et le registre de
contenu, pour ne jamais diverger du code. Relancer apres toute modification de la navigation.
"""
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "content", "site-spec.json")

NAV_TS = os.path.join(ROOT, "src", "config", "navigation.ts")
CONTENT_DIR = os.path.join(ROOT, "src", "content", "fr")


def read(path):
    with open(path, encoding="utf-8") as fh:
        return fh.read()


def routes_from_app():
    """Liste les routes en parcourant src/app."""
    app = os.path.join(ROOT, "src", "app")
    found = []
    for dirpath, _dirnames, filenames in os.walk(app):
        if "page.tsx" not in filenames:
            continue
        rel = os.path.relpath(dirpath, app)
        route = "/" if rel == "." else "/" + rel
        # Ignore les groupes de routes (parentheses), sans effet sur l'URL.
        route = re.sub(r"/\([^)]+\)", "", route)
        found.append(route)
    return sorted(found)


def titles_from_content():
    """Titre et libelle de menu de chaque fiche."""
    out = {}
    for name in sorted(os.listdir(CONTENT_DIR)):
        if not name.endswith(".ts") or name in {"types.ts", "index.ts"} or name.endswith(".test.ts"):
            continue
        source = read(os.path.join(CONTENT_DIR, name))
        slug = name[:-3]
        title = re.search(r'"title":\s*"((?:[^"\\]|\\.)*)"', source) or re.search(
            r"title:\s*'((?:[^'\\]|\\.)*)'", source)
        menu = re.search(r'"menu":\s*"((?:[^"\\]|\\.)*)"', source) or re.search(
            r"menu:\s*'((?:[^'\\]|\\.)*)'", source)
        out[slug] = {
            "title": title.group(1) if title else None,
            "menu": menu.group(1) if menu else None,
        }
    return out


def nav_order():
    """Ordre du menu principal et du sous-menu Finance, lu dans la config."""
    source = read(NAV_TS)
    finance = re.findall(r"label: '([^']+)', href: '(/finance/[^']+)'", source)
    main = re.findall(r"\{\s*label: '([^']+)',\s*href: '(/[^']*)'", source)
    return {
        "main": [{"label": label, "href": href} for label, href in main],
        "finance": [
            {"rank": i + 1, "label": label, "href": href}
            for i, (label, href) in enumerate(finance)
        ],
    }


def git_head():
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"], cwd=ROOT, text=True).strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def main():
    generated_at = sys.argv[1] if len(sys.argv) > 1 else None
    spec = {
        "$comment": "Généré par scripts/gen_site_spec.py — ne pas éditer à la main.",
        "project": "argentum-investments.ch",
        "locale": "fr-CH",
        "locales": ["fr"],
        "indexing": {
            "noindex": True,
            "reason": "Exclusion totale demandée par le client.",
            "layers": ["meta robots (layout)", "X-Robots-Tag (proxy.ts)", "robots.txt"],
            "sitemap": False,
            "sitemapReason": "Un sitemap contredirait le no-index : aucune URL à proposer.",
        },
        "brands": [
            {
                "key": "investments",
                "legalName": "Argentum Investments SA",
                "domain": "argentum-investments.ch",
                "theme": "light",
            },
            {
                "key": "advisors",
                "legalName": "Argentum Advisors SA",
                "domain": "argentum-advisors.ch",
                "theme": "dark",
            },
        ],
        "contentSource": {
            "files": 19,
            "format": "odt",
            "archivedIn": "content-source/",
            "pipeline": ["pnpm content:extract", "pnpm content:build"],
            "handWritten": ["mezzanine-capital"],
        },
        "navigation": nav_order(),
        "routes": routes_from_app(),
        "pages": titles_from_content(),
        "generator": {"script": "scripts/gen_site_spec.py", "commit": git_head()},
    }
    if generated_at:
        spec["generator"]["generatedAt"] = generated_at

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(spec, fh, ensure_ascii=False, indent=2)
        fh.write("\n")
    print(f"{len(spec['routes'])} routes, {len(spec['pages'])} fiches -> {os.path.relpath(OUT, ROOT)}")


if __name__ == "__main__":
    main()
