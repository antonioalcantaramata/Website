#!/usr/bin/env python3
"""Regenerate every generated block of the site.

Every page (see PAGES below):
    PAGES                -> <head>: title, description, canonical URL, favicon,
                            link-preview (Open Graph) tags, stylesheet, fonts,
                            and structured data (schema.org Person) on the home page
    partials/sprite.svg  -> the inline icon sprite
    partials/nav.html    -> skip link + top navigation, current page marked
    partials/footer.html -> footer

research.html only:
    publications.json -> the Publications list and its filter buttons
    software.json     -> the Software list (or its placeholder, while empty)
    dissemination.json -> the Dissemination section (talks, grouped by type)
    all three + the Research Interests boxes -> the overview tiles at the top

index.html:
    publications.json, dissemination.json, software.json -> the highlight
    tiles under the hero (latest paper, latest talk, software)

Also rewrites sitemap.xml from PAGES.

Adding a paper or a tool should be one JSON object, not forty lines of markup,
and changing a menu item should be one edit, not six. Output is written straight
into the pages between their BUILD markers, so the deployed site stays static
HTML -- crawlers, Google Scholar and no-JS visitors still see everything.

    python3 build.py

Run it after editing a partial, PAGES, publications.json, software.json or
dissemination.json.
"""

import datetime
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
PARTIALS = ROOT / "partials"
PUBS = ROOT / "publications.json"
SOFT = ROOT / "software.json"
DISS = ROOT / "dissemination.json"

SITE = "https://www.antonioalcantara.com/"
NAME = "Antonio Alcántara Mata"
OG_IMAGE = "images/og-image.jpg"  # 1200x630, the card shown in link previews

# One entry per page that carries the shared chrome. `path` is the page's
# public URL relative to SITE. publications.html is deliberately absent: it is
# a redirect and must not be indexed or listed in the sitemap.
PAGES = {
    "index.html": {
        "path": "",
        "title": f"{NAME} - Tenure-track Assistant Professor",
        "og_title": NAME,
        "description": f"{NAME} is a Tenure-track Assistant Professor in the Department of "
                       "Quantitative Methods at CUNEF Universidad, Madrid, working on machine "
                       "learning, probabilistic forecasting and data-driven optimization for "
                       "energy systems.",
    },
    "about.html": {
        "path": "about.html",
        "title": f"About - {NAME}",
        "description": f"Background, positions, education and awards of {NAME}, Tenure-track "
                       "Assistant Professor in the Department of Quantitative Methods at CUNEF "
                       "Universidad.",
    },
    "research.html": {
        "path": "research.html",
        "title": f"Research - {NAME}",
        "description": f"Research interests, publications, software and talks by {NAME} - machine "
                       "learning, probabilistic forecasting and data-driven optimization for "
                       "energy systems.",
    },
    "teaching.html": {
        "path": "teaching.html",
        "title": f"Teaching - {NAME}",
        "description": f"Courses taught by {NAME} at CUNEF Universidad and Universidad Carlos "
                       "III de Madrid: data analysis, statistics and statistical modelling.",
    },
    "contact.html": {
        "path": "contact.html",
        "title": f"Contact - {NAME}",
        "description": f"Contact details and academic profiles of {NAME}, Department of "
                       "Quantitative Methods, CUNEF Universidad, Madrid.",
    },
}

# schema.org Person, embedded in the home page. This is what lets a search
# engine tie the site to the same person as the ORCID and Scholar profiles.
PERSON = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": NAME,
    "givenName": "Antonio",
    "familyName": "Alcántara Mata",
    "url": SITE,
    "image": SITE + "images/profile-600.webp",
    "email": "mailto:antonio.alcantara@cunef.edu",
    "jobTitle": "Tenure-track Assistant Professor",
    "worksFor": {
        "@type": "CollegeOrUniversity",
        "name": "CUNEF Universidad",
        "url": "https://www.cunef.edu/",
    },
    "alumniOf": [
        {"@type": "CollegeOrUniversity", "name": "Universidad Carlos III de Madrid",
         "url": "https://www.uc3m.es/"},
        {"@type": "CollegeOrUniversity", "name": "Universidad de Granada",
         "url": "https://www.ugr.es/"},
    ],
    "knowsAbout": [
        "Machine learning",
        "Probabilistic forecasting",
        "Data-driven optimization",
        "Surrogate modeling",
        "Energy systems",
    ],
    "sameAs": [
        "https://orcid.org/0000-0002-3306-2246",
        "https://scholar.google.es/citations?user=xMW2VDgAAAAJ",
        "https://github.com/antonioalcantaramata",
        "https://www.linkedin.com/in/antonio-alcantara",
    ],
}

