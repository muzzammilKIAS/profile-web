import { THREE, TAU, studio, controller, rounded, leafGeometry, surfaceTexture, sample, ramp, pulse } from './common.js';

const KEYS = [
  { p: 0, d: 1.08, e: 23, sx: 0, syPortrait: 0.3, focus: 0 },
  { p: 0.16, d: 0.68, e: 8, sx: 0.42, syPortrait: 0.36, focus: -1 },
  { p: 0.28, d: 0.68, e: 8, sx: 0.42, syPortrait: 0.36, focus: -1 },
  { p: 0.315, d: 0.36, e: 9, sx: 0.3, syPortrait: 0.32, focus: -1 },
  { p: 0.4, d: 0.82, e: 30, sx: 0.12, syPortrait: 0.32, focus: -0.65 },
  { p: 0.5, d: 1.1, e: 16, sx: 0, syPortrait: 0.25, focus: 0 },
  { p: 0.64, d: 0.85, e: 25, sx: -0.12, syPortrait: 0.32, focus: 0.55 },
  { p: 0.72, d: 0.68, e: 8, sx: -0.42, syPortrait: 0.36, focus: 1 },
  { p: 0.84, d: 0.68, e: 8, sx: -0.42, syPortrait: 0.36, focus: 1 },
  { p: 0.865, d: 0.36, e: 9, sx: -0.3, syPortrait: 0.32, focus: 1 },
  { p: 0.93, d: 0.74, e: 32, sx: -0.08, syPortrait: 0.3, focus: 0.75 },
  { p: 1, d: 1.08, e: 23, sx: 0, syPortrait: 0.3, focus: 0 },
];

function book(s, entry, cover, paper, edges) {
  const root = new THREE.Group(); s.scene.add(root);
  const h = 2.5, w = h * entry.aspect_ratio;
  // 0.10 mm per sheet, scaled against an approximately A5 210 mm cover.
  const depth = 0.075 + entry.page_count / 2 * 0.0012;
  const leatherMap = s.own(surfaceTexture('leather'));
  const leather = s.material({ color: entry.dominant_color_hex, map: leatherMap, bumpMap: leatherMap, bumpScale: 0.006, roughness: 0.56 });
  const front = s.material({ map: cover, roughness: 0.49, metalness: 0, envMapIntensity: 0.45 });
  s.mesh(root, rounded(w, h, 0.036, 0.018), leather, 0, 0, -depth / 2 - 0.018);
  s.mesh(root, rounded(w - 0.065, h - 0.06, depth, 0.012), edges);
  s.mesh(root, rounded(0.07, h, depth + 0.06, 0.025), leather, -w / 2 + 0.025);
  const hinge = new THREE.Group(); hinge.position.set(-w / 2, 0, depth / 2 + 0.018); root.add(hinge);
  s.mesh(hinge, rounded(w, h, 0.036, 0.018), leather, w / 2);
  // PlaneGeometry UV (0,0) bottom-left: full original cover, no crop or mirror.
  s.mesh(hinge, new THREE.PlaneGeometry(w - 0.012, h - 0.012), front, w / 2, 0, 0.0195);
  const leaves = [];
  for (let i = 0; i < (s.ctx.tier === 'low' ? 3 : 5); i++) {
    const pivot = new THREE.Group(); pivot.position.set(-w / 2 + 0.035, 0, depth / 2 + 0.003 + i * 0.002); root.add(pivot);
    s.mesh(pivot, leafGeometry(w - 0.07, h - 0.07, 0.035 + i * 0.012, s.ctx.tier === 'low' ? 16 : 28), paper);
    leaves.push(pivot);
  }
  const shadow = s.contact(0, 0, 3.5, 2.8);
  return { root, hinge, leaves, shadow, slug: entry.slug };
}

