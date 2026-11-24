# Antonio Alcántara Mata - Academic Website

Source of <https://www.antonioalcantara.com>, served by GitHub Pages from the
`main` branch. Plain static HTML, CSS and JavaScript; no framework and no
dependencies beyond Python 3 for the build script.

## Everyday tasks

| to change | edit | then |
|---|---|---|
| a publication | `publications.json` | `python3 build.py` |
| a software entry | `software.json` | `python3 build.py` |
| a talk | `dissemination.json` (and the Selected Talks section of `cv/cv26.tex`) | `python3 build.py` |
| a blog post | add `blog/<slug>.html` and its card image in `images/blog/`, then an entry in `blog.json` (see below) | `python3 build.py` |
| the menu, footer or icons | `partials/` | `python3 build.py` |
| a page title, description or link preview | `PAGES` at the top of `build.py` | `python3 build.py` |
| page text (bio, news, courses, ...) | the page's `.html` file directly | nothing |
| the CV | `cv/cv26.tex` (see `cv/README.md`) | `latexmk -pdf cv26.tex` in `cv/` |

Commit the regenerated `.html` files together with the change that produced
them: the site is served exactly as committed.

## Pages

| file | content |
|---|---|
| `index.html` | Home: summary and recent news |
| `about.html` | Bio, positions, education, awards |
| `research.html` | Research interests, publications (generated), software (generated), dissemination: talks (generated) |
| `teaching.html` | Courses and student evaluations |
| `contact.html` | Email, office and academic profiles |
| `blog.html` | Blog: the list of posts (generated from `blog.json`) |
| `blog/<slug>.html` | A post: a standalone page with its own head and styles, not touched by `build.py` |
| `publications.html` | Redirect to `research.html#publications`, kept so old external links still work |

## build.py

Everything shared between pages, or generated from data, lives between
`<!-- BUILD:name start -->` / `<!-- BUILD:name end -->` markers and is
rewritten by `python3 build.py`. **Do not hand-edit inside those markers**;
the next build overwrites it. The script writes:

- **`head`** (every page): title, description, canonical URL, favicon,
  link-preview (Open Graph) tags, stylesheet and fonts, all from `PAGES` in
  `build.py`. The home page also gets schema.org `Person` structured data
  (`PERSON` in `build.py`), which links the site to the ORCID, Scholar,
  GitHub and LinkedIn profiles for search engines.
- **`sprite`**, **`nav`**, **`footer`** (every page): from `partials/`. The
  current page's menu link is marked active at build time; the footer year is
  the year of the build.
- **`publications-list`**, **`publication-filters`**, **`last-updated`**,
  **`software`**, **`dissemination`** (`research.html`): from
  `publications.json`, `software.json` and `dissemination.json`.
- **`research-hub`** (`research.html`): the four overview tiles at the top --
  counts and latest item per section, from the same files plus the Research
  Interests boxes' headings.
- **`home-tiles`** (`index.html`): the Latest publication, Latest talk and
  Software tiles under the hero. The Teaching and CV tiles after them are
  hand-written in `index.html`; update the Teaching one when the current
  course changes.
- **`blog-list`** (`blog.html`): one card per post, newest first, from
  `blog.json`. The build fails if a listed post or its image is missing.
- **`sitemap.xml`**: from `PAGES`, plus every post in `blog.json`.

The output is static HTML, so crawlers, Google Scholar and visitors without
JavaScript see every entry. Running the build twice produces no changes.

### publications.json

| field | notes |
|---|---|
| `title`, `venue`, `year` | plain text |
| `month` | required, 1-12; only orders papers within a year (not displayed). Use the issue month for journals, the v1 month for arXiv. The build fails if it is missing |
| `authors` | trusted markup: keeps `<strong>` around your own name |
| `type` | `journal`, `conference` or `working`; drives the badge and filters. A filter button only appears for types that have entries |
| `url` | the article; renders "View Article" |
| `code_url` | optional; renders a "Code" link |
| `explainer_url` | optional; renders an "Interactive explainer" link to a blog post, e.g. `blog/<slug>.html` |
| `bibtex` | optional; renders a "BibTeX" button that shows the entry with a Copy button. Keys must be unique (the build checks) |
| `open_access` | `true` adds the Open Access badge |
| `cover`, `cover_alt` | a file in `images/journal-covers/` |
| `abstract` | optional; omit it and no expand button is rendered |

