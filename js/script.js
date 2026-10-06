/* ==========================================================================
   RAVI RAJ — PORTFOLIO SCRIPT
   Version: 5.0 (1st-year portfolio · Recruiter-focused)
   ========================================================================== */

(function () {
    'use strict';

    /* ======================================================================
       1. HELPERS
       ====================================================================== */
    const $  = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.prototype.slice.call(
        (ctx || document).querySelectorAll(sel)
    );

    const prefersReduced = (function () {
        try {
            return window.matchMedia &&
                   window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) {
            return false;
        }
    })();

    const FOCUSABLE = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    function sessionGet(key) {
        try { return sessionStorage.getItem(key); }
        catch (e) { return null; }
    }
    function sessionSet(key, value) {
        try { sessionStorage.setItem(key, value); return true; }
        catch (e) { return false; }
    }

    /* ======================================================================
       2. ELEMENT REFERENCES
       ====================================================================== */
    const menuBtn       = $('#menuBtn');
    const mobileNav     = $('#mobileNav');
    const mobileOverlay = $('#mobileOverlay');
    const mobileClose   = $('#mobileNavClose');

    const header        = $('#siteHeader');
    const yearEl        = $('#year');
    const copyBtn       = $('#copyEmail');
    const emailTxt      = $('#emailText');
    const scrollCue     = $('.scroll-cue');

    const sections      = $$('section[id]');
    const navLinks      = $$('.primary-nav a[href^="#"]');

    /* ======================================================================
       3. YEAR IN FOOTER
       ====================================================================== */
    if (yearEl) {
        yearEl.textContent = String(new Date().getFullYear());
    }

    /* ======================================================================
       4. FOCUS TRAP (mobile menu ke liye)
       ====================================================================== */
    let activeTrap = null;

    function handleTrapKey(e) {
        if (e.key !== 'Tab' || !activeTrap) return;

        const focusables = $$(FOCUSABLE, activeTrap).filter(function (el) {
            return el.offsetParent !== null || el === document.activeElement;
        });
        if (!focusables.length) return;

        const first = focusables[0];
        const last  = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }

    function handleGlobalEscape(e) {
        if (e.key !== 'Escape') return;

        if (mobileNav && mobileNav.dataset.open === 'true') {
            closeMenu();
        }
    }

    function trapFocus(container) {
        releaseFocus();
        activeTrap = container;
        container.addEventListener('keydown', handleTrapKey);
        document.addEventListener('keydown', handleGlobalEscape);
    }

    function releaseFocus() {
        if (activeTrap) {
            activeTrap.removeEventListener('keydown', handleTrapKey);
            activeTrap = null;
        }
        document.removeEventListener('keydown', handleGlobalEscape);
    }

    /* ======================================================================
       5. MOBILE MENU
       ====================================================================== */
    let lastFocusedMenu = null;

    function openMenu() {
        if (!mobileNav || !mobileOverlay) return;
        lastFocusedMenu = document.activeElement;

        mobileNav.hidden = false;
        mobileOverlay.hidden = false;
        void mobileNav.offsetHeight;

        mobileNav.dataset.open = 'true';
        mobileOverlay.dataset.open = 'true';

        document.body.style.overflow = 'hidden';
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
        mobileNav.setAttribute('aria-hidden', 'false');
        mobileOverlay.setAttribute('aria-hidden', 'false');

        setTimeout(function () {
            const firstLink = $('a', mobileNav);
            if (firstLink && typeof firstLink.focus === 'function') {
                try { firstLink.focus(); } catch (e) {}
            }
        }, 100);

        trapFocus(mobileNav);
    }

    function closeMenu() {
        if (!mobileNav || !mobileOverlay) return;

        mobileNav.dataset.open = 'false';
        mobileOverlay.dataset.open = 'false';
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
        mobileNav.setAttribute('aria-hidden', 'true');
        mobileOverlay.setAttribute('aria-hidden', 'true');

        document.body.style.overflow = '';

        setTimeout(function () {
            mobileNav.hidden = true;
            mobileOverlay.hidden = true;
        }, 500);

        releaseFocus();

        if (lastFocusedMenu && typeof lastFocusedMenu.focus === 'function') {
            try { lastFocusedMenu.focus(); } catch (e) {}
        }
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            const isOpen = mobileNav && mobileNav.dataset.open === 'true';
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        });
    }

    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMenu);

    $$('#mobileNav a').forEach(function (link) {
        link.addEventListener('click', function () {
            setTimeout(closeMenu, 60);
        });
    });

    /* ======================================================================
       6. SMOOTH SCROLL
       ====================================================================== */
    $$('a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href.length < 2) return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();

            const top = target.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({
                top: top,
                behavior: prefersReduced ? 'auto' : 'smooth'
            });

            try { history.pushState(null, '', href); } catch (err) {}
        });
    });

    /* ======================================================================
       7. COPY EMAIL
       ====================================================================== */
    function showCopyState(label) {
        if (!copyBtn || !emailTxt) return;
        const prev = emailTxt.textContent;
        emailTxt.textContent = label;
        setTimeout(function () {
            emailTxt.textContent = prev;
        }, 1600);
    }

    function copyEmail() {
        if (!emailTxt) return;
        const text = emailTxt.textContent.trim();

        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(
                    function () { showCopyState('Copied ✓'); },
                    function () { showCopyState('Copy failed'); }
                );
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.position = 'absolute';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                showCopyState('Copied ✓');
            }
        } catch (err) {
            showCopyState('Copy failed');
        }
    }

    if (copyBtn) copyBtn.addEventListener('click', copyEmail);

    /* ======================================================================
       8. ACTIVE NAV ON SCROLL
       ====================================================================== */
    function updateActiveNav() {
        if (!sections.length || !navLinks.length) return;

        const scrollY = window.scrollY + 140;
        let currentId = '';

        for (let i = 0; i < sections.length; i++) {
            const s = sections[i];
            const top = s.offsetTop;
            const bottom = top + s.offsetHeight;
            if (scrollY >= top && scrollY < bottom) {
                currentId = s.id;
                break;
            }
        }

        navLinks.forEach(function (link) {
            const href = link.getAttribute('href') || '';
            const navKey = href.charAt(0) === '#' ? href.slice(1) : '';
            const isActive = navKey === currentId;
            link.classList.toggle('is-active', isActive);
            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    let navRaf = null;
    window.addEventListener('scroll', function () {
        if (navRaf) return;
        navRaf = requestAnimationFrame(function () {
            updateActiveNav();
            navRaf = null;
        });
    }, { passive: true });

    window.addEventListener('load', updateActiveNav);
    updateActiveNav();

    /* ======================================================================
       9. SCROLL CUE FADE
       ====================================================================== */
    if (scrollCue) {
        let cueRaf = null;

        const fadeCue = function () {
            const opacity = Math.max(0, 1 - window.scrollY / 300);
            scrollCue.style.opacity = String(opacity);
            scrollCue.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
        };

        window.addEventListener('scroll', function () {
            if (cueRaf) return;
            cueRaf = requestAnimationFrame(function () {
                fadeCue();
                cueRaf = null;
            });
        }, { passive: true });

        fadeCue();
    }

    /* ======================================================================
       10. EXTERNAL LINKS SECURITY
       ====================================================================== */
    $$('a[target="_blank"]').forEach(function (link) {
        const rel = link.getAttribute('rel') || '';
        if (rel.indexOf('noopener') === -1) {
            link.setAttribute('rel', (rel + ' noopener noreferrer').trim());
        }
    });

    /* ======================================================================
       11. CONSOLE GREETING
       ====================================================================== */
    const hasGreeted = sessionGet('rr-greeted');
    if (!hasGreeted) {
        const accent = 'color:#b45309;font-weight:600;';
        const soft   = 'color:#737373;';

        console.log('%cRavi Raj — Portfolio', 'font-size:14px;font-weight:700;' + accent);
        console.log('%cHi, fellow developer. Thanks for opening the console.', 'font-size:12px;' + soft);
        console.log('%cCode: https://github.com/ravirajhere', 'font-size:12px;' + soft);

        sessionSet('rr-greeted', '1');
    }

    /* ======================================================================
       12. LIVE GITHUB STATS
       ====================================================================== */
    (function initLiveStats() {
        const lastCommitEl = $('#tbCommits');

        if (!lastCommitEl) return;

        fetch('/api/stats')
            .then(function (res) {
                if (!res.ok) throw new Error('HTTP ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data || !data.lastCommit) return;

                const days = data.lastCommit.daysAgo;
                const textEl = lastCommitEl.querySelector('.tb-commits-text') || lastCommitEl;

                if (days === 0) {
                    textEl.textContent = 'Committed today';
                } else if (days === 1) {
                    textEl.textContent = 'Last commit: yesterday';
                } else if (days !== null && days >= 0) {
                    textEl.textContent = 'Last commit: ' + days + 'd ago';
                }
            })
            .catch(function (err) {
                console.warn('[stats] Failed to load:', err.message);
            });
    })();

})();
