document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileNavLinks = document.querySelector('.mobile-nav-links');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const hamburger = mobileMenuBtn.querySelector('.hamburger');
    const closeIcon = mobileMenuBtn.querySelector('.close');
    const header = document.querySelector('header');
    
    // Toggle mobile menu
    function toggleMobileMenu() {
        const isActive = mobileNavLinks.classList.contains('active');
        
        if (isActive) {
            // Close menu
            mobileNavLinks.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            hamburger.style.display = 'flex';
            closeIcon.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        } else {
            // Open menu
            mobileNavLinks.classList.add('active');
            mobileNavOverlay.classList.add('active');
            hamburger.style.display = 'none';
            closeIcon.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Disable scrolling
        }
    }
    
    // Event listeners
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileNavOverlay.addEventListener('click', toggleMobileMenu);
    
    // Close menu when clicking on a link (for mobile)
    mobileNavLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            // Don't close for links that might have submenus (you can add conditions if needed)
            toggleMobileMenu();
        });
    });
    
    // Close menu on window resize (if resized to desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Close mobile menu if open
            if (mobileNavLinks.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
    
    // Add scroll effect to header
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Keyboard accessibility
    document.addEventListener('keydown', function(e) {
        // Close menu on ESC key
        if (e.key === 'Escape' && mobileNavLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
        
        // Trap focus within mobile menu when open
        if (e.key === 'Tab' && mobileNavLinks.classList.contains('active')) {
            const focusableElements = mobileNavLinks.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
    
    // Touch gestures for mobile (optional)
    let touchStartX = 0;
    let touchEndX = 0;
    
    mobileNavLinks.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    mobileNavLinks.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        
        // Swipe right to close menu
        if (touchEndX > touchStartX + 50 && mobileNavLinks.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});