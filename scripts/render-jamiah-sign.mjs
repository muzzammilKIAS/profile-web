import { chromium } from 'playwright';
import fs from 'node:fs';
const W = 4096, H = Math.round(4096 / 18.73);
const variants = { final: 'جامعة الإمام محمد بن سُعود الإسلامية' };
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent('<p style="font-family:\'Diwan Thuluth\'">جامعة</p>');
const out = await page.evaluate(async ({ W, H, variants }) => {
  await document.fonts.ready;
  const res = {};
  for (const [name, text] of Object.entries(variants)) for (const bg of [null, '#e4cfaa']) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, W, H); }
    g.direction = 'rtl'; g.textAlign = 'left';
    let size = 200; g.font = `${size}px "Diwan Thuluth"`;
    let m = g.measureText(text);
    size *= Math.min((W * 0.9) / (m.actualBoundingBoxLeft + m.actualBoundingBoxRight), (H * 0.9) / (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent));
    g.font = `${size}px "Diwan Thuluth"`; m = g.measureText(text);
    const w = m.actualBoundingBoxLeft + m.actualBoundingBoxRight, h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    const x = (W - w) / 2 + m.actualBoundingBoxLeft, y = (H - h) / 2 + m.actualBoundingBoxAscent;
    // Huruf timbul tebal: bayang bawah, sorotan atas, kemudian dakwat zamrud gelap dengan garis luar sewarna.
    g.lineJoin = 'round';
    const ink = (style, dx, dy, line) => { g.fillStyle = style; g.strokeStyle = style; g.lineWidth = line; g.strokeText(text, x + dx, y + dy); g.fillText(text, x + dx, y + dy); };
    ink('rgba(3,16,11,0.55)', 3, 6, 9);
    ink('rgba(255,244,220,0.35)', -1, -2, 7);
    ink('#0a2c1f', 0, 0, 7);
    res[name + (bg ? '-stone' : '')] = c.toDataURL('image/png');
  }
  res.check = document.fonts.check('20px "Diwan Thuluth"');
  return res;
}, { W, H, variants });
for (const [k, v] of Object.entries(out)) if (typeof v === 'string') fs.writeFileSync(`shots/sign-${k}.png`, Buffer.from(v.split(',')[1], 'base64'));
console.log('font check', out.check);
await browser.close();