ICON = '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-%s"></use></svg>'


def esc(text):
    """Escape text that must not be read as markup."""
    return html.escape(text, quote=True)


# --------------------------------------------------------------------------
# Splicing generated blocks into pages
# --------------------------------------------------------------------------

def marker_re(name):
    return re.compile(
        r"^([ \t]*)<!-- BUILD:%s start[^>]*-->\n.*?^[ \t]*<!-- BUILD:%s end -->"
        % (re.escape(name), re.escape(name)),
        re.S | re.M,
    )


def splice(page, name, body, filename):
    """Replace the block between a pair of BUILD markers.

    `body` is written unindented; it is indented to match the start marker so
    the generated markup lines up with the hand-written markup around it.
    """
    pattern = marker_re(name)
    match = pattern.search(page)
    if not match:
        sys.exit(f"error: BUILD:{name} markers not found in {filename}")
    pad = match.group(1)
    lines = [pad + line if line.strip() else "" for line in body.split("\n")]
    block = (f"{pad}<!-- BUILD:{name} start -- generated by build.py -->\n"
             + "\n".join(lines)
             + f"\n{pad}<!-- BUILD:{name} end -->")
    return page[:match.start()] + block + page[match.end():]


def splice_inline(page, name, text, filename):
    """Replace an inline marker pair, e.g. a date inside a sentence."""
    start, end = f"<!-- BUILD:{name} start -->", f"<!-- BUILD:{name} end -->"
    if start not in page or end not in page:
        sys.exit(f"error: BUILD:{name} markers not found in {filename}")
    return page[: page.index(start) + len(start)] + text + page[page.index(end):]


# --------------------------------------------------------------------------
# Shared chrome
# --------------------------------------------------------------------------

def render_head(filename, meta):
    url = SITE + meta["path"]
    out = [
        f'<title>{esc(meta["title"])}</title>',
        f'<meta name="description" content="{esc(meta["description"])}">',
        f'<link rel="canonical" href="{url}">',
        '<link rel="icon" href="favicon.ico" sizes="32x32">',
        '<link rel="icon" href="images/icon-192.png" type="image/png" sizes="192x192">',
        '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
        '<meta name="theme-color" content="#1a1f6c">',
        "",
        "<!-- Link previews (LinkedIn, Slack, WhatsApp, X, ...) -->",
        f'<meta property="og:type" content="{"profile" if filename == "index.html" else "website"}">',
        f'<meta property="og:site_name" content="{esc(NAME)}">',
        f'<meta property="og:title" content="{esc(meta.get("og_title", meta["title"]))}">',
        f'<meta property="og:description" content="{esc(meta["description"])}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:image" content="{SITE}{OG_IMAGE}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{esc(NAME)}, Tenure-track Assistant Professor at CUNEF Universidad">',
        '<meta name="twitter:card" content="summary_large_image">',
        "",
        # Set before first paint so CSS that depends on JavaScript (the Research
        # page's one-section-at-a-time view) never flashes its no-JS layout.
        "<script>document.documentElement.classList.add('js')</script>",
        '<link rel="stylesheet" href="styles.css">',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        "<!-- CUNEF brand faces: Aeonik is licensed and not redistributed here, so",
        "     Manrope stands in as the primary geometric grotesque; Taviraj is the",
        "     manual's own secondary face (sec. 3.2.2). Arial is the CSS fallback. -->",
        '<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800'
        '&family=Taviraj:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap" rel="stylesheet">',
    ]
    if filename == "index.html":
        data = json.dumps(PERSON, ensure_ascii=False, indent=4)
        out += ["", '<script type="application/ld+json">', data, "</script>"]
    return "\n".join(out)


def render_nav(filename):
    nav = (PARTIALS / "nav.html").read_text(encoding="utf-8").rstrip("\n")
    link = f'<a href="{filename}" class="nav-link">'
    if link not in nav:
        sys.exit(f"error: partials/nav.html has no nav-link for {filename}")
    return nav.replace(link, f'<a href="{filename}" class="nav-link active" aria-current="page">')


def render_footer():
    footer = (PARTIALS / "footer.html").read_text(encoding="utf-8").rstrip("\n")
    return footer.replace("{year}", str(datetime.date.today().year))


