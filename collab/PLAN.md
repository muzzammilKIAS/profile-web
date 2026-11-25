# PLAN — Profil Akademik Imersif 3D

Branch integrasi: `immersive-3d` (asas: `a22d568` daripada `muzzammilkias/profile-web`).
Tiada push/deploy tanpa izin pengguna.

## Keputusan seni bina
- Kekal **statik tanpa build** seperti asal (HTML + CSS + JS, GitHub Pages `/profile-web/`). Semua laluan relatif.
- `index.html`, `i18n.js`, `script.js` asal dikekalkan sebagai asas kandungan; lapisan baharu ditambah, bukan ditulis semula.
- Three.js + GSAP ScrollTrigger di-vendor ke `vendor/` (versi dipin), dimuat sebagai ES module melalui import map. Tiada CDN masa jalan untuk 3D.
- Satu `SceneManager` (`js/scene-manager.js`): satu renderer WebGL dikongsi, hanya satu babak aktif pada satu masa, lazy load, DPR adaptif, jeda luar skrin/tab tersembunyi, dispose, fallback poster.
- HTML semantik kekal sumber kandungan; WebGL hanya penambahbaikan.

## Babak 3D (ikut keutamaan)
- P0 `#jamiah` — GLB Jamiah Imam, yaw 0→2π ikut scroll + dolly, mod Teroka manual.
- P1 `#pustaka` — buku 3D dengan kulit PDF sebenar (Fiqh Halal dan Haram; Fiqh Al-Quran dan Sunnah).
- P1 `#pencapaian` — pingat emas/perak generik 3D.
- P1 `#bidang` — manuskrip/kitab atas rehal (mesh prosedural, tekstur neutral tanpa teks agama).
- P1 `#aplikasi` — laptop/tablet/telefon dengan tangkapan skrin aplikasi sebenar.

## Pemilikan fail
| Pemilik | Fail |
|---|---|
| Claude | `index.html`, `styles.css`, `immersive.css`, `script.js`, `i18n.js`, `js/**`, `vendor/**`, `collab/PLAN.md`, `collab/TASKS.md`, `collab/BASELINE.md`, `collab/DECISIONS.md`, `collab/QA.md`, dokumen akar |
| Codex | `tools/**`, `assets/models/jamiah-imam.opt.glb`, `assets/textures/books/**`, `BOOK_COVER_MANIFEST.md`, `collab/CODEX_REPORT.md` |
| Gemini | `collab/GEMINI_REVIEW.md` sahaja |

Satu pemilik bagi setiap fail. Jangan guna `git reset --hard`, `git clean`, atau padam fail agent lain.
