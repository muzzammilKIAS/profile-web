// Koreografi 2D: butang magnetik, kaleidoskop yang berubah bentuk mengikut skrol,
// dan bayang mashrabiyya yang bergerak merentasi tajuk bahagian. Semua dihentikan apabila gerakan dijeda.
const root = document.documentElement;
const motionPaused = () => root.dataset.motion === 'paused';
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

// ── Butang magnetik: tarikan maksimum 6px ke arah penuding, label bergerak separuh daripadanya. ──
const MAGNET = '.button, .tool, .contact-link, .award-link, .app-links a, .chip, .lang-switch button, .theme-toggle, .to-top';
const PULL = 6;
let magnetTarget = null, magnetFrame = 0, magnetEvent = null;
function releaseMagnet(el) {
  if (!el) return;
  el.style.removeProperty('--mag-x');
  el.style.removeProperty('--mag-y');
  el.classList.remove('is-magnet');
}
function applyMagnet() {
  magnetFrame = 0;
  const el = magnetTarget, event = magnetEvent;
  if (!el || !event) return;
  const rect = el.getBoundingClientRect();
  const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
  const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
  el.style.setProperty('--mag-x', `${(clamp(dx, -1, 1) * PULL).toFixed(2)}px`);
  el.style.setProperty('--mag-y', `${(clamp(dy, -1, 1) * PULL * 0.6).toFixed(2)}px`);
  el.style.setProperty('--glow-x', `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`);
}
document.addEventListener('pointermove', (event) => {
  if (!finePointer.matches || motionPaused()) return;
  const el = event.target.closest?.(MAGNET);
  if (el !== magnetTarget) { releaseMagnet(magnetTarget); magnetTarget = el; if (el) el.classList.add('is-magnet'); }
  magnetEvent = event;
  if (el && !magnetFrame) magnetFrame = requestAnimationFrame(applyMagnet);
}, { passive: true });
document.addEventListener('pointerleave', () => { releaseMagnet(magnetTarget); magnetTarget = null; });

// ── Kaleidoskop hero dan hubungi: corak berubah bentuk (masa lukisan) mengikut kemajuan skrol. ──
const morphers = [
  { canvas: document.querySelector('.hero-kaleido'), section: document.getElementById('utama'), from: 2.5, span: 6, last: -1 },
  { canvas: document.querySelector('.contact-kaleido'), section: document.getElementById('hubungi'), from: 2.5, span: 5, last: -1 },
].filter((item) => item.canvas && item.section);
let morphQueued = false;
function morph() {
  morphQueued = false;
  if (motionPaused() || !window.__kaleidoDraw) return;
  morphers.forEach((item) => {
    const rect = item.section.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > innerHeight + 200) return;
    const p = clamp((innerHeight - rect.top) / (innerHeight + rect.height));
    const step = Math.round(p * 90); // 90 langkah: perubahan halus, tiada kelipan
    if (step === item.last) return;
    item.last = step;
    window.__kaleidoDraw(item.canvas, item.from + (step / 90) * item.span);
  });
}
addEventListener('scroll', () => { if (!morphQueued) { morphQueued = true; requestAnimationFrame(morph); } }, { passive: true });

// ── Kemajuan masuk setiap bahagian (--enter 0→1) untuk bayang mashrabiyya dan pendedahan tajuk. ──
const sections = [...document.querySelectorAll('main > .section:not(.hero)')];
let enterQueued = false;
function enter() {
  enterQueued = false;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > innerHeight) return;
    const p = clamp((innerHeight - rect.top) / (innerHeight * 0.9));
    section.style.setProperty('--enter', p.toFixed(3));
  });
}
addEventListener('scroll', () => { if (!enterQueued) { enterQueued = true; requestAnimationFrame(enter); } }, { passive: true });
enter();

// ── Identiti gerakan setiap bahagian: kelas pada pembalut supaya CSS boleh memilih variasi pendedahan. ──
const identities = {
  tentang: 'motion-unveil',
  akademik: 'motion-trace',
  bidang: 'motion-ledger',
  pencapaian: 'motion-strike',
  penerbitan: 'motion-index',
  aplikasi: 'motion-deck',
  pengalaman: 'motion-ledger',
  hubungi: 'motion-portal',
};
Object.entries(identities).forEach(([id, name]) => document.getElementById(id)?.classList.add(name));
