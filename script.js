// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSmoothScrolling();
    initPublicationFilters();
    initResearchTabs();
});

// Navigation functionality. The current page's link is marked active by
// build.py, so nothing here needs to work out which page we are on.
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle. The hamburger is a real <button>, so Enter/Space
    // come for free; this keeps the announced state in sync.
    function setMenu(open) {
        hamburger.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    hamburger.addEventListener('click', function() {
        setMenu(!navMenu.classList.contains('active'));
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            setMenu(false);
        });
    });

    // Escape closes the menu and returns focus to the toggle
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            setMenu(false);
            hamburger.focus();
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    // Research section links are handled by initResearchTabs instead.
    const links = document.querySelectorAll(
        'a[href^="#"]:not(.hub-tile):not(.section-nav-link)');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                // scrollIntoView honours each target's CSS scroll-margin-top,
                // so the fixed navbar (and the sticky section nav on the
                // Research page) never covers the heading we land on.
                targetElement.scrollIntoView({
                    behavior: reduce ? 'auto' : 'smooth',
                    block: 'start'
                });
                // Scrolling alone leaves focus behind, which defeats the skip
                // link for keyboard users.
                targetElement.focus({ preventScroll: true });
                if (history.replaceState) {
                    history.replaceState(null, '', '#' + targetId);
                }
            }
        });
    });
}

// Research page: the overview tiles (and the compact bar that stands in for
// them once they scroll away) show one section at a time. The URL hash names
// the section, so research.html#publications -- including the old
// publications.html redirect -- still opens straight on it. Without
// JavaScript none of this runs and every section is shown, as before.
function initResearchTabs() {
    const hub = document.querySelector('.research-hub');
    const bar = document.querySelector('.section-nav');
    if (!hub) return;

    const panels = Array.from(document.querySelectorAll('.research-section'));
    const ids = panels.map(p => p.id);
    const links = Array.from(document.querySelectorAll('.hub-tile, .section-nav-link'));

    function show(id) {
        if (!ids.includes(id)) id = ids[0];
        panels.forEach(p => p.classList.toggle('is-active', p.id === id));
        links.forEach(link => {
            const on = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', on);
            if (on) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
        });
        return panels[ids.indexOf(id)];
    }

    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const id = link.getAttribute('href').slice(1);
            const panel = show(id);
            if (history.replaceState) history.replaceState(null, '', '#' + id);
            // From the compact bar the reader is deep in the page: bring the
            // tiles back into view, the new one highlighted and its section
            // right under it. From the tiles themselves nothing needs to move.
            // Instant, not smooth: the page height has just changed under the
            // scroll, and a smooth scroll across that can stop short.
            if (hub.getBoundingClientRect().top < 0) {
                hub.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
            // Keyboard and screen-reader users land in the content they chose.
            panel.focus({ preventScroll: true });
        });
    });

    window.addEventListener('hashchange', () => show(location.hash.slice(1)));
    show(location.hash.slice(1));

    // The compact bar appears only once the tiles have scrolled up behind the
    // fixed navbar. One getBoundingClientRect per scroll event is cheap, and
    // checking directly (no IntersectionObserver, no rAF) behaves the same
    // everywhere.
    if (bar) {
        const navbar = document.getElementById('navbar');
        const update = () => bar.classList.toggle('is-visible',
            hub.getBoundingClientRect().bottom < (navbar ? navbar.offsetHeight : 70));
        window.addEventListener('scroll', update, { passive: true });
        update();
    }
}

// Publication Filters
function initPublicationFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortButtons = document.querySelectorAll('.sort-btn');
    // Build order: newest first, then by title. Kept as the tiebreak for
    // papers from the same year.
    const publicationItems = Array.from(document.querySelectorAll('.publication-item'));
    const publicationsList = document.querySelector('.publications-list');

    if (filterButtons.length === 0) return; // Exit if not on the Research page

    // Current filter and sort state
    let currentFilter = 'all';
    let currentSort = 'desc';

    updateAllButtonCounts(publicationItems);

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentFilter = this.getAttribute('data-filter');
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            applyFilterAndSort(currentFilter, currentSort);
        });
    });

    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentSort = this.getAttribute('data-sort');
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            applyFilterAndSort(currentFilter, currentSort);
        });
    });

    // The page already arrives filtered to "all" and sorted newest first, so
    // this only runs when a button is pressed.
    function applyFilterAndSort(filter, sort) {
        const sorted = publicationItems.slice().sort((a, b) => {
            const yearDiff = (parseInt(a.dataset.year) || 0) - (parseInt(b.dataset.year) || 0);
            if (yearDiff !== 0) return sort === 'desc' ? -yearDiff : yearDiff;
            const indexDiff = publicationItems.indexOf(a) - publicationItems.indexOf(b);
            return sort === 'desc' ? indexDiff : -indexDiff;
        });

        sorted.forEach(item => {
            const show = filter === 'all' || item.dataset.type === filter;
            // style, not the hidden attribute: .publication-item sets display: grid
            item.style.display = show ? '' : 'none';
            publicationsList.appendChild(item);
        });
    }
}

function updateAllButtonCounts(items) {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        const filter = button.getAttribute('data-filter');
        const label = button.getAttribute('data-label') || button.textContent.trim();
        const count = filter === 'all'
            ? items.length
            : items.filter(item => item.getAttribute('data-type') === filter).length;

        button.textContent = `${label} (${count})`;
        // A filter that cannot match anything is a dead control -- hide it
        // rather than offering "Conference Papers (0)".
        button.hidden = count === 0;
    });
}

// Toggle abstract visibility
function toggleAbstract(button) {
    const publicationItem = button.closest('.publication-item');
    const abstract = publicationItem.querySelector('.pub-abstract');
    const use = button.querySelector('.icon use');
    const opening = abstract.style.display === 'none' || abstract.style.display === '';

    abstract.style.display = opening ? 'block' : 'none';
    button.classList.toggle('expanded', opening);
    button.setAttribute('aria-expanded', String(opening));
    button.setAttribute('aria-label', (opening ? 'Hide' : 'Show') + ' abstract');
    if (use) {
        use.setAttribute('href', opening ? '#i-minus' : '#i-plus');
    }
}

// Toggle the BibTeX entry under a publication
function toggleBibtex(button) {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    const opening = panel.hidden;

    panel.hidden = !opening;
    button.classList.toggle('expanded', opening);
    button.setAttribute('aria-expanded', String(opening));
}

// Copy a BibTeX entry to the clipboard. If the clipboard is unavailable
// (old browser, or the page opened from disk), select the entry instead so
// Cmd/Ctrl+C still works.
function copyBibtex(button) {
    const code = button.closest('.pub-bibtex').querySelector('code');
    const label = button.querySelector('span');
    const use = button.querySelector('.icon use');

    function selectEntry() {
        const range = document.createRange();
        range.selectNodeContents(code);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        label.textContent = 'Selected';
    }

    function done() {
        label.textContent = 'Copied';
        use.setAttribute('href', '#i-check');
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code.textContent).then(done, selectEntry);
    } else {
        selectEntry();
    }

    clearTimeout(button._reset);
    button._reset = setTimeout(() => {
        label.textContent = 'Copy';
        use.setAttribute('href', '#i-copy');
    }, 2000);
}
