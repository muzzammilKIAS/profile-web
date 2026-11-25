# ASSET MANIFEST

| Aset | Saiz | Bahagian | Sumber / lesen | Catatan |
|---|---:|---|---|---|
| `assets/models/jamiah-imam.glb` | 1.27 MB | – (sandaran asal) | Model GLB dibekalkan pengguna | Tidak diubah. Tafsiran artistik daripada foto hadapan, bukan ukuran binaan sebenar. |
| `assets/models/jamiah-imam.parts.glb` | 578 KB | Jamiah | Dijana daripada GLB asal oleh `scripts/build-jamiah-parts.mjs` | 8 mesh (satu bagi setiap bahan: batu, gangsa, kubah, kaca, pelepah, semak, rumput, papan tanda). Geometri, UV dan transform sama dengan asal; verteks dikimpal. **Inilah yang dimuat oleh laman.** |
| `assets/models/jamiah-imam.opt.glb` | 660 KB | – | Dijana oleh Codex (`tools/optimize-glb.mjs`) | 2 mesh, disahkan tanpa kehilangan (laporan dalam `tools/reports/`). Tidak dimuat oleh laman sejak bahan dipisahkan. Disimpan sebagai bukti X-01. |
| `assets/textures/jamiah-sign-thuluth.webp` | 64 KB | Jamiah | Dirender daripada fon sistem macOS **Diwan Thuluth** (`scripts/render-jamiah-sign.mjs`) | Teks penuh «جامعة الإمام محمد بن سُعود الإسلامية», 4096×219, lutsinar. Menggantikan tekstur asal 355×49 yang kabur. Fon tidak diedarkan; hanya imej render. |
| `assets/textures/books/fiqh-halal-haram-front-{2048,1024}.webp` | 201 / 81 KB | Pustaka | Halaman 1 PDF `kitab/Fiqh-Halal-dan-Haram_…pdf` (karya pengguna) | Diekstrak oleh Codex pada 300 DPI, tiada crop. Lihat `BOOK_COVER_MANIFEST.md`. |
| `assets/textures/books/fiqh-quran-sunnah-front-{2048,1024}.webp` | 390 / 141 KB | Pustaka | Halaman 1 PDF `kitab/Fiqh-Al-Quran-dan-Sunnah_…pdf` (karya pengguna) | Seperti di atas. Kulit belakang tiada dalam PDF; diganti kulit neutral berwarna tulang buku. |
| `assets/textures/apps/ehadis40-laptop.webp` | 53 KB | Makmal | Tangkapan sebenar https://www.ehadis40.my/ (1440×900, 25 Nov 2026) | Selepas dialog penafian ditutup. |
| `assets/textures/apps/fiqh-manhaji-tablet.webp` | 68 KB | Makmal | Tangkapan sebenar https://muzzammilkias.github.io/fiqh-manhaji/ (834×1112 @2x) | |
| `assets/textures/apps/haji-pintar-phone.webp` | 86 KB | Makmal | Tangkapan sebenar https://www.hajipintar.my/ (390×844 @2x) | Selepas dialog penafian ditutup. |
| `assets/posters/*-{night,day}.webp` | 456 KB (10 fail) | Semua pentas 3D | Render sebenar laman ini (Chromium WebGL) | Dipaparkan semasa memuat, sebagai sandaran tanpa WebGL, dan mengikut mood. |
| `vendor/three/*` | ~1.0 MB | Semua 3D | three.js r187, lesen MIT (`vendor/three/LICENSE`) | Dibundel menjadi satu modul + addon yang digunakan sahaja. |
| `vendor/gsap/*` | ~110 KB | Skrol | GSAP 3.15.1 + ScrollTrigger, lesen "Standard no-charge" GSAP | |
| `gambar/muzzammil.jpg`, `kitab/*.pdf` | 0.2 / 18.6 MB | Hero, Pustaka | Aset asal pengguna | Tidak diubah. |
| `qa/reference/*.jpg` | 332 KB | – | Foto rujukan dan render konsep dibekalkan pengguna | Untuk semakan sahaja. |

Tekstur prosedural (kayu rehal, kulit, halaman kosong, tepi halaman, logam pingat) dijana dalam kod (`js/scenes/common.js`) dan tidak mengandungi sebarang teks. Tiada logo pertandingan, sijil atau teks agama direka.