def render_sitemap():
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for meta in PAGES.values():
        out.append(f"  <url><loc>{SITE}{meta['path']}</loc></url>")
    out.append("</urlset>")
    return "\n".join(out) + "\n"


# --------------------------------------------------------------------------
# research.html: publications and software
# --------------------------------------------------------------------------

def bibtex_key(bibtex):
    return re.match(r"@\w+\{([^,]+),", bibtex).group(1)


def render_item(pub):
    badge = pub.get("badge") or {
        "journal": "Journal Article",
        "conference": "Conference Paper",
        "working": "Working Paper",
    }.get(pub["type"], pub["type"].title())

    out = []
    out.append(f'<div class="publication-item" data-type="{esc(pub["type"])}" data-year="{pub["year"]}">')
    out.append('    <div class="pub-cover">')
    out.append(
        f'        <img src="images/journal-covers/{esc(pub["cover"])}"'
        f' alt="{esc(pub.get("cover_alt") or pub["venue"])}"'
        f' class="journal-cover" width="200" height="267" loading="lazy" decoding="async"'
        f' onerror="this.src=\'images/journal-covers/default-journal.webp\'">'
    )
    out.append('    </div>')
    out.append('    <div class="pub-content">')
    out.append('        <div class="pub-title-row">')
    out.append(f'            <h3 class="pub-title">{esc(pub["title"])}</h3>')
    out.append('            <div class="pub-badges">')
    out.append(f'                <span class="pub-type-badge {esc(pub["type"])}">{esc(badge)}</span>')
    out.append('            </div>')
    out.append('        </div>')
    # authors is trusted markup: it carries <strong> around his own name
    out.append(f'        <p class="pub-authors">{pub["authors"]}</p>')
    out.append('        <div class="pub-venue-info">')
    out.append(f'            <span class="pub-venue">{esc(pub["venue"])}</span>')
    out.append(f'            <span class="pub-year">{pub["year"]}</span>')
    out.append('        </div>')
    out.append('        <div class="pub-links">')
    if pub.get("url"):
        out.append(f'            <a href="{esc(pub["url"])}" class="pub-link" target="_blank" rel="noopener">')
        out.append(f'                {ICON % "external-link"} View Article')
        out.append('            </a>')
    if pub.get("code_url"):
        out.append(f'            <a href="{esc(pub["code_url"])}" class="pub-link" target="_blank" rel="noopener">')
        out.append(f'                {ICON % "github"} Code')
        out.append('            </a>')
    if pub.get("bibtex"):
        bib_id = "bib-" + bibtex_key(pub["bibtex"])
        out.append(
            f'            <button class="pub-link bibtex-btn" type="button" onclick="toggleBibtex(this)"'
            f' aria-expanded="false" aria-controls="{esc(bib_id)}">'
        )
        out.append(f'                {ICON % "quote-left"} BibTeX')
        out.append('            </button>')
    if pub.get("open_access"):
        out.append('            <span class="pub-open-access-badge">')
        out.append(f'                {ICON % "unlock-alt"} Open Access')
        out.append('            </span>')
    if pub.get("abstract"):
        out.append(
            '            <button class="expand-btn" type="button" onclick="toggleAbstract(this)"'
            ' aria-expanded="false" aria-label="Show abstract">'
        )
        out.append(f'                {ICON % "plus"}')
        out.append('            </button>')
    out.append('        </div>')
    if pub.get("bibtex"):
        # The entry sits in a <pre> so it can be read and selected by hand
        # too; the Copy button is a shortcut, not the only way to get it.
        out.append(f'        <div class="pub-bibtex" id="{esc(bib_id)}" hidden>')
        out.append(
            f'            <button class="bibtex-copy" type="button" onclick="copyBibtex(this)">'
            f'{ICON % "copy"} <span>Copy</span></button>'
        )
        # Joined onto one output line: splice() indents line by line, and
        # indentation inside a <pre> would end up in the copied entry.
        pre = esc(pub["bibtex"]).replace("\n", "&#10;")
        out.append(f'            <pre><code>{pre}</code></pre>')
        out.append('        </div>')
    if pub.get("abstract"):
        out.append('        <div class="pub-abstract" style="display: none;">')
        out.append(f'            <p><strong>Abstract:</strong> {esc(pub["abstract"])}</p>')
        out.append('        </div>')
    out.append('    </div>')
    out.append('</div>')
    return "\n".join(out)