`last_updated` at the top is the date shown above the list. Update it by hand
when the list really changes.

To get BibTeX for a new paper, ask doi.org for it and tidy the result:

```bash
curl -sLH "Accept: application/x-bibtex" https://doi.org/<doi>
```

### software.json

| field | notes |
|---|---|
| `name`, `description`, `url` | required; `url` is the repository |
| `logo` | optional; a file in `images/software/` |
| `role`, `language`, `license` | optional chips |
| `paper_title`, `paper_url` | optional; adds a link to the related paper |

While `software` is an empty list, the `placeholder` text is shown instead.

### dissemination.json

| field | notes |
|---|---|
| `date` | `YYYY-MM` (the build checks); shown as a month/year block |
| `type` | a key of `types` (`invited`, `conference`); one list per type, in the order `types` lists them, newest first |
| `venue`, `title` | required |
| `location` | optional; shown after the venue |
| `url` | optional; renders an "Event page" link |

The talks are also in the Selected Talks section of `cv/cv26.tex`; add a
new talk to both.

### blog.json

| field | notes |
|---|---|
| `date` | `YYYY-MM` (the build checks); posts are listed newest first |
| `slug` | the post is `blog/<slug>.html` (the build checks it exists) |
| `title`, `summary` | shown on the card |
| `kind` | the small label above the title, e.g. "Interactive explainer" |
| `topics` | optional; shown after the date |
| `image`, `image_alt` | a 1200x630 file in `images/blog/` (the build checks it exists) |

While `posts` is an empty list, the `placeholder` text is shown instead.

Posts are standalone pages: interactive explainers bring their own layout,
styles and scripts, and `styles.css` would clash with them, so `build.py`
leaves `blog/` alone. Each post therefore carries its own `<head>` (title,
canonical URL, favicon, and link-preview tags pointing at its card image)
and a slim bar at the top linking back to `../index.html`,
`../research.html` and `../blog.html`. Copy those from an existing post;
links inside `blog/` are relative to it, hence the `../`.

## Images

Pages load WebP renditions sized for how they are displayed. Keep the
`width`/`height` attributes in the markup in sync with them so pages do not
shift while images load.

| file | used for |
|---|---|
| `images/profile-320.webp`, `profile-600.webp` | portrait: 140px page headers, 300px home page |
| `images/journal-covers/*.webp` | 80x100px publication covers; `default-journal.webp` is the fallback |
| `images/logos/*.webp` | CUNEF, DTU, UC3M and UGR logos |
| `images/software/*.webp` | software logos |
| `images/og-image.jpg` | 1200x630 card shown when a page link is shared |
| `images/blog/*.jpg` | 1200x630 post images: the card on `blog.html` and the post's own link preview |
| `favicon.ico`, `images/icon-192.png`, `apple-touch-icon.png` | browser and home-screen icons |

Full-resolution originals are kept out of the repository (see `.gitignore`).

## Brand

The site follows the CUNEF Universidad brand identity manual. Colours are
CSS custom properties in the `:root` block at the top of `styles.css`.
Aeonik, the brand's primary face, is licensed and not redistributed here, so
Manrope stands in for it, with Taviraj (the manual's secondary face) for
supporting text. The CUNEF logo is never recoloured and never shown below 40px
wide.

The current look (Azul headers, white overlapping tiles, bordered cards, pill
buttons) is the "2026 refresh" block at the end of `styles.css`, which
overrides the older rules above it. It also fixes one colour per kind of
content, used on tiles and section edges: Azul for interests and teaching,
Turquesa dark for publications, Granate for software, Naranja dark for talks.

## Other files

- `script.js`: mobile menu, smooth in-page scrolling, the Research page's
  tiles (one section at a time, chosen by the URL hash, e.g.
  `research.html#publications`, plus a compact bar once the tiles scroll
  away), publication filter/sort, abstract and BibTeX toggles. Without
  JavaScript every Research section is shown.
- `robots.txt`: allows everything and points to `sitemap.xml`.
- `CNAME`: the custom domain for GitHub Pages.

Icons are Font Awesome Free 6.4.0 glyphs (CC BY 4.0), inlined as an SVG sprite.
