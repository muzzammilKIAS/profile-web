# Manifest kulit buku sebenar

Dijana oleh `tools/extract_covers.py`. Sumber ialah PDF tempatan yang disahkan bermula dengan `%PDF`.

Halaman 1-4 dan tiga halaman terakhir setiap PDF disemak secara visual. Indeks halaman bermula dengan 0. Kulit depan ialah halaman 1 (indeks 0), diikuti halaman judul dalaman, hak cipta dan prakata. Tiada kulit belakang sebenar dalam kedua-dua PDF; tiada tekstur belakang direka atau dieksport.

Render RGB pada 300 DPI, kemudian resize Lanczos tanpa crop kepada sisi panjang 2048/1024 px. WebP: cwebp `-q 95 -m 6 -sharp_yuv -metadata none`. Nisbah mungkin berbeza kurang daripada satu piksel akibat pembundaran. PNG perantaraan dipadam secara automatik; PDF asal tidak diubah.

## Fiqh Halal dan Haram

- Slug: `fiqh-halal-haram`
- PDF: [`kitab/Fiqh-Halal-dan-Haram_Ahmad-Muzzammil_2026.pdf`](kitab/Fiqh-Halal-dan-Haram_Ahmad-Muzzammil_2026.pdf)
- SHA-256 PDF: `9d4de6f2bc5dd3a37cab1a1544e6750eac0c6649e127806a7bd840a33fd317ec`
- Jumlah halaman: 138; depan: indeks 0; belakang: `null`.
- Kulit belakang: Tiada; halaman akhir ialah Bacaan Tambahan, didahului bibliografi.
- Halaman disemak (indeks): 0, 1, 2, 3, 135, 136, 137.
- Render 300 DPI: 2479 × 3508 px; nisbah PDF W/H: 0.706670435.
- Warna dominan cadangan untuk spine: `#661514`. Ini warna sampel kulit, bukan imej spine sebenar.

| Tekstur | Lebar × tinggi | Bait | Nisbah W/H |
|---|---:|---:|---:|
| [fiqh-halal-haram-front-2048.webp](assets/textures/books/fiqh-halal-haram-front-2048.webp) | 1447 × 2048 | 200,616 | 0.706542969 |
| [fiqh-halal-haram-front-1024.webp](assets/textures/books/fiqh-halal-haram-front-1024.webp) | 724 × 1024 | 81,422 | 0.707031250 |

## Fiqh Al-Quran dan Sunnah

- Slug: `fiqh-quran-sunnah`
- PDF: [`kitab/Fiqh-Al-Quran-dan-Sunnah_Ahmad-Muzzammil_2026.pdf`](kitab/Fiqh-Al-Quran-dan-Sunnah_Ahmad-Muzzammil_2026.pdf)
- SHA-256 PDF: `b8952c1d264f5105a11ed80dc234b2f8165ba2ed378223285798adbc25bf88e4`
- Jumlah halaman: 170; depan: indeks 0; belakang: `null`.
- Kulit belakang: Tiada; halaman akhir ialah bibliografi dan bacaan tambahan.
- Halaman disemak (indeks): 0, 1, 2, 3, 167, 168, 169.
- Render 300 DPI: 2479 × 3508 px; nisbah PDF W/H: 0.706670435.
- Warna dominan cadangan untuk spine: `#022B59`. Ini warna sampel kulit, bukan imej spine sebenar.

| Tekstur | Lebar × tinggi | Bait | Nisbah W/H |
|---|---:|---:|---:|
| [fiqh-quran-sunnah-front-2048.webp](assets/textures/books/fiqh-quran-sunnah-front-2048.webp) | 1447 × 2048 | 390,254 | 0.706542969 |
| [fiqh-quran-sunnah-front-1024.webp](assets/textures/books/fiqh-quran-sunnah-front-1024.webp) | 724 × 1024 | 141,254 | 0.707031250 |

## Integrasi

`assets/textures/books/manifest.json` ialah array metadata lengkap termasuk hash tekstur. Gunakan `aspect_ratio` untuk bentuk buku, `textures[].path` relatif kepada akar laman, dan `dominant_color_hex` untuk spine neutral. Gunakan bahan neutral bagi belakang kerana `back_page_index` ialah `null`. Tetapkan tekstur kulit sebagai sRGB pada Three.js. Ketebalan buku bukan ukuran fizikal yang disahkan.

Warna dominan dipilih daripada warna paling banyak dalam palet median-cut 8 warna bagi keseluruhan kulit yang dikecilkan ke 128 px. Tekstur 2048 px meningkatkan resolusi fail keluaran; ia tidak menambah butiran kepada imej raster yang sudah terkandung dalam PDF.
