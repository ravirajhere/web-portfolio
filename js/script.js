/* ==========================================================================
   RAVI RAJ — PORTFOLIO SCRIPT
   Version: 7.0 (matches index.html v7 · Resume on desktop + mobile)
   ========================================================================== */

(function () {
    'use strict';

    /* ======================================================================
       1. HELPERS
       ====================================================================== */
    const $  = function (sel, ctx) {
        return (ctx || document).querySelector(sel);
    };
    const $$ = function (sel, ctx) {
        return Array.prototype.slice.call(
            (ctx || document).querySelectorAll(sel)
        );
    };

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

    function getScrollY() {
        return window.scrollY || window.pageYOffset || 0;
    }

    /* ======================================================================
       2. ELEMENT REFERENCES
       ====================================================================== */
    const menuBtn       = $('#menuBtn');
    const mobileNav     = $('#mobileNav');
    const mobileOverlay = $('#mobileOverlay');
    const mobileClose   = $('#mobileNavClose');

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

    function getFocusables(container) {
        return $$(FOCUSABLE, container).filter(function (el) {
            if (el === document.activeElement) return true;
            if (el.hasAttribute('disabled')) return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
    }

    function handleTrapKey(e) {
        if (e.key !== 'Tab' || !activeTrap) return;

        const focusables = getFocusables(activeTrap);
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
    const MENU_TRANSITION_MS = 500;

    function focusFirstInMenu() {
        if (!mobileNav) return;
        const firstLink = $('a', mobileNav);
        if (firstLink && typeof firstLink.focus === 'function') {
            try { firstLink.focus(); } catch (e) {}
        }
    }

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

        // Two RAFs ensure the transition has started before focusing
        requestAnimationFrame(function () {
            requestAnimationFrame(focusFirstInMenu);
        });

        trapFocus(mobileNav);
    }

    function closeMenu() {
        if (!mobileNav || !mobileOverlay) return;

        mobileNav.dataset.open = 'false';
        mobileOverlay.dataset.open = 'false';
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');

        document.body.style.overflow = '';

        window.setTimeout(function () {
            if (mobileNav.dataset.open !== 'true') {
                mobileNav.hidden = true;
                mobileOverlay.hidden = true;
            }
        }, MENU_TRANSITION_MS);

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

    // Only close the menu for internal hash links.
    // External links (e.g. Resume) navigate away — no need to close.
    $$('#mobileNav a[href^="#"]').forEach(function (link) {
        link.addEventListener('click', function () {
            window.setTimeout(closeMenu, 60);
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

            target.scrollIntoView({
                behavior: prefersReduced ? 'auto' : 'smooth',
                block: 'start'
            });

            try { history.replaceState(null, '', href); } catch (err) {}
        });
    });

    /* ======================================================================
       7. COPY EMAIL
       ====================================================================== */
    const ORIGINAL_EMAIL = emailTxt ? emailTxt.textContent.trim() : '';
    let copyTimer = null;

    function showCopyState(label) {
        if (!copyBtn || !emailTxt) return;
        if (copyTimer) clearTimeout(copyTimer);
        emailTxt.textContent = label;
        copyTimer = setTimeout(function () {
            emailTxt.textContent = ORIGINAL_EMAIL;
        }, 1600);
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    }

    function copyEmail() {
        if (!ORIGINAL_EMAIL) return;

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(ORIGINAL_EMAIL).then(
                function () { showCopyState('Copied ✓'); },
                function () {
                    fallbackCopy(ORIGINAL_EMAIL);
                    showCopyState('Copied ✓');
                }
            );
        } else {
            fallbackCopy(ORIGINAL_EMAIL);
            showCopyState('Copied ✓');
        }
    }

    if (copyBtn) copyBtn.addEventListener('click', copyEmail);

    /* ======================================================================
       8. ACTIVE NAV ON SCROLL
       ====================================================================== */
    function updateActiveNav() {
        if (!sections.length || !navLinks.length) return;

        const y = getScrollY() + 140;
        let currentId = '';

        for (let i = 0; i < sections.length; i++) {
            const s = sections[i];
            const top = s.offsetTop;
            const bottom = top + s.offsetHeight;
            if (y >= top && y < bottom) {
                currentId = s.id;
                break;
            }
        }

        // Fallback: keep "About" highlighted when at top
        if (!currentId && sections.length) {
            currentId = sections[0].id;
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

    /* ======================================================================
       9. SCROLL CUE FADE
       ====================================================================== */
    let scrollCueOpacity = 1;

    function fadeCue() {
        if (!scrollCue) return;
        const opacity = Math.max(0, 1 - getScrollY() / 300);
        if (opacity === scrollCueOpacity) return;
        scrollCueOpacity = opacity;
        scrollCue.style.opacity = String(opacity);
        scrollCue.style.pointerEvents = opacity < 0.1 ? 'none' : 'auto';
    }

    /* ======================================================================
       10. SINGLE SCROLL HANDLER (RAF throttled)
       ====================================================================== */
    let rafId = null;

    function onScroll() {
        if (rafId) return;
        rafId = requestAnimationFrame(function () {
            updateActiveNav();
            fadeCue();
            rafId = null;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', updateActiveNav);
    window.addEventListener('resize', onScroll, { passive: true });

    updateActiveNav();
    fadeCue();

    /* ======================================================================
       11. CONTACT FORM
       ====================================================================== */
    (function initContactForm() {
        const form = $('#contactForm');
        const status = $('#formStatus');
        const submitBtn = $('#submitBtn');

        if (!form || !status || !submitBtn) return;

        const MIN_NAME = 2;
        const MIN_MSG = 10;
        const STATUS_DISMISS_MS = 5000;
        const LOADING_TIMEOUT_MS = 15000;

        let statusTimer = null;

        function showStatus(message, type) {
            if (statusTimer) clearTimeout(statusTimer);
            status.textContent = message;
            status.className = 'status is-visible is-' + type;

            if (type === 'loading') {
                statusTimer = setTimeout(function () {
                    status.className = 'status';
                    resetBtn();
                }, LOADING_TIMEOUT_MS);
            } else {
                statusTimer = setTimeout(function () {
                    status.className = 'status';
                }, STATUS_DISMISS_MS);
            }
        }

        function validateForm(name, email, message) {
            if (!name || name.length < MIN_NAME) {
                return 'Please enter your name (at least 2 characters).';
            }
            if (name.length > 60) return 'Name is too long.';

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
            if (!email || !emailRegex.test(email)) {
                return 'Please enter a valid email address.';
            }

            if (!message || message.length < MIN_MSG) {
                return 'Message must be at least 10 characters.';
            }
            if (message.length > 2000) return 'Message is too long.';

            return null;
        }

        function resetBtn() {
            submitBtn.disabled = false;
            submitBtn.innerHTML =
                '<span>Send Message</span>' +
                '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">' +
                '<path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
                '</svg>';
        }

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const honeypot = $('#hp_website');
            if (honeypot && honeypot.value.trim() !== '') {
                return;
            }

            const nameEl = $('#user_name');
            const emailEl = $('#user_email');
            const msgEl = $('#user_message');

            const name = nameEl ? nameEl.value.trim() : '';
            const email = emailEl ? emailEl.value.trim() : '';
            const message = msgEl ? msgEl.value.trim() : '';

            const error = validateForm(name, email, message);
            if (error) {
                showStatus(error, 'error');
                return;
            }

            showStatus('Sending your message…', 'loading');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Sending…</span>';

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        message: message,
                        website: '',
                        context: 'portfolio'
                    })
                });

                const data = await res.json().catch(function () { return {}; });

                if (!res.ok) {
                    showStatus(data.error || 'Failed to send. Try again.', 'error');
                    resetBtn();
                    return;
                }

                showStatus("Message sent. I'll reply soon.", 'success');
                form.reset();
                resetBtn();

                if (nameEl && typeof nameEl.focus === 'function') {
                    try { nameEl.focus(); } catch (err) {}
                }
            } catch (err) {
                console.error(err);
                showStatus('Network error. Try again.', 'error');
                resetBtn();
            }
        });
    })();

})();
