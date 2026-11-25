// Pengurus babak: satu renderer WebGL dikongsi, satu babak aktif pada satu masa.
// Babak dimuat secara lazy apabila pentasnya menghampiri viewport, dijeda apabila
// di luar skrin atau tab tersembunyi, dan kualiti diturunkan jika bingkai lambat.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const root = document.documentElement;
export const motionPaused = () => root.dataset.motion === 'paused';
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const isRTL = () => root.dir === 'rtl';
// Versi Pagi / Malam mengikut suis tema laman (atau tetapan sistem jika pelawat belum memilih).
const systemDark = matchMedia('(prefers-color-scheme: dark)');
export const isNight = () => (root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches);

function pickTier() {
  const small = matchMedia('(max-width: 900px), (pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  if (small || cores <= 4 || memory <= 4) return 'low';
  return 'high';
}

export class SceneManager {
  constructor() {
    this.entries = [];
    this.active = null;
    this.renderer = null;
    this.failed = false;
    this.tier = pickTier();
    this.maxDpr = this.tier === 'high' ? 2 : 1.5;
    this.dpr = Math.min(devicePixelRatio || 1, this.maxDpr);
    this.force = true;
    this.raf = 0;
    this.last = 0;
    this.slow = 0;
    this.fast = 0;
    this.perf = { frames: 0, avgMs: 0, downgrades: 0 };
    this.frame = this.frame.bind(this);
    this.io = new IntersectionObserver((records) => {
      records.forEach((record) => {
        const entry = this.entries.find((item) => item.stage === record.target);
        if (!entry) return;
        entry.ratio = record.isIntersecting ? Math.max(record.intersectionRatio, 0.001) : 0;
        entry.near = record.isIntersecting;
      });
      this.evaluate();
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '90% 0px 90% 0px' });
    this.ro = new ResizeObserver(() => this.resize());
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
    const wake = () => this.kick();
    addEventListener('scroll', wake, { passive: true });
    addEventListener('resize', wake, { passive: true });
    ['pointerdown', 'pointermove', 'wheel', 'touchstart', 'keydown'].forEach((type) => document.addEventListener(type, wake, { passive: true }));
    systemDark.addEventListener('change', () => { this.force = true; this.kick(); });
    new MutationObserver(() => { this.force = true; this.kick(); })
      .observe(root, { attributes: true, attributeFilter: ['data-motion', 'data-theme', 'dir', 'lang'] });
  }

  register(stage, loader) {
    const entry = { stage, loader, ratio: 0, near: false, state: 'idle', scene3d: null, name: stage.dataset.scene };
    this.entries.push(entry);
    this.io.observe(stage);
    return entry;
  }

  ensureRenderer() {
    if (this.renderer || this.failed) return !this.failed;
    try {
      const canvas = document.createElement('canvas');
      canvas.className = 'stage-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = this.tier === 'high' ? THREE.VSMShadowMap : THREE.PCFShadowMap;
      renderer.setPixelRatio(this.dpr);
      const pmrem = new THREE.PMREMGenerator(renderer);
      this.env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        this.lost = true;
        root.classList.add('webgl-lost');
        cancelAnimationFrame(this.raf); this.raf = 0;
      });
      canvas.addEventListener('webglcontextrestored', () => this.restore());
      this.renderer = renderer;
      this.canvas = canvas;
      return true;
    } catch (error) {
      console.warn('[3d] WebGL tidak tersedia; paparan poster digunakan.', error);
      this.fail();
      return false;
    }
  }

  fail() {
    this.failed = true;
    root.classList.add('no-webgl');
    this.entries.forEach((entry) => entry.stage.classList.add('is-fallback'));
  }

  // Selepas konteks dipulihkan semua sumber GPU hilang, jadi babak dibina semula.
  restore() {
    this.lost = false;
    root.classList.remove('webgl-lost');
    this.entries.forEach((entry) => {
      entry.gen = (entry.gen || 0) + 1; // muatan yang masih berjalan menjadi basi dan akan dibuang
      if (entry.scene3d) {
        try { entry.scene3d.onDeactivate?.(); } catch { /* pilihan */ }
        try { entry.scene3d.dispose(); } catch { /* sumber sudah hilang */ }
      }
      entry.scene3d = null;
      entry.state = 'idle';
      entry.stage.classList.remove('is-live', 'is-ready', 'is-exploring', 'is-loading');
    });
    this.active = null;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.evaluate();
  }

  async load(entry) {
    if (entry.state !== 'idle' || !this.ensureRenderer()) return;
    entry.state = 'loading';
    entry.stage.classList.add('is-loading');
    const gen = entry.gen = (entry.gen || 0) + 1;
    try {
      const create = await entry.loader();
      const scene3d = await create({
        THREE, stage: entry.stage, manager: this, renderer: this.renderer, canvas: this.canvas,
        env: this.env, tier: this.tier, requestRender: () => { this.force = true; this.kick(); },
      });
      if (gen !== entry.gen) { try { scene3d.dispose(); } catch { /* basi */ } return; }
      entry.scene3d = scene3d;
      entry.state = 'ready';
      entry.stage.classList.add('is-ready');
    } catch (error) {
      if (gen !== entry.gen) return;
      console.warn(`[3d] Babak "${entry.name}" gagal dimuat.`, error);
      entry.state = 'error';
      entry.stage.classList.add('is-fallback');
    }
    entry.stage.classList.remove('is-loading');
    this.evaluate();
  }

  evaluate() {
    if (this.failed || this.lost) return;
    let best = null;
    this.entries.forEach((entry) => {
      if (entry.near && entry.state === 'idle') this.load(entry);
      if (entry.state === 'ready' && entry.ratio > 0 && (!best || entry.ratio > best.ratio + 0.05)) best = entry;
    });
    if (best !== this.active) this.activate(best);
    this.kick();
  }

  activate(next) {
    const previous = this.active;
    if (previous) {
      // Simpan bingkai terakhir sebagai poster supaya pentas yang ditinggalkan tidak kosong.
      try {
        this.draw(previous);
        const poster = previous.stage.querySelector('.stage-snapshot');
        if (poster) poster.src = this.canvas.toDataURL('image/webp', 0.82);
      } catch { /* poster pilihan */ }
      const hadFocus = previous.stage.contains(document.activeElement);
      previous.scene3d.onDeactivate?.();
      if (hadFocus && document.activeElement === document.body) previous.stage.querySelector('.tool-explore')?.focus({ preventScroll: true });
      previous.stage.classList.remove('is-live');
      this.ro.unobserve(previous.stage);
    }
    this.active = next;
    if (!next) return;
    next.stage.querySelector('.stage-mount').append(this.canvas);
    next.stage.classList.add('is-live');
    this.ro.observe(next.stage);
    next.scene3d.onActivate?.();
    this.resize();
  }

  resize() {
    const entry = this.active;
    if (!entry) return;
    const mount = entry.stage.querySelector('.stage-mount');
    const width = Math.max(1, mount.clientWidth), height = Math.max(1, mount.clientHeight);
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setSize(width, height, false);
    entry.scene3d.resize(width, height);
    this.force = true;
    this.kick();
  }

  // Babak boleh membekalkan render sendiri (contoh: pasca-proses ambient occlusion).
  draw(entry) {
    this.renderer.toneMappingExposure = entry.scene3d.exposure ?? 1.12;
    if (entry.scene3d.render) entry.scene3d.render(this.renderer);
    else this.renderer.render(entry.scene3d.scene, entry.scene3d.camera);
  }

  kick() {
    this.idle = 0;
    if (!this.raf && this.active && !document.hidden && !this.lost) {
      this.last = 0;
      this.raf = requestAnimationFrame(this.frame);
    }
  }

  frame(now) {
    this.raf = 0;
    const entry = this.active;
    if (!entry || document.hidden || this.lost) return;
    const delta = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    const interval = this.last ? now - this.last : 16;
    this.last = now;
    const dirty = entry.scene3d.update(delta, now / 1000) || this.force;
    if (dirty) {
      this.force = false;
      this.idle = 0;
      this.draw(entry);
      this.sample(interval);
    } else if (++this.idle > 120) {
      return; // senyap: tiada bingkai sehingga skrol, input atau perubahan seterusnya
    }
    this.raf = requestAnimationFrame(this.frame);
  }

  // DPR adaptif: turun jika purata bingkai melebihi ~30fps, naik semula jika lancar lama.
  sample(interval) {
    const perf = this.perf;
    perf.frames++;
    perf.avgMs += (interval - perf.avgMs) * 0.08;
    if (interval > 40) { this.slow++; this.fast = 0; } else if (interval < 19) { this.fast++; this.slow = Math.max(0, this.slow - 1); }
    if (this.slow > 28 && this.dpr > 0.8) {
      this.dpr = Math.max(0.75, this.dpr - 0.25);
      this.slow = 0; perf.downgrades++;
      this.resize();
    } else if (this.fast > 600 && this.dpr < Math.min(devicePixelRatio || 1, this.maxDpr)) {
      this.dpr = Math.min(this.dpr + 0.25, devicePixelRatio || 1, this.maxDpr);
      this.fast = 0;
      this.resize();
    }
  }
}

// Kemajuan skrol yang dilicinkan oleh GSAP ScrollTrigger (scrub).
// mode 'pin'  : 0 apabila bahagian atas trek mencecah atas viewport, 1 di hujung trek.
// mode 'pass' : 0 apabila elemen masuk dari bawah, 1 apabila keluar di atas.
export function scrollProgress(trigger, mode = 'pass', scrub = 0.9) {
  const state = { value: 0, raw: 0 };
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) {
    const read = () => {
      const rect = trigger.getBoundingClientRect();
      const value = mode === 'pin'
        ? -rect.top / Math.max(1, rect.height - innerHeight)
        : (innerHeight - rect.top) / (innerHeight + rect.height);
      state.raw = state.value = clamp(value);
    };
    addEventListener('scroll', read, { passive: true });
    read();
    return state;
  }
  const range = mode === 'pin' ? { start: 'top top', end: 'bottom bottom' } : { start: 'top bottom', end: 'bottom top' };
  gsap.to(state, { value: 1, ease: 'none', scrollTrigger: { trigger, ...range, scrub, invalidateOnRefresh: true } });
  ScrollTrigger.create({ trigger, ...range, onUpdate: (self) => { state.raw = self.progress; } });
  return state;
}
