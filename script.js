/* ============================================
   TEMPLATE HOTELLERIE v5.0.17 — JavaScript
   Construit FROM SCRATCH (8th template)
   ----------------------------------------------------
   18 modules Chime communs (inspiration vitrine, code réécrit)
   + 16 modules hotellerie-spécifiques = 34 modules

   3 BUGS CRITIQUES À ÉVITER :
   - Bug #1 : initReveal() doit ajouter .reveal--pending AVANT observation
   - Bug #2 : initStickyCta() doit être MOBILE ONLY (max-width:768px)
   - Bug #3 : Aucune logique JS qui masque des sections entières
   ============================================ */
(function(){
'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;

/* ============================================================
   PARTIE 1 — 18 MODULES CHIME COMMUNS (inspiration vitrine, code réécrit)
   ============================================================ */

// 1. HEADER SHRINK
function initHeaderShrink(){
    const header = document.getElementById('header');
    if(!header) return;
    let ticking = false;
    window.addEventListener('scroll', ()=>{
        if(!ticking){
            window.requestAnimationFrame(()=>{
                if(window.pageYOffset > 50){
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, {passive:true});
}

// 2. REVEAL ON SCROLL
// BUG #1 (CRITIQUE) : on ajoute .reveal--pending AVANT d'observer
// pour que les éléments soient invisibles SEULEMENT si JS tourne.
// Si JS échoue : .reveal reste opacity:1 (visible).
function initReveal(){
    if(prefersReducedMotion) return;
    const els = document.querySelectorAll('.reveal');
    els.forEach(el=>el.classList.add('reveal--pending'));
    const obs = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
            if(e.isIntersecting){
                e.target.classList.add('is-visible');
                obs.unobserve(e.target);
            }
        });
    }, {threshold:0.1, rootMargin:'0px 0px -50px 0px'});
    els.forEach(el=>obs.observe(el));
}

// 3. COUNT-UP (stats hôtellerie)
function initCountUp(){
    const els = document.querySelectorAll('[data-count], [data-cible]');
    if(!els.length) return;
    if(prefersReducedMotion){
        els.forEach(el=>{
            const target = el.dataset.count || el.dataset.cible;
            const suffix = el.dataset.suffix || '';
            el.textContent = target + suffix;
        });
        return;
    }
    const obs = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
            if(e.isIntersecting){
                const el = e.target;
                const target = parseInt(el.dataset.count || el.dataset.cible, 10);
                const suffix = el.dataset.suffix || (parseInt(el.dataset.cible,10) > 100 ? '+' : '');
                const start = performance.now();
                const dur = 1800;
                function step(now){
                    const p = Math.min((now-start)/dur, 1);
                    const ease = 1 - Math.pow(1-p, 3);
                    el.textContent = Math.floor(target*ease).toLocaleString() + suffix;
                    if(p<1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
                obs.unobserve(el);
            }
        });
    }, {threshold:0.5});
    els.forEach(el=>obs.observe(el));
}

// 4. HERO PARALLAX 3D
function initHeroParallax(){
    if(prefersReducedMotion || isMobile) return;
    const heroBg = document.querySelector('.hero-hotellerie__bg, .hero__bg, .chambre-hero__bg');
    if(!heroBg) return;
    const hero = heroBg.closest('.hero-hotellerie, .hero, .chambre-hero');
    if(!hero) return;
    let ticking = false;
    window.addEventListener('scroll', ()=>{
        if(!ticking){
            window.requestAnimationFrame(()=>{
                const offset = window.pageYOffset;
                if(offset < window.innerHeight){
                    heroBg.style.transform = `translateY(${offset*0.4}px) scale(${1 + offset*0.0003})`;
                }
                ticking = false;
            });
            ticking = true;
        }
    }, {passive:true});
}

// 5. TILT CARDS — premium cards 3D tilt
function initTiltCards(){
    if(prefersReducedMotion || isMobile) return;
    document.querySelectorAll('.tilt-card').forEach(card=>{
        let rafId = null;
        card.addEventListener('mousemove', (e)=>{
            const r = card.getBoundingClientRect();
            const cx = r.left + r.width/2;
            const cy = r.top + r.height/2;
            const rx = -(e.clientY - cy) / (r.height/2) * 10;
            const ry = (e.clientX - cx) / (r.width/2) * 10;
            if(rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(()=>{
                card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
            });
        });
        card.addEventListener('mouseleave', ()=>{
            if(rafId) cancelAnimationFrame(rafId);
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
        });
    });
}

// 6. HOVER GLOW (premium-card) — sets --mx/--my
function initHoverGlow(){
    if(prefersReducedMotion || isMobile) return;
    document.querySelectorAll('.premium-card').forEach(card=>{
        card.addEventListener('mousemove', (e)=>{
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', ((e.clientX-r.left)/r.width*100)+'%');
            card.style.setProperty('--my', ((e.clientY-r.top)/r.height*100)+'%');
        });
    });
}

// 7. FAQ ACCORDION — button + aria-expanded
function initFaq(){
    document.querySelectorAll('.faq-hotellerie__q, .faq__q, .faq-question').forEach(q=>{
        const item = q.closest('.faq-hotellerie__item') || q.closest('.faq__item') || q.parentElement;
        if(!item) return;
        const itemId = item.id || 'faq-' + Math.random().toString(36).substr(2,9);
        item.id = itemId;
        const panel = item.querySelector('.faq-hotellerie__a, .faq__a, .faq-reponse');
        if(panel){
            panel.id = itemId + '-panel';
            panel.setAttribute('role', 'region');
            panel.setAttribute('aria-labelledby', itemId + '-tab');
        }
        q.id = itemId + '-tab';
        q.setAttribute('aria-controls', itemId + '-panel');
        if(!q.hasAttribute('aria-expanded')){
            q.setAttribute('aria-expanded', 'false');
        }
        q.addEventListener('click', ()=>{
            const isOpen = item.classList.contains('open') || q.classList.contains('open');
            // Close others (single-open behavior)
            document.querySelectorAll('.faq-hotellerie__item.open, .faq__item.open').forEach(o=>{
                if(o !== item){
                    o.classList.remove('open');
                    const oq = o.querySelector('.faq-hotellerie__q, .faq__q, .faq-question');
                    if(oq) oq.setAttribute('aria-expanded', 'false');
                }
            });
            item.classList.toggle('open');
            q.setAttribute('aria-expanded', !isOpen);
        });
    });
}

// 8. CUSTOM CURSOR (desktop only)
function initCursor(){
    if(prefersReducedMotion || isMobile) return;
    const cursor = document.getElementById('cursor');
    if(!cursor) return;
    cursor.style.display = 'block';
    let mx=0, my=0, cx=0, cy=0;
    document.addEventListener('mousemove', e=>{mx=e.clientX; my=e.clientY;});
    function loop(){
        cx += (mx-cx)*0.2; cy += (my-cy)*0.2;
        cursor.style.left = cx+'px'; cursor.style.top = cy+'px';
        requestAnimationFrame(loop);
    }
    loop();
    document.querySelectorAll('a,button,.premium-card,input,select,.tilt-card,.chambre-card,.equipe-hotellerie').forEach(el=>{
        el.addEventListener('mouseenter', ()=>cursor.classList.add('hover'));
        el.addEventListener('mouseleave', ()=>cursor.classList.remove('hover'));
    });
}

// 9. BURGER MENU — aria-expanded init + click outside
function initBurger(){
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('menu');
    if(!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'menu');
    toggle.addEventListener('click', (e)=>{
        e.stopPropagation();
        const isOpen = menu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
    });
    document.addEventListener('click', (e)=>{
        if(menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)){
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', (e)=>{
        if(e.key === 'Escape' && menu.classList.contains('open')){
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.focus();
        }
    });
}

// 10. FORM SUBMIT — envoyer notification + modal premium (PAS de redirection WhatsApp)
function initForm(){
    const forms = document.querySelectorAll('form[data-notif]');
    if(!forms.length) return;
    forms.forEach(form=>{
        form.removeAttribute('onsubmit');
        form.addEventListener('submit', (e)=>{
            e.preventDefault();
            const requiredFields = form.querySelectorAll('[required]');
            let valid = true;
            requiredFields.forEach(f=>{
                if(!f.value.trim()){
                    f.setAttribute('aria-invalid', 'true');
                    valid = false;
                } else {
                    f.removeAttribute('aria-invalid');
                }
            });
            if(!valid){
                showToast('Veuillez remplir tous les champs obligatoires', 'error');
                const firstInvalid = form.querySelector('[aria-invalid="true"]');
                if(firstInvalid) firstInvalid.focus();
                return;
            }

            const formType = form.dataset.notif || 'contact';
            const titleMap = {
                contact: 'Message envoyé',
                reservation: 'Réservation envoyée',
                reservation_chambre: 'Demande de réservation envoyée',
                spa: 'Réservation spa envoyée',
                conference: 'Demande de salle envoyée',
                newsletter: 'Inscription confirmée',
                estimation: 'Demande envoyée'
            };
            const title = titleMap[formType] || 'Demande envoyée';
            const msgMap = {
                reservation: 'Merci ! Notre équipe de réservation vous confirmera la disponibilité sous 24h.',
                reservation_chambre: 'Merci ! Nous vous confirmerons la disponibilité de la chambre sous 24h.',
                spa: 'Merci ! Votre réservation spa a bien été enregistrée. Confirmation sous 2h.',
                conference: 'Merci ! Notre service événementiel vous recontactera sous 24h.',
                contact: 'Merci ! Notre équipe vous répondra sous 24h.',
                newsletter: 'Vous êtes bien inscrit à notre newsletter.',
                estimation: 'Merci ! Nous vous répondrons sous 24h.'
            };
            const msg = msgMap[formType] || "Merci ! Votre demande a bien été envoyée.";

            form.reset();
            const btn = form.querySelector('button[type="submit"]');
            if(btn){
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i> Envoyé !';
                btn.disabled = true;
                setTimeout(()=>{
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2500);
            }

            showPremiumModal({
                title: title,
                message: msg,
                type: 'success',
                autoClose: true
            });
        });
    });
}

// 11. STICKY CTA MOBILE
// BUG #2 (CRITIQUE) : Sticky CTA visible sur MOBILE uniquement (max-width:768px)
function initStickyCta(){
    const cta = document.getElementById('stickyCta');
    if(!cta) return;
    // Vérification mobile stricte — sur desktop : on return (PAS de sticky CTA)
    const isMobileView = window.matchMedia('(max-width: 768px)').matches;
    if(!isMobileView) return;
    window.addEventListener('scroll', ()=>{
        if(window.pageYOffset > 400){
            cta.classList.add('show');
        } else {
            cta.classList.remove('show');
        }
    }, {passive:true});
}

// 12. TOAST — accessible (role="status" aria-live="polite" set in HTML)
function showToast(msg, type){
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.remove('toast--error', 'toast--success');
    if(type) toast.classList.add('toast--' + type);
    toast.classList.add('show');
    setTimeout(()=>toast.classList.remove('show'), 3000);
}
window.showToast = showToast;

// 12b. TOAST alias "afficher" for backward-compat
const Toast = {
    _timer: null,
    afficher: function(msg, duree){
        duree = duree || 2500;
        const el = document.getElementById('toast');
        if(!el) return;
        clearTimeout(this._timer);
        el.textContent = msg;
        el.classList.add('show', 'visible');
        this._timer = setTimeout(function(){
            el.classList.remove('show', 'visible');
        }, duree);
    }
};
window.Toast = Toast;

// 13. MODAL PREMIUM CHIME
function showPremiumModal(opts){
    const backdrop = document.getElementById('modalNotif');
    if(!backdrop){
        showToast(opts.message || opts.title || 'OK', opts.type || 'success');
        return;
    }
    const card = document.getElementById('modalNotifCard');
    const iconEl = document.getElementById('modalNotifIcon');
    const titleEl = document.getElementById('modalNotifTitle');
    const msgEl = document.getElementById('modalNotifMessage');
    const closeBtn = document.getElementById('modalNotifClose');

    const isError = opts.type === 'error';
    card.classList.toggle('modal-premium--error', isError);
    iconEl.innerHTML = isError
        ? '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-check" aria-hidden="true"></i>';

    titleEl.textContent = opts.title || (isError ? 'Erreur' : 'Demande envoyée');
    msgEl.textContent = opts.message || '';

    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if(closeBtn) closeBtn.focus();

    let lastFocused = document.activeElement;

    function close(){
        backdrop.classList.remove('open');
        backdrop.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        backdrop.removeEventListener('click', onBackdropClick);
        if(closeBtn) closeBtn.removeEventListener('click', close);
        document.removeEventListener('keydown', onKeydown);
        if(lastFocused && lastFocused.focus) lastFocused.focus();
    }
    function onBackdropClick(e){
        if(e.target === backdrop) close();
    }
    function onKeydown(e){
        if(e.key === 'Escape') close();
        if(e.key === 'Tab'){
            const focusable = backdrop.querySelectorAll('button, [tabindex="0"], a[href]');
            if(focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if(e.shiftKey && document.activeElement === first){
                e.preventDefault();
                last.focus();
            } else if(!e.shiftKey && document.activeElement === last){
                e.preventDefault();
                first.focus();
            }
        }
    }
    backdrop.addEventListener('click', onBackdropClick);
    if(closeBtn) closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', onKeydown);

    if(opts.autoClose){
        setTimeout(close, 4000);
    }
}
window.showPremiumModal = showPremiumModal;

// 14. READING PROGRESS BAR
function initProgressBar(){
    const bar = document.getElementById('barre-progression');
    if(!bar) return;
    window.addEventListener('scroll', ()=>{
        const h = document.documentElement;
        const scrollPercent = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        bar.style.width = scrollPercent + '%';
    }, {passive:true});
}

// 15. LIGHTBOX (galerie photos)
function initLightbox(){
    const lb = document.getElementById('lightbox');
    if(!lb) return;
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-legende');
    let currentIndex = 0;
    let images = [];

    function openLightbox(src, alt, idx){
        img.src = src;
        img.alt = alt || '';
        if(caption) caption.textContent = alt || '';
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        currentIndex = idx;
    }
    window.ouvrirLightbox = function(src, alt, idx){
        images = Array.from(document.querySelectorAll('[data-lightbox]')).map(el=>({
            src: el.dataset.lightbox || el.src || el.href,
            alt: el.alt || el.title || ''
        }));
        currentIndex = idx !== undefined ? idx : images.findIndex(i=>i.src===src);
        openLightbox(src, alt, idx);
    };
    window.fermerLightbox = function(){
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };
    window.lightboxNav = function(dir){
        if(!images.length) return;
        currentIndex = (currentIndex + dir + images.length) % images.length;
        img.src = images[currentIndex].src;
        img.alt = images[currentIndex].alt;
        if(caption) caption.textContent = images[currentIndex].alt;
    };
    lb.addEventListener('click', (e)=>{
        if(e.target === lb || e.target.classList.contains('lightbox__close')) window.fermerLightbox();
    });
    document.addEventListener('keydown', (e)=>{
        if(!lb.classList.contains('open')) return;
        if(e.key === 'Escape') window.fermerLightbox();
        if(e.key === 'ArrowLeft') window.lightboxNav(-1);
        if(e.key === 'ArrowRight') window.lightboxNav(1);
    });
}

// 16. CAROUSEL CTRL (manual nav for auto-scroll carousels)
function initCarouselCtrl(){
    document.querySelectorAll('[data-carousel]').forEach(carousel=>{
        const track = carousel.querySelector('.carousel-track');
        const prevBtn = carousel.querySelector('[data-carousel-prev]');
        const nextBtn = carousel.querySelector('[data-carousel-next]');
        if(!track) return;
        const itemWidth = 320 + 24; // item + gap
        if(prevBtn){
            prevBtn.addEventListener('click', ()=>{
                track.scrollBy({left: -itemWidth, behavior: 'smooth'});
            });
        }
        if(nextBtn){
            nextBtn.addEventListener('click', ()=>{
                track.scrollBy({left: itemWidth, behavior: 'smooth'});
            });
        }
    });
}

// 17. ACTIVE NAV LINK (auto-highlight current page)
function initActiveNav(){
    const path = window.location.pathname.split('/').pop() || 'accueil.html';
    document.querySelectorAll('.nav__menu a').forEach(a=>{
        const href = a.getAttribute('href');
        if(href === path){
            a.classList.add('nav--active');
            a.setAttribute('aria-current', 'page');
        }
    });
}

// 18. BACK TO TOP (subtle — appears after scroll)
function initBackToTop(){
    const btn = document.getElementById('backToTop');
    if(!btn) return;
    window.addEventListener('scroll', ()=>{
        if(window.pageYOffset > 600){
            btn.classList.add('show');
        } else {
            btn.classList.remove('show');
        }
    }, {passive:true});
    btn.addEventListener('click', ()=>{
        window.scrollTo({top: 0, behavior: 'smooth'});
    });
}

/* ============================================================
   PARTIE 2 — 16 MODULES HOTELLERIE SPÉCIFIQUES
   ============================================================ */

// H1. BOOKING BAR — arrival/departure/guests
function initBookingBar(){
    const form = document.getElementById('booking-bar-form');
    if(!form) return;
    const arrivee = document.getElementById('booking-arrivee');
    const depart = document.getElementById('booking-depart');
    const guests = document.getElementById('booking-guests');

    // Set min dates to today
    const today = new Date().toISOString().split('T')[0];
    if(arrivee){
        arrivee.setAttribute('min', today);
        arrivee.addEventListener('change', ()=>{
            if(depart && arrivee.value){
                depart.setAttribute('min', arrivee.value);
                if(depart.value && depart.value < arrivee.value){
                    depart.value = arrivee.value;
                }
            }
        });
    }
    if(depart){
        depart.setAttribute('min', today);
    }

    form.addEventListener('submit', (e)=>{
        e.preventDefault();
        if(!arrivee.value || !depart.value){
            showToast('Veuillez sélectionner vos dates de séjour', 'error');
            return;
        }
        if(arrivee.value >= depart.value){
            showToast('La date de départ doit être après la date d\'arrivée', 'error');
            return;
        }
        const nbNuits = Math.round((new Date(depart.value) - new Date(arrivee.value)) / (1000*60*60*24));
        showPremiumModal({
            title: 'Recherche de disponibilité',
            message: `Nous recherchons une chambre pour ${guests ? guests.value : '2'} personne(s), ${nbNuits} nuit(s) du ${arrivee.value} au ${depart.value}. Redirection vers nos chambres...`,
            type: 'success',
            autoClose: true
        });
        setTimeout(()=>{
            window.location.href = 'chambres.html';
        }, 1800);
    });
}

// H2. CHAMBRES FILTERS — combined filter logic
function initChambresFilters(){
    const grid = document.getElementById('chambres-grid-filterable');
    if(!grid) return;
    const cards = Array.from(grid.querySelectorAll('.chambre-card'));
    const typeFilter = document.getElementById('filtre-type');
    const vueFilter = document.getElementById('filtre-vue');
    const prixFilter = document.getElementById('filtre-prix');
    const resetBtn = document.getElementById('filtre-reset');
    const resultCount = document.getElementById('filtre-resultats');

    function applyFilters(){
        const type = typeFilter ? typeFilter.value : '';
        const vue = vueFilter ? vueFilter.value : '';
        const prixMax = prixFilter ? parseInt(prixFilter.value, 10) : 999999;
        const prixDisplay = document.getElementById('filtre-prix-display');
        if(prixDisplay && prixFilter) prixDisplay.textContent = prixFilter.value + ' €';

        let visibleCount = 0;
        cards.forEach(card=>{
            const cardType = card.dataset.type || '';
            const cardVue = card.dataset.vue || '';
            const cardPrix = parseInt(card.dataset.prix || '0', 10);
            const matchType = !type || cardType === type;
            const matchVue = !vue || cardVue === vue;
            const matchPrix = cardPrix <= prixMax;
            const visible = matchType && matchVue && matchPrix;
            card.style.display = visible ? '' : 'none';
            if(visible) visibleCount++;
        });
        if(resultCount) resultCount.textContent = visibleCount;
        if(visibleCount === 0){
            showToast('Aucune chambre ne correspond à vos critères', 'error');
        }
    }

    if(typeFilter) typeFilter.addEventListener('change', applyFilters);
    if(vueFilter) vueFilter.addEventListener('change', applyFilters);
    if(prixFilter) prixFilter.addEventListener('input', applyFilters);
    if(resetBtn){
        resetBtn.addEventListener('click', ()=>{
            if(typeFilter) typeFilter.value = '';
            if(vueFilter) vueFilter.value = '';
            if(prixFilter) prixFilter.value = prixFilter.max || 500;
            applyFilters();
            showToast('Filtres réinitialisés', 'success');
        });
    }
    applyFilters();
}

// H3. CHAMBRE GALERIE — photo gallery + lightbox
function initChambreGalerie(){
    const main = document.querySelector('.chambre-galerie__main img');
    const thumbs = document.querySelectorAll('.chambre-galerie__thumb');
    if(!main || !thumbs.length) return;
    thumbs.forEach((thumb, idx)=>{
        const img = thumb.querySelector('img');
        if(!img) return;
        thumb.addEventListener('click', ()=>{
            // Swap main image
            const tmpSrc = main.src;
            const tmpAlt = main.alt;
            main.src = img.src;
            main.alt = img.alt;
            img.src = tmpSrc;
            img.alt = tmpAlt;
            // Active state
            thumbs.forEach(t=>t.classList.remove('is-active'));
            thumb.classList.add('is-active');
        });
        // Lightbox on main click
        thumb.addEventListener('keydown', (e)=>{
            if(e.key === 'Enter' || e.key === ' '){
                e.preventDefault();
                thumb.click();
            }
        });
    });
    if(main.parentElement){
        main.parentElement.addEventListener('click', ()=>{
            if(window.ouvrirLightbox){
                window.ouvrirLightbox(main.src, main.alt, 0);
            }
        });
    }
}

// H4. CHAMBRE TARIFS — price toggle (low/high season)
function initChambreTarifs(){
    const toggle = document.querySelector('.chambre-tarifs__toggle');
    if(!toggle) return;
    const buttons = toggle.querySelectorAll('button');
    const rows = document.querySelectorAll('.chambre-tarifs__table tr[data-saison]');

    buttons.forEach(btn=>{
        btn.addEventListener('click', ()=>{
            buttons.forEach(b=>b.classList.remove('is-active'));
            btn.classList.add('is-active');
            const saison = btn.dataset.saison;
            rows.forEach(row=>{
                if(row.dataset.saison === saison || row.dataset.saison === 'all'){
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    });
}

// H5. SERVICES SLIDER — services carousel
function initServicesSlider(){
    const carousel = document.querySelector('[data-services-carousel]');
    if(!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    if(!track) return;
    const itemWidth = 280 + 24;
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    if(prev) prev.addEventListener('click', ()=>track.scrollBy({left:-itemWidth, behavior:'smooth'}));
    if(next) next.addEventListener('click', ()=>track.scrollBy({left:itemWidth, behavior:'smooth'}));
}

// H6. SPA RESERVATION — spa booking form
function initSpaReservation(){
    const form = document.getElementById('spa-reservation-form');
    if(!form) return;
    const traitement = document.getElementById('spa-traitement');
    const dateInput = document.getElementById('spa-date');
    const timeSelect = document.getElementById('spa-heure');

    // Set min date to today
    if(dateInput){
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Update time slots based on treatment duration
    if(traitement){
        traitement.addEventListener('change', ()=>{
            const duration = parseInt(traitement.options[traitement.selectedIndex].dataset.duration || '60', 10);
            if(!timeSelect) return;
            timeSelect.innerHTML = '';
            const slots = generateTimeSlots(duration);
            slots.forEach(s=>{
                const opt = document.createElement('option');
                opt.value = s;
                opt.textContent = s;
                timeSelect.appendChild(opt);
            });
        });
    }

    function generateTimeSlots(duration){
        const slots = [];
        const start = 9 * 60; // 9:00 in minutes
        const end = 19 * 60;  // 19:00 in minutes
        for(let m = start; m + duration <= end; m += 30){
            const h = Math.floor(m / 60);
            const min = m % 60;
            slots.push(`${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`);
        }
        return slots;
    }
    // form submit handled by initForm (data-notif="spa")
}

// H7. AVIS SLIDER — reviews slider
function initAvisSlider(){
    const carousel = document.querySelector('[data-avis-carousel]');
    if(!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    if(!track) return;
    const itemWidth = 360 + 24;
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    if(prev) prev.addEventListener('click', ()=>track.scrollBy({left:-itemWidth, behavior:'smooth'}));
    if(next) next.addEventListener('click', ()=>track.scrollBy({left:itemWidth, behavior:'smooth'}));

    // Auto-advance every 6s if not hovering
    if(prefersReducedMotion) return;
    let autoTimer = setInterval(()=>{
        if(track.scrollLeft + track.clientWidth >= track.scrollWidth - 10){
            track.scrollTo({left:0, behavior:'smooth'});
        } else {
            track.scrollBy({left:itemWidth, behavior:'smooth'});
        }
    }, 6000);
    carousel.addEventListener('mouseenter', ()=>clearInterval(autoTimer));
}

// H8. STATS HOTELLERIE — count-up stats
function initStatsHotellerie(){
    const els = document.querySelectorAll('.stat-hotellerie__nombre[data-cible]');
    if(!els.length) return;
    if(prefersReducedMotion){
        els.forEach(el=>{
            const target = el.dataset.cible;
            const suffix = el.dataset.suffix || '';
            el.textContent = target + suffix;
        });
        return;
    }
    const obs = new IntersectionObserver((entries)=>{
        entries.forEach(e=>{
            if(e.isIntersecting){
                const el = e.target;
                const target = parseInt(el.dataset.cible, 10);
                const suffix = el.dataset.suffix || (target > 100 ? '+' : '');
                const start = performance.now();
                const dur = 2000;
                function step(now){
                    const p = Math.min((now-start)/dur, 1);
                    const ease = 1 - Math.pow(1-p, 3);
                    el.textContent = Math.floor(target*ease).toLocaleString() + suffix;
                    if(p<1) requestAnimationFrame(step);
                }
                requestAnimationFrame(step);
                obs.unobserve(el);
            }
        });
    }, {threshold:0.5});
    els.forEach(el=>obs.observe(el));
}

// H9. OFFRES CAROUSEL — offers carousel
function initOffresCarousel(){
    const carousel = document.querySelector('[data-offres-carousel]');
    if(!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    if(!track) return;
    const itemWidth = 320 + 24;
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    if(prev) prev.addEventListener('click', ()=>track.scrollBy({left:-itemWidth, behavior:'smooth'}));
    if(next) next.addEventListener('click', ()=>track.scrollBy({left:itemWidth, behavior:'smooth'}));
}

// H10. CONFERENCE RESERVATION — meeting room booking
function initConferenceReservation(){
    const buttons = document.querySelectorAll('[data-reserver-salle]');
    buttons.forEach(btn=>{
        btn.addEventListener('click', ()=>{
            const salleNom = btn.dataset.reserverSalle;
            const salleCapacite = btn.dataset.capacite || '';
            const form = document.getElementById('conference-form');
            const salleInput = document.getElementById('conference-salle');
            const capaciteInput = document.getElementById('conference-capacite');
            if(form && salleInput){
                salleInput.value = salleNom;
                if(capaciteInput) capaciteInput.value = salleCapacite;
                form.scrollIntoView({behavior:'smooth', block:'center'});
                showToast(`Salle "${salleNom}" sélectionnée — complétez votre demande`, 'success');
            }
        });
    });
}

// H11. ACCESS MAP — interactive access map
function initAccessMap(){
    const cards = document.querySelectorAll('.acces-hotellerie__card');
    if(!cards.length) return;
    cards.forEach(card=>{
        card.addEventListener('click', ()=>{
            const type = card.dataset.acces;
            if(!type) return;
            cards.forEach(c=>c.classList.remove('is-active'));
            card.classList.add('is-active');
            const mapInfo = document.getElementById('acces-map-info');
            if(mapInfo){
                const labels = {
                    airport: 'Aéroport international · 25 min en taxi',
                    train: 'Gare TGV · 15 min en métro',
                    parking: 'Parking privé · accès direct à la réception'
                };
                mapInfo.textContent = labels[type] || '';
                mapInfo.style.display = labels[type] ? 'block' : 'none';
            }
        });
    });
}

// H12. FILTRE TYPE — room type filter (alias)
function initFiltreType(){
    const select = document.getElementById('filtre-type');
    if(!select) return; // handled by initChambresFilters
}

// H13. FILTRE PRIX — price range filter (alias)
function initFiltrePrix(){
    const input = document.getElementById('filtre-prix');
    if(!input) return; // handled by initChambresFilters
    const display = document.getElementById('filtre-prix-display');
    if(display){
        input.addEventListener('input', ()=>{
            display.textContent = input.value + ' €';
        });
        display.textContent = input.value + ' €';
    }
}

// H14. FILTRE VUE — view filter (alias)
function initFiltreVue(){
    const select = document.getElementById('filtre-vue');
    if(!select) return; // handled by initChambresFilters
}

// H15. CHAMBRE BOOKMARK — favorites localStorage
function initChambreBookmark(){
    const buttons = document.querySelectorAll('.chambre-card__bookmark');
    if(!buttons.length) return;
    const STORAGE_KEY = 'hotellerie_favoris';
    let favoris = [];
    try {
        favoris = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch(e){ favoris = []; }

    buttons.forEach(btn=>{
        const id = btn.dataset.bienId || btn.dataset.chambreId;
        if(!id) return;
        if(favoris.includes(id)){
            btn.classList.add('is-bookmarked');
            btn.querySelector('i').classList.remove('fa-regular');
            btn.querySelector('i').classList.add('fa-solid');
        }
        btn.addEventListener('click', (e)=>{
            e.preventDefault();
            e.stopPropagation();
            const idx = favoris.indexOf(id);
            if(idx === -1){
                favoris.push(id);
                btn.classList.add('is-bookmarked');
                btn.querySelector('i').classList.remove('fa-regular');
                btn.querySelector('i').classList.add('fa-solid');
                showToast('Chambre ajoutée à vos favoris', 'success');
            } else {
                favoris.splice(idx, 1);
                btn.classList.remove('is-bookmarked');
                btn.querySelector('i').classList.remove('fa-solid');
                btn.querySelector('i').classList.add('fa-regular');
                showToast('Chambre retirée de vos favoris', 'success');
            }
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(favoris));
            } catch(e){}
        });
    });
}

// H16. RESERVATION CONFIRMEE — booking confirmation modal
function initReservationConfirmee(){
    const form = document.querySelector('form[data-notif="reservation_chambre"]');
    if(!form) return; // form submit handled by initForm
    const chambreNom = form.dataset.chambreNom;
    const prixNuit = form.dataset.prixNuit;

    // Set min date for arrival/departure
    const arrivee = form.querySelector('input[name="arrivee"]');
    const depart = form.querySelector('input[name="depart"]');
    const today = new Date().toISOString().split('T')[0];
    if(arrivee){
        arrivee.setAttribute('min', today);
        arrivee.addEventListener('change', ()=>{
            if(depart && arrivee.value){
                depart.setAttribute('min', arrivee.value);
            }
        });
    }
    if(depart){
        depart.setAttribute('min', today);
    }

    // Live price calculation
    const calcDisplay = document.getElementById('reservation-prix-total');
    function calculerTotal(){
        if(!arrivee || !depart || !arrivee.value || !depart.value) return;
        if(arrivee.value >= depart.value) return;
        const nbNuits = Math.round((new Date(depart.value) - new Date(arrivee.value)) / (1000*60*60*24));
        if(calcDisplay && prixNuit){
            const total = nbNuits * parseInt(prixNuit, 10);
            calcDisplay.textContent = `${nbNuits} nuit(s) × ${parseInt(prixNuit,10)} € = ${total} €`;
        }
    }
    if(arrivee) arrivee.addEventListener('change', calculerTotal);
    if(depart) depart.addEventListener('change', calculerTotal);
}

/* ============================================================
   INIT — all modules
   ============================================================ */
function init(){
    // 18 modules Chime communs
    initHeaderShrink();
    initReveal();
    initCountUp();
    initHeroParallax();
    initTiltCards();
    initHoverGlow();
    initFaq();
    initCursor();
    initBurger();
    initForm();
    initStickyCta();
    initProgressBar();
    initLightbox();
    initCarouselCtrl();
    initActiveNav();
    initBackToTop();

    // 16 modules hotellerie
    initBookingBar();
    initChambresFilters();
    initChambreGalerie();
    initChambreTarifs();
    initServicesSlider();
    initSpaReservation();
    initAvisSlider();
    initStatsHotellerie();
    initOffresCarousel();
    initConferenceReservation();
    initAccessMap();
    initFiltreType();
    initFiltrePrix();
    initFiltreVue();
    initChambreBookmark();
    initReservationConfirmee();
}

if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
})();
