"""Convertit les .odt du client Argentum en blocs structures JSON.

Structure ODF observee :
  <text:h outline-level=N>          -> titre de section
  <text:p>texte</text:p>            -> paragraphe
  <text:p><text:span Strong_20_Emphasis>LABEL</text:span><text:line-break/>TEXTE</text:p>
                                    -> item de liste a label (ou etape si LABEL commence par "NN -")
"""
import json
import re
import sys
import unicodedata
import zipfile
from xml.etree import ElementTree as ET

NS = {
    "office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
}
T = lambda t: "{%s}%s" % (NS["text"], t)

STRONG = "Strong_20_Emphasis"
STEP_RE = re.compile(r"^(\d{2})\s*[–—-]\s*(.+)$")


def para_parts(el):
    """Rend (label, texte) : label = span gras initial, texte = le reste."""
    label_bits, rest_bits, in_label = [], [], True
    if el.text:
        in_label = False
        rest_bits.append(el.text)
    for child in el:
        tag, style = child.tag, child.get(T("style-name"))
        if tag == T("span") and style == STRONG and in_label:
            label_bits.append("".join(child.itertext()))
        elif tag == T("line-break"):
            in_label = False
        else:
            if tag == T("span") and in_label and label_bits:
                in_label = False
            rest_bits.append("".join(child.itertext()))
        if child.tail:
            in_label = False
            rest_bits.append(child.tail)
    return " ".join(label_bits).strip(), " ".join("".join(rest_bits).split()).strip()


def walk(el, out):
    tag = el.tag
    if tag == T("h"):
        txt = " ".join("".join(el.itertext()).split()).strip()
        if txt:
            out.append({"kind": "h", "level": int(el.get(T("outline-level")) or 1), "text": txt})
        return
    if tag == T("p"):
        label, text = para_parts(el)
        if label:
            out.append({"kind": "item", "label": label, "text": text})
        elif text:
            out.append({"kind": "p", "text": text})
        return
    if tag == T("list"):
        for item in el:
            txt = " ".join("".join(item.itertext()).split()).strip()
            if txt:
                out.append({"kind": "bullet", "text": txt})
        return
    for child in el:
        walk(child, out)


def is_caps(s):
    """Vrai si la ligne est un libelle de bouton en capitales."""
    letters = [c for c in s if c.isalpha()]
    if len(letters) < 8:
        return False
    upper = sum(1 for c in letters if unicodedata.normalize("NFD", c)[0].isupper())
    return upper / len(letters) > 0.9


def build(flat):
    """Regroupe les noeuds plats en blocs de page."""
    blocks, i = [], 0
    while i < len(flat):
        node = flat[i]
        kind = node["kind"]

        if kind == "h":
            blocks.append({"type": "heading", "level": node["level"], "title": node["text"]})
            i += 1
            continue

        if kind == "item":
            # Un paragraphe entierement en gras, sans corps : bouton si capitales, sinon accroche.
            if not node["text"]:
                label = node["label"]
                if is_caps(label):
                    blocks.append({"type": "button", "label": label})
                else:
                    blocks.append({"type": "quote", "text": label})
                i += 1
                continue
            group, is_steps = [], bool(STEP_RE.match(node["label"]))
            while i < len(flat) and flat[i]["kind"] == "item":
                label, text = flat[i]["label"], flat[i]["text"]
                m = STEP_RE.match(label)
                if m and is_steps:
                    group.append({"num": m.group(1), "label": m.group(2).strip(), "text": text})
                else:
                    group.append({"label": label, "text": text})
                i += 1
            blocks.append({"type": "steps" if is_steps else "items", "items": group})
            continue

        if kind == "bullet":
            group = []
            while i < len(flat) and flat[i]["kind"] == "bullet":
                group.append(flat[i]["text"])
                i += 1
            blocks.append({"type": "bullets", "items": group})
            continue

        # kind == "p"
        text = node["text"]
        if is_caps(text):
            blocks.append({"type": "button", "label": text})
            i += 1
            continue
        group = []
        while i < len(flat) and flat[i]["kind"] == "p" and not is_caps(flat[i]["text"]):
            group.append(flat[i]["text"])
            i += 1
        blocks.append({"type": "prose", "paragraphs": group})
    return mark_disclaimer(blocks)


DISCLAIMER_HINTS = (
    "n’est ni une banque",
    "ne confère aucun droit",
    "aucun engagement",
    "ne constitue ni un engagement",
    "demeurent soumis",
)


def mark_disclaimer(blocks):
    """Retype en avertissement le dernier bloc de prose s'il en a la teneur juridique."""
    for block in reversed(blocks):
        if block["type"] != "prose":
            continue
        joined = " ".join(block["paragraphs"])
        if any(hint in joined for hint in DISCLAIMER_HINTS):
            block["type"] = "disclaimer"
        break
    return blocks


def convert(path):
    root = ET.fromstring(zipfile.ZipFile(path).read("content.xml"))
    flat = []
    walk(root.find(T("").replace("text", "office") if False else "{%s}body" % NS["office"]), flat)
    return build(flat)


if __name__ == "__main__":
    result = {}
    for path in sys.argv[1:]:
        result[path.split("/")[-1]] = convert(path)
    print(json.dumps(result, ensure_ascii=False, indent=1))
