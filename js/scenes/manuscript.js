import { THREE, TAU, studio, controller, rounded, batch, surfaceTexture, leafGeometry, ramp, canvasTexture } from './common.js';

// Susunan mengikut ayat pada laman: pusingan penuh → kamera mendekati halaman → helaian diselak.
// Kitab kembali menghadap pembaca sebelum kamera rapat, supaya tulisan pada halaman boleh dibaca.
const KEYS = [
  { p: 0, d: 1.05, e: 28, sx: 0, syPortrait: 0.05, ty: 1.25 },
  { p: 0.2, d: 0.96, e: 36, sx: 0, syPortrait: 0.04, ty: 1.4 },
  { p: 0.42, d: 0.56, e: 60, sx: 0, syPortrait: 0.02, ty: 1.66 },
  { p: 0.76, d: 0.54, e: 62, sx: 0, syPortrait: 0.02, ty: 1.66 },
  { p: 1, d: 0.8, e: 46, sx: 0, syPortrait: 0.04, ty: 1.5 },
];
const TEX_W = 1024, TEX_H = 1572;
const INK = '#1c140d', GOLD = '#8a6b34', RUBRIC = '#7a2e1e';

function rosette(g, cx, cy, r, lw = 2) {
  g.save(); g.translate(cx, cy); g.strokeStyle = GOLD; g.lineWidth = lw;
  for (const [n, k, rr] of [[8, 3, r], [8, 2, r * 0.62], [16, 7, r * 0.36]]) {
    g.beginPath();
    for (let i = 0; i <= n; i++) {
      const a = (i * k / n) * Math.PI * 2 - Math.PI / 2;
      g[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rr, Math.sin(a) * rr);
    }
    g.stroke();
  }
  for (const rr of [r * 1.08, r * 1.14]) { g.beginPath(); g.arc(0, 0, rr, 0, Math.PI * 2); g.stroke(); }
  g.restore();
}

