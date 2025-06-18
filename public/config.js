// Mobile Menu Toggle with Animation
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    // Animate hamburger icon
    mobileMenuBtn.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// Search Functionality
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        alert(`Mencari: ${query}\nIni akan mengarahkan ke hasil pencarian.`);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Animation on scroll
const animateElements = document.querySelectorAll('.feature-card, .testimonial-card, .section-title, .search-container, .footer-column, .copyright');

function checkScroll() {
    animateElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 100) {
            element.classList.add('animate-in');
        }
    });
}

// Initial check when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkScroll();
    
    // Animate footer columns sequentially
    setTimeout(() => {
        document.querySelectorAll('.footer-column').forEach((col, index) => {
            setTimeout(() => {
                col.classList.add('animate-in');
            }, index * 200);
        });
        
        // Animate copyright last
        setTimeout(() => {
            document.querySelector('.copyright').classList.add('animate-in');
        }, 800);
    }, 500);
});

// Check on scroll
window.addEventListener('scroll', checkScroll);

// Floating animation for hero elements
const floatingElements = document.querySelectorAll('.floating');
floatingElements.forEach(el => {
    el.style.opacity = '1';
});