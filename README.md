# Antonio Alcántara Mata - Academic Website

A modern, responsive single-page academic website built from scratch without using GitHub templates.

## Features

- **Modern Design**: Clean, professional layout with smooth animations
- **Fully Responsive**: Mobile-first design that works on all devices
- **Interactive Elements**: Smooth scrolling, hover effects, and dynamic navigation
- **Performance Optimized**: Fast loading with optimized CSS and JavaScript
- **Accessible**: Proper semantic HTML and accessibility features
- **SEO Ready**: Meta tags and structured content for search engines

## Sections

1. **Hero/Home** - Introduction and main call-to-action
2. **About** - Academic background and research interests
3. **Research** - Research interests, publications and software, as three
   sections of one page with a sticky in-page nav
5. **Teaching** - Teaching experience and courses
6. **Contact** - Contact information and contact form

## Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with Flexbox and Grid
- **JavaScript (ES6+)** - Interactive functionality
- **Inline SVG sprite** - Icons (Font Awesome Free glyphs, CC BY 4.0, inlined per page)
- **Google Fonts (Manrope + Taviraj)** - Typography

## Setup Instructions

1. **Clone or download** this repository
2. **Add your profile image** to `images/profile.jpg`
3. **Add your CV** to `cv/antonio_alcantara_cv.pdf`
4. **Customize content** in `index.html`:
   - Update personal information
   - Modify research interests
   - Add your publications
   - Update teaching experience
   - Add your social media links
5. **Open `index.html`** in a web browser

## Customization

### Content Updates
- Edit `index.html` to update text content, links, and personal information
- Replace placeholder publications with your actual research
- Update social media links in the hero section
- Modify contact information

### Visual Customization
- **Colors**: Update the CSS custom properties in `styles.css`
- **Fonts**: Change font imports in the HTML head section
- **Layout**: Modify grid and flexbox layouts in CSS
- **Animations**: Adjust or add new animations in `script.js`

### Brand System

The site follows the **CUNEF Universidad brand identity manual** (`CUNEF - Manual de identidad de marca.pdf`).
All brand values live in the `:root` block at the top of `styles.css`:

```css
:root {
  /* 3.1.1 Principales */
  --cunef-azul:        #1a1f6c;
  --cunef-naranja:     #ff5700;
  --cunef-beige:       #d6d1c4;

  /* 3.1.2 De apoyo */
  --cunef-azul-claro:  #d2e0f3;
  --cunef-beige-claro: #f0ece8;

  /* 3.1.3 Secundarios */
  --cunef-amarillo:    #fe961f;
  --cunef-turquesa:    #0796a3;
  --cunef-granate:     #ae3c7c;
}
```

**Typography** (manual sec. 3.2): the primary face is Aeonik, which is licensed
and therefore *not* redistributed in this repository. **Manrope** stands in as the
closest freely licensed geometric grotesque, with **Taviraj** — the manual's own
secondary face — for supporting text and quotes, and **Arial** as the system
fallback named in sec. 3.2.3. To switch to real Aeonik, drop woff2 files into
`fonts/`, add `@font-face` rules, and put `'Aeonik'` first in `--font-primary`
(it is already listed second in the stack).

**Logo usage**: `images/logos/cunef-logo.png` is the single-colour Naranja mark on
a transparent ground. Per sec. 1.2 it is never rendered below 40px wide, and per
sec. 1.3 its colour is never altered — hence the `filter: none` exemption on
`.cunef-logo`.

## Research page

`research.html` holds three sections behind a sticky in-page nav:

1. **Research Interests** - hand-written. Currently a `.section-placeholder`
   paragraph; there is a commented-out `.research-grid` / `.research-card`
   snippet in the markup showing the card pattern to use when you fill it in.
2. **Publications** - generated from `publications.json`.
3. **Software** - generated from `software.json`. While `software` is an empty
   list the section renders the `placeholder` string from that file instead of
   cards, so it switches over automatically once you add an entry.

Regenerate sections 2 and 3 with:

```bash
python3 build_research.py
```

