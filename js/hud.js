// HUD pentas 3D: bar alat (Teroka, zum, set semula, skrin penuh, jeda) dan UI bab
// (kad cerita, dail kemajuan, titik langkah). Teks dalam tiga bahasa.
import { clamp, motionPaused } from './scene-manager.js';

const root = document.documentElement;
const STRINGS = {
  ms: {
    toolbar: 'Kawalan paparan 3D', explore: 'Teroka 360°', zoomIn: 'Zum masuk', zoomOut: 'Zum keluar',
    reset: 'Set semula', full: 'Skrin penuh', exit: 'Sambung skrol', pause: 'Jeda gerakan', play: 'Mainkan gerakan',
    loading: 'Memuat model 3D…', hint: 'Seret untuk memutar · cubit atau roda tetikus untuk zum · Esc untuk keluar',
    step: (n, total) => `Langkah ${n} daripada ${total}`,
  },
  en: {
    toolbar: '3D view controls', explore: 'Explore 360°', zoomIn: 'Zoom in', zoomOut: 'Zoom out',
    reset: 'Reset view', full: 'Fullscreen', exit: 'Resume scroll', pause: 'Pause motion', play: 'Play motion',
    loading: 'Loading 3D model…', hint: 'Drag to rotate · pinch or use the wheel to zoom · Esc to exit',
    step: (n, total) => `Step ${n} of ${total}`,
  },
  ar: {
    toolbar: 'أدوات العرض ثلاثي الأبعاد', explore: 'استكشف 360°', zoomIn: 'تكبير', zoomOut: 'تصغير',
    reset: 'إعادة الضبط', full: 'ملء الشاشة', exit: 'متابعة التمرير', pause: 'إيقاف الحركة', play: 'تشغيل الحركة',
    loading: 'جارٍ تحميل النموذج ثلاثي الأبعاد…', hint: 'اسحب للتدوير · استخدم إصبعين أو عجلة الفأرة للتكبير · Esc للخروج',
    step: (n, total) => `الخطوة ${n} من ${total}`,
  },
};
export const tr = (key, ...args) => {
  const pack = STRINGS[root.lang] || STRINGS.ms;
  const value = pack[key] ?? STRINGS.ms[key];
  return typeof value === 'function' ? value(...args) : value;
};

