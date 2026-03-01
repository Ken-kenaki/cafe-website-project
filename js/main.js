/* ===================================================================
   main.js — Scroll Reveal Animations & Shared Interactivity
   Cafe Delight
   =================================================================== */

(function () {
    'use strict';

    /* ----- Scroll Reveal with IntersectionObserver ----- */
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    if ('IntersectionObserver' in window && revealElements.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                        observer.unobserve(entry.target); // animate only once
                    }
                });
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
        );

        revealElements.forEach((el) => observer.observe(el));
    } else {
        // Fallback: show everything immediately
        revealElements.forEach((el) => el.classList.add('revealed'));
    }

    /* ----- Smooth Scroll for anchor links ----- */
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    /* ----- Active nav link highlighting ----- */
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a, .mobile-nav-links a').forEach((link) => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });

    /* ----- Floating badge subtle animation on scroll ----- */
    const badges = document.querySelectorAll('.hero-badge');
    if (badges.length) {
        window.addEventListener(
            'scroll',
            () => {
                const scrollY = window.scrollY;
                badges.forEach((badge, i) => {
                    const direction = i % 2 === 0 ? 1 : -1;
                    badge.style.transform = `translateY(${scrollY * 0.05 * direction}px)`;
                });
            },
            { passive: true }
        );
    }
})();
