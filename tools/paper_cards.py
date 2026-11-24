"""Link-preview cards for the paper pages: images/papers/<slug>.jpg.

One 1200x630 JPEG per entry in publications.json -- the image LinkedIn, X,
Slack or WhatsApp show when someone shares papers/<slug>.html. build.py uses
a card when it exists and falls back to images/og-image.jpg otherwise, so it
needs nothing beyond Python itself; this script is the only part that needs
Pillow and is run by hand:

    python3 -m pip install Pillow
    python3 tools/paper_cards.py

Rerun it after adding a publication or changing a title, authors or venue,
then run build.py. The fonts are macOS system fonts (Avenir Next), close to
the site's Manrope; point FONT at another file on other systems.
"""

import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "images" / "papers"
FONT = "/System/Library/Fonts/Avenir Next.ttc"
BOLD, DEMI, MEDIUM = 0, 2, 5  # face indices in Avenir Next.ttc

W, H = 1200, 630
PAD = 72
AZUL, AZUL_DARK, AZUL_CLARO = (26, 31, 108), (17, 20, 74), (210, 224, 243)
NARANJA, BLANCO = (255, 87, 0), (255, 255, 255)
BADGE = {"journal": "JOURNAL ARTICLE", "conference": "CONFERENCE PAPER", "working": "WORKING PAPER"}


def font(face, size):
    return ImageFont.truetype(FONT, size, index=face)


def wrap(draw, text, fnt, width):
    """Greedy word wrap to lines no wider than `width` pixels."""
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    lines.append(line)
    return lines


def fit_title(draw, title, width, max_lines=4):
    """The largest title size, from 64px down, that fits in max_lines."""
    for size in range(64, 33, -2):
        fnt = font(BOLD, size)
        lines = wrap(draw, title, fnt, width)
        if len(lines) <= max_lines:
            return fnt, lines, size
    fnt = font(BOLD, 34)
    lines = wrap(draw, title, fnt, width)[:max_lines]
    lines[-1] = lines[-1].rstrip(".,:;") + "…"
    return fnt, lines, 34


def background():
    """Azul with a soft glow top right and an orange one bottom left, like the
    site's page headers."""
    img = Image.new("RGB", (W, H), AZUL)
    glow = Image.new("RGB", (W, H), AZUL)
    px = glow.load()
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            light = max(0.0, 1 - (((x - W) / 700) ** 2 + (y / 520) ** 2)) * 0.16
            warm = max(0.0, 1 - ((x / 560) ** 2 + ((y - H) / 480) ** 2)) * 0.18
            c = tuple(int(a + (b - a) * light + (o - a) * warm)
                      for a, b, o in zip(AZUL, AZUL_CLARO, NARANJA))
            for dx in (0, 1):
                for dy in (0, 1):
                    if x + dx < W and y + dy < H:
                        px[x + dx, y + dy] = c
    return Image.blend(img, glow, 1.0)


def card(pub):
    img = background()
    draw = ImageDraw.Draw(img)

    cover_w = 0
    cover = ROOT / "images" / "journal-covers" / pub["cover"]
    if cover.is_file():
        im = Image.open(cover).convert("RGB")
        cover_h = 360
        cover_w = round(im.width * cover_h / im.height)
        im = im.resize((cover_w, cover_h), Image.LANCZOS)
        x, y = W - PAD - cover_w, (H - cover_h) // 2 - 10
        shadow = Image.new("RGBA", (cover_w + 24, cover_h + 24), (0, 0, 0, 0))
        ImageDraw.Draw(shadow).rounded_rectangle((12, 16, cover_w + 12, cover_h + 16), 10, fill=(0, 0, 0, 90))
        img.paste(shadow, (x - 12, y - 12), shadow)
        mask = Image.new("L", (cover_w, cover_h), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, cover_w, cover_h), 8, fill=255)
        img.paste(im, (x, y), mask)
        cover_w += 56  # gap between text and cover

    text_w = W - 2 * PAD - cover_w

    # Eyebrow: type and venue, as on the page header
    eyebrow = f'{BADGE.get(pub["type"], pub["type"].upper())}  ·  {pub["venue"].upper()}  ·  {pub["year"]}'
    efont = font(DEMI, 20)
    while draw.textlength(eyebrow, font=efont) > text_w and efont.size > 14:
        efont = font(DEMI, efont.size - 1)
    draw.rectangle((PAD, PAD, PAD + 48, PAD + 5), fill=NARANJA)
    draw.text((PAD, PAD + 26), eyebrow, font=efont, fill=AZUL_CLARO)

    # Title
    tfont, lines, size = fit_title(draw, pub["title"], text_w)
    y = PAD + 82
    step = round(size * 1.16)
    for line in lines:
        draw.text((PAD, y), line, font=tfont, fill=BLANCO)
        y += step

    # Authors
    authors = re.sub(r"<[^>]+>", "", pub["authors"]).replace("&amp;", "&")
    afont = font(MEDIUM, 24)
    alines = wrap(draw, authors, afont, text_w)[:2]
    y += 18
    for line in alines:
        draw.text((PAD, y), line, font=afont, fill=AZUL_CLARO)
        y += 34

    # Footer: whose site this is
    draw.line((PAD, H - PAD - 34, W - PAD, H - PAD - 34), fill=(60, 66, 140), width=1)
    draw.text((PAD, H - PAD - 16), "Antonio Alcántara Mata", font=font(BOLD, 22), fill=BLANCO)
    site = "antonioalcantara.com"
    sfont = font(MEDIUM, 22)
    draw.text((W - PAD - draw.textlength(site, font=sfont), H - PAD - 16), site, font=sfont, fill=AZUL_CLARO)
    return img


def main():
    pubs = json.loads((ROOT / "publications.json").read_text(encoding="utf-8"))["publications"]
    OUT.mkdir(parents=True, exist_ok=True)
    slugs = set()
    for pub in pubs:
        slugs.add(pub["slug"])
        path = OUT / f'{pub["slug"]}.jpg'
        card(pub).save(path, "JPEG", quality=86, optimize=True, progressive=True)
        print(f"wrote {path.relative_to(ROOT)}")
    for old in OUT.glob("*.jpg"):
        if old.stem not in slugs:
            old.unlink()
            print(f"removed {old.relative_to(ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
