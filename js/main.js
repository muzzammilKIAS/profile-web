// Lapisan imersif: titik masuk. Kandungan HTML kekal berfungsi tanpa fail ini;
// WebGL hanyalah penambahbaikan. Three.js dimuat hanya apabila pentas pertama hampir kelihatan.
const root = document.documentElement;
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const motionPaused = () => root.dataset.motion === 'paused';

function webglSupported() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

const LOADERS = {
  jamiah: () => import('./scenes/jamiah.js'),
  manuskrip: () => import('./scenes/manuscript.js'),
  pingat: () => import('./scenes/medals.js'),
  pustaka: () => import('./scenes/library.js'),
  makmal: () => import('./scenes/devices.js'),
};
const stages = $$('.stage[data-scene]');
const forceFallback = new URLSearchParams(location.search).has('no3d');

if (!forceFallback && webglSupported() && stages.length) {
  root.classList.add('has-3d');
  $$('.chapter').forEach((chapter) => chapter.classList.add('is-enhanced'));
  let booted = false;
  const boot = async () => {
    if (booted) return;
    booted = true;
    starter.disconnect();
    try {
      const { SceneManager } = await import('./scene-manager.js');
      const manager = new SceneManager();
      (window.__profile3d ||= {}).manager = manager;
      stages.forEach((stage) => {
        const loader = LOADERS[stage.dataset.scene];
        if (loader) manager.register(stage, () => loader().then((module) => module.default));
      });
    } catch (error) {
      console.warn('[3d] Lapisan 3D gagal dimulakan; paparan poster digunakan.', error);
      root.classList.remove('has-3d');
      root.classList.add('no-webgl');
      $$('.chapter').forEach((chapter) => chapter.classList.remove('is-enhanced'));
    }
  };
  const starter = new IntersectionObserver((records) => { if (records.some((record) => record.isIntersecting)) boot(); }, { rootMargin: '220% 0px' });
  stages.forEach((stage) => starter.observe(stage));
} else {
  root.classList.add('no-webgl');
}

// ScrollTrigger: segar semula apabila tinggi kandungan berubah (bahasa, tapisan, fon).
if (window.gsap && window.ScrollTrigger) {
  window.gsap.registerPlugin(window.ScrollTrigger);
  window.ScrollTrigger.config({ ignoreMobileResize: true });
  let timer, lastHeight = document.body.offsetHeight;
  new ResizeObserver(() => {
    const height = document.body.offsetHeight;
    if (Math.abs(height - lastHeight) < 2) return;
    lastHeight = height;
    clearTimeout(timer);
    timer = setTimeout(() => window.ScrollTrigger.refresh(), 180);
  }).observe(document.body);
  document.fonts?.ready.then(() => window.ScrollTrigger.refresh());
}

// Suis Pagi / Malam: ikon bertukar (matahari ↔ bulan) dan label pendek kelihatan di sebelahnya.
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const night = () => (root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches);
  const WORDS = { ms: ['Pagi', 'Malam'], en: ['Day', 'Night'], ar: ['نهار', 'ليل'] };
  const MOON = '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5Z"/>';
  const SUN = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>';
  themeToggle.classList.add('mood-toggle');
  const word = document.createElement('span');
  word.className = 'mood-word';
  themeToggle.append(word);
  const paint = () => {
    const isNightNow = night();
    themeToggle.querySelector('svg').innerHTML = isNightNow ? MOON : SUN;
    const pair = WORDS[root.lang] || WORDS.ms;
    word.textContent = isNightNow ? pair[1] : pair[0];
    themeToggle.dataset.mood = isNightNow ? 'night' : 'day';
    root.dataset.mood = isNightNow ? 'night' : 'day';
    // Poster pentas (render sebenar) mengikut mood.
    document.querySelectorAll('.stage-poster[data-poster]').forEach((img) => {
      const next = `assets/posters/${img.dataset.poster}-${isNightNow ? 'night' : 'day'}.webp`;
      if (!img.src.endsWith(next)) img.src = next;
    });
  };
  paint();
  systemDark.addEventListener('change', paint);
  new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['data-theme', 'lang'] });
}

// Nota sumber model 3D: dipaparkan sebagai butang maklumat kecil, bukan teks terang di atas pentas.
document.querySelectorAll('.stage-note').forEach((note, index) => {
  const id = note.id || `stage-note-${index}`;
  note.id = id;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'note-toggle';
  button.setAttribute('aria-describedby', id);
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = '<span aria-hidden="true">i</span>';
  const label = () => button.setAttribute('aria-label', { ms: 'Nota tentang model 3D', en: 'Note about the 3D model', ar: 'ملاحظة حول النموذج ثلاثي الأبعاد' }[root.lang] || 'Nota');
  label();
  new MutationObserver(label).observe(root, { attributes: true, attributeFilter: ['lang'] });
  const wrap = document.createElement('div');
  wrap.className = 'note-wrap';
  note.replaceWith(wrap);
  wrap.append(button, note);
  button.addEventListener('click', () => {
    const open = wrap.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && wrap.classList.contains('is-open')) { wrap.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); } });
});