def render_filters(pubs, labels):
    present = [t for t in labels if any(p["type"] == t for p in pubs)]
    out = ['<div class="filter-buttons">']
    out.append(
        '    <button class="filter-btn active" type="button" data-filter="all"'
        ' data-label="All Publications">All Publications</button>'
    )
    for t in present:
        out.append(
            f'    <button class="filter-btn" type="button" data-filter="{esc(t)}"'
            f' data-label="{esc(labels[t])}">{esc(labels[t])}</button>'
        )
    out.append('</div>')
    skipped = [t for t in labels if t not in present]
    if skipped:
        print(f"  filters omitted (no entries): {', '.join(skipped)}")
    return "\n".join(out)


def render_software(items, placeholder):
    """Software entries, or the placeholder paragraph while the list is empty.

    Mirrors render_item()'s structure so a software entry and a publication read
    as the same kind of card: logo where the journal cover goes, then title row,
    description and links.
    """
    if not items:
        return f'<p class="section-placeholder">{esc(placeholder)}</p>'

    out = ['<div class="software-list">']
    for sw in items:
        has_logo = bool(sw.get("logo"))
        cls = "software-item" if has_logo else "software-item no-logo"
        out.append(f'    <div class="{cls}">')
        if has_logo:
            out.append('        <div class="software-logo">')
            out.append(
                f'            <img src="images/software/{esc(sw["logo"])}"'
                f' alt="{esc(sw["name"])} logo" class="software-logo-img"'
                f' width="240" height="240" loading="lazy" decoding="async">'
            )
            out.append('        </div>')
        out.append('        <div class="software-content">')
        out.append('            <div class="software-title-row">')
        out.append(f'                <h3 class="software-name">{esc(sw["name"])}</h3>')
        if sw.get("role") or sw.get("language") or sw.get("license"):
            out.append('                <div class="software-chips">')
            # role first: it is the one thing a visitor cannot infer from the repo
            if sw.get("role"):
                out.append(f'                    <span class="software-role">{esc(sw["role"])}</span>')
            if sw.get("language"):
                out.append(f'                    <span class="software-lang">{esc(sw["language"])}</span>')
            if sw.get("license"):
                out.append(f'                    <span class="software-license">{esc(sw["license"])}</span>')
            out.append('                </div>')
        out.append('            </div>')
        out.append(f'            <p class="software-description">{esc(sw["description"])}</p>')
        out.append('            <div class="software-links">')
        out.append(f'                <a href="{esc(sw["url"])}" class="pub-link" target="_blank" rel="noopener">')
        out.append(f'                    {ICON % "github"} Repository')
        out.append('                </a>')
        # paper_url is optional: an empty string leaves the slot unrendered
        if sw.get("paper_url"):
            label = sw.get("paper_title") or "Related paper"
            out.append(f'                <a href="{esc(sw["paper_url"])}" class="pub-link" target="_blank" rel="noopener">')
            out.append(f'                    {ICON % "external-link"} {esc(label)}')
            out.append('                </a>')
        out.append('            </div>')
        out.append('        </div>')
        out.append('    </div>')
    out.append('</div>')
    return "\n".join(out)


MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def render_dissemination(data):
    """Talks, one list per type in the order `types` gives, newest first.

    The date is a small month/year block in the slot the journal cover and the
    software logo use, so the three lists on the page share one left edge.
    """
    labels = data.get("types", {})
    talks = data.get("talks", [])
    unknown = sorted({t["type"] for t in talks} - set(labels))
    if unknown:
        sys.exit(f"error: dissemination.json: talk type(s) not in `types`: {', '.join(unknown)}")
    for t in talks:
        if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", t["date"]):
            sys.exit(f"error: dissemination.json: date must be YYYY-MM, got {t['date']!r}")

    out = ['<div class="talk-groups">']
    for key, label in labels.items():
        # sorted() is stable: talks in the same month keep their file order
        group = sorted((t for t in talks if t["type"] == key),
                       key=lambda t: t["date"], reverse=True)
        if not group:
            continue
        out.append('    <div class="talk-group">')
        out.append(f'        <h3 class="talk-group-title">{esc(label)}'
                   f' <span class="talk-count">{len(group)}</span></h3>')
        out.append('        <ol class="talk-list" reversed>')
        for t in group:
            year, month = t["date"].split("-")
            out.append('            <li class="talk-item">')
            out.append(f'                <time class="talk-date" datetime="{year}-{month}">'
                       f'<span class="month">{MONTHS[int(month) - 1]}</span>'
                       f'<span class="year">{year}</span></time>')
            out.append('                <div class="talk-body">')
            out.append(f'                    <h4 class="talk-title">{esc(t["title"])}</h4>')
            venue = esc(t["venue"])
            if t.get("location"):
                venue += f' <span class="talk-location">&middot; {esc(t["location"])}</span>'
            # The event link rides at the end of the venue line rather than on a
            # row of its own, so a linked talk is no taller than an unlinked one.
            if t.get("url"):
                venue += (f' <a href="{esc(t["url"])}" class="pub-link talk-link"'
                          f' target="_blank" rel="noopener">{ICON % "external-link"} Event page</a>')
            out.append(f'                    <p class="talk-venue">{venue}</p>')
            out.append('                </div>')
            out.append('            </li>')
        out.append('        </ol>')
        out.append('    </div>')
    out.append('</div>')
    return "\n".join(out)