function wrap(g, text, max) {
  const words = text.split(/\s+/), lines = []; let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (line && g.measureText(next).width > max) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Halaman kitab: kertas tua, bingkai emas berganda dan tulisan sebenar laman ini (bukan teks agama,
// bukan tulisan olok-olok). spineRight = halaman kiri, tulang di sebelah kanan lukisan.
function paintPage(g, w, h, kind, copy, spineRight) {
  const rtl = copy.rtl, serif = rtl ? '"Amiri", "Noto Naskh Arabic", "Geeza Pro", serif' : '"Cormorant Garamond", Georgia, serif';
  g.fillStyle = '#e9dcc0'; g.fillRect(0, 0, w, h);
  const glow = g.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, h * 0.72);
  glow.addColorStop(0, 'rgba(255,250,236,.5)'); glow.addColorStop(1, 'rgba(150,118,70,.2)');
  g.fillStyle = glow; g.fillRect(0, 0, w, h);
  let seed = 4127;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(70,48,22,${random() * 0.07})`; g.fillRect(random() * w, random() * h, 1.6, 1.6); }
  const gutter = g.createLinearGradient(spineRight ? w : 0, 0, spineRight ? w - 150 : 150, 0);
  gutter.addColorStop(0, 'rgba(60,40,18,.34)'); gutter.addColorStop(1, 'rgba(60,40,18,0)');
  g.fillStyle = gutter; g.fillRect(0, 0, w, h);
  g.strokeStyle = GOLD; g.lineWidth = 5; g.strokeRect(74, 74, w - 148, h - 148);
  g.lineWidth = 1.6; g.strokeRect(90, 90, w - 180, h - 180); g.strokeRect(62, 62, w - 124, h - 124);
  for (const [x, y] of [[90, 90], [w - 90, 90], [90, h - 90], [w - 90, h - 90]]) {
    g.fillStyle = '#e9dcc0'; g.beginPath(); g.arc(x, y, 30, 0, Math.PI * 2); g.fill(); rosette(g, x, y, 22, 1.6);
  }
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.direction = rtl ? 'rtl' : 'ltr';
  const cx = w / 2, max = w - 290;
  const rule = y => {
    g.strokeStyle = GOLD; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 170, y); g.lineTo(cx - 26, y); g.moveTo(cx + 26, y); g.lineTo(cx + 170, y); g.stroke();
    g.save(); g.translate(cx, y); g.rotate(Math.PI / 4); g.strokeRect(-9, -9, 18, 18); g.restore();
  };
  const eyebrow = (text, y) => {
    g.fillStyle = RUBRIC; g.font = rtl ? `700 50px ${serif}` : `700 36px ${serif}`;
    try { g.letterSpacing = rtl ? '0px' : '7px'; } catch { /* pilihan */ }
    g.fillText(rtl ? text : text.toUpperCase(), cx, y);
    try { g.letterSpacing = '0px'; } catch { /* pilihan */ }
  };
  // Tiada tulisan pada mana-mana halaman (permintaan pemilik): hiasan geometri sahaja.
  if (kind === 'body' || kind === 'fields') { rule(330); rosette(g, cx, h / 2, 130, 2.2); rosette(g, cx, h / 2, 50, 1.6); rule(h - 330); return; }
  if (kind === 'title') kind = 'ornament';
  if (kind === 'ornament') {
    rosette(g, cx, h / 2, 250, 2.6); rosette(g, cx, h / 2, 96, 1.8);
    rule(h / 2 - 400); rule(h / 2 + 400);
    return;
  }
  if (kind === 'title') {
    rosette(g, cx, 360, 96, 2.2);
    eyebrow(copy.eyebrow, 560);
    let size = rtl ? 150 : 172, lines;
    do { g.font = `${rtl ? 700 : 600} ${size}px ${serif}`; lines = wrap(g, copy.title, max); size -= 6; } while ((lines.length > 3 || lines.some(l => g.measureText(l).width > max)) && size > 70);
    const lh = (size + 6) * (rtl ? 1.5 : 1.06), y0 = 830 - (lines.length - 1) * lh / 2;
    g.fillStyle = INK; lines.forEach((l, i) => g.fillText(l, cx, y0 + i * lh));
    rule(y0 + (lines.length - 1) * lh + lh * 0.5 + 70);
    rosette(g, cx, h - 300, 54, 1.8);
    return;
  }
  if (kind === 'body') {
    rule(330);
    const size = rtl ? 78 : 86;
    g.font = `${rtl ? 400 : 600} ${size}px ${serif}`;
    const lines = wrap(g, copy.body, max), lh = size * (rtl ? 1.75 : 1.42), y0 = h / 2 - (lines.length - 1) * lh / 2;
    g.fillStyle = INK; lines.forEach((l, i) => g.fillText(l, cx, y0 + i * lh));
    // Huruf pertama dirubrik seperti manuskrip: titik merah kecil di atas dan bawah teks.
    g.fillStyle = RUBRIC; for (const y of [y0 - lh * 0.9, y0 + (lines.length - 1) * lh + lh * 0.9]) { g.beginPath(); g.arc(cx, y, 6, 0, Math.PI * 2); g.fill(); }
    rule(h - 330);
    return;
  }
  // 'fields': senarai bidang kajian yang sama seperti di sebelah model.
  eyebrow(copy.eyebrow, 300); rule(370);
  const size = rtl ? 70 : 78, lh = 176, y0 = 560;
  copy.fields.forEach((text, i) => {
    const y = y0 + i * lh;
    g.fillStyle = RUBRIC; g.font = `600 34px ${serif}`; g.fillText(String(i + 1).padStart(2, '0'), cx, y - 62);
    g.fillStyle = INK; g.font = `${rtl ? 700 : 500} ${size}px ${serif}`;
    let s2 = size; while (g.measureText(text).width > max && s2 > 40) { s2 -= 4; g.font = `${rtl ? 700 : 500} ${s2}px ${serif}`; }
    g.fillText(text, cx, y);
  });
  rule(h - 250);
}

function readCopy(feature) {
  const text = sel => feature?.querySelector(sel)?.textContent.trim() || '';
  return {
    rtl: document.documentElement.dir === 'rtl',
    eyebrow: text('[data-i18n="msEyebrow"]'), title: text('[data-i18n="msTitle"]'), body: text('[data-i18n="msBody"]'),
    fields: [...(feature?.querySelectorAll('.field-list li') || [])].map(li => li.textContent.trim()),
  };
}

const PAGE_W = 1.42, PAGE_H = 2.18;

function stackGeometry() {
  const shape = new THREE.Shape();
  const top = u => 0.06 + 0.17 * Math.sin(Math.PI * u) + u * 0.24;
  shape.moveTo(0, top(0));
  for (let i = 1; i <= 28; i++) shape.lineTo(PAGE_W * i / 28, top(i / 28));
  for (let i = 28; i >= 0; i--) shape.lineTo(PAGE_W * i / 28, top(i / 28) - 0.14);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: PAGE_H, steps: 1, bevelEnabled: false });
  geometry.rotateX(Math.PI / 2); geometry.translate(0, PAGE_H / 2, 0); geometry.clearGroups();
  return geometry;
}

export default async function create(ctx) {
  const s = studio(ctx, 3);
  try {
    const woodMap = s.own(surfaceTexture('wood')), leatherMap = s.own(surfaceTexture('leather'));
    const edgeMap = s.own(surfaceTexture('edge'));
    const wood = s.material({ color: 0xb39a7c, map: woodMap, bumpMap: woodMap, bumpScale: 0.012, roughness: 0.48 });
    const leather = s.material({ color: 0x42251a, map: leatherMap, bumpMap: leatherMap, bumpScale: 0.009, roughness: 0.64 });
    const brass = s.material({ color: 0xba9858, metalness: 1, roughness: 0.38 });
    const feature = ctx.stage.closest('.feature');
    try { await Promise.all([document.fonts.load('500 120px "Cormorant Garamond"'), document.fonts.load('700 120px "Amiri"')]); } catch { /* fon sandaran */ }
    // Empat muka: kiri (tajuk), helaian depan (ayat), helaian belakang (roset), kanan (bidang).
    const aniso = ctx.renderer.capabilities.getMaxAnisotropy();
    const faces = {};
    for (const [kind, mirrored] of [['title', true], ['body', false], ['ornament', true], ['fields', false]]) {
      const map = s.own(canvasTexture(TEX_W, TEX_H, () => {}));
      map.anisotropy = aniso;
      // Halaman kiri dicermin oleh geometri (scale.x = -1 atau muka belakang); tekstur dibalikkan semula.
      if (mirrored) { map.wrapS = THREE.RepeatWrapping; map.repeat.x = -1; map.offset.x = 1; }
      faces[kind] = { map, mirrored, material: s.material({ map, color: 0xd9d2c4, roughness: 0.94, side: kind === 'body' ? THREE.FrontSide : kind === 'ornament' ? THREE.BackSide : THREE.DoubleSide }) };
    }
    const repaint = () => {
      const copy = readCopy(feature);
      for (const [kind, face] of Object.entries(faces)) {
        const g = face.map.image.getContext('2d');
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, TEX_W, TEX_H);
        paintPage(g, TEX_W, TEX_H, kind, copy, face.mirrored);
        face.map.needsUpdate = true;
      }
      ctx.requestRender();
    };
    repaint();
    let repaintTimer = 0;
    const langObserver = new MutationObserver(() => { clearTimeout(repaintTimer); repaintTimer = setTimeout(repaint, 120); });
    langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'dir'] });
    s.cleanup.push(() => { langObserver.disconnect(); clearTimeout(repaintTimer); });
    const edges = s.material({ map: edgeMap, color: 0xd6c7a7, roughness: 0.98 });
    const pivot = new THREE.Group(); s.scene.add(pivot);
    // Two intersecting boards, broad in Z: a physical X-shaped wooden rehal.
    const boards = [], trims = [];
    for (const sign of [-1, 1]) {
      const board = rounded(1.72, 2, 0.13, 0.045);
      board.rotateY(Math.PI / 2); board.rotateZ(sign * 0.62); board.translate(0, 0.87, 0); boards.push(board);
      for (const z of [-0.77, 0.77]) {
        const strip = new THREE.BoxGeometry(0.135, 1.91, 0.014).toNonIndexed();
        strip.translate(0, 0, z); strip.rotateZ(sign * 0.62); strip.translate(0, 0.87, 0); trims.push(strip);
      }
    }
    batch(s, pivot, wood, boards);
    batch(s, pivot, brass, trims);
    const pin = s.mesh(pivot, new THREE.CylinderGeometry(0.075, 0.075, 1.82, 20), brass, 0, 0.87, 0);
    pin.rotation.x = Math.PI / 2;
    const book = new THREE.Group(); book.position.y = 1.65; book.rotation.x = -Math.PI / 2; pivot.add(book);
    const ornaments = [];
    for (const sign of [-1, 1]) {
      const wing = new THREE.Group(); wing.scale.x = sign; book.add(wing);
      const cover = s.mesh(wing, rounded(PAGE_W + 0.09, PAGE_H + 0.12, 0.045, 0.03), leather, PAGE_W / 2, 0, 0.055);
      cover.rotation.y = -Math.atan(0.24 / PAGE_W);
      s.mesh(wing, stackGeometry(), edges);
      const top = leafGeometry(PAGE_W, PAGE_H, 0, ctx.tier === 'low' ? 20 : 36);
      const pos = top.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        const u = pos.getX(j) / PAGE_W;
        pos.setZ(j, 0.067 + 0.17 * Math.sin(Math.PI * u) + u * 0.24);
      }
      top.computeVertexNormals(); s.mesh(wing, top, faces[sign < 0 ? 'title' : 'fields'].material);
      // Corner mounts are on the leather margins, not on the neutral page face.
      for (const end of [-1, 1]) {
        const corner = new THREE.BoxGeometry(0.18, 0.055, 0.018).toNonIndexed();
        corner.translate(sign * (PAGE_W - 0.035), end * (PAGE_H / 2 + 0.035), 0.185); ornaments.push(corner);
      }
    }
    batch(s, book, brass, ornaments);
    const spine = s.mesh(book, rounded(0.13, PAGE_H + 0.1, 0.12, 0.035), leather, 0, 0, -0.075);
    spine.castShadow = true;
    const turningGeometry = leafGeometry(PAGE_W, PAGE_H - 0.025, 0, ctx.tier === 'low' ? 24 : 40);
    turningGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    turningGeometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
    const turning = s.mesh(book, turningGeometry, faces.body.material);
    const turningBack = s.mesh(book, turningGeometry, faces.ornament.material);
    turning.frustumCulled = turningBack.frustumCulled = false;
    const positions = turningGeometry.attributes.position, normals = turningGeometry.attributes.normal;
    const base = new Float32Array(positions.array);
    s.contact(0, 0, 4.1, 3.3);
    return controller(s, {
      name: 'manuskrip', radius: 3.05, keys: KEYS, stable: 0,
      targetAt(p, k, out) { out.set(0, k.ty, 0); },
      pose(p, rig, state) {
        const spin = ramp(p, 0.05, 0.44), yaw = TAU * spin;
        rig.azimuth = 0.1 * Math.sin(TAU * p);
        pivot.rotation.y = yaw;
        const t = ramp(p, 0.52, 0.72), angle = Math.PI * t;
        const ca = Math.cos(angle), sa = Math.sin(angle), bend = Math.sin(angle) * 0.25;
        // Analytic surface and normals in existing buffers: right -> arched -> left.
        // +sin(angle) lifts the sheet away from the page block at mid-turn.
        for (let j = 0; j < positions.count; j++) {
          const x = base[j * 3], u = x / PAGE_W;
          const z = 0.17 * Math.sin(Math.PI * u) + u * 0.24;
          const dz = 0.17 * Math.PI / PAGE_W * Math.cos(Math.PI * u) + 0.24 / PAGE_W;
          const extraCurl = bend * Math.sin(Math.PI * u);
          const dx = ca - dz * sa, dzdx = sa + dz * ca + bend * Math.PI / PAGE_W * Math.cos(Math.PI * u);
          const length = Math.hypot(dx, dzdx);
          positions.setXYZ(j, x * ca - z * sa, base[j * 3 + 1], 0.079 + x * sa + z * Math.abs(ca) + extraCurl);
          // Derivative uses |cos| for the page's resting crown on either side.
          const nz = sa + dz * Math.abs(ca) + bend * Math.PI / PAGE_W * Math.cos(Math.PI * u);
          const norm = Math.hypot(dx, nz) || length || 1;
          normals.setXYZ(j, -nz / norm, 0, dx / norm);
        }
        positions.needsUpdate = normals.needsUpdate = true;
        state.yawDeg = spin * 360; state.pageTurn = t; state.pageTurnDeg = t * 180;
      },
    });
  } catch (error) { s.dispose(); throw error; }
}
