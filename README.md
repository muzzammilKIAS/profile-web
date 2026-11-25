# Profil Akademik Imersif — Ahmad Muzzammil Mohammad Najib

Laman profil akademik statik (HTML, CSS dan JavaScript) untuk GitHub Pages di `/profile-web/`. Versi ini menambah lapisan 3D sinematik di atas laman asal. Semua kandungan, terjemahan BM/EN/عربي dan fungsi asal dikekalkan.

## Jalankan secara lokal

```sh
python3 -m http.server 8000
# buka http://localhost:8000/
```

Tiada langkah build. Three.js r187 dan GSAP 3.15 di-vendor dalam `vendor/` dan dimuat melalui import map. Tiada CDN digunakan untuk 3D. Fon Google Fonts kekal seperti laman asal.

Parameter URL:
- `?lang=en` atau `?lang=ar` untuk bahasa.
- `?no3d` memaksa paparan poster tanpa WebGL (ujian sandaran).

## Struktur

| Laluan | Fungsi |
|---|---|
| `index.html`, `styles.css`, `script.js`, `i18n.js` | Laman asal (kandungan, terjemahan, navigasi, tapisan). Diubah secara minimum. |
| `immersive.css`, `i18n-immersive.js` | Lapisan imersif: bab 3D, versi Pagi/Malam, identiti gerakan setiap bahagian, pembaikan semakan visual, terjemahan teks baharu. |
| `js/main.js` | Titik masuk: kesan WebGL, muat babak secara lazy, suis Pagi/Malam, poster, rel bahagian, nota (i). |
| `js/motion.js` | Butang magnetik, kaleidoskop yang berubah bentuk mengikut skrol, bayang mashrabiyya, identiti gerakan setiap bahagian. |
| `js/scene-manager.js` | Satu renderer WebGL dikongsi; satu babak aktif pada satu masa; DPR adaptif; jeda luar skrin; pemulihan konteks WebGL. |
| `js/rig.js`, `js/hud.js` | Rig kamera berskrip (dolly, elevation, FOV, orbit) + mod Teroka (OrbitControls); bar alat, kad cerita, dail darjah. |
| `js/scenes/jamiah.js` | Bab Jamiah Imam: maket PBR, khat Thuluth, putaran 360° dipacu skrol, ambient occlusion. |
| `js/scenes/library.js`, `devices.js`, `manuscript.js`, `medals.js`, `common.js` | Babak Pustaka, Makmal, Manuskrip, Pingat (dibina oleh Codex; disepadukan dan dibaiki oleh Claude). |
| `assets/` | Model GLB, tekstur kulit buku, tangkapan aplikasi, khat papan tanda, poster render. Lihat `ASSET_MANIFEST.md`. |
| `scripts/` | Jana semula `jamiah-imam.parts.glb` dan tekstur khat. |
| `tools/` | Alat Codex: pengoptimuman GLB, ekstrak kulit PDF, laporan pengesahan. |
| `collab/` | Fail kolaborasi tiga agent (PLAN, TASKS, BASELINE, DECISIONS, QA, laporan Gemini dan Codex). |
| `qa/` | Tangkapan skrin baseline dan semakan. |

## Jana semula aset

```sh
# Model Jamiah: satu mesh bagi setiap jenis bahan (perlukan @gltf-transform/core)
npm ci --prefix tools && NODE_PATH=tools/node_modules node scripts/build-jamiah-parts.mjs
# Khat papan tanda (perlukan Playwright + fon Diwan Thuluth macOS)
node scripts/render-jamiah-sign.mjs && cwebp -q 92 -alpha_q 100 -exact shots/sign-final.png -o assets/textures/jamiah-sign-thuluth.webp
# Kulit buku daripada PDF
/usr/bin/python3 tools/extract_covers.py
```

## Terbit ke GitHub Pages

Kerja ini berada di branch `immersive-3d`. Tiada apa-apa ditolak (push) atau diterbitkan. Untuk menerbitkan:

```sh
git push origin immersive-3d
# semak pratonton, kemudian gabungkan ke main apabila berpuas hati
```

Semua laluan aset adalah relatif, jadi laman berfungsi di bawah `https://muzzammilkias.github.io/profile-web/`.
