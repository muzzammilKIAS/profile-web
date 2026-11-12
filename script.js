(() => {
  'use strict';
  const doc = document.documentElement;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const mobile = matchMedia('(max-width: 900px)');
  const readPreference = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const savePreference = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Optional storage. */ } };

  $('#year').textContent = new Date().getFullYear();

  // ── Tiga bahasa: BM (asal dalam HTML), English, العربية. ──
  const I18N = window.PROFILE_I18N || {};
  const msJs = window.PROFILE_I18N_MS_JS || {};
  let lang = ['en', 'ar'].includes(doc.lang) ? doc.lang : 'ms';
  const t = (key, ...args) => {
    const pack = (lang !== 'ms' && I18N[lang] && I18N[lang].js) || msJs;
    const value = pack[key] ?? msJs[key];
    return typeof value === 'function' ? value(...args) : value;
  };
  const metaDescription = document.querySelector('meta[name="description"]');
  const msMeta = { title: document.title, desc: metaDescription.content };
  const i18nAttrs = { i18nAria: 'aria-label', i18nPh: 'placeholder', i18nAlt: 'alt' };
  const originals = new Map();
  const originalAttrs = new Map();
  $$('[data-i18n]').forEach(el => originals.set(el, el.innerHTML));
  $$('[data-i18n-aria], [data-i18n-ph], [data-i18n-alt]').forEach(el => {
    originalAttrs.set(el, Object.fromEntries(Object.values(i18nAttrs).map(attr => [attr, el.getAttribute(attr)])));
  });
  function applyStaticText(next) {
    const pack = next === 'ms' ? null : (I18N[next] || {});
    $$('[data-i18n]').forEach(el => {
      const original = originals.get(el);
      el.innerHTML = pack && pack[el.dataset.i18n] != null ? pack[el.dataset.i18n] : original;
    });
    originalAttrs.forEach((saved, el) => {
      Object.entries(i18nAttrs).forEach(([dataKey, attr]) => {
        const key = el.dataset[dataKey];
        if (!key) return;
        const original = saved[attr];
        el.setAttribute(attr, pack && pack[key] != null ? pack[key] : original);
      });
    });
    document.title = pack && pack._title ? pack._title : msMeta.title;
    metaDescription.content = pack && pack._desc ? pack._desc : msMeta.desc;
    doc.lang = next;
    doc.dir = next === 'ar' ? 'rtl' : 'ltr';
    $$('.lang-switch button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === next)));
  }
  if (lang !== 'ms') applyStaticText(lang);
  else $$('.lang-switch button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === 'ms')));

  // Theme follows the system until the visitor chooses an override.
  const savedTheme = readPreference('research-profile-theme');
  if (['light', 'dark'].includes(savedTheme)) doc.dataset.theme = savedTheme;
  const isDark = () => doc.dataset.theme ? doc.dataset.theme === 'dark' : systemTheme.matches;
  function updateThemeLabel() {
    $('#themeToggle').setAttribute('aria-label', isDark() ? t('toLight') : t('toDark'));
  }
  updateThemeLabel();
  systemTheme.addEventListener('change', updateThemeLabel);
  $('#themeToggle').addEventListener('click', () => {
    doc.dataset.theme = isDark() ? 'light' : 'dark';
    savePreference('research-profile-theme', doc.dataset.theme);
    updateThemeLabel();
  });

  // Reduced motion always takes precedence over the optional visitor toggle.
  let userPaused = readPreference('research-profile-motion') === 'paused';
  const motionPaused = () => reducedMotion.matches || userPaused;
  function updateMotion() {
    const paused = motionPaused();
    doc.dataset.motion = paused ? 'paused' : 'active';
    $('#motionLabel').textContent = paused ? t('motionOff') : t('motionOn');
    $('#motionToggle').setAttribute('aria-pressed', String(paused));
    $('#motionToggle').setAttribute('aria-label', reducedMotion.matches ? t('reduced') : paused ? t('play') : t('pause'));
    $('#motionToggle').setAttribute('aria-disabled', String(reducedMotion.matches));
    $('#motionToggle path').setAttribute('d', paused ? 'M9 5l10 7-10 7Z' : 'M9 5v14M15 5v14');
    if (paused) $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }
  updateMotion();
  reducedMotion.addEventListener('change', updateMotion);
  $('#motionToggle').addEventListener('click', () => {
    if (reducedMotion.matches) return;
    userPaused = !userPaused;
    savePreference('research-profile-motion', userPaused ? 'paused' : 'active');
    updateMotion();
  });

  const panel = $('#navPanel');
  const menu = $('#menuToggle');
  function closeMenu(restoreFocus = false) {
    const wasOpen = panel.classList.contains('is-open');
    panel.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', t('menuOpen'));
    panel.inert = mobile.matches;
    if (restoreFocus && wasOpen) menu.focus();
  }
  function openMenu() {
    panel.inert = false;
    panel.classList.add('is-open');
    document.body.classList.add('menu-open');
    menu.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-label', t('menuClose'));
    panel.querySelector('a').focus();
  }
  closeMenu();
  menu.addEventListener('click', () => panel.classList.contains('is-open') ? closeMenu(true) : openMenu());
  mobile.addEventListener('change', () => closeMenu());
  document.addEventListener('click', (event) => {
    if (panel.classList.contains('is-open') && !event.target.closest('.nav-actions')) closeMenu(true);
  });
  document.addEventListener('keydown', (event) => {
    if (!panel.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeMenu(true);
    if (event.key === 'Tab') {
      const focusable = [...panel.querySelectorAll('a, .lang-switch button'), $('#themeToggle'), menu];
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  // Menu jatuh "Profil": klik, hover (tetikus sahaja) dan papan kekunci.
  const drop = $('#navDrop');
  const dropToggle = $('#dropToggle');
  const hoverCapable = matchMedia('(hover: hover) and (pointer: fine)');
  function setDrop(open) {
    drop.classList.toggle('is-open', open);
    dropToggle.setAttribute('aria-expanded', String(open));
  }
  dropToggle.addEventListener('click', () => setDrop(!drop.classList.contains('is-open')));
  drop.addEventListener('mouseenter', () => { if (hoverCapable.matches && !mobile.matches) setDrop(true); });
  drop.addEventListener('mouseleave', () => { if (hoverCapable.matches && !mobile.matches) setDrop(false); });
  drop.addEventListener('focusout', (event) => { if (!drop.contains(event.relatedTarget)) setDrop(false); });
  document.addEventListener('click', (event) => { if (!event.target.closest('#navDrop')) setDrop(false); });
  drop.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drop.classList.contains('is-open')) { event.stopPropagation(); setDrop(false); dropToggle.focus(); }
  });

  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    setDrop(false);
    const wasOpen = panel.classList.contains('is-open');
    closeMenu();
    if (wasOpen) {
      const destination = $(link.getAttribute('href'));
      destination.setAttribute('tabindex', '-1');
      destination.focus({ preventScroll: true });
    }
  }));

  // One animation frame per scroll; no continuous JavaScript animation loop.
  const sections = [...new Set($$('.nav-link').map(link => $(link.getAttribute('href'))))]
    .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
  const hero = $('#utama');
  let scrollPending = false;
  // Kedudukan bahagian disimpan sekali (dikira semula bila saiz berubah) supaya tatalan tidak memaksa layout.
  const siteHeader = $('#siteHeader'), progressBar = $('#readingProgress');
  const navLinks = $$('.nav-link'), dropLinks = $$('.drop-link');
  const heroKaleidoEl = hero.querySelector('.hero-kaleido');
  let sectionTops = [], heroHeight = 1, pageTotal = 0, activeId = null, headerOn = null, zoomKey = '';
  function measure() {
    const base = window.scrollY;
    sectionTops = sections.map(section => section.getBoundingClientRect().top + base);
    heroHeight = Math.max(1, hero.offsetHeight);
    pageTotal = doc.scrollHeight - innerHeight;
  }
  function setActive(active) {
    activeId = active;
    navLinks.forEach(link => {
      const selected = link.getAttribute('href') === `#${active}`;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    dropToggle.classList.toggle('is-active', dropLinks.some(link => link.classList.contains('is-active')));
  }
  function updateScroll() {
    const scroll = window.scrollY;
    const scrolled = scroll > 12;
    if (scrolled !== headerOn) { headerOn = scrolled; siteHeader.classList.toggle('is-scrolled', scrolled); }
    progressBar.style.transform = `scaleX(${pageTotal > 0 ? Math.min(1, scroll / pageTotal) : 0})`;
    let active = sections[0].id;
    for (let i = 0; i < sections.length; i++) if (sectionTops[i] - scroll <= innerHeight * .4) active = sections[i].id;
    if (active !== activeId) setActive(active);
    // Kaleidoskop hero zoom masuk dan berpusing perlahan mengikut tatalan (hanya selagi hero kelihatan).
    if (heroKaleidoEl && scroll < heroHeight * 1.3) {
      const heroProgress = Math.min(1, scroll / heroHeight);
      const zoom = (1 + heroProgress * .45).toFixed(3), turn = (heroProgress * 40).toFixed(1);
      const key = zoom + '|' + turn;
      if (key !== zoomKey) {
        zoomKey = key;
        heroKaleidoEl.style.setProperty('--scroll-zoom', zoom);
        heroKaleidoEl.style.setProperty('--scroll-turn', turn + 'deg');
      }
    }
    scrollPending = false;
  }
  measure();
  addEventListener('load', () => { measure(); updateScroll(); });
  if ('ResizeObserver' in window) {
    let measureTimer;
    new ResizeObserver(() => { clearTimeout(measureTimer); measureTimer = setTimeout(() => { measure(); requestScrollUpdate(); }, 120); }).observe(document.body);
  }
  function requestScrollUpdate() {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }
  addEventListener('scroll', requestScrollUpdate, { passive: true });
  addEventListener('resize', () => { measure(); requestScrollUpdate(); }, { passive: true });
  updateScroll();

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .08 });
    const staggered = ['research-card', 'honour', 'cert-card', 'app-card'];
    $$('.section-header, .about-note, .about-copy, .research-card, .timeline-item, .panel, .contact-box, .award-card, .honour, .cert-card, .app-card').forEach((el) => {
      if (motionPaused()) return;
      el.classList.add('reveal');
      if (staggered.some(name => el.classList.contains(name))) el.style.setProperty('--reveal-delay', `${([...el.parentElement.children].indexOf(el) % 3) * 90}ms`);
      revealObserver.observe(el);
    });
    revealObserver.observe($('#timeline'));
    const statsObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      $$('.stat-number').forEach(el => {
        const target = Number(el.dataset.target);
        if (!Number.isFinite(target) || (target === 0 && el.dataset.placeholder)) return;
        const decimals = Number(el.dataset.decimals || 0);
        const suffix = el.dataset.suffix || '';
        const start = performance.now();
        function tick(now) {
          const progress = motionPaused() ? 1 : Math.min((now - start) / 1400, 1);
          el.textContent = (target * (1 - (1 - progress) ** 3)).toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      statsObserver.disconnect();
    }, { threshold: .2 });
    statsObserver.observe($('#stats'));
  } else {
    $('#timeline').classList.add('is-visible');
  }

  // ── Kaleidoskop: satu baji corak dicerminkan berulang kali (simetri 2N). ──
  // Satu gelung animasi untuk semua kanvas; kanvas di luar skrin atau semasa jeda tidak dilukis semula.
  const kaleidoConfig = {
    intro: { wedges: 16, shapes: 26, spin: .09, alpha: 1 },
    hero: { wedges: 16, shapes: 20, spin: .025, alpha: .9 },
    arch: { wedges: 12, shapes: 16, spin: -.04, alpha: .75 },
    contact: { wedges: 12, shapes: 14, spin: .03, alpha: .8 },
  };
  const kaleidoColours = ['#dcc48b', '#f6f0de', '#2f7d5f', '#3b6491', '#b8954a', '#1a5a46'];
  function seeded(seed) {
    return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }
  function starPath(ctx, x, y, radius, rotation, points, inner) {
    ctx.beginPath();
    for (let k = 0; k < points * 2; k++) {
      const angle = rotation + k * Math.PI / points;
      const r = k % 2 ? radius * inner : radius;
      ctx.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
    }
    ctx.closePath();
  }
  function createKaleido(canvas) {
    const config = kaleidoConfig[canvas.dataset.kaleido] || kaleidoConfig.hero;
    const ctx = canvas.getContext('2d');
    const random = seeded(canvas.dataset.kaleido.length * 977 + 13);
    const kinds = ['star', 'star', 'circle', 'diamond', 'petal', 'ring'];
    const shapes = Array.from({ length: config.shapes }, () => ({
      kind: kinds[Math.floor(random() * kinds.length)],
      distance: .06 + random() * .9,
      angle: random(),
      size: .025 + random() * .08,
      speed: .15 + random() * .35,
      phase: random() * Math.PI * 2,
      colour: kaleidoColours[Math.floor(random() * kaleidoColours.length)],
      fill: random() > .45,
    }));
    let width = 0, height = 0, radius = 0;
    function resize() {
      width = canvas.offsetWidth; height = canvas.offsetHeight;
      // Kanvas hiasan dilukis pada resolusi terhad dan diskalakan oleh CSS; ini memotong kos lukisan dengan banyak.
      const cap = canvas.dataset.kaleido === 'intro' ? 480 : 640;
      const ratio = Math.max(.3, Math.min(devicePixelRatio || 1, 1.5, cap / Math.max(1, width, height)));
      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      radius = Math.hypot(width, height) / 2;
    }
    function drawWedge(time, segment) {
      shapes.forEach(shape => {
        const wobble = Math.sin(time * shape.speed + shape.phase);
        const d = (shape.distance + wobble * .07) * radius;
        const a = (shape.angle + Math.sin(time * shape.speed * .6 + shape.phase) * .35) * segment;
        const x = Math.cos(a) * d, y = Math.sin(a) * d;
        const size = shape.size * radius * (1 + Math.cos(time * shape.speed + shape.phase) * .25);
        const turn = time * shape.speed * .8 + shape.phase;
        ctx.strokeStyle = shape.colour;
        ctx.fillStyle = shape.colour + (shape.fill ? '55' : '00');
        ctx.lineWidth = Math.max(.6, radius * .0022);
        if (shape.kind === 'star') starPath(ctx, x, y, size, turn, 8, .55);
        else if (shape.kind === 'diamond') starPath(ctx, x, y, size, turn, 4, .3);
        else if (shape.kind === 'petal') { ctx.beginPath(); ctx.ellipse(x, y, size, size * .38, turn, 0, Math.PI * 2); }
        else { ctx.beginPath(); ctx.arc(x, y, size * (shape.kind === 'ring' ? 1.2 : .55), 0, Math.PI * 2); }
        ctx.fill(); ctx.stroke();
      });
    }
    function draw(time) {
      if (!width) resize();
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalAlpha = config.alpha;
      ctx.translate(width / 2, height / 2);
      ctx.rotate(time * config.spin);
      const segment = Math.PI * 2 / config.wedges;
      for (let i = 0; i < config.wedges; i++) {
        ctx.save();
        ctx.rotate(i * segment);
        if (i % 2) { ctx.rotate(segment); ctx.scale(1, -1); } // pantulan cermin
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, -.004, segment + .004);
        ctx.closePath();
        ctx.clip();
        drawWedge(time, segment);
        ctx.restore();
      }
      // Gelang emas statik memberi struktur rozet.
      ctx.strokeStyle = '#dcc48b';
      ctx.globalAlpha = config.alpha * .35;
      ctx.lineWidth = 1;
      [.18, .34, .52].forEach(r => { ctx.beginPath(); ctx.arc(0, 0, radius * r, 0, Math.PI * 2); ctx.stroke(); });
      ctx.restore();
    }
    return { canvas, draw, resize, visible: true };
  }
  const kaleidos = $$('canvas[data-kaleido]').map(createKaleido);
  const kaleidoStart = performance.now();
  let frozenTime = 2.5;
  let kaleidoRunning = false;
  let lastKaleidoDraw = 0;
  function kaleidoFrame(now) {
    const introEl = document.getElementById('intro');
    const introOn = introEl && introEl.isConnected;
    // Semasa pembukaan hanya kanvas pembukaan dilukis; selepas itu hanya yang kelihatan.
    const live = kaleidos.filter(k => k.canvas.isConnected && k.visible && (!introOn || k.canvas.dataset.kaleido === 'intro'));
    if (motionPaused() || !live.length) { kaleidoRunning = false; return; }
    if (now - lastKaleidoDraw >= (introOn ? 66 : 32)) {
      lastKaleidoDraw = now;
      frozenTime = (now - kaleidoStart) / 1000 + 2.5;
      live.forEach(k => k.draw(frozenTime));
    }
    requestAnimationFrame(kaleidoFrame);
  }
  function startKaleido() {
    kaleidos.forEach(k => { if (k.canvas.isConnected) k.draw(frozenTime); });
    if (!kaleidoRunning && !motionPaused()) { kaleidoRunning = true; requestAnimationFrame(kaleidoFrame); }
  }
  if ('IntersectionObserver' in window) {
    const kaleidoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { kaleidos.find(k => k.canvas === entry.target).visible = entry.isIntersecting; });
      startKaleido();
    });
    kaleidos.forEach(k => kaleidoObserver.observe(k.canvas));
  }
  let resizeTimer;
  addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { kaleidos.forEach(k => k.resize()); startKaleido(); }, 150);
  }, { passive: true });
  $('#motionToggle').addEventListener('click', startKaleido);
  reducedMotion.addEventListener('change', startKaleido);
  startKaleido();

  // ── Kotak hidup: cahaya emas mengikut kursor dan condong 3D yang halus. ──
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  $$('.lively').forEach(card => {
    let moveEvent = null, moveQueued = false;
    function applyMove() {
      moveQueued = false;
      const event = moveEvent;
      if (!event) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      if (motionPaused() || card.classList.contains('publication')) return;
      const dx = x - .5, dy = y - .5;
      const tilt = Math.min(6, Math.hypot(dx, dy) * 10);
      card.style.rotate = `${(-dy).toFixed(3)} ${dx.toFixed(3)} 0 ${tilt.toFixed(2)}deg`;
    }
    card.addEventListener('pointermove', (event) => {
      if (!finePointer.matches) return;
      moveEvent = event;
      if (!moveQueued) { moveQueued = true; requestAnimationFrame(applyMove); }
    }, { passive: true });
    card.addEventListener('pointerleave', () => { moveEvent = null; card.style.rotate = ''; });
  });

  // ── Pembukaan: zoom masuk, zoom keluar, kemudian tirai jatuh. Sekali bagi setiap sesi. ──
  const intro = $('#intro');
  if (doc.classList.contains('has-intro') && intro) {
    try { sessionStorage.setItem('profile-intro-seen', '1'); } catch { /* Optional storage. */ }
    document.body.style.overflow = 'hidden';
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(introTimer);
      intro.classList.add('is-leaving');
      doc.classList.add('intro-done');
      document.body.style.overflow = '';
      setTimeout(() => intro.remove(), 1150);
    };
    const introTimer = setTimeout(finish, 2900);
    intro.addEventListener('click', finish);
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') finish(); });
  } else if (intro) {
    intro.remove();
  }

  // ── Tapisan cip (sijil & penerbitan) + carian penerbitan. ──
  const publications = $$('.publication');
  const filters = { publicationList: 'all', certGrid: 'all' };
  function popIn(el) {
    if (motionPaused()) return;
    el.classList.remove('pop-in');
    void el.offsetWidth;
    el.classList.add('pop-in');
  }
  function filterPublications() {
    const query = $('#publicationSearch').value.trim().toLocaleLowerCase();
    let count = 0;
    publications.forEach(publication => {
      const matches = (filters.publicationList === 'all' || publication.dataset.cat === filters.publicationList)
        && publication.textContent.toLocaleLowerCase().includes(query);
      const wasHidden = publication.hidden;
      publication.hidden = !matches;
      if (matches) { count++; if (wasHidden) popIn(publication); }
    });
    $('#publicationCount').textContent = t('count', count);
    $('#publicationEmpty').hidden = count > 0;
    requestScrollUpdate();
  }
  function filterCertificates() {
    $$('#certGrid .cert-card').forEach(card => {
      const matches = filters.certGrid === 'all' || card.dataset.cat === filters.certGrid;
      const wasHidden = card.hidden;
      card.hidden = !matches;
      if (matches && wasHidden) { card.classList.add('is-visible'); popIn(card); }
    });
    requestScrollUpdate();
  }
  $$('.chip-row[data-filter-for]').forEach(row => {
    row.addEventListener('click', (event) => {
      const chip = event.target.closest('.chip');
      if (!chip) return;
      row.querySelectorAll('.chip').forEach(other => other.setAttribute('aria-pressed', String(other === chip)));
      filters[row.dataset.filterFor] = chip.dataset.filter;
      if (row.dataset.filterFor === 'certGrid') filterCertificates();
      else filterPublications();
    });
  });
  $('#publicationSearch').addEventListener('input', filterPublications);

  // ── Tukar bahasa dengan peralihan: tirai kaleidoskop berkembang dari butang, teks berganti, tirai pudar. ──
  const languageNames = { ms: 'Bahasa Melayu', en: 'English', ar: 'العربية' };
  const veil = document.createElement('div');
  veil.className = 'lang-veil';
  veil.setAttribute('aria-hidden', 'true');
  veil.innerHTML = '<svg class="lang-veil-star" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M50 4 61 39 96 50 61 61 50 96 39 61 4 50 39 39Z"/><path d="M17 17 54 33 83 17 67 54 83 83 46 67 17 83 33 46Z"/><circle cx="50" cy="50" r="14"/><circle cx="50" cy="50" r="30" stroke-dasharray="2 5"/></svg><span class="lang-veil-word"></span>';
  document.body.append(veil);
  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  function refreshDynamicText() {
    updateThemeLabel();
    updateMotion();
    menu.setAttribute('aria-label', panel.classList.contains('is-open') ? t('menuClose') : t('menuOpen'));
    filterPublications();
  }
  function applyLanguage(next) {
    lang = next;
    applyStaticText(next);
    savePreference('profile-lang', next);
    refreshDynamicText();
    requestScrollUpdate();
  }
  let switching = false;
  async function switchLanguage(next, origin) {
    if (next === lang || switching) return;
    if (motionPaused()) { applyLanguage(next); return; }
    switching = true;
    const rect = origin.getBoundingClientRect();
    veil.style.setProperty('--x', `${rect.left + rect.width / 2}px`);
    veil.style.setProperty('--y', `${rect.top + rect.height / 2}px`);
    const word = veil.querySelector('.lang-veil-word');
    word.textContent = languageNames[next];
    word.lang = next;
    veil.classList.remove('is-out');
    void veil.offsetWidth;
    veil.classList.add('is-in');
    await wait(560);
    applyLanguage(next);
    doc.classList.add('lang-enter');
    await wait(260);
    veil.classList.add('is-out');
    await wait(650);
    veil.classList.remove('is-in', 'is-out');
    await wait(300);
    doc.classList.remove('lang-enter');
    switching = false;
  }
  $$('.lang-switch button').forEach(button => button.addEventListener('click', () => switchLanguage(button.dataset.lang, button)));

  refreshDynamicText();
})();
