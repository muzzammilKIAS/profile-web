# TASKS

| ID | Pemilik | Tugasan | Fail dibenarkan | Bergantung | Ujian penerimaan | Status |
|---|---|---|---|---|---|---|
| C-01 | Claude | Audit, baseline, branch, fail kolaborasi | `collab/*` | – | Screenshot baseline wujud di `qa/baseline/` | selesai |
| G-01 | Gemini | Audit visual laman asal + art direction + storyboard gerakan | `collab/GEMINI_REVIEW.md` | C-01 | Fail merujuk screenshot sebenar, senarai kelemahan dan cadangan spesifik | selesai (pusingan 1) |
| X-01 | Codex | Optimumkan GLB Jamiah Imam (kurangkan draw call, kekal rupa) | `tools/**`, `assets/models/jamiah-imam.opt.glb` | C-01 | Ukuran sebelum/selepas direkod; GLB sah dimuat | selesai (`jamiah-imam.opt.glb`, validator 0 ralat) |
| X-02 | Codex | Ekstrak kulit sebenar daripada PDF buku | `tools/**`, `assets/textures/books/**`, `BOOK_COVER_MANIFEST.md` | C-01 | WebP kulit + manifest (hash PDF, halaman, saiz) | selesai (2 buku; tiada kulit belakang dalam PDF) |
| C-02 | Claude | Sistem reka bentuk, hero, navigasi, lapisan gerakan | `immersive.css`, `index.html`, `js/**` | G-01 (nasihat) | Tiada ralat konsol; BM/EN/AR berfungsi | selesai |
| C-03 | Claude | Babak Jamiah Imam scroll 360° + mod Teroka | `js/**` | X-01 | Yaw 0/90/180/270/360° pada 0/25/50/75/100% | selesai (disahkan QA) |
| C-04 | Claude | Pustaka 3D, pingat, manuskrip, makmal digital | `js/**` | X-02 | Setiap babak dimuat lazy dan berfungsi | selesai: babak dibina Codex (pusingan 2), disepadukan dan dibaiki Claude |
| G-02 | Gemini | Semakan visual versi bersepadu | `collab/GEMINI_REVIEW.md` (bahagian 2) | C-02..C-04 | Isu P0/P1 disenaraikan | pusingan 2 selesai; pusingan 3 berjalan |
| X-03 | Codex | Semakan kod + regresi/prestasi | `collab/CODEX_REPORT.md` (bahagian 2) | C-02..C-04 | Isu P0/P1 disenaraikan | **pending**: Codex mencapai had penggunaan; lihat `collab/HANDOFF_CODEX_X03.md`. Semakan ganti oleh sub-agent Claude. |
| C-05 | Claude | Baiki P0/P1, QA akhir, dokumen serahan | semua fail Claude | G-02, X-03 | `QA_REPORT.md` dengan hasil sebenar | belum |
| X-02b | Codex | Babak Pustaka, Makmal, Manuskrip, Pingat (arahan kreatif pengguna) | `js/scenes/{library,devices,manuscript,medals,common}.js` | C-03 | Berjalan dalam WebGL tanpa ralat; QA browser oleh Claude | selesai; 4 pepijat visual dibaiki Claude |
| C-06 | Claude | Versi Pagi/Malam, khat Thuluth penuh, buang AI slop, kaleidoskop geometri, poster | `js/**`, `immersive.css`, `script.js`, `assets/**` | G-02 | QA browser | selesai |
