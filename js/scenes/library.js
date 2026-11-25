import { THREE, TAU, studio, controller, rounded, leafGeometry, surfaceTexture, sample, ramp, pulse } from './common.js';

// Tiga buku, tiga babak sama panjang. Setiap babak: buku mara sambil berputar 360°,
// berhenti menghadap kamera (titik semak kulit), kamera merapati kulit sebenar, buku terbuka,
// helaian diselak, buku tertutup dan berundur. Semuanya fungsi tulen kedudukan skrol.
const SLUGS = ['fiqh-halal-haram', 'fiqh-quran-sunnah', 'bahasa-arab-muamalat'];
const STARTS = [0.03, 0.35, 0.67];
export const CHECKPOINTS = STARTS.map(a => a + 0.115);
const ease = t => t; // ramp() dan pulse() sudah dilicinkan
const focusOf = (p, i) => ease(pulse(p, STARTS[i], STARTS[i] + 0.085, STARTS[i] + 0.262, STARTS[i] + 0.31));
const KEYS = [{ p: 0, d: 1.2, e: 18, sx: 0, syPortrait: 0.3 }];
STARTS.forEach((a, i) => {
  const side = i % 2 === 0 ? 1 : -1;
  KEYS.push(
    { p: a + 0.09, d: 0.68, e: 8, sx: 0.42 * side, syPortrait: 0.36 },
    { p: a + 0.138, d: 0.68, e: 8, sx: 0.42 * side, syPortrait: 0.36 },
    { p: a + 0.166, d: 0.78, e: 14, sx: 0.3 * side, syPortrait: 0.34 },
    { p: a + 0.218, d: 0.98, e: 30, sx: 0.3 * side, syPortrait: 0.32 },
    { p: a + 0.262, d: 1.0, e: 24, sx: 0.16 * side, syPortrait: 0.32 },
    { p: Math.min(1, a + 0.32), d: i === 2 ? 1.24 : 1.14, e: i === 2 ? 21 : 17, sx: 0, syPortrait: 0.28 },
  );
});
KEYS.push({ p: 1, d: 1.24, e: 21, sx: 0, syPortrait: 0.3 });

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
    const slugs = SLUGS;
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
    // Kedudukan buku: tiga sebaris; buku yang difokus mara ke hadapan, yang lain berundur dan merenggang.
    const place = (p, i, out) => {
      const focus = focusOf(p, i), base = (i - 1) * 1.9;
      let other = 0, lead = -1;
      for (let j = 0; j < 3; j++) if (j !== i && focusOf(p, j) > other) { other = focusOf(p, j); lead = j; }
      let x = base * (1 - 0.5 * focus);
      if (lead >= 0) {
        // Buku lain beralih ke sisi bertentangan dengan kad teks buku yang difokus.
        const side = lead % 2 === 0 ? 1 : -1, rank = [0, 1, 2].filter(j => j !== lead).indexOf(i);
        const order = side > 0 ? rank : 1 - rank;
        x += ((lead - 1) * 0.81 + side * (1.5 + 1.05 * order) - x) * other;
      }
      return out.set(x, 1.85 + 0.1 * Math.sin(p * Math.PI) + 0.05 * focus, -0.8 + focus * 1.3 - other * 0.75 - (i === 1 ? 0.12 : 0));
    };
    let pausedAt = 0;
    const api = controller(s, {
      name: 'pustaka', radius: 2.9, keys: KEYS, pin: true, stable: () => pausedAt,
      targetAt(p, key, out) {
        out.set(0, 1.85, 0);
        let which = 0, most = 0;
        for (let i = 0; i < books.length; i++) { const f = focusOf(p, i); if (f > most) { most = f; which = i; } }
        if (!most) return;
        place(p, which, target);
        target.z += 0.1;
        out.lerp(target, most);
      },
      pose(p, rig, state) {
        sample(KEYS, p, k);
        const az = 0.14 * Math.sin(TAU * p);
        rig.azimuth = az;
        for (let i = 0; i < books.length; i++) {
          const b = books[i], a = STARTS[i], focus = focusOf(p, i);
          place(p, i, b.root.position);
          // Satu pusingan penuh semasa mara; berakhir tepat menghadap kamera di titik semak kulit.
          const turn = ease(ramp(p, a - 0.012, a + 0.088));
          const rest = (i - 1) * -0.2;
          b.root.rotation.set(-k.e * Math.PI / 180 * focus, TAU * turn + az + rest * (1 - focus), (i - 1) * 0.05 * (1 - focus));
          const opening = ease(pulse(p, a + 0.15, a + 0.192, a + 0.236, a + 0.27));
          b.hinge.rotation.y = -2.58 * opening;
          for (let j = 0; j < b.leaves.length; j++) {
            const turnPage = ease(pulse(p, a + 0.166 + j * 0.006, a + 0.206 + j * 0.006, a + 0.238, a + 0.266));
            b.leaves[j].rotation.y = -2.35 * turnPage;
            // Helaian melengkung hanya wujud semasa kulit dibuka; jika tidak ia menembusi kulit depan
            // dan menutup kulit PDF sebenar (dikesan dalam semakan browser Claude).
            b.leaves[j].visible = opening > 0.002 || turnPage > 0.002;
          }
          b.shadow.position.x = b.root.position.x; b.shadow.position.z = b.root.position.z;
          state[['yawDeg', 'secondYawDeg', 'thirdYawDeg'][i]] = turn * 360;
          state[['firstOpen', 'secondOpen', 'thirdOpen'][i]] = -b.hinge.rotation.y;
        }
      },
    });
    const chapter = ctx.stage.closest('.chapter');
    const onBook = event => {
      const button = event.target.closest('[data-book-view]');
      if (!button) return;
      const index = slugs.indexOf(button.dataset.bookView);
      if (index < 0) return;
      const at = CHECKPOINTS[index];
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
