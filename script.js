// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Initialize all components
    initNavigation();
    initScrollAnimations();
    initSmoothScrolling();
    initContactForm();
    initThemeAnimations();
    initLoadingAnimations();
    initPublicationFilters();
}

// Navigation functionality
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Active navigation link highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const sections = document.querySelectorAll('section[id]');
    
    if (sections.length > 0 && currentPage === 'index.html') {
        // For home page with sections, use scroll-based navigation
        window.addEventListener('scroll', updateActiveNavLink);
        updateActiveNavLink(); // Initial call
    } else {
        // For other pages, use page-based navigation
        setActiveNavLink();
    }
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

function updateActiveNavLink() {
    // This function is for single-page navigation with sections
    // Only run if we're on a page with sections (like index.html)
    const sections = document.querySelectorAll('section[id]');
    
    if (sections.length === 0) {
        return; // No sections, use page-based navigation
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';
    
    // Get the current section based on scroll position
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    // If no section is detected or we're at the top, default to home
    if (!current || window.scrollY < 100) {
        current = 'home';
    }
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkHref = link.getAttribute('href');
        
        // For section-based navigation on home page
        if ((linkHref === `#${current}`) || 
            (current === 'home' && linkHref === 'index.html')) {
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
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
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
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Basic validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields.', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Simulate form submission
            submitContactForm(name, email, subject, message);
        });
    }
}

function submitContactForm(name, email, subject, message) {
    // Show loading state
    const submitButton = document.querySelector('#contactForm button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    submitButton.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
        
        // Show success message
        showNotification('Thank you for your message! I will get back to you soon.', 'success');
        
        // Reset form
        document.getElementById('contactForm').reset();
        
        // In a real application, you would send this data to your backend
        console.log('Contact form submission:', { name, email, subject, message });
    }, 2000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close functionality
    const closeButton = notification.querySelector('.notification-close');
    closeButton.addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

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

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimized scroll handler
const optimizedScrollHandler = throttle(function() {
    updateActiveNavLink();
}, 100);

window.addEventListener('scroll', optimizedScrollHandler);

// Handle resize events
const optimizedResizeHandler = debounce(function() {
    // Recalculate positions if needed
    updateActiveNavLink();
}, 250);

window.addEventListener('resize', optimizedResizeHandler);

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
        let count = 0;
        let originalText = '';
        
        // Get the original button text (without count)
        if (filter === 'all') {
            originalText = 'All Publications';
            count = items.length;
        } else if (filter === 'journal') {
            originalText = 'Journal Articles';
            count = Array.from(items).filter(item => 
                item.getAttribute('data-type') === 'journal'
            ).length;
        } else if (filter === 'conference') {
            originalText = 'Conference Papers';
            count = Array.from(items).filter(item => 
                item.getAttribute('data-type') === 'conference'
            ).length;
        } else if (filter === 'working') {
            originalText = 'Working Papers';
            count = Array.from(items).filter(item => 
                item.getAttribute('data-type') === 'working'
            ).length;
        }
        
        // Update button text with count
        button.textContent = `${originalText} (${count})`;
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
    const icon = button.querySelector('i');
    
    if (abstract.style.display === 'none' || abstract.style.display === '') {
        abstract.style.display = 'block';
        button.classList.add('expanded');
        icon.classList.remove('fa-plus');
        icon.classList.add('fa-minus');
    } else {
        abstract.style.display = 'none';
        button.classList.remove('expanded');
        icon.classList.remove('fa-minus');
        icon.classList.add('fa-plus');
    }
}
