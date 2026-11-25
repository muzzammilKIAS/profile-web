# PERFORMANCE REPORT

**Kaedah.** Diukur pada 25 Nov 2026 dengan Playwright Chromium headless (WebGL 2 melalui ANGLE/Metal) pada Mac Apple Silicon pengguna. Pelayan ialah `python3 -m http.server` lokal, jadi masa rangkaian tidak realistik. Skrip: `_qa/perf.mjs` (di luar repo). Mobile ialah emulasi 390×844 dengan pendikitan CPU 4× melalui CDP, **bukan telefon sebenar**. GPU tidak didikit. Angka ini menunjukkan kos CPU/JS laman, bukan prestasi GPU telefon.

Masa bingkai diukur semasa skrol berterusan merentasi keseluruhan bab berpin dalam 6 saat (360 bingkai). Babak telah dimuat sebelum pengukuran.

| Ukuran | Desktop 1440×900 | Mobile 390×844, CPU 4× | Sasaran |
|---|---:|---:|---|
| LCP (muat lokal) | 292 ms | 460 ms | ≤ 2.5 s |
| CLS | 0.001 | 0 | ≤ 0.1 |
| Data dipindah (tanpa PDF) | 3.3 MB | 2.8 MB | – |
| Tier kualiti dipilih | high | low | – |
| Jamiah: purata fps / p95 / terburuk | 60 / 16.7 ms / 16.8 ms | 60 / 16.7 ms / 16.8 ms | 60 desktop, 30 mobile |
| Pustaka: purata fps / p95 | 60 / 16.7 ms | 60 / 16.7 ms | |
| Makmal: purata fps / p95 | 60 / 16.7 ms | 60 / 16.7 ms | |
| Penurunan DPR adaptif berlaku | 0 | 0 | |
| Draw call (bingkai terakhir) | Jamiah: 1 pas akhir komposit (GTAO) · Pustaka 36 · Makmal 59 | Jamiah 22 · Pustaka 29 · Makmal 53 | |
| Segi tiga | Pustaka 6.8 k · Makmal 48 k | Jamiah 84 k · Pustaka 5.3 k · Makmal 48 k | |

Nota: pada tier high, Jamiah dirender melalui EffectComposer (GTAO), jadi `renderer.info` hanya melaporkan pas komposit terakhir (1 draw call). Pada tier low, angka 22 draw call ialah render penuh tanpa pasca-proses.

## Langkah prestasi yang dilaksanakan
- Satu renderer WebGL dikongsi; hanya satu babak dirender pada satu masa; render hanya apabila ada perubahan (kamera atau skrol), bukan gelung berterusan.
- Babak dan Three.js dimuat secara lazy apabila pentas menghampiri viewport. Hero dan kandungan tidak menunggu WebGL (LCP ialah teks/potret hero).
- Model Jamiah dikurangkan daripada 1,520 mesh kepada 8 mesh mengikut bahan (lihat `ASSET_MANIFEST.md`).
- DPR adaptif (turun jika bingkai > 30 ms berterusan), DPR maksimum 1.5 pada tier low.
- Tier low: tiada ambient occlusion, shadow map 1024, tekstur kulit buku 1024.
- Jeda apabila tab tersembunyi atau babak di luar skrin; pemulihan konteks WebGL diuji.

## Tidak diukur
Lighthouse; INP; telefon atau tablet fizikal; Safari iOS sebenar; rangkaian 3G/4G. Disyorkan sebelum terbit: Lighthouse mobile pada URL GitHub Pages sebenar dan ujian pada sekurang-kurangnya satu telefon Android pertengahan.