def short_venue(venue):
    """`Computers & Operations Research` stays; a long conference name keeps
    only its acronym in brackets, e.g. `(GridFM)`, when it has one."""
    m = re.search(r"\(([^)]+)\)", venue)
    return m.group(1) if m and len(venue) > 45 else venue


def talk_when(talk):
    year, month = talk["date"].split("-")
    return f"{MONTHS[int(month) - 1]} {year}"


def latest_talk(diss):
    return max(diss.get("talks", []), key=lambda t: t["date"], default=None)


def render_research_hub(pubs, soft, diss, interests):
    """The four overview tiles at the top of research.html.

    Each tile is a plain in-page link, so without JavaScript it simply jumps to
    its section; script.js turns the row into a one-section-at-a-time switcher.
    The counts and "latest" lines are derived here so they cannot go stale.
    """
    talk = latest_talk(diss)
    tools = soft.get("software", [])
    tiles = [
        ("interests", "Research Interests", len(interests),
         "theme" if len(interests) == 1 else "themes",
         " · ".join(interests)),
        ("publications", "Publications", len(pubs),
         "paper" if len(pubs) == 1 else "papers",
         f"Latest: {pubs[0]['title']} ({short_venue(pubs[0]['venue'])}, {pubs[0]['year']})"
         if pubs else ""),
        ("software", "Software", len(tools),
         "tool" if len(tools) == 1 else "tools",
         " · ".join(t["name"] for t in tools)),
        ("dissemination", "Dissemination", len(diss.get("talks", [])),
         "talk" if len(diss.get("talks", [])) == 1 else "talks",
         f"Latest: {talk.get('location') or short_venue(talk['venue'])}, {talk_when(talk)}"
         if talk else ""),
    ]
    out = ['<div class="hub-grid">']
    for key, label, count, unit, latest in tiles:
        out.append(f'    <a href="#{key}" class="hub-tile hub-{key}" data-panel="{key}">')
        out.append(f'        <span class="hub-label">{esc(label)}</span>')
        out.append(f'        <span class="hub-count"><strong>{count}</strong> {unit}</span>')
        if latest:
            out.append(f'        <span class="hub-latest">{esc(latest)}</span>')
        out.append('    </a>')
    out.append('</div>')
    return "\n".join(out)


def interest_titles(page):
    """The <h3> of each Research Interests box, which stays hand-written."""
    return [html.unescape(t) for t in
            re.findall(r'<div class="interest-box">.*?<h3>(.*?)</h3>', page, re.S)]


def render_home_tiles(pubs, soft, diss):
    """The data-driven highlight tiles on the home page. The Teaching and CV
    tiles after them are hand-written in index.html."""
    out = []
    if pubs:
        p = pubs[0]
        out += [
            '<a href="research.html#publications" class="tile tile-paper">',
            '    <span class="tile-eyebrow">Latest publication</span>',
            f'    <span class="tile-title">{esc(p["title"])}</span>',
            f'    <span class="tile-meta">{esc(p["venue"])} &middot; {p["year"]}</span>',
            f'    <span class="tile-cta">All {len(pubs)} publications <span aria-hidden="true">&rarr;</span></span>',
            '</a>',
        ]
    talk = latest_talk(diss)
    if talk:
        where = ", ".join(x for x in (short_venue(talk["venue"]), talk.get("location")) if x)
        out += [
            '<a href="research.html#dissemination" class="tile tile-talk">',
            '    <span class="tile-eyebrow">Latest talk</span>',
            f'    <span class="tile-title">{esc(talk["title"])}</span>',
            f'    <span class="tile-meta">{esc(where)} &middot; {talk_when(talk)}</span>',
            f'    <span class="tile-cta">All {len(diss["talks"])} talks <span aria-hidden="true">&rarr;</span></span>',
            '</a>',
        ]
    tools = soft.get("software", [])
    if tools:
        out += [
            '<a href="research.html#software" class="tile tile-software">',
            '    <span class="tile-eyebrow">Software</span>',
            f'    <span class="tile-title">{esc(" · ".join(t["name"] for t in tools))}</span>',
            '    <span class="tile-meta">Open-source tools from my research</span>',
            '    <span class="tile-cta">See the code <span aria-hidden="true">&rarr;</span></span>',
            '</a>',
        ]
    return "\n".join(out)


