/* ============================================================
   Roy Andrej Martinsen — Foto
   ============================================================ */

(() => {
  const $  = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  /* ----- Loader ----- */
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    setTimeout(() => $('#loader')?.classList.add('hidden'), 600);
  });

  /* ----- Year ----- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ----- Nav scroll state ----- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----- Mobile nav ----- */
  const toggle = $('#navToggle');
  const links  = $('#navLinks');
  toggle?.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
  }));

  /* ----- Cursor (desktop only). Direct positioning, no rAF loop. ----- */
  if (matchMedia('(pointer: fine)').matches) {
    const cursor = $('#cursor');
    let pending = false;
    let lastX = 0, lastY = 0;
    document.addEventListener('mousemove', e => {
      lastX = e.clientX; lastY = e.clientY;
      cursor.classList.add('show');
      if (!pending) {
        pending = true;
        requestAnimationFrame(() => {
          cursor.style.transform = `translate(${lastX}px, ${lastY}px) translate(-50%, -50%)`;
          pending = false;
        });
      }
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.remove('show'));
    document.addEventListener('mouseover', e => {
      const t = e.target.closest('a, button, .g-item');
      cursor.classList.toggle('hover', !!t);
    });
  }

  /* ----- Reveal on scroll -----
     NB: g-items inne i masonry-gallerier (.gallery-feature/-doc/-concept)
     skal IKKE få reveal-klassen, fordi Safari maler transformerte
     children utenfor sin CSS-column-boks. Det gjør at bilder havner
     visuelt over neste seksjons tekst. */
  const masonryItems = new Set($$('.gallery-feature .g-item, .gallery-doc .g-item, .gallery-concept .g-item'));
  const galleryItems = $$('.g-item').filter(el => !masonryItems.has(el));
  const revealEls = [
    ...$$('.section-title, .lede, .intro-body p, .chapter-header, .chapter-title, .chapter-desc, .chapter-num'),
    ...galleryItems,
    ...$$('.reflect, .lens-set-label, .video-frame'),
  ];
  revealEls.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  revealEls.forEach(el => io.observe(el));

  /* Stagger gallery items within a section */
  $$('.gallery').forEach(g => {
    [...g.children].forEach((it, i) => {
      it.style.transitionDelay = `${Math.min(i, 8) * 60}ms`;
    });
  });

  /* Hero parallax fjernet bevisst — den forårsaket lag på scroll. */

  /* ----- Lightbox ----- */
  const lb     = $('#lightbox');
  const lbImg  = $('#lbImg');
  const lbCap  = $('#lbCap');
  const lbCnt  = $('#lbCount');
  const items  = $$('.g-item');

  let currentIdx = -1;

  const openLB = (i) => {
    currentIdx = i;
    const fig = items[i];
    const img = fig.querySelector('img');
    const cap = fig.querySelector('figcaption')?.textContent || '';
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = cap;
    lbCnt.textContent = `${String(i + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLB = () => {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentIdx = -1;
  };

  const step = (n) => {
    if (currentIdx < 0) return;
    const i = (currentIdx + n + items.length) % items.length;
    openLB(i);
  };

  items.forEach((it, i) => it.addEventListener('click', () => openLB(i)));
  $('#lbClose').addEventListener('click', closeLB);
  $('#lbPrev').addEventListener('click', () => step(-1));
  $('#lbNext').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });

  /* Swipe on touch */
  let touchX = 0;
  lb.addEventListener('touchstart', e => touchX = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 60) step(dx > 0 ? -1 : 1);
  });
})();