// Portal gerbang: bab 3D terbuka melalui tingkap gerbang runcing yang membesar ketika bab masuk dari bawah.
const portals = [...document.querySelectorAll('.chapter')];
if (portals.length) {
  let queued = false;
  const update = () => {
    queued = false;
    portals.forEach((chapter) => {
      const top = chapter.getBoundingClientRect().top;
      const k = Math.min(1, Math.max(0, 1 - top / innerHeight)); // 0 apabila bab di bawah skrin, 1 apabila dipin
      // Gerbang sentiasa berdiri di dasar kawasan yang kelihatan dan membesar hingga menutup skrin pada k = 1.
      const narrow = innerWidth < 680;
      const w = (narrow ? 62 : 28) + (narrow ? 140 : 170) * k ** 3;   // % lebar
      const h = k * 100 * 0.96 + 90 * k ** 4;                         // vh
      const y = k * 100 - h;                                          // vh, dari atas elemen melekit
      chapter.style.setProperty('--portal', k.toFixed(4));
      chapter.style.setProperty('--mw', `${w.toFixed(2)}%`);
      chapter.style.setProperty('--mh', `${h.toFixed(2)}vh`);
      chapter.style.setProperty('--my', `${y.toFixed(2)}vh`);
      chapter.classList.toggle('portal-open', k >= 0.999);
    });
  };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', update, { passive: true });
  update();
}

// Butang kembali ke atas.
const toTop = document.getElementById('toTop');
if (toTop) {
  let shown = false;
  const check = () => {
    root.classList.toggle('near-end', scrollY + innerHeight > document.documentElement.scrollHeight - innerHeight * 0.9);
    const next = scrollY > innerHeight * 1.2;
    if (next !== shown) { shown = next; toTop.hidden = false; toTop.classList.toggle('is-visible', next); toTop.tabIndex = next ? 0 : -1; }
  };
  addEventListener('scroll', check, { passive: true });
  check();
}

// Rel bahagian (desktop): titik bagi setiap bahagian utama, dengan label apabila dituding/fokus.
const sectionIds = ['utama', 'tentang', 'akademik', 'bidang', 'pencapaian', 'penerbitan', 'aplikasi', 'pengalaman', 'hubungi'];
const railSections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
if (railSections.length) {
  const rail = document.createElement('nav');
  rail.className = 'section-rail';
  const links = railSections.map((section) => {
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.innerHTML = '<span class="rail-label"></span>';
    rail.append(link);
    return link;
  });
  document.body.append(rail);
  const label = () => {
    const navLabel = document.querySelector('.nav-panel')?.getAttribute('aria-label') || 'Navigasi';
    rail.setAttribute('aria-label', `${navLabel} · 2`);
    railSections.forEach((section, index) => {
      const heading = section.id === 'utama'
        ? document.querySelector('.nav-link[href="#utama"]')
        : section.querySelector('h2');
      const text = (heading?.textContent || section.id).trim();
      links[index].querySelector('.rail-label').textContent = text;
      links[index].setAttribute('aria-label', text);
    });
  };
  label();
  new MutationObserver(label).observe(root, { attributes: true, attributeFilter: ['lang'] });
  const spy = new IntersectionObserver((records) => {
    records.forEach((record) => {
      if (!record.isIntersecting) return;
      const index = railSections.indexOf(record.target);
      links.forEach((link, i) => { if (i === index) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
      // Bab gelap: rel dan butang bertukar kepada warna cerah.
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  railSections.forEach((section) => spy.observe(section));
}

// Kaleidoskop hero bertindak balas halus terhadap penuding (desktop sahaja).
const heroKaleido = document.querySelector('.hero-kaleido');
const hero = document.getElementById('utama');
if (heroKaleido && hero && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let queued = false, px = 0, py = 0;
  hero.addEventListener('pointermove', (event) => {
    px = event.clientX / innerWidth - 0.5; py = event.clientY / innerHeight - 0.5;
    if (queued || motionPaused()) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      heroKaleido.style.setProperty('--px', `${(px * -28).toFixed(1)}px`);
      heroKaleido.style.setProperty('--py', `${(py * -22).toFixed(1)}px`);
    });
  }, { passive: true });
}

// Tandakan apabila bab gelap berada di bawah pengepala supaya pengepala bertukar gaya.
const header = document.getElementById('siteHeader');
const darkZones = $$('.chapter');
if (header && darkZones.length) {
  let pending = false;
  const check = () => {
    pending = false;
    const line = header.offsetHeight / 2;
    const dark = root.classList.contains('has-3d') && !motionPaused() && root.dataset.mood !== 'day' && darkZones.some((zone) => {
      const rect = zone.getBoundingClientRect();
      return rect.top <= line && rect.bottom >= line;
    });
    root.classList.toggle('over-dark', dark);
    const inside = root.classList.contains('has-3d') && darkZones.some((zone) => { const r = zone.getBoundingClientRect(); return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5; });
    root.classList.toggle('in-chapter', inside);
  };
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(check); } }, { passive: true });
  new MutationObserver(check).observe(root, { attributes: true, attributeFilter: ['data-motion', 'data-mood'] });
  check();
}
