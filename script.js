// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initSmoothScrolling();
    initPublicationFilters();
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
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                // scrollIntoView honours each target's CSS scroll-margin-top,
                // so the fixed navbar never covers the heading we land on.
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

// Publication Filters
function initPublicationFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortButtons = document.querySelectorAll('.sort-btn');
    // Build order: newest first, then by title. Kept as the tiebreak for
    // papers from the same year.
    const publicationItems = Array.from(document.querySelectorAll('.publication-item'));
    const publicationsList = document.querySelector('.publications-list');

    if (filterButtons.length === 0) return; // Exit if not on the Publications page

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