def build_index(page):
    pubs = sorted(json.loads(PUBS.read_text(encoding="utf-8"))["publications"],
                  key=lambda p: (-p["year"], p["title"]))
    soft = json.loads(SOFT.read_text(encoding="utf-8"))
    diss = json.loads(DISS.read_text(encoding="utf-8"))
    return splice(page, "home-tiles", render_home_tiles(pubs, soft, diss), "index.html")


def build_research(page):
    data = json.loads(PUBS.read_text(encoding="utf-8"))
    pubs = data["publications"]
    labels = data.get("types", {})
    soft = json.loads(SOFT.read_text(encoding="utf-8"))
    diss = json.loads(DISS.read_text(encoding="utf-8"))

    keys = [bibtex_key(p["bibtex"]) for p in pubs if p.get("bibtex")]
    dupes = {k for k in keys if keys.count(k) > 1}
    if dupes:
        sys.exit(f"error: duplicate BibTeX keys in publications.json: {', '.join(sorted(dupes))}")

    # Newest first; the sort buttons re-order client-side from here.
    pubs = sorted(pubs, key=lambda p: (-p["year"], p["title"]))

    page = splice(page, "publications-list",
                  "\n\n".join(render_item(p) for p in pubs), "research.html")
    page = splice(page, "publication-filters",
                  render_filters(pubs, labels), "research.html")
    page = splice(page, "software",
                  render_software(soft.get("software", []), soft.get("placeholder", "")),
                  "research.html")
    page = splice(page, "dissemination", render_dissemination(diss), "research.html")
    page = splice(page, "research-hub",
                  render_research_hub(pubs, soft, diss, interest_titles(page)), "research.html")
    # "Last updated" comes from the data file, so it reflects the last real
    # change to the list rather than the last time this script happened to run.
    page = splice_inline(page, "last-updated", esc(data.get("last_updated", "")), "research.html")

    by_type = {}
    for p in pubs:
        by_type[p["type"]] = by_type.get(p["type"], 0) + 1
    n_soft = len(soft.get("software", []))
    print(f"  {len(pubs)} publications ("
          + ", ".join(f"{k}: {v}" for k, v in sorted(by_type.items()))
          + f"), {len(keys)} with BibTeX; last updated {data.get('last_updated')!r}")
    print(f"  software entries: {n_soft}" + ("  (placeholder rendered)" if not n_soft else ""))
    by_kind = {}
    for t in diss.get("talks", []):
        by_kind[t["type"]] = by_kind.get(t["type"], 0) + 1
    print(f"  talks: {len(diss.get('talks', []))} ("
          + ", ".join(f"{k}: {v}" for k, v in sorted(by_kind.items())) + ")")
    return page


def main():
    sprite = (PARTIALS / "sprite.svg").read_text(encoding="utf-8").rstrip("\n")
    footer = render_footer()

    for filename, meta in PAGES.items():
        path = ROOT / filename
        page = path.read_text(encoding="utf-8")
        page = splice(page, "head", render_head(filename, meta), filename)
        page = splice(page, "sprite", sprite, filename)
        page = splice(page, "nav", render_nav(filename), filename)
        page = splice(page, "footer", footer, filename)
        print(f"wrote {filename}")
        if filename == "research.html":
            page = build_research(page)
        if filename == "index.html":
            page = build_index(page)
        path.write_text(page, encoding="utf-8")

    (ROOT / "sitemap.xml").write_text(render_sitemap(), encoding="utf-8")
    print(f"wrote sitemap.xml ({len(PAGES)} pages)")


if __name__ == "__main__":
    main()