`publications.html` is now a redirect to `research.html#publications`. It is
kept because that URL is the one most likely to be linked from outside the site
(CV, coauthors' pages, talk slides, email) and those links should keep working.

### software.json

| field | notes |
|---|---|
| `name`, `description`, `url` | required; `url` is the repo |
| `logo` | optional; a file in `images/software/`. Rendered in the same 80x100 slot a journal cover uses, with `object-fit: contain` so it is never cropped. Omit it and the card drops the logo column. |
| `role` | optional chip (Azul) -- your involvement, e.g. `Main developer`, `Contributor`, `Maintainer`. Free text; rendered first because it is the one thing a visitor cannot infer from the repo |
| `language` | optional chip (turquesa) |
| `license` | optional chip (neutral) |
| `paper_title`, `paper_url` | optional; adds a second link. Leave as `""` and nothing renders |

Software entries deliberately use the same card as `.publication-item` -- same
3px Azul Claro left ribbon, radius, padding, shadow and hover -- so a tool and a
paper read as one system on the page.

## Publications

`publications.json` is the source of truth for the publication list. To add or
edit a paper, change that file and regenerate the page:

```bash
python3 build_research.py
```

Each entry's fields:

| field | notes |
|---|---|
| `title`, `venue`, `year` | plain text |
| `authors` | trusted markup -- keeps `<strong>` around your own name |
| `type` | `journal`, `conference` or `working`; drives the badge and filters |
| `url` | the article; renders the "View Article" link |
| `code_url` | *optional* -- renders a "Code" link with the GitHub mark |
| `open_access` | `true` adds the Open Access badge |
| `cover`, `cover_alt` | file in `images/journal-covers/` |
| `abstract` | *optional* -- omit it and no expand button is rendered |

The script rewrites the list inside `research.html` between its
`<!-- BUILD:... -->` markers, so **the deployed page stays static HTML** and
crawlers, Google Scholar and no-JS visitors still see every entry. It also:

- emits filter buttons only for types that actually have entries, so a dead
  "Conference Papers (0)" control can never reappear;
- reads the `last_updated` string from the JSON, so the date on the page
  reflects the last real change to the list rather than the last build.

Do not hand-edit the generated blocks in `research.html` -- it will be
overwritten on the next build.

## Images

Source images live at full resolution; the site references downscaled WebP
renditions generated from them:

| served file | source | displayed at |
|---|---|---|
| `images/profile-320.webp`, `profile-600.webp` | `images/profile.JPG` | 140px (page headers), 300px (hero) |
| `images/journal-covers/*.webp` | the original `.jpg`/`.png` in that folder | 80x100px |

The originals are kept as the masters for future resizing but are no longer
loaded by any page. Regenerate renditions with Pillow if you replace a source
image, and keep the `width`/`height` attributes in the markup in sync so pages
do not shift while images load.

## File Structure

```
/
├── index.html              # Home
├── about.html              # Bio, positions, education, awards
├── research.html           # Interests + generated publications + software
├── publications.html       # Redirect to research.html#publications
├── teaching.html           # Courses
├── contact.html            # Contact details and profiles
├── publications.json       # Source of truth for publications
├── build_research.py   # Regenerates the list in publications.html
├── styles.css              # All styling; CUNEF tokens in :root at the top
├── script.js               # Nav, section nav, filters, sorting, abstracts
├── images/
│   ├── profile.JPG         # Master portrait (not served)
│   ├── profile-320.webp    # Served renditions
│   ├── profile-600.webp
│   ├── journal-covers/     # Masters + served .webp renditions
│   ├── software/           # Project logos for the Software section
│   └── logos/              # cunef, uc3m, dtu, ugr
├── cv/antonio_alcantara_cv.pdf
├── CNAME                   # www.antonioalcantara.com
└── .gitignore              # Keeps brand source assets out of the public repo
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Performance Features

- **Optimized CSS** with efficient selectors
- **Throttled scroll events** for smooth performance
- **Lazy loading** preparation for images
- **Minimal JavaScript** with efficient event handling
- **Progressive enhancement** approach

## Accessibility Features

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators
- Alt text for images

## SEO Features

- Meta tags for search engines
- Structured data preparation
- Semantic HTML markup
- Fast loading times
- Mobile-friendly design

## Deployment Options

### GitHub Pages
1. Create a new repository
2. Upload files
3. Enable GitHub Pages in settings
4. Your site will be available at `username.github.io/repository-name`

### Netlify
1. Drag and drop the folder to Netlify
2. Get instant deployment with custom domain support

### Vercel
1. Connect your GitHub repository
2. Automatic deployments on push

### Traditional Web Hosting
1. Upload files via FTP
2. Point domain to the directory

## Future Enhancements

- Blog section integration
- Dark mode toggle
- Multi-language support
- PWA features
- Advanced contact form with backend
- Publication search and filtering
- Research project galleries

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- **Design**: Custom design inspired by modern academic websites
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Manrope + Taviraj)
- **Animations**: Custom CSS and JavaScript

---

*Built with ❤️ for academic excellence*