export default async function create(ctx) {
  const s = studio(ctx, 3);
  try {
    const response = await fetch('assets/textures/books/manifest.json');
    if (!response.ok) throw new Error(`Manifest buku: HTTP ${response.status}`);
    const manifest = await response.json();
    const slugs = ['fiqh-halal-haram', 'fiqh-quran-sunnah'];
    const entries = slugs.map(slug => {
      const entry = manifest.find(item => item.slug === slug);
      if (!entry) throw new Error(`Buku tiada dalam manifest: ${slug}`);
      return entry;
    });
    const covers = [];
    // Sequential loading means a later failure can dispose every completed resource.
    for (const entry of entries) covers.push(await s.texture(`assets/textures/books/${entry.slug}-front-${ctx.tier === 'low' ? 1024 : 2048}.webp`));
    const pageMap = s.own(surfaceTexture('page')), edgeMap = s.own(surfaceTexture('edge'));
    const paper = s.material({ map: pageMap, side: THREE.DoubleSide, roughness: 0.96 });
    const edges = s.material({ map: edgeMap, roughness: 0.93, color: 0xe4d9bd });
    const books = entries.map((entry, i) => book(s, entry, covers[i], paper, edges));
    const k = {}, target = new THREE.Vector3();
    let pausedAt = 0;
    const api = controller(s, {
      name: 'pustaka', radius: 2.8, keys: KEYS, pin: true, stable: () => pausedAt,
      targetAt(p, key, out) {
        out.set(0, 1.85, 0);
        const which = key.focus < 0 ? 0 : 1;
        target.copy(books[which].root.position);
        target.z += 0.1;
        out.lerp(target, Math.abs(key.focus));
      },
      pose(p, rig, state) {
        sample(KEYS, p, k);
        const az = 0.16 * Math.sin(TAU * p);
        rig.azimuth = az;
        for (let i = 0; i < 2; i++) {
          const b = books[i];
          const focus = i === 0 ? pulse(p, 0.04, 0.16, 0.28, 0.47) : pulse(p, 0.57, 0.72, 0.84, 1);
          b.root.position.set((i === 0 ? -1 : 1) * (1.18 + focus * 0.35), 1.85 + 0.13 * Math.sin(p * Math.PI), -0.65 + focus * 1.05);
          // Each book completes one whole revolution, outside its reading plateau.
          const turn = i === 0 ? ramp(p, 0.28, 0.68) : ramp(p, 0.06, 0.7);
          b.root.rotation.set(-k.e * Math.PI / 180 * focus, TAU * turn + az, (i === 0 ? -1 : 1) * 0.07 * (1 - focus));
          const opening = i === 0 ? pulse(p, 0.3, 0.38, 0.46, 0.6) : pulse(p, 0.85, 0.91, 0.96, 1);
          b.hinge.rotation.y = -2.58 * opening;
          for (let j = 0; j < b.leaves.length; j++) {
            const turnPage = i === 0 ? pulse(p, 0.33 + j * 0.009, 0.405 + j * 0.009, 0.49, 0.59) : pulse(p, 0.87 + j * 0.004, 0.93 + j * 0.004, 0.96, 1);
            b.leaves[j].rotation.y = -2.35 * turnPage;
            // Helaian melengkung hanya wujud semasa kulit dibuka; jika tidak ia menembusi kulit depan
            // dan menutup kulit PDF sebenar (dikesan dalam semakan browser Claude).
            b.leaves[j].visible = opening > 0.002 || turnPage > 0.002;
          }
          b.shadow.position.x = b.root.position.x; b.shadow.position.z = b.root.position.z;
        }
        state.yawDeg = ramp(p, 0.28, 0.68) * 360;
        state.secondYawDeg = ramp(p, 0.06, 0.7) * 360;
        state.firstOpen = -books[0].hinge.rotation.y; state.secondOpen = -books[1].hinge.rotation.y;
      },
    });
    const chapter = ctx.stage.closest('.chapter');
    const onBook = event => {
      const button = event.target.closest('[data-book-view]');
      if (!button) return;
      const index = slugs.indexOf(button.dataset.bookView);
      if (index < 0) return;
      const at = index === 0 ? 0.22 : 0.78;
      pausedAt = at;
      if (api.rig.mode === 'explore') api.rig.exitExplore();
      api.rig.blend = null;
      const rect = chapter.getBoundingClientRect();
      scrollTo({ top: rect.top + scrollY + at * Math.max(0, rect.height - innerHeight), behavior: 'instant' });
      window.ScrollTrigger?.update();
      // Finish any scrub interpolation so Teroka starts at the cover checkpoint.
      for (const tween of window.gsap?.getTweensOf(api.progress) || []) {
        tween.scrollTrigger?.getTween()?.progress(1);
      }
      api.progress.value = at;
      api.update(0);
      api.hud.setExplore(true);
      api.state.mode = 'explore';
      ctx.requestRender();
    };
    chapter.addEventListener('click', onBook);
    s.cleanup.push(() => chapter.removeEventListener('click', onBook));
    return api;
  } catch (error) { s.dispose(); throw error; }
}
