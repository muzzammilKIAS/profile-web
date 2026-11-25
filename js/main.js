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
  const starter = new IntersectionObserver((records) => { if (records.some((record) => record.isIntersecting)) boot(); }, { rootMargin: '120% 0px' });
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

// Butang kembali ke atas.
const toTop = document.getElementById('toTop');
if (toTop) {
  let shown = false;
  const check = () => {
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
    const dark = root.classList.contains('has-3d') && !motionPaused() && darkZones.some((zone) => {
      const rect = zone.getBoundingClientRect();
      return rect.top <= line && rect.bottom >= line;
    });
    root.classList.toggle('over-dark', dark);
  };
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(check); } }, { passive: true });
  new MutationObserver(check).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  check();
}