const ICONS = {
  explore: '<path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 3c3 2.5 3 15.500 0 18M12 3c-3 2.5-3 15.500 0 18M3 12h18"/><path d="m17 3 4 .5-.5 4"/>',
  zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6M11 8v6"/>',
  zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8 11h6"/>',
  reset: '<path d="M4 12a8 8 0 1 0 2.5-5.800"/><path d="M4 4v5h5"/>',
  full: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  exit: '<path d="M12 4v14m-6-6 6 6 6-6"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  play: '<path d="M9 5l10 7-10 7Z"/>',
};
const icon = (name) => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]}</svg>`;

export function mountHud(stage, rig, { onExplore } = {}) {
  const bar = document.createElement('div');
  bar.className = 'stage-tools';
  bar.setAttribute('role', 'toolbar');
  const hint = document.createElement('p');
  hint.className = 'stage-hint';
  const live = document.createElement('p');
  live.className = 'sr-only';
  live.setAttribute('role', 'status');
  const fullscreenTarget = stage.closest('.chapter-sticky') || stage;
  const canFullscreen = document.fullscreenEnabled && !!fullscreenTarget.requestFullscreen;
  const defs = [
    ['explore', 'explore', true], ['zoomIn', 'zoomIn', false], ['zoomOut', 'zoomOut', false], ['reset', 'reset', false],
    ...(canFullscreen ? [['full', 'full', false]] : []), ['motion', 'pause', true], ['exit', 'exit', false],
  ];
  const buttons = {};
  defs.forEach(([act, iconName, always]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `tool tool-${act}${always ? '' : ' tool-explore-only'}`;
    button.dataset.act = act;
    button.dataset.icon = iconName;
    bar.append(button);
    buttons[act] = button;
  });
  stage.append(bar, hint, live);

  function label() {
    const exploring = rig.mode === 'explore';
    const paused = motionPaused();
    bar.setAttribute('aria-label', tr('toolbar'));
    hint.textContent = tr('hint');
    Object.entries(buttons).forEach(([act, button]) => {
      const key = act === 'motion' ? (paused ? 'play' : 'pause') : act;
      const text = tr(key);
      const showText = act === 'explore' || act === 'exit';
      button.innerHTML = icon(key) + (showText ? `<span>${text}</span>` : '');
      button.setAttribute('aria-label', text);
      button.title = text;
      if (!button.classList.contains('tool-explore-only')) return;
      button.hidden = !exploring;
    });
    buttons.explore.hidden = exploring;
    buttons.explore.setAttribute('aria-pressed', String(exploring));
  }
  function setExplore(on) {
    if (on) rig.enterExplore(); else rig.exitExplore();
    label();
    onExplore?.(on);
    live.textContent = on ? `${tr('explore')}. ${tr('hint')}` : tr('exit');
    (on ? buttons.exit : buttons.explore).focus({ preventScroll: true });
  }
  bar.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-act]');
    if (!button) return;
    const act = button.dataset.act;
    if (act === 'explore') setExplore(true);
    else if (act === 'exit') setExplore(false);
    else if (act === 'zoomIn') { rig.zoom(0.78); label(); }
    else if (act === 'zoomOut') { rig.zoom(1.28); label(); }
    else if (act === 'reset') rig.reset();
    else if (act === 'motion') document.getElementById('motionToggle')?.click();
    else if (act === 'full') {
      if (document.fullscreenElement) document.exitFullscreen();
      else fullscreenTarget.requestFullscreen().catch(() => {});
    }
  });
  const onKey = (event) => {
    if (event.key === 'Escape' && rig.mode === 'explore' && !document.fullscreenElement) setExplore(false);
  };
  document.addEventListener('keydown', onKey);
  const observer = new MutationObserver(label);
  observer.observe(root, { attributes: true, attributeFilter: ['lang', 'data-motion'] });
  label();
  return {
    setExplore, label,
    dispose() { document.removeEventListener('keydown', onKey); observer.disconnect(); bar.remove(); hint.remove(); live.remove(); },
  };
}

// UI bab berpin: kad cerita aktif, dail darjah dan titik langkah yang boleh diklik.
export function chapterUI(chapter) {
  const cards = [...chapter.querySelectorAll('.story-card')];
  const positions = cards.map((card, index) => card.dataset.at != null ? Number(card.dataset.at) : index / Math.max(1, cards.length - 1));
  const rail = chapter.querySelector('.chapter-rail');
  const degree = chapter.querySelector('.dial-degree');
  const ring = chapter.querySelector('.dial-ring-value');
  const dots = [];
  if (rail) {
    const list = document.createElement('div');
    list.className = 'rail-dots';
    cards.forEach((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'rail-dot';
      dot.addEventListener('click', () => {
        const rect = chapter.getBoundingClientRect();
        const top = rect.top + scrollY + positions[index] * (rect.height - innerHeight);
        scrollTo({ top, behavior: motionPaused() ? 'auto' : 'smooth' });
      });
      list.append(dot);
      dots.push(dot);
    });
    rail.append(list);
  }
  const relabel = () => dots.forEach((dot, index) => {
    const heading = cards[index].querySelector('h3, h4');
    dot.setAttribute('aria-label', `${tr('step', index + 1, cards.length)}${heading ? ': ' + heading.textContent.trim() : ''}`);
  });
  relabel();
  new MutationObserver(relabel).observe(root, { attributes: true, attributeFilter: ['lang'] });
  let current = -1, lastDegree = -1;
  return {
    positions,
    update(p, turns = 1) {
      let best = 0;
      positions.forEach((at, index) => { if (Math.abs(p - at) < Math.abs(p - positions[best])) best = index; });
      const gap = positions.length > 1 ? (positions[1] - positions[0]) : 1;
      const shown = Math.abs(p - positions[best]) < gap * 0.36 ? best : -1;
      if (shown !== current) {
        current = shown;
        cards.forEach((card, index) => card.classList.toggle('is-active', index === shown));
        dots.forEach((dot, index) => {
          if (index === best) dot.setAttribute('aria-current', 'step'); else dot.removeAttribute('aria-current');
        });
        chapter.dataset.step = String(best);
      }
      const deg = Math.round(clamp(p) * 360 * turns) % 361;
      if (deg !== lastDegree) {
        lastDegree = deg;
        if (degree) degree.textContent = `${deg}°`;
        if (ring) ring.style.strokeDashoffset = String(100 - clamp(p) * 100);
        chapter.style.setProperty('--p', clamp(p).toFixed(4));
      }
    },
  };
}
