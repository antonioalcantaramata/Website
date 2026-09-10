// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initSmoothScrolling();
    initThemeAnimations();
    initLoadingAnimations();
    initPublicationFilters();
    initResearchNav();
}

// Navigation functionality
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
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // The site is multi-page, so the active link is decided by the URL.
    setActiveNavLink();
}

function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        
        // Check if the link href matches the current page
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === '/' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        }
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

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animateElements = document.querySelectorAll(`
        .research-card,
        .publication-item,
        .teaching-card,
        .contact-item,
        .skill-category,
        .about-text,
        .section-header
    `);

    animateElements.forEach(el => {
        el.classList.add('scroll-animate');
        observer.observe(el);
    });
}

// Contact form functionality
// Theme animations and interactions
function initThemeAnimations() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.research-card, .teaching-card, .skill-category');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add click animations to buttons
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Create ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Add CSS for ripple animation
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Loading animations
function initLoadingAnimations() {
    // Add loading class to body initially
    document.body.classList.add('loading');
    
    // Remove loading class after everything is loaded
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.body.classList.remove('loading');
            
            // Trigger initial animations
            const heroElements = document.querySelectorAll('.hero-text > *');
            heroElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('fade-in-up');
                }, index * 200);
            });
        }, 500);
    });
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
    // Handle escape key to close mobile menu
    if (e.key === 'Escape') {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});

// Print styles
window.addEventListener('beforeprint', function() {
    // Add print-specific styles or modifications
    document.body.classList.add('printing');
});

window.addEventListener('afterprint', function() {
    document.body.classList.remove('printing');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', function() {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            }
        }, 0);
    });
}


// In-page section nav (Research page). Keeps the active link in sync with
// whichever section is currently in view.
function initResearchNav() {
    const links = Array.from(document.querySelectorAll('.section-nav-link'));
    if (links.length === 0) return;

    const sections = links
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);
    if (sections.length === 0) return;

    function setActive(id) {
        links.forEach(link => {
            const on = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', on);
            if (on) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    // Clicking a link should light it up straight away rather than waiting for
    // the scroll to settle -- and at the very bottom of the page the last
    // section may never win the measurement below.
    links.forEach(link => {
        link.addEventListener('click', function () {
            setActive(link.getAttribute('href').slice(1));
        });
    });

    if (!('IntersectionObserver' in window)) {
        setActive(sections[0].id);
        return;
    }

    // Compare how many *viewport* pixels each section covers, not
    // intersectionRatio: that is a fraction of the element, so a short section
    // peeking in would always outscore the long publications list.
    const covered = new Map();
    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            covered.set(entry.target.id,
                entry.isIntersecting ? entry.intersectionRect.height : 0);
        });

        // At the bottom of the page the final section can never fill the
        // reading area, so claim it explicitly.
        const atBottom = window.innerHeight + window.scrollY >=
            document.documentElement.scrollHeight - 4;
        if (atBottom) {
            setActive(sections[sections.length - 1].id);
            return;
        }

        let best = null;
        let bestPx = 0;
        sections.forEach(section => {
            const px = covered.get(section.id) || 0;
            if (px > bestPx) { bestPx = px; best = section.id; }
        });
        if (best) setActive(best);
    }, {
        // Discount the fixed navbar plus the sticky section nav.
        rootMargin: '-130px 0px -30% 0px',
        threshold: [0, 0.01, 0.1, 0.25, 0.5, 0.75, 1]
    });

    sections.forEach(section => observer.observe(section));
    setActive(sections[0].id);
}

// Publication Filters
function initPublicationFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const sortButtons = document.querySelectorAll('.sort-btn');
    const publicationItems = document.querySelectorAll('.publication-item');
    const publicationsList = document.querySelector('.publications-list');
    
    if (filterButtons.length === 0) return; // Exit if not on publications page
    
    // Current filter and sort state
    let currentFilter = 'all';
    let currentSort = 'desc';
    
    // Initialize button counts
    updateAllButtonCounts(publicationItems);
    
    // Filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            currentFilter = filter;
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter and sort
            applyFilterAndSort(currentFilter, currentSort);
        });
    });
    
    // Sort functionality
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sort = this.getAttribute('data-sort');
            currentSort = sort;
            
            // Update active button
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Apply filter and sort
            applyFilterAndSort(currentFilter, currentSort);
        });
    });
    
    function applyFilterAndSort(filter, sort) {
        // Get all publication items as array
        const itemsArray = Array.from(publicationItems);
        
        // Filter items
        const filteredItems = itemsArray.filter(item => {
            const itemType = item.getAttribute('data-type');
            return filter === 'all' || itemType === filter;
        });
        
        // Sort filtered items by year
        filteredItems.sort((a, b) => {
            const yearA = parseInt(a.getAttribute('data-year')) || 0;
            const yearB = parseInt(b.getAttribute('data-year')) || 0;
            
            // Primary sort by year
            if (yearA !== yearB) {
                if (sort === 'desc') {
                    return yearB - yearA; // Newest first
                } else {
                    return yearA - yearB; // Oldest first
                }
            }
            
            // Secondary sort: reverse order for items with same year
            // Get their original DOM position as tiebreaker
            const indexA = Array.from(publicationItems).indexOf(a);
            const indexB = Array.from(publicationItems).indexOf(b);
            
            if (sort === 'desc') {
                return indexA - indexB; // Keep original order for desc
            } else {
                return indexB - indexA; // Reverse original order for asc
            }
        });
        
        // Hide all items first with animation
        itemsArray.forEach(item => {
            item.classList.add('fade-out');
            setTimeout(() => {
                item.classList.add('hidden');
                item.style.display = 'none';
            }, 300);
        });
        
        // Show and reorder filtered items
        setTimeout(() => {
            // Clear the container
            publicationsList.innerHTML = '';
            
            // Add filtered and sorted items back
            filteredItems.forEach((item, index) => {
                item.classList.remove('fade-out', 'hidden');
                item.style.display = 'grid'; // Force grid display
                publicationsList.appendChild(item);
                
                // Stagger the fade-in animation
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                }, index * 100);
            });
        }, 350);
    }
    
    // Initial sort (newest first by default)
    setTimeout(() => {
        applyFilterAndSort(currentFilter, currentSort);
    }, 100);
}

function updateAllButtonCounts(items) {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        const filter = button.getAttribute('data-filter');
        const label = button.getAttribute('data-label') || button.textContent.trim();
        const count = filter === 'all'
            ? items.length
            : Array.from(items).filter(item => item.getAttribute('data-type') === filter).length;

        button.textContent = `${label} (${count})`;
        // A filter that cannot match anything is a dead control -- hide it
        // rather than offering "Conference Papers (0)".
        button.hidden = count === 0;
    });
}

function updatePublicationCount(filter, items) {
    let count = 0;
    if (filter === 'all') {
        count = items.length;
    } else {
        count = Array.from(items).filter(item => 
            item.getAttribute('data-type') === filter
        ).length;
    }
    
    // You can use this count to display somewhere if needed
    console.log(`Showing ${count} publications of type: ${filter}`);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment when you have a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered'))
        //     .catch(error => console.log('SW registration failed'));
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
