# Alat aset Jamiah dan kulit buku

Semua laluan skrip berasaskan lokasi skrip, bukan direktori kerja. Fail GLB/PDF asal tidak ditulis semula. Dependencies Node terasing dalam `tools/package.json` dan lockfile.

## Jana semula

```sh
npm ci --prefix tools --cache tools/.npm-cache --no-audit --no-fund
node tools/optimize-glb.mjs
node tools/verify-gltfloader.mjs
/usr/bin/python3 tools/extract_covers.py
```

Persekitaran yang diuji: Node 24.22.1, PyMuPDF 1.26.5, Pillow 11.3.0, cwebp 1.6.0. `verify-gltfloader.mjs` menggunakan API `registerHooks` Node moden. PyMuPDF dan Pillow perlu tersedia dalam interpreter Python yang digunakan. cwebp dicari melalui PATH, kemudian `/opt/homebrew/bin/cwebp`.

`optimize-glb.mjs` menjalankan dedup, flatten, join, weld tanpa kehilangan atribut, dedup dan prune. Tiada simplify, quantize, Draco, meshopt atau KTX2. Semakan meliputi baca semula, validator Khronos penuh, hash tekstur, bahan, bounding box, dan multiset segi tiga berorientasi bersama atribut pada ketepatan lima tempat perpuluhan. Output di `assets/models/jamiah-imam.opt.glb`; bukti di `tools/reports/`.

`verify-gltfloader.mjs` menguji modul Three.js/GLTFLoader sebenar di `vendor/`. Shim ImageBitmap berasaskan sharp membolehkan penyahkodan PNG dalam Node. Ia bukan ujian render WebGL atau GPU.

`extract_covers.py --inspect-only` menghasilkan contact sheet halaman awal/akhir di `tools/reports/`. Pemilihan halaman dan hash PDF dipin selepas semakan visual. Jika PDF berubah, ekstraksi akan berhenti sehingga konfigurasi disemak semula. Empat WebP dan dua manifest dijana oleh mod biasa; PNG perantaraan dibuang automatik.

## Semakan render yang masih perlu dijalankan

Harness `glb-check.html` memuatkan kedua-dua GLB menggunakan GLTFLoader tanpa decoder. Ia membandingkan empat sudut dengan tetapan kamera/cahaya yang sama. Buka selepas memulakan server dari akar repo:

```sh
/usr/bin/python3 -m http.server 8765 --bind 127.0.0.1
```

URL: `http://127.0.0.1:8765/tools/glb-check.html`.

Untuk automasi pada mesin yang boleh melancarkan Chrome headless, pasang Playwright Python dan jalankan `tools/verify_browser.py` dengan server tersebut masih berjalan. Versi Playwright yang dicuba ialah 1.60.0. Skrip menyimpan screenshot dan metrik perbezaan piksel, serta menolak ralat pemuatan/konsol. Percubaan sesi ini gagal melancarkan Chrome (`SIGABRT`); tiada keputusan render atau FPS didakwa. Browser CUA juga tidak tersedia. Rujuk `collab/CODEX_REPORT.md`.

`node_modules/`, `.npm-cache/`, `scratch/` dan `__pycache__/` diabaikan oleh `tools/.gitignore`. Bukti di `reports/` tidak diabaikan. Alat ini untuk penyediaan aset; tidak perlu dimuatkan oleh laman produksi.
