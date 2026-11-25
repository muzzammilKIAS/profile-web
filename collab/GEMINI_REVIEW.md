<!-- Nota Claude: tangkapan dalam qa/baseline/, qa/round2/ dan qa/round3/ kemudiannya dimampatkan daripada .png kepada .jpg (nama fail sama). Teks Gemini di bawah tidak diubah. -->
<!-- Output Gemini (Antigravity CLI agy 1.5.17), pusingan 1, disimpan tanpa suntingan oleh Claude. -->

# GEMINI REVIEW — Audit Visual, Art Direction & Storyboard Imersif 3D

**Peranan:** Penyemak Kreatif / Visual (Gemini)  
**Sasaran integrasi:** Branch `immersive-3d` (berdasarkan baseline `a22d568` — `index.html`, `styles.css`, `script.js`)  
**Skop dokumen:** Cadangan boleh laksana untuk integrasi Claude (`immersive.css`, `index.html`, `js/**`) dan Codex (pengoptimuman `jamiah-imam.glb` & bahan PBR).

---

## Ketelusan Bahan yang Dikaji

- **Berjaya dibuka dan diperiksa secara visual (imej sebenar):**
  - Desktop BM (1440×900): `qa/baseline/base-desktop-ms-00-top.png`, `01-tentang.png`, `02-akademik.png`, `03-bidang.png`, `04-pencapaian.png`, `05-penerbitan.png`, `06-aplikasi.png`, `07-pengalaman.png`, `08-hubungi.png`.
  - Mobile BM (390×844): `qa/baseline/base-mobile-ms-00-top.png`, `01-tentang.png`, `02-akademik.png`, `04-pencapaian.png`, `05-penerbitan.png`, `08-hubungi.png`.
  - Desktop & Mobile Arab/RTL: `qa/baseline/base-desktop-ar-00-top.png`, `01-tentang.png`, `02-akademik.png`, `05-penerbitan.png`, `08-hubungi.png`, `base-mobile-ar-00-top.png`.
  - Rujukan 3D: `qa/reference/jamiah-art-direction.jpg` (render konsep maquette) dan `qa/reference/jamiah-original.jpg` (foto rujukan hadapan masjid/gerbang kampus).
  - Kod sumber penuh: `collab/MASTER_PROMPT.md`, `collab/PLAN.md`, `collab/BASELINE.md`, `index.html`, `styles.css`, `script.js`, dan `assets/models/jamiah-imam-preview.html`.
- **Tidak dapat dibuka / tidak tersedia dalam semakan ini (dinyatakan secara jujur):**
  - `assets/models/jamiah-imam.glb`: fail binari 3D tidak dapat dirender secara langsung dalam persekitaran bacaan sahaja ini; penilaian geometri/PBR dibuat daripada `jamiah-art-direction.jpg`, `jamiah-original.jpg`, tetapan kamera `jamiah-imam-preview.html`, dan spesifikasi struktur dalam `collab/MASTER_PROMPT.md` (1,520 mesh, 1 material, 1 tekstur).
  - Mod gelap (`data-theme="dark"`), bahagian sijil/kepujian bawah dalam `#pencapaian`, serta keadaan animasi/intro/hover tiada screenshot dalam `qa/baseline/`; penilaian mod gelap dibuat secara langsung daripada token warna dalam `styles.css` (baris 30–43, 359–360).
  - Penyenaraian direktori melalui shell (`ls`) disekat oleh konfigurasi sandbox, jadi hanya fail yang dinamakan secara eksplisit dibuka terus.

---

## 1. DNA Visual Asal yang Mesti Kekal

Identiti laman asal sudah matang dan berbeza daripada portfolio teknologi biasa. Lima teras berikut wajib dikekalkan dan dinaik taraf (bukan dibuang):

1. **Kaleidoskop Simetri 2N Berasaskan Kanvas (`script.js:254–360`):**
   - Struktur 16 baji (`intro`, `hero`) dan 12 baji (`arch`, `contact`) yang dicerminkan (`ctx.scale(1, -1)`), 3 gelang emas sepusat (`0.18, 0.34, 0.52`), serta palet 6 warna (`#dcc48b`, `#f6f0de`, `#2f7d5f`, `#3b6491`, `#b8954a`, `#1a5a46`).
   - Bukti visual: latar kanan hero yang berbaur lembut (`base-desktop-ms-00-top.png`, dicermin ke kiri pada `base-desktop-ar-00-top.png`), latar dalam gerbang potret `.heritage-art`, sudut atas kad anugerah (`base-desktop-ms-04-pencapaian.png`), dan kotak penutup (`base-desktop-ms-08-hubungi.png`).
   - Prinsip kejuruteraan asal yang baik: lukis sekali pada resolusi tajam, putaran perlahan pada GPU melalui CSS `rotate` berasingan daripada `transform` scroll (`--scroll-zoom`, `--scroll-turn`).

2. **Gerbang/Arch Mihrab sebagai Bingkai Utama:**
   - Kad hero berkubah (`.hero-card`, `border-radius: 240px 240px 26px 26px`) yang memuatkan `.heritage-art` berbingkai garis emas berkembar (`inset: 14px` & `25px`), berlian puncak `.art-star`, bingkai potret emas `conic-gradient`, dan plat nama Arab `.portrait-nameplate` (`أحمد مزمّل محمد نجيب`) (`base-desktop-ms-00-top.png`, `base-mobile-ms-00-top.png`, `base-desktop-ar-00-top.png`).
   - Lengkung editorial asimetri `.about-note` (`8px 90px 8px 90px`, `base-desktop-ms-01-tentang.png`) sebagai gema visual gerbang.

3. **Rozet & Bintang Lapan (Rub el Hizb):**
   - Ikon jenama `.brand-mark` (40×40px) di header (`base-desktop-ms-00-top.png`), rozet SVG 400×400 berputar bertentangan arah di belakang potret (`.rosette` vs `.rosette-inner`), serta bintang kembar `.portrait-star.s1/.s2`.

4. **Palet Editorial Ivory × Deep Emerald × Champagne Gold (+ sentuhan Lapis):**
   - Latar kertas gading `#f8f5ec` / `#f0ebdd` berpasangan dengan blok zamrud gelap `#0d3a2d` (`.heritage-art`, `.about-note`, `.research-card.featured`, `.award-card`, `.contact-box`) dan aksen emas `#98712b` / `#dcc48b` (`base-desktop-ms-00-top.png`, `01-tentang.png`, `03-bidang.png`, `08-hubungi.png`). Gabungan ini membawa wibawa kesarjanaan Islam, bukan tema korporat dingin.

5. **Tipografi Editorial Tribahasa:**
   - `Cormorant Garamond` (weight 500, tracking rapat) untuk tajuk Latin memberi rasa buku ilmiah (`base-desktop-ms-00-top.png`, `02-akademik.png`, `05-penerbitan.png`), dipadankan dengan `Plus Jakarta Sans` untuk badan teks, serta `Noto Kufi Arabic` (tajuk) dan `Amiri`/serif Arab untuk teks Arab (`base-desktop-ar-00-top.png`, `01-tentang.png`, `08-hubungi.png`).

---

## 2. Kelemahan Visual Sebenar & Cadangan Spesifik

Setiap isu di bawah disahkan terus daripada screenshot baseline dan kod `styles.css`.

### A. Header & Ruang Atas
1. **Kandungan yang ditatal bocor di belakang header melekit (`.site-header`):**
   - *Bukti:* Dalam `base-desktop-ms-01-tentang.png`, `base-desktop-ar-01-tentang.png`, `base-mobile-ms-01-tentang.png`, `base-mobile-ms-02-akademik.png`, dan `base-mobile-ms-08-hubungi.png`, angka statistik (`10+`, `9`, `3.81`, `C1`) dan teks (`Bahasa Arab Rabbani`) jelas bertindih di belakang logo `Ahmad Muzzammil` dan pautan navigasi.
   - *Punca:* `styles.css:65` guna `background: color-mix(in srgb, var(--bg) 94%, transparent)` tanpa kabur latar.
   - *Cadangan CSS:*
     ```css
     .site-header {
       background: color-mix(in srgb, var(--bg) 86%, transparent);
       backdrop-filter: blur(14px) saturate(1.1);
       -webkit-backdrop-filter: blur(14px) saturate(1.1);
     }
     @supports not (backdrop-filter: blur(1px)) {
       .site-header { background: var(--bg); }
     }
     ```

### B. Komposisi Hero & Duplikasi Potret
2. **Wajah potret diulang dua kali dalam kad yang sama & `scroll-cue` terkeluar daripada lipatan 1440×900:**
   - *Bukti:* `base-desktop-ms-00-top.png` dan `base-desktop-ar-00-top.png` memaparkan potret besar dalam mihrab emas diikuti terus di bawahnya oleh `.avatar` bulat (52×52px) yang mengulang gambar sama. Ketinggian `.heritage-art` (440px) + `.dossier` menolak `.hero-bottom` ke luar skrin 900px.
   - *Cadangan:* Buang foto berulang dalam `.avatar` (ganti dengan lambang bintang-8 kecil `36px` atau ringkaskan kepada baris label bersih tanpa avatar). Laras `.heritage-art { height: clamp(320px, 39vh, 390px); }` dan `.hero { padding-block: clamp(28px, 4vh, 52px) 24px; }` supaya keseluruhan kad hero dan `.hero-bottom` kelihatan lengkap dalam 1440×900.

### C. Tipografi, Skala Mikro & Nada Aksen
3. **Saiz teks UI terlalu kecil (9–10px) untuk kebolehbacaan akademik:**
   - *Bukti:* `base-desktop-ms-00-top.png` (`.dossier-row` `10px`, `.hero-kicker` `10px`, `.identity small` `9px`), `base-desktop-ms-08-hubungi.png` (`.site-footer` `10px`, `.contact-location` `11px`).
   - *Cadangan CSS:* Tetapkan paras lantai `12px` (`0.75rem`) untuk semua label/meta/dossier/footer:
     ```css
     .eyebrow, .hero-kicker, .stat-label, .identity small, .site-footer { font-size: 12px; }
     .dossier-row { font-size: 12.5px; grid-template-columns: 76px 1fr; }
     ```
4. **Fon `Baloo 2` bercanggah dengan wibawa editorial & monogram Arab `ر` sukar dibaca:**
   - *Bukti:* `base-desktop-ms-03-bidang.png` (`01/02/03`), `base-desktop-ms-06-aplikasi.png` (`e-Hadis40`, `Haji Pintar`, `Rabbaniyyah`). Lengkungan bulat `Baloo 2` memberi nada kasual yang kurang padan dengan `Cormorant Garamond`. Selain itu, dalam `base-desktop-ms-06-aplikasi.png`, huruf tunggal `ر` pada kad `Rabbaniyyah` dalam `Noto Kufi Arabic` kelihatan seperti huruf Latin `J`.
   - *Cadangan:* Tukar `.stat-number`, `.research-card .number`, `.publication-year`, `.cert-year` kepada `Cormorant Garamond` (`font-weight: 600; font-variant-numeric: lining-nums tabular-nums;`) dan `.app-head h3`, `.chip`, `.grade` kepada `Plus Jakarta Sans` (`font-weight: 600–700`). Untuk monogram Arab `.app-mono:lang(ar)`, guna `font-family: 'Amiri', serif; font-size: 24px; line-height: 1;`.

### D. Kepadatan Kad, Ruang & Kontras
5. **Watermark `.lively::after` berulang pada hampir setiap kad sehingga bertindih dengan teks/pil:**
   - *Bukti:* Dalam `base-desktop-ms-05-penerbitan.png`, pil `Buku`/`Artikel jurnal` duduk tepat di atas bintang watermark; dalam `base-mobile-ms-02-akademik.png`, tarikh `2022–2024` memotong garisan bintang; dalam `base-desktop-ms-06-aplikasi.png`, corak sama diulang 9 kali.
   - *Cadangan CSS:* Hadkan `.lively::after` hanya kepada kad tumpuan (`.research-card.featured`, `.award-card`, `.about-note`). Buang `::after` daripada `.timeline-card`, `.publication`, `.cert-card`, `.app-card`, dan `.panel`.
6. **Panjang halaman berlebihan (11,291px desktop; 19,139px mobile) dan senarai penerbitan terlalu "berkotak":**
   - *Bukti:* `base-desktop-ms-05-penerbitan.png` (12 kad bersempadan penuh yang menggantikan gaya garisan editorial baris 168 dengan blok baris 463), `base-desktop-ms-01-tentang.png` (ruang kosong vertikal terlalu tinggi antara `#tentang` dan `#akademik`).
   - *Cadangan:* Kembalikan `.publication` kepada baris editorial nipis (`border: 0; border-bottom: 1px solid var(--border); border-radius: 0; background: transparent; padding: 18px 10px;`) dengan tahun `72px` dan pil status sejajar atas. Turunkan `--section: clamp(56px, 6.5vw, 96px);`.
7. **Kaleidoskop bersaing dengan teks di atas kad gelap & pembezaan Emas vs Perak terlalu lemah:**
   - *Bukti:* `base-mobile-ms-08-hubungi.png` dan `base-mobile-ms-04-pencapaian.png` menunjukkan bentuk bintang kaleidoskop (`opacity: 0.30–0.38`) jatuh tepat di belakang tajuk putih. Dalam `base-desktop-ms-04-pencapaian.png`, kad `Pingat Emas` dan `Anugerah Perak` kelihatan hampir seragam.
   - *Cadangan CSS:* Tambah scrim perlindungan teks di atas kanvas (`linear-gradient(110deg, rgba(6,22,17,.9) 0%, rgba(13,58,45,.62) 55%, rgba(13,58,45,.15) 100%)`), turunkan `.contact-kaleido`/`.award-kaleido` kepada `opacity: .20` pada `<=680px`, dan bezakan `.award-card` perak dengan nada zamrud-slate lebih sejuk (`#11312c` → `#081817`) + trim atas `#cfd6d4` berbanding trim champagne `#dcc48b` pada kad emas.

### E. Mobile (390×844)
8. **Suis bahasa hilang dari bar atas mobile & potret hero terpotong di bawah fold:**
   - *Bukti:* `base-mobile-ms-00-top.png` dan `base-mobile-ar-00-top.png`. `.lang-switch.in-header` disembunyikan pada `<=680px` (`styles.css:659`), menyukarkan pelawat antarabangsa/Arab menukar bahasa segera. Di samping itu, bahagian atas mihrab potret terkerat pada paras mata di skrin 844px.
   - *Bukti tambahan (`base-mobile-ms-05-penerbitan.png`):* 7 cip tapisan membungkus kepada 2 baris tebal dan jarak anak panah `Muat turun PDF ↗` (`margin-left: 14px`) nampak terpisah.
   - *Cadangan CSS:*
     - Kekalkan butang suis bahasa padat (3 pilihan ringkas atau kitaran `BM/EN/ع`) dalam header mobile (`min-height: 44px`).
     - Jadikan `.chip-row` pada `<=680px` sebagai jalur tatal mendatar (`flex-wrap: nowrap; overflow-x: auto; padding-bottom: 4px; -webkit-overflow-scrolling: touch;`).
     - Padatkan `.hero` mobile (`padding-top: 20px;`) dan `.hero-actions` kepada `display: grid; grid-template-columns: 1fr 1fr; gap: 10px;` supaya potret mihrab naik lebih penuh ke dalam fold.

### F. Bahasa Arab / RTL (6 Kecacatan Sebenar)
9. **Bar kemajuan bacaan bergerak songsang (kiri ke kanan) dalam RTL:**
   - *Bukti:* `base-desktop-ar-01-tentang.png`, `02-akademik.png`, `05-penerbitan.png` — garis emas `.reading-progress` bermula dari kiri.
   - *Cadangan CSS:* `html[dir='rtl'] .reading-progress { transform-origin: right; }`
10. **Tajuk penerbitan BM/EN dalam paparan Arab tercampak ke kiri jauh daripada tahun dan metadata kanan:**
    - *Bukti:* `base-desktop-ar-05-penerbitan.png` — `2026` dan `eISBN · الطبعة الأولى` sejajar kanan, tetapi `Fiqh Halal dan Haram...` sejajar kiri kerana `dir="ltr"` menjadikan `text-align: start` bernilai `left`.
    - *Cadangan CSS:* `html[lang='ar'] .publication-title[dir='ltr'] { text-align: right; unicode-bidi: isolate; }`
11. **Elemen teks tidak diterjemah dalam mod Arab & jenama header kekal Latin:**
    - *Bukti:* `Ahmad Muzzammil` di header (`base-desktop-ar-00-top.png`, `base-mobile-ar-00-top.png`) dan lencana `Mumtaz · 3.74/4` (`base-desktop-ar-02-akademik.png`) kekal Latin/BM.
    - *Cadangan:* Tambah `data-i18n` pada `.brand-text` (`أحمد مزمّل`) dan `.grade` (`ممتاز · 3.74/4`), serta guna `font-family: var(--font-ar-display)` pada jenama Arab.
12. **Dekorasi `::after` dan sudut asimetri tidak dicerminkan dalam RTL:**
    - *Bukti:* `base-desktop-ar-08-hubungi.png` (garisan berlian `.contact-box::after` masih di kanan tepat di belakang tajuk Arab `تواصل / للتعاون العلمي`); `base-desktop-ar-01-tentang.png` (bintang `.about-note::after` kekal di kanan di belakang teks Arab dan bucu `8px 90px 8px 90px` tidak diterbalikkan).
    - *Cadangan CSS:*
      ```css
      html[dir='rtl'] .about-note { border-radius: 90px 8px 90px 8px; }
      html[dir='rtl'] .about-note::after { right: auto; left: 10px; }
      html[dir='rtl'] .contact-box::after { right: auto; left: -180px; }
      ```
13. **Anak panah pautan PDF tidak dicermin & jarak `margin-left` keras:**
    - *Bukti:* `base-desktop-ar-05-penerbitan.png` (`تحميل ملف PDF ↗` mempunyai ruang aneh di kiri).
    - *Cadangan CSS:* Ganti `margin-left: 14px` pada `.publication-link::after` kepada `margin-inline-start: 8px; font-size: 16px; display: inline-block;` dan tambah `html[dir='rtl'] .publication-link::after { transform: scaleX(-1); }`.
14. **Kesan `.sheen` pada tajuk Arab memecahkan warna pada satu huruf sahaja:**
    - *Bukti:* `base-mobile-ar-00-top.png` — hanya huruf `ل` pada `أحمد مزمّل` menjadi keemasan, nampak seperti ralat warna.
    - *Cadangan CSS:* Untuk `html[lang='ar'] .sheen`, guna kecerunan lembut lebar penuh atau matikan `background-clip: text` pada skrip bersambung Arab (`color: var(--text);` dengan garis bawah aksen emas halus) supaya sambungan huruf (*ligatures*) kekal sempurna merentas pelayar.

---

## 3. Art Direction untuk Versi Imersif

Arah seni menggabungkan DNA editorial parchment/zamrud laman asal dengan keanggunan **maquette seni bina muzium** seperti dalam `qa/reference/jamiah-art-direction.jpg` (batu pasir Riyadh yang hangat, lattice gangsa gelap, kubah kelabu-slate berjalur, tapak granit gelap) — disatukan secara organik ke dalam halaman tanpa kotak WebGL yang terasing.

### A. Palet Rasmi (Tepat & Accessible WCAG AA/AAA)

| Peranan | Mod Cerah (*Ivory & Riyadh Sandstone*) | Mod Gelap (*Emerald Night & Lantern Gold*) | Catatan Kontras / Guna |
|---|---|---|---|
| Latar utama (`--bg`) | `#F7F3E8` | `#081410` | Kanvas halaman & latar neutral babak |
| Latar sekunder (`--bg-soft`) | `#EDE6D6` | `#0D1D17` | Pembahagi bab halus |
| Permukaan kad (`--surface`) | `#FFFDF8` | `#12251E` | Kad maklumat & panel editorial |
| Permukaan lembut (`--surface-muted`) | `#E5DEC9` | `#1A3128` | Pil status, hover lembut |
| Zamrud utama (`--forest`) | `#0B3529` | `#0B3529` | Blok tumpuan, CTA utama, mihrab |
| Zamrud aksen (`--teal`) | `#195340` | `#8BC7A5` | Peranan, pautan, label institusi |
| Teks utama (`--text`) | `#0F2F26` | `#F2ECE0` | Kontras > 12:1 (cerah) / > 14:1 (gelap) |
| Teks sekunder (`--text-soft`) | `#3A4F46` | `#C4CFC2` | Perenggan badan (> 7.5:1) |
| Teks meta (`--muted`) | `#5B665A` | `#96A898` | Metadata, kapsyen (> 5.2:1) |
| Emas teks/aksen (`--gold`) | `#8E6723` | `#DFC487` | Eyebrow, tahun, sempadan aktif (≥ 4.6:1 atas `#FFFDF8`) |
| Emas champagne (`--gold-soft`) | `#D8BE82` | `#C8AC6B` | Trim mihrab, garis hairline, aksen atas gelap |
| Batu pasir 3D (`--sandstone`) | `#D4BC96` | `#B59971` | Jambatan tona antara UI dan model Jamiah |
| Lapis (`--lapis`) | `#23466E` | `#89AED8` | Status "Dalam penulisan" & aksen kaleidoskop |
| Sempadan (`--border`) | `#D9D0BA` | `#263E34` | Garis pemisah 1px |

### B. Pencahayaan & Suasana Babak 3D Jamiah Imam

Elakkan langit biru terang menyilau seperti foto `jamiah-original.jpg`; pilih **suasana galeri/editorial** supaya model 3D menyatu dengan halaman:

- **Mod Cerah (*Riyadh Morning Gallery*):**
  - **Latar babak:** Renderer lutsinar (`alpha: true`) di atas latar CSS radial lembut `radial-gradient(ellipse 68% 60% at 50% 48%, #FFFDF7 0%, #F4EDE0 55%, #E9DFC9 100%)`.
  - **Kabus (`FogExp2`):** `#F2ECDC`, ketumpatan `0.0042` (hanya melembutkan sudut jauh kompleks ketika dolly-out 60% & 100%).
  - **Key Light (`DirectionalLight`):** `#FFF1D6`, intensiti `2.35`, azimuth `+42°` (kanan hadapan), elevation `48°` — menghasilkan bayang seni bina lembut ke kiri-belakang seperti `jamiah-art-direction.jpg`. Shadow map `2048` (desktop) / `1024` (mobile), `shadow.bias = -0.0004`, `shadow.normalBias = 0.03`.
  - **HemisphereLight:** langit `#F5F0E4`, lantunan tanah batu pasir `#C2A882`, intensiti `0.85`.
  - **Rim Light (`DirectionalLight`):** `#CFE2D9` (sentuhan zamrud-dingin), intensiti `0.55`, azimuth `-138°`, elevation `24°` untuk memisahkan siluet menara dan kubah.
  - **Tone Mapping:** `ACESFilmicToneMapping`, `exposure: 1.04`, `RoomEnvironment` neutral-hangat (`envMapIntensity: 0.42`).
- **Mod Gelap (*Senja Zamrud Riyadh*):**
  - **Latar babak:** `radial-gradient(ellipse 64% 58% at 50% 48%, #15362A 0%, #0C2019 52%, #081410 100%)`.
  - **Kabus (`FogExp2`):** `#091813`, ketumpatan `0.0058`.
  - **Key Light (cahaya bulan sejuk-hangat):** `#D8E6E0`, intensiti `1.15`, azimuth `+42°`, elevation `42°`.
  - **Cahaya halaman/portal (`PointLight` tunggal):** `#F4B86A`, intensiti `1.4`, `distance: 20`, `decay: 2` diletakkan di belakang pintu gerbang lattice untuk mencipta siluet geometri bintang yang hangat tanpa bloom melampau.
  - **Rim Light:** `#73AF97`, intensiti `0.85`, `exposure: 0.96`.

### C. Bahan PBR Batu Pasir, Kubah, Menara & Lattice

Berdasarkan `jamiah-art-direction.jpg`, `jamiah-original.jpg`, dan kekangan `jamiah-imam.glb` (1 material/tekstur asal yang wajib dipelihara UV dan rupanya oleh Codex):

- **Batu pasir Najdi / limestone dinding & menara:** tona `#E4D1B2` (bercahaya) → `#C7AB82` (teduh), `roughness: 0.88`, `metalness: 0.0`, `envMapIntensity: 0.35`. Jangan buat permukaan licin atau berkilat seperti plastik.
- **Kubah berjalur (*ribbed dome*) & puncak menara:** kelabu-slate anodized `#5E656B` (puncak menara `#3A4047`), `roughness: 0.44`, `metalness: 0.38`, `envMapIntensity: 0.72` — menangkap sorotan cahaya halus ketika putaran 80%.
- **Skrin pintu gerbang / mashrabiyya:** gangsa teroksida gelap `#473A2C`, `roughness: 0.38`, `metalness: 0.62` supaya tepi corak bintang berkilau lembut semasa dolly-in 20%.
- **Tapak/plinth & bayang sentuh:** granit gelap matte `#302F2C` (`roughness: 0.80`) ditambah satah bayang radial lutsinar di bawah plinth supaya model terasa kukuh berpijak, bukan terapung.
- *Nota kejuruteraan:* Jika `jamiah-imam.opt.glb` kekal 1 material tunggal, guna nilai kompromi matte-mineral (`roughness: 0.82`, `metalness: 0.06`, `envMapIntensity: 0.42`) dan serahkan variasi tona kepada peta tekstur asal serta `roughnessMap` yang dijana daripada nilai luminans/warna tekstur jika Codex menyokongnya.

### D. Kaleidoskop & Seni Bina Islam sebagai Bingkai/Transisi Tanpa Ganggu Bacaan

- **Bingkai Portal Seni Bina (bukan ulangan kad):**
  - Pentas 3D `#jamiah` dibingkai oleh garisan lengkung gerbang halus (`1px solid color-mix(in srgb, var(--gold-soft) 35%, transparent)`, `border-radius: 36px 36px 16px 16px` pada desktop; lengkung atas halus pada hero) bersama penanda puncak berlian 8px — menjadi jambatan visual terus daripada `.heritage-art` di hero ke pentas 3D Jamiah.
  - Antara bab utama, gunakan **pembahagi friz geometri nipis** (garisan `1px` dengan bintang-8 emas `12px` di tengah), bukan kanvas besar di setiap seksyen.
- **Peraturan Kaleidoskop & Keterbacaan:**
  - Hero: 16 baji, `opacity: 0.14` (cerah) / `0.24` (gelap), topeng radial kuat yang memastikan ruangan teks kiri mempunyai `0%` gangguan visual.
  - Bab `#jamiah`: lapisan kaleidoskop ultra-halus (`opacity: 0.07` cerah / `0.11` gelap) di belakang kanvas WebGL, berputar perlahan selari `progress * 60deg` supaya terasa seperti halo seni bina, bukan saingan kepada model 3D.
  - `#pencapaian` (kad anugerah) & `#hubungi` (penutup): kekalkan kaleidoskop 12 baji tetapi wajib bertopeng scrim kecerunan gelap di bawah teks.
  - Seksyen bacaan padat (`#tentang`, `#akademik` senarai penuh, `#penerbitan`, `#pengalaman`): **sifar kaleidoskop di belakang teks**; biarkan ruang putih dan tipografi bernafas.

---

## 4. Storyboard Scroll — Bab Jamiah Imam (0% → 100%)

- **Mekanik paksi:** Progress `p ∈ [0, 1]` daripada sticky scroll container (`height: 460vh` desktop; `420vh` mobile) memutar **yaw model `0° → 360°` (`0 → 2π`)** secara linear dengan GSAP `scrub: 0.85` (mobile `0.65`). **Kamera tidak berputar yaw** — kamera kekal pada azimuth asas `+18°` (memberi sudut frontal 3/4 ikonik pada `yaw = 0°` dan `360°`) dan hanya menginterpolasi **jarak relatif (`distance`)**, **elevation**, serta **sasaran pandangan (`target`)**.
- **Kerangka koordinat target:** `(x, y, z)` dinyatakan relatif kepada saiz *bounding box* model (`W` = lebar, `H` = tinggi, `D` = dalam), pusat `(0, 0, 0)`. Anjakan `target.x` mengimbangi model ke sisi bertentangan kad teks supaya tiada pertindihan. Dalam **RTL (`dir="rtl"`)**, tukar sisi kad (Kiri ↔ Kanan) dan songsangkan tanda `target.x` (`x → -x`).
- **Ketepatan fakta:** Kad maklumat memaparkan 3 kelayakan sebenar di Universiti Islam Imam Muhammad bin Saud, Riyadh **tanpa** melabelkan mana-mana sayap bangunan 3D sebagai fakulti atau institut tertentu.

| Progress | Yaw Model | Jarak Relatif | Elevation | Sasaran Pandangan `(x, y, z)` | Kedudukan Kad (LTR / RTL) | Kandungan & Transisi Teks |
|---:|---:|---:|---:|---|---|---|
| **0%** | `0°` (`0`) | `1.00×` | `22°` | `(0, +0.05H, 0)` — pusat fasad & keseluruhan kompleks | **Kiri bawah** / *Kanan bawah (RTL)* · maks `350px` | **Pengenalan Bab:** *"Riyadh, 2015–2024 · Universiti Islam Imam Muhammad bin Saud — Sembilan tahun pengajian bahasa Arab, syariah dan fiqh perbandingan."*<br>**Transisi:** Mask reveal dari bawah (`clip-path: inset(0 0 100% 0) → 0%`, `y: 16px → 0`), garis emas hairline meluas `scaleX(0 → 1)`. |
| **20%** | `72°` (`0.4π`) | `0.72×` | `15°` | `(-0.10W, -0.04H, +0.16D)` — merapat ke pintu gerbang & lattice (model sedikit ke kanan) | **Kiri tengah** / *Kanan tengah (RTL)* · maks `360px` | **Kad 1 — Diploma:** *Diploma Bahasa Arab dan Pengajian Islam* · Fakulti Bahasa Arab, Universiti Islam Imam Muhammad bin Saud, Riyadh · **2015–2017** · `Mumtaz · 3.94/4`.<br>**Transisi:** Kad Pengenalan keluar pada `p = 0.11–0.15` (`y: -10px, opacity: 0`); Kad 1 masuk `p = 0.16–0.23` dengan stagger 60ms (tahun → tajuk → institusi → lencana). |
| **40%** | `144°` (`0.8π`) | `0.95×` | `34°` | `(0, +0.02H, 0)` — pandangan serong tinggi (*bird's-eye*) halaman & susun atur kompleks | **Bawah tengah** (kapsyen ringkas 1 baris, tiada kad besar) | **Transisi Pendidikan:** *"Daripada asas bahasa Arab ke pengkhususan syariah"* — memberi ruang pernafasan penuh kepada seni bina 3D semasa kamera menaik.<br>**Transisi:** Kad 1 pudar keluar `p = 0.33–0.37`; kapsyen crossfade lembut `p = 0.38–0.47` (`opacity: 0 → 1 → 0`), titik penunjuk kemajuan beralih ke fasa 2. |
| **60%** | `216°` (`1.2π`) | `1.15×` | `28°` | `(+0.09W, +0.04H, 0)` — dolly out lebar kampus penuh dari sudut bertentangan (model sedikit ke kiri) | **Kanan tengah** / *Kiri tengah (RTL)* · maks `360px` | **Kad 2 — Sarjana Muda:** *Sarjana Muda Syariah (Kepujian)* · Fakulti Syariah, Universiti Islam Imam Muhammad bin Saud, Riyadh · **2017–2020** · `Mumtaz · 3.98/4`.<br>**Transisi:** Pertukaran sisi mencipta ritma editorial; Kad 2 masuk `p = 0.55–0.63` (`x: +16px → 0`, RTL `-16px → 0`, `opacity: 0 → 1`) dengan sorotan halus angka `3.98/4`. |
| **80%** | `288°` (`1.6π`) | `0.70×` | `12°` | `(-0.08W, +0.26H, -0.04D)` — sudut rendah mendongak, fokus kubah berjalur & puncak menara | **Kiri tengah** / *Kanan tengah (RTL)* · maks `360px` | **Kad 3 — Sarjana:** *Sarjana Fiqh Perbandingan* · Institut Kehakiman Tinggi, Universiti Islam Imam Muhammad bin Saud, Riyadh · **2022–2024** · `Mumtaz · 3.74/4`.<br>**Transisi:** Kad 2 keluar `p = 0.72–0.76`; Kad 3 masuk `p = 0.77–0.84` dengan mask reveal menegak + trim atas emas champagne menandakan kemuncak pengajian. |
| **100%** | `360°` (`2π`) | `1.00×` | `22°` | `(0, +0.05H, 0)` — kembali tepat ke orientasi fasad asal 3/4 | **Bar bawah tengah** (kompak, lutsinar berkabur) | **Penutup & Mod Teroka:** Ringkasan *"Mumtaz ×3 · 2015–2024"* + butang **Teroka 360°** (mengaktifkan `OrbitControls`, Zoom +/−, Reset, Keluar/Esc) dan pautan ke garis masa penuh `#akademik` (termasuk Tripoli, Tahfiz, Hamza C1, OUM).<br>**Transisi:** Kad 3 keluar `p = 0.90–0.93`; bar kawalan muncul `p = 0.94–1.00`. Model berhenti tenang (*settle*), tiada auto-rotate. |

- **Laras Mobile (`<=768px`):** Kanvas 3D mengambil `58svh` di bahagian atas (sasaran `target.y` dilaras sedikit ke bawah `-0.04H` agar model berpusat kemas), manakala kad maklumat dipaparkan sebagai panel bawah padat (maks `32svh`, sudut atas `20px`) supaya kad tidak pernah menutup model 3D.
- **Laras `prefers-reduced-motion` / Mod Jeda:** Tampilkan pose statik `p = 0%` (atau poster pra-render tajam) dengan 3 butang loncatan fasa (`Diploma`, `Sarjana Muda`, `Sarjana`) yang menukar sudut kamera serta-merta tanpa tatalan berterusan, serta pilihan butang `Teroka 360°`.

---

## 5. Token Gerakan & Keyframe Gerakan Hero

### A. Token Gerakan Sistem (`immersive.css` & `js/`)

```css
:root {
  /* Durasi */
  --dur-micro: 180ms;        /* hover butang, suis, fokus */
  --dur-ui: 300ms;           /* dropdown, cip, indikator nav */
  --dur-reveal: 680ms;       /* kemasukan kad & seksyen */
  --dur-editorial: 900ms;    /* mask reveal tajuk & gerbang hero */
  --dur-veil: 600ms;         /* tirai tukar bahasa */
  --dur-rosette-outer: 110s; /* putaran rozet luar */
  --dur-rosette-inner: 72s;  /* putaran rozet dalam (songsang) */
  --dur-kaleido-hero: 240s;  /* putaran ambien kaleidoskop */

  /* Easing (editorial terkawal — tiada lantunan/overshoot) */
  --ease-editorial: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-settle: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-curtain: cubic-bezier(0.76, 0, 0.24, 1);
  --ease-hover: cubic-bezier(0.25, 0.8, 0.25, 1);

  /* Stagger */
  --stagger-hero: 75ms;
  --stagger-cards: 65ms;     /* hadkan kepada maks 4 elemen serentak */
  --stagger-list: 45ms;

  /* Amplitud transform terkawal */
  --lift-hover: -4px;        /* kurangkan daripada -10px asal */
  --reveal-y: 18px;
  --parallax-hero: 24px;     /* 0px pada mobile & reduced-motion */
}
```

- **Token JS/GSAP:** `SCRUB_DESKTOP = 0.85`, `SCRUB_MOBILE = 0.65`, `CAMERA_EASE = 'power2.inOut'`, `MANUAL_DAMPING = 0.08`, `RESUME_BLEND_MS = 550`.
- **Pembetulan easing asal:** Gantikan `cubic-bezier(.34, 1.56, .64, 1)` pada `.dropdown-menu` (`styles.css:377`) dan `.pop-in` (`styles.css:580`) kepada `var(--ease-editorial)`.

### B. 7 Keyframe Gerakan untuk Hero (`t = 0ms → 1350ms` + Tatalan)

Direka supaya **tidak menyekat LCP** (potret `muzzammil.jpg` dan H1 sudah sedia dipapar awal tanpa kelewatan kosong).

| Keyframe | Masa / Pencetus | Elemen Sasaran | Gerakan & Sifat Animasi |
|---|---|---|---|
| **KF-01** | `0–220ms` | `.hero-kaleido` & latar | Lapisan kaleidoskop 16-baji pudar masuk (`opacity: 0 → 0.14` cerah / `0.24` gelap) + `scale(1.04 → 1)` dengan `--ease-editorial`. |
| **KF-02** | `60–540ms` | `.hero-card` & `.heritage-art` | Bingkai gerbang mihrab membuka dengan `scale(0.97 → 1)` (`--ease-settle`); trim emas berkembar (`::before`/`::after`) menyala `opacity: 0 → 1`. Potret `<img>` kekal `opacity: 1` untuk LCP pantas dengan un-zoom halus `scale(1.06 → 1.0)`. |
| **KF-03** | `120–680ms` | `.hero-kicker`, `h1` (baris 1–2), `.hero-patronym` | Stagger `75ms`: kicker naik `y: 10px → 0`; nama `Ahmad / Muzzammil` terbuka melalui mask menegak (`clip-path: inset(0 0 100% 0) → inset(0 0 0% 0)`, `y: 14px → 0`); `Mohammad Najib` menyusul lembut. |
| **KF-04** | `320–760ms` | `.hero-role` & `.hero-intro` | Baris jawatan (`FPIB · KIAS`) dan perenggan pengenalan masuk beriringan (`y: 12px → 0`, `opacity: 0 → 1`). |
| **KF-05** | `440–860ms` | `.hero-actions`, `.portrait-nameplate`, `.dossier` | Butang CTA (stagger `60ms`) dan plat nama Arab `أحمد مزمّل محمد نجيب` mendarat kemas (`y: 10px → 0`, `--ease-settle`), diikuti baris dossier. |
| **KF-06** | `720–1350ms` | `.rosette`, `.sheen`, `.hero-bottom` | Rozet SVG memulakan putaran perlahan bertentangan arah (`110s`/`72s`); satu sapuan kilauan emas tunggal (`.sheen`, `iteration-count: 1`, bukan 3×) melintasi nama Latin; `scroll-cue` muncul lembut di kaki hero. |
| **KF-07** | Scroll `0% → 100%` tinggi hero | `.hero-kaleido`, `.heritage-art`, `.scroll-cue` | Parallax halus: kaleidoskop membesar `1.0 → 1.24` & berpusing `0° → 26°`, gerbang potret bergerak `translateY(0 → -24px)` (desktop sahaja), dan `scroll-cue` pudar keluar pada 15% scroll pertama. |

---

## 6. Senarai Semak "Jangan Buat"

Perkara berikut akan segera menjadikan laman kelihatan generik, seperti templat AI, atau seperti permainan video — **elakkan sepenuhnya**:

- **Jangan tukar palet kepada gelap-neon / "cyber-Islamic":** Tiada cyan elektrik, ungu neon, gradien pelangi AI, atau kesan `UnrealBloomPass` yang membuat menara/kubah Jamiah bercahaya seperti permainan sci-fi.
- **Jangan guna `glassmorphism` berlebihan pada setiap kad:** Simpan permukaan frosted hanya untuk header melekit dan panel kawalan terapung di atas kanvas 3D; kad teks kekal kertas editorial bersih (`#FFFDF8` / `#12251E`).
- **Jangan pasang UI gaya HUD/gaming pada babak 3D:** Tiada garisan radar, koordinat nombor bergerak, kotak wireframe berpusing, atau partikel debu bercahaya merata-rata.
- **Jangan guna animasi melantun (*bouncy*) atau hover terlalu dramatik:** Buang `cubic-bezier(.34, 1.56, .64, 1)`, hadkan angkatan hover kad kepada `-4px`, dan hadkan (atau matikan) condong 3D `.lively` pada kad teks besar supaya tidak rasa seperti kad koleksi permainan.
- **Jangan putar atau pecahkan ayat suci/kaligrafi:** Jangan sekali-kali meletakkan ayat al-Quran, nama Allah/Rasul, atau kaligrafi suci di dalam tekstur kaleidoskop, corak latar berputar, atau tekstur buku/manuskrip prosedural.
- **Jangan jadikan semua seksyen berat dengan 3D & kaleidoskop serentak:** Hanya satu renderer WebGL aktif pada satu masa; seksyen teks seperti `#tentang`, `#penerbitan` (senarai lengkap), dan `#pengalaman` mesti kekal tenang tanpa latar bergerak di belakang teks.
- **Jangan buat *scroll hijacking* atau *auto-rotate* liar:** Apabila pengguna berhenti scroll di bab Jamiah, model mesti berhenti kemas (*settle*). Jangan tangkap roda tetikus/sentuhan atas kanvas 3D melainkan pengguna mengklik butang **Teroka 360°** secara sedar (dengan butang Keluar + `Esc`).
- **Jangan reka fakta, label bangunan, kulit buku, atau antaramuka palsu:** Jangan labelkan bahagian model 3D Jamiah sebagai bangunan fakulti tertentu tanpa bukti; jangan jana kulit buku atau tangkapan skrin aplikasi dengan AI; jangan ubah atau sunting wajah asal dalam `gambar/muzzammil.jpg`.
- **Jangan biarkan intro atau efek menyekat LCP & aksesibiliti:** Pastikan kandungan HTML semantik boleh dibaca serta-merta, hormati `prefers-reduced-motion` dan butang jeda, serta uji setiap komponen baharu dalam **mod Arab RTL** (`reading-progress`, arah anak panah, penjajaran tajuk LTR dalam RTL, dan pencerminan ofset kamera 3D).


---

<!-- Pusingan 2: output Gemini (Antigravity CLI), disimpan tanpa suntingan oleh Claude. -->

# Semakan Kreatif & Visual — Pusingan 2

**Status keseluruhan:** Versi semasa masih jauh daripada taraf *Awwwards / Apple product showcase*. Naik taraf PBR pada Jamiah membawa peningkatan kecil pada batu, tetapi keseluruhan persembahan masih terbaca sebagai **maket CAD di atas meja kelabu + templat laman web janaan AI**. Paling kritikal: empat daripada lima pentas 3D (`#bidang`, `#pencapaian`, `#penerbitan`, `#aplikasi`) kelihatan **kosong** dalam tangkapan skrin, dan pembahagi gerbang bergigi serta latar potret robot AI merosakkan wibawa akademik laman ini.

---

## 1. Jamiah Imam: Kritikan Tegas, Parameter Tepat & Shot List Sinematik

### A. Apa yang Masih Nampak Mainan, Kartun atau Generik

1. **Tumbuhan ialah pembunuh realisme #1 (`r2-jamiah-000.png`, `r2-jamiah-020.png`, `r2-jamiah-080.png`)**
   - Barisan pokok renek di hadapan (`shrub`) ialah sfera licin (`SMOOTH = new Set(['slate', 'shrub'])`) beratur seragam seperti biji kacang pis plastik. Dalam `qa/reference/jamiah-art-direction.jpg`, tumbuhan ialah rimbunan berbilang tona dalam kotak batu berbingkai dengan lampu tiang rendah.
   - Pokok kurma di halaman (`r2-jamiah-080.png`, dan masih kelihatan bayangnya di balik kekisi pada `-000` dan `-020`) kelihatan seperti labah-labah plastik rata.
   - **Tindakan wajib:** Ganti sfera `shrub` dengan gumpalan *icosahedron* terdisplas (*vertex noise*) atau *instanced foliage cluster* 3 tona hijau zaitun-kering + kotak pasu batu berbingkai (`height: 0.45`, `bevel`), atau jika kekangan poligon ketat, **ubah kepada landskap seni bina minimalis Riyadh** (pagar batu rendah berlekuk + lampu *bollard* gangsa hangat + 2–4 pokok kurma berpelepah berlengkung 3D sebenar) — jauh lebih mewah daripada sfera mainan.

2. **Garisan ufuk patah & lantai kelabu getah (`r2-jamiah-000.png`, `r2-jamiah-020.png`)**
   - Di belakang bangunan jelas kelihatan garisan mendatar tajam memisahkan lantai kelabu-hijau (`~#28312d`) dengan langit hitam pekat (`#040b08`). Puncanya: `scene.fog = new THREE.FogExp2(0x0e1d17, 0.0052)` terlalu cair untuk menelan pinggir `CircleGeometry(radius * 12)` dan warna kabus tidak padan dengan warna lantai di ufuk.
   - Hasilnya nampak seperti model diletak di atas meja getah di depan langsir hitam, bukan ruang studio tak bersempadan (*infinity cyclorama*).

3. **Tompokan cahaya kuning pelik di bawah plinth (`r2-jamiah-000.png`, `r2-jamiah-020.png`, `r2-mobile-ms-02-akademik.png`)**
   - Cahaya `SpotLight` (`pool`, intensiti `900`) memantul pada lantai `roughness: 0.42` tepat di bucu hadapan plinth, mencipta tompokan kuning kabur seolah-olah ada lampu LED murah di bawah meja. Tiada *contact shadow* gelap di pangkal plinth, jadi plinth kelihatan melayang.

4. **Batu pasir terlalu terang & rata; kaligrafi seperti pelekat pudar (`r2-jamiah-000.png`, `r2-jamiah-020.png`)**
   - Gabungan `stone` (`0xe4cfaa`), `key` (`3.4`) dan `pool` (`900`) membakar dinding hadapan hingga hilang kontras bayang mikro. Grid `masonry()` terlalu seragam dan kaku seperti jubin bilik air.
   - Papan tanda kaligrafi (`sign`) nampak seperti tekstur rata kelabu yang terpotong di kiri dan kanan (`الامام محمد بن سعود ا`), bukannya huruf gangsa timbul 3D yang membuang bayang nipis ke atas dinding seperti dalam rujukan `jamiah-art-direction.jpg`.

5. **Kekisi mashrabiyya & kubah kehilangan mutu logam (`r2-jamiah-000.png`, `r2-jamiah-020.png`)**
   - Kekisi `bronze` terbaca sebagai garisan hitam 2D tanpa ketebalan atau pantulan tepi (*rim specular*). Cahaya `lantern` (`90`) tenggelam kerana seluruh fasad luar sudah terlalu terang.
   - Kubah `slate` (`roughness: 0.38, metalness: 0.55`) berkilat lebar seperti plastik krom murah. Tingkap `glass` pula seperti pelekat coklat rata; `emissiveIntensity: 0.07` langsung tidak kelihatan.

6. **Komposisi, FOV statik & kad teks bertindih (`r2-jamiah-000.png`, `r2-jamiah-020.png`, `r2-mobile-ms-02-akademik.png`)**
   - `PerspectiveCamera(28, ...)` yang kaku sepanjang putaran membunuh drama ruang — bangunan terasa seperti paparan objek CAD.
   - `.story-card` menutup hujung kiri bangunan pada `-000` dan menutup sayap kanan pada `-020`. Hotspot `"Pintu gerbang berkekisi"` terapung di tengah kekisi tanpa garisan penunjuk (*leader line*) dan berlaga dengan kad teks.
   - Di mobile (`r2-mobile-ms-02-akademik.png`), kad teks hilang daripada bingkai awal, manakala model terpotong di kiri-kanan dan terlalu rendah.

---

### B. Nilai Parameter Tepat (PBR, Cahaya, Latar, Kabus, Kamera)

Tetapkan `renderer.toneMapping = THREE.ACESFilmicToneMapping` dan `renderer.toneMappingExposure = 0.96` (elak *blown highlights* pada batu).

| Kategori | Elemen | Nilai Semasa | Nilai Sasaran Tepat |
|---|---|---|---|
| **Latar & Kabus** | `backdrop()` atas → ufuk → bawah | `#040b08` → `#13271f` → `#0a1611` | `#050a08` (0%) → `#091310` (54%) → `#0e1b16` (68%) → `#07100d` (100%) |
| | `scene.fog` | `FogExp2(0x0e1d17, 0.0052)` | `FogExp2(0x091310, 0.0115)` (padankan tepat dengan warna ufuk + *alpha radial fade* pada lantai) |
| | `scene.environmentIntensity` | `0.32` | `0.48` (guna PMREM studio hangat-gelap dengan *softbox* sisi supaya gangsa & kubah tangkap *rim light*) |
| **Lantai & Plinth** | `floorMaterial` | `#101b17`, rough `0.42`, metal `0.15` | `#091310`, `roughness: 0.78`, `metalness: 0.05`, `envMapIntensity: 0.25` + *radial alphaMap* pudar ke `0` pada `radius * 4.5` (hapus terus garisan ufuk!) + *baked soft contact shadow plane* (`#000000`, `opacity: 0.65`) tepat di bawah plinth |
| | `plinthMaterial` | `#1d1b18`, rough `0.55`, metal `0.1` | `#121110` (basalt hitam bertekstur halus), `roughness: 0.68`, `metalness: 0.08`, tambah *chamfer/bevel* tepi `0.08` |
| | `brassMaterial` | `#b08d4a`, rough `0.3`, metal `1.0` | `#c7a45e`, `roughness: 0.26`, `metalness: 0.95`, `envMapIntensity: 1.4` |
| **Bahan Seni Bina** | `stone` (batu pasir Riyadh) | `#e4cfaa`, rough `0.84`, metal `0` | `#d8bf96`, `roughness: 0.91`, `metalness: 0.0`; tambah `bumpMap`/pertubasi normal dalam shader `masonry` + kurangkan kontras garisan mortar daripada `0.2` kepada `0.11` + variasi *macro-weathering* rendah frekuensi (`0.90–1.04`) supaya tidak nampak jubin |
| | `bronze` (kekisi mashrabiyya) | `#4a3826`, rough `0.36`, metal `0.82` | `#5a4328`, `roughness: 0.30`, `metalness: 0.92`, `envMapIntensity: 1.8` (mesti tangkap kilau tepi keemasan) |
| | `slate` (kubah zink berusuk) | `#6a7379`, rough `0.38`, metal `0.55` | `#4f595e`, `roughness: 0.56`, `metalness: 0.42`, `envMapIntensity: 0.85`; tajamkan rusuk (`rib` 36 jalur, `mix(0.68, 1.04, ...)`) + ubah `roughness` sedikit di lurah rusuk |
| | `glass` (tingkap dalaman) | `#14262b`, rough `0.1`, emissive `0.07` | `#0f1f24`, `roughness: 0.14`, `metalness: 0.85`, `emissive: #e89b48`, `emissiveIntensity: 0.32` (cahaya bilik kuliah hangat yang hidup apabila kamera rapat) |
| | `foliage` / `shrub` / `lawn` | `#5f6b49` / `#4d5a3f` / `#5c6848` | `#4a5938` (`roughness: 0.86`) / `#3c4b2f` (`roughness: 0.94`, *flatShading/displaced*, **bukan** sfera licin) / `#445235` (`roughness: 0.98`) |
| | `sign` (kaligrafi) | `#fff3dc`, rough `0.8` | Tukar latar papan tanda menyamai `#d8bf96` tanpa sempadan segi empat; huruf kaligrafi `#2c2217` (gangsa gelap) dengan `roughness: 0.35`, `metalness: 0.75` atau *extrude* mesh 3D sebenar + betulkan UV yang terpotong |
| **Pencahayaan** | `key` (matahari senja Riyadh) | `#ffe4bf`, `3.4`, pos `(-1.25, 1.35, 1.5)` | `#ffd7a3`, intensiti `2.45`, sudut lebih rendah `(-1.6, 0.95, 1.15)` supaya bayang bangunan & kekisi memanjang dramatik ke halaman |
| | `fill` (langit senja sejuk) | `#a9c0cc` / `#2b2118`, `0.55` | `#7e9fb3` / `#1c1510`, intensiti `0.38` (biarkan sisi bayang kekal dalam & berdimensi!) |
| | `rim` (pemisah siluet belakang) | `#bfe0d2`, `1.1` | `#d9c192` (emas hangat pudar), intensiti `1.45`, pos `(1.4, 0.85, -1.6)` untuk menggariskan menara & bucu dinding daripada latar gelap |
| | `pool` (`SpotLight` atas) | `#fff0d8`, `900`, angle `0.42` | **Kurangkan drastik atau buang** — jika kekalkan sebagai *top accent*, turun ke `#ffe8c4`, intensiti `140`, `angle: 0.34`, `penumbra: 1.0`, `decay: 2`, sasaran tepat pada pusat bumbung `[0, 3, 0]` (elak limpahan ke lantai hadapan!) |
| | `lantern` (cahaya dari dalam gerbang) | `#f4b86a`, `90`, `dist: 1.1r` | `#ffaa4c`, intensiti `160`, `distance: radius * 1.45`, `decay: 1.8`, tambah `PointLight` kedua di halaman (`#ffba6b`, intensiti `75`, `[0, 3.0, -0.5]`) supaya ruang dalaman bercahaya emas dan kekisi membentuk siluet dramatik |
| **Kamera & AO** | `FOV` | Statik `28°` | Dinamik `22°–38°` mengikut syot (interpolasi dalam `Rig.update()`, kira `this.base` menggunakan rujukan tetap `32°` supaya kesan *dolly-zoom* terasa) |
| | `GTAOPass` | `radius: 1.5`, `scale: 1.25` | `radius: 1.1`, `scale: 1.45`, `thickness: 1.2`, tambah `UnrealBloomPass` sangat halus (`threshold: 0.92`, `strength: 0.18`, `radius: 0.35`) hanya untuk menangkap kilau `lantern`, tingkap hangat dan puncak menara |

---

### C. Shot List Sinematik 7 Syot (Satu Putaran 360° Penuh)

**Perubahan mekanikal wajib dalam `js/scenes/jamiah.js` & `js/rig.js`:**
Jangan ikat `yaw = YAW0 + p * TAU` secara linear! Masukkan `yaw` dan `fov` ke dalam `KEYS` supaya kamera boleh **memperlahankan putaran semasa extreme close-up** dan **memecut elegan semasa sapuan sudut lebar**, sambil tetap melengkapkan tepat **360°** (`-24°` → `+336°`).

**Ubah suai gaya teks (`.story-card`):** Buang kotak kaca berat di tengah skrin yang menutup model. Tukar kepada **tipografi editorial terapung tanpa kotak** (*borderless editorial overlay*) dengan *scrim* gradien halus di pinggir skrin (`linear-gradient(90deg, #050a08d8 0%, transparent 44%)`) atau jalur minimal di tepi *safe-zone* (`max-width: 340px`, sudut kiri/kanan bawah atau sisi berlawanan dengan `sx`).

| Syot | Nama & Niat Sinematik | Julat `p` | `yaw` (°) | Jarak Relatif (`d`) | Elevation (`e`) | `FOV` (°) | Sasaran (`target` ruang model) & `sx` | Koreografi Teks (6 Kad Cerita + Transisi) |
|---|---|---|---|---|---|---|---|---|
| **1** | **Pendekatan Monumental** (*Approaching the Gate*) — Kamera meluncur rendah menghampiri pintu gerbang utama; batu pasir muncul dari gelap, cahaya emas mula mengintai dari balik kekisi. | `0.00 – 0.14` | `-24° → -4°` | `1.22 → 0.74` | `9° → 5°` | `36° → 31°` | `[0, 2.8, 7.2]` (tarik ke gerbang), `sx: +0.26` | **Kad 1 (Riyadh · 2015–2024):** Muncul di kiri dengan *clip-path* menegak (bukan kotak kaca) pada `p=0.00–0.12`; pudar keluar sebelum gerbang membesar ke tengah bingkai. |
| **2** | **Extreme Close-Up Kekisi Mashrabiyya & Kaligrafi** — Kamera menembusi ruang hadapan; kekisi gangsa membingkai halaman bercahaya emas, kaligrafi Arab tersergam di bahagian atas. | `0.14 – 0.28` | `-4° → +22°` | `0.74 → 0.36` | `5° → 11°` | `31° → 23°` | `[0, 3.6, 8.9]` (pusat kekisi & papan tanda), `sx: -0.28` | **Kad 2 (Diploma 2015–2017):** Masuk di kanan sejurus `p=0.16`. Hotspot `gate` muncul dengan *hairline leader line* emas (`1px`) tanpa pil hitam besar, hilang sebelum `p=0.27`. |
| **3** | **Sapuan Sayap Barat & Garis Fasad** (*Architectural Orbit*) — Kamera berundur sedikit sambil menyapu sisi kompleks, mempamerkan irama tingkap berlekuk dan kepadatan blok seni bina. | `0.28 – 0.46` | `+22° → +116°` | `0.36 → 0.88` | `11° → 18°` | `23° → 34°` | `[-2.0, 3.2, 0.5]` (sayap barat), `sx: +0.28` | **Kad 3 (Mumtaz ×3):** Angka besar `Mumtaz ×3` di kiri sebagai teks monumental *parallax* perlahan (`p=0.31–0.44`), seiring ritma tingkap yang melintas di kanan. |
| **4** | **Mendongak ke Menara Kembar** (*Low-Angle Minaret Rise*) — Kamera turun rendah di belakang kompleks, mendongak ke arah menara supaya puncak gangsa membelah langit malam. | `0.46 – 0.60` | `+116° → +190°` | `0.88 → 0.64` | `18° → 8°` | `34° → 38°` | `[3.8, 7.2, -5.1]` (paksi menara kanan), `sx: -0.26` | **Kad 4 (Sarjana Muda Syariah 2017–2020):** Masuk di kanan (`p=0.48–0.59`); garisan menegak tipis di sisi teks menyahut paksi menegak menara. |
| **5** | **Extreme Close-Up Kubah Berusuk** (*Dome & Finial Study*) — Lensa memampat ke telefoto ketat `22°`, menonjolkan alur rusuk kubah zink, siluet menara kedua di belakang dan kilau hangat di puncak. | `0.60 – 0.74` | `+190° → +248°` | `0.64 → 0.42` | `8° → 25°` | `38° → 22°` | `[0, 6.9, -5.95]` (kubah masjid), `sx: +0.30` | **Kad 5 (Sarjana Fiqh Perbandingan 2022–2024):** Masuk di kiri (`p=0.62–0.73`). Hotspot `dome` menyala halus pada puncak kubah tanpa menutupi kelengkungan kubah. |
| **6** | **Menyusuri Sayap Timur & Intipan Halaman** (*Courtyard Sweep*) — Kamera memanjat tinggi di sisi timur, membuka pemandangan ke dalam halaman dalaman, koloni tiang dan pokok kurma yang diterangi lampu hangat. | `0.74 – 0.88` | `+248° → +308°` | `0.42 → 0.94` | `25° → 34°` | `22° → 34°` | `[0, 2.4, 1.0]` (halaman tengah), `sx: -0.22` | **Beat Bernafas (Tiada kad penuh):** Hanya kapsyen mikro 1 baris di bawah (`Halaman dalam · Masjid & Fakulti`) atau peralihan keluar Kad 5 — beri mata pengguna 100% menikmati seni bina sebelum klimaks. |
| **7** | **Aerial Reveal 360° Lengkap** (*Monumental Finale*) — Kamera berundur lebar dan naik tinggi ala dron seni bina sambil melengkapkan pusingan 360° penuh ke sudut `-24°`, mendedahkan keseluruhan pelan simetri kampus di atas plinth basalt. | `0.88 – 1.00` | `+308° → +336°` | `0.94 → 1.30` | `34° → 44°` | `34° → 30°` | `[0, 2.0, 0]` (pusat kompleks), `sx: +0.24` | **Kad 6 (Satu pusingan lengkap / Garis masa penuh):** Masuk di kiri bawah (`p=0.90–1.00`) bersama CTA emas `Lihat garis masa ↓` dan cincin dail `360°` mengunci dengan denyutan emas halus. |

> **Nota responsif potret (`aspect < 0.9`):** Pastikan `syPortrait` meletakkan sasaran model di 45% bahagian atas skrin (`syPortrait: 0.24`), kecilkan kad cerita kepada jalur padat di 30% bawah dengan *backdrop scrim* (`max-height: 28svh`), dan pindahkan nota disclaimer keluar dari pentas supaya model tidak pernah terpotong.

---

## 2. Identiti Gerakan Berbeza Bagi Setiap Bahagian

**Bahasa Visual Induk (Unified Motion Grammar):**
Semua bahagian berkongsi satu fizik dan watak — **"Keberatan Seni Bina & Kinetik Kaligrafi"**: lengkung pecutan bermaruah (`cubic-bezier(0.22, 1, 0.36, 1)` untuk masuk, `power2.inOut` untuk *scroll-scrub*), tiada *bounce* kartun, tiada ulangan *translateY + fade* yang sama di setiap blok, dan cahaya emas champagne (`#dfc487`) sentiasa bertindak sebagai penunjuk fokus.

### 1. Hero (`#utama`)
- **Konsep:** *Tirai gerbang dibuka oleh cahaya fajar — tipografi terukir keluar dari garis dasar, bukan jatuh dari langit.*
- **Beat gerakan:**
  1. **Garis Paksi Emas (`0–350ms`):** Satu garis nipis menegak `1px` membelah ruang antara teks dan kad potret, mengembang dari pusat ke atas dan bawah (`scaleY: 0 → 1`).
  2. **Masker Garis Dasar Tipografi (`120–780ms`):** Baris nama `Ahmad` / `Muzzammil` / `Mohammad Najib` tidak naik dengan `opacity` biasa, tetapi terdedah dari dalam pembalut `overflow: hidden` (`translateY(105%) → 0`, *stagger* `90ms`), tanpa gradien `.sheen` yang pelik.
  3. **Pendedahan Gerbang Potret (`250–1100ms`):** Gerbang potret terbuka dari celah menegak tengah ke luar (*curtain aperture* menggunakan `clip-path: inset(0 48% 0 48% round 220px 220px 8px 8px)` → `inset(0 0 0 0 round ...)`), diikuti *slow dolly-out* imej potret (`scale: 1.12 → 1.0`).
  4. **Parallax Kedalaman Skrol (`scroll 0 → 100vh`):** Teks kiri bergerak lebih laju (`y: -48px`) daripada gerbang potret (`y: -18px`) sambil kaleidoskop di belakang mekar secara geometrik (*morph*), mencipta rasa lapisan kaca.

### 2. Jamiah (`#akademik` / `#jamiah`)
- **Konsep:** *Koreografi kamera filem seni bina — satu pusingan 360° yang berirama antara monumental, intim dan perspektif burung.*
- **Beat gerakan:**
  1. **Penyelaman Gerbang (`p: 0.00 → 0.28`):** *Push-in* rendah ke dalam kekisi sambil FOV memampat `36° → 23°` dan `lantern` dalaman memuncak intensiti `100 → 180`.
  2. **Sapuan Sisi & Dongakan Menara (`p: 0.28 → 0.60`):** Kamera merendah ke `8°` dengan FOV lebar `38°` supaya menara menjulang melepasi garis ufuk.
  3. **Kajian Makro Kubah (`p: 0.60 → 0.74`):** Putaran diperlahankan (*dwell*), telefoto `22°` mengunci rusuk kubah semasa cahaya *rim* menyapu lengkung logam.
  4. **Pelepasan Dron 360° (`p: 0.74 → 1.00`):** Kamera mendaki ke `44°` dan berundur penuh, mengakhiri putaran pada pelan simetri keseluruhan kompleks.

### 3. Manuskrip di Atas Rehal (`#bidang`)
- **Konsep:** *Helaian kitab turath dibuka oleh tangan yang cermat — gerakan berengsel, terlipat dan berfokus pada dakwat.*
- **Beat gerakan:**
  1. **Penguncian Rehal (`p: 0.00 → 0.22`):** Kamera bermula dari sudut sisi rendah (`e: 14°`) melihat siluet rehal bersilang, kemudian mendaki ke sudut bacaan (`e: 48°`) di atas kitab terbuka.
  2. **Selakan Helaian Fizikal (`p: 0.22 → 0.68`):** Setiap satu daripada 5 item `.field-list` (01–05) disegerakkan dengan selakan satu helaian manuskrip 3D (*vertex bend/curl* lembut merentasi tulang belakang buku) — bukan memutar seluruh rehal seperti meja pusing!
  3. **Pembesaran Mikro Kaligrafi (`p: 0.68 → 0.90`):** Kamera *pan* perlahan merentasi halaman kanan ke kiri (mengikut arah bacaan Arab!) pada jarak makro (`d: 0.45`), sambil cahaya *raking light* hangat meluncur merentasi tekstur kertas dan sepuhan emas.
  4. **Penutupan Hormat (`p: 0.90 → 1.00`):** Kamera berundur lembut ke sudut 3/4 klasik apabila senarai 05 selesai.

### 4. Pingat Emas & Perak (`#pencapaian`)
- **Konsep:** *Kilauan logam di dalam bilik gelap — gerakan ayunan bandul perlahan di mana cahaya yang bergerak, bukan objek berpusing laju.*
- **Beat gerakan:**
  1. **Jatuhan Berpemberat (*Weighted Drop*, `p: 0.00 → 0.20`):** Pingat tidak *fade-in*; ia turun sedikit dari atas rebennya dengan inersia bandul teredam (*damped pendulum swing* `±7° → 0°`).
  2. **Sapuan Cahaya Spekular (`p: 0.20 → 0.55`):** Pingat hanya berpusing halus `±18°`, sebaliknya **sumber cahaya utama bergerak mengelilingi permukaan ukiran** (140° arc) untuk memancarkan kilau tajam emas (`ICTE'26`) diikuti perak (`ITeLIC'26`).
  3. **Peralihan Berpasangan (*Dual Reveal*, `p: 0.55 → 0.85`):** Pingat Emas mengundur sedikit ke kedalaman fokus (*depth-of-field* / jarak `z - 1.2`) manakala Pingat Perak meluncur masuk ke hadapan tanpa bertukar secara mengejut.
  4. **Keseimbangan Dua Paksi (`p: 0.85 → 1.00`):** Kedua-dua pingat berhenti sejajar pada sudut 3/4 bertentangan, membalas condongan mikro penuding (`±4°`).

### 5. Pustaka Buku (`#penerbitan`)
- **Konsep:** *Menarik jilid pilihan dari rak perpustakaan — pergerakan linear, gelongsor tulang belakang dan bukaan kulit buku.*
- **Beat gerakan:**
  1. **Barisan Tulang Belakang (*Spine Shelf*, `p: 0.00 → 0.25`):** Buku-buku tersusun rapat secara mendatar/serong dalam perspektif seni bina; kamera menyusur selari (*tracking shot* lateral, tiada orbit).
  2. **Tarikan Jilid Aktif (`p: 0.25 → 0.75`):** Apabila skrol menjejak penerbitan tumpuan, satu buku **menggelongsor keluar ke hadapan (`+z: 1.4`)**, berpaling `35°` menghadap kamera dan kulit hadapannya terangkat sedikit (`12°`) sambil buku lain meredup sedikit (*emissive/light falloff*).
  3. **Segerak Senarai Editorial (`p: 0.75 → 1.00`):** Pentas 3D melaras halus ke atas sambil senarai `.publication-list` di bawah memasuki bingkai dengan garis pembahagi `scaleX: 0 → 1` dari kiri ke kanan (atau kanan ke kiri dalam RTL).

### 6. Makmal Peranti (`#aplikasi`)
- **Konsep:** *Pendedahan produk Apple yang jitu — peranti terapung dalam susunan berlayer (exploded UI), tepat dan klinikal tetapi hangat.*
- **Beat gerakan:**
  1. **Pemasangan Profil Tepi (`p: 0.00 → 0.25`):** Telefon/tablet bermula dari pandangan tepi nipis (`yaw: 82°`, menonjolkan ketebalan bingkai logam & kilau *rim*), kemudian berpaling tajam dan licin ke hadapan (`yaw: 12°`).
  2. **Pecahan Lapisan UI (*Layered Depth*, `p: 0.25 → 0.65`):** Skrin aplikasi memisahkan 2–3 lapisan antara muka (contoh: kad e-Hadis40 / modul bahasa Arab) sejauh `z: +0.18` dan `+0.36` di hadapan kaca peranti semasa kamera bergerak serong `25°` untuk menunjukkan kedalaman.
  3. **Pertukaran Paparan Skrin (*Screen Morph*, `p: 0.65 → 0.88`):** Pertukaran antara aplikasi berlaku melalui *wipe* menegak pada tekstur skrin peranti yang disegerakkan dengan kad teks aktif — bukan memutar peranti 360°.
  4. **Pendaratan Grid (`p: 0.88 → 1.00`):** Lapisan UI kembali rapat ke skrin kaca dan peranti condong `10°` sebagai jemputan membuka grid 9 aplikasi di bawah.

### 7. Hubungi (`#hubungi`)
- **Konsep:** *Ruang pertemuan yang tenang — tirai bingkai mengecil masuk ke fokus, menamatkan perjalanan dengan keheningan berwibawa.*
- **Beat gerakan:**
  1. **Bingkai Masuk (*Architectural Inset*, `scroll enter`):** Kotak Hubungi mengembang dari `inset(0 32px 0 32px round 24px)` ke saiz penuh kontena (`inset(0 0 0 0 round 12px)`), memberikan rasa memasuki ruang tertutup yang intim.
  2. **Nafas Geometri Perlahan:** Kaleidoskop di sudut kanan hanya bergerak apabila penuding memasuki kawasan kad (reaksi halus, bukan berpusing tanpa henti).
  3. **Sinar Pautan (`hover`):** Pautan e-mel & GitHub menarik penuding secara magnetik (lihat Bahagian 5) sambil anak panah `↗` meluncur keluar dan muncul semula dari sudut bertentangan (*double-arrow chase*).

---

## 3. Kaleidoskop: Transformasi Geometri Dinamik (Bukan Stiker Berpusing)

### Diagnosis Semasa (`script.js` baris 256–360)
Buat masa ini, `script.js` melukis satu bingkai statik (`const kaleidoTime = 2.5`) daripada bentuk rawak (`star`, `circle`, `diamond`, `petal`, `ring`) lalu memusingkannya dengan animasi CSS `kaleidoSpin 240s`. Hasilnya kelihatan seperti corak bunga api rawak yang kabur, bukan geometri Islam (*girih / star-and-polygon*) yang hidup.

### Arah Baharu: Enjin Geometri Poligon-Bintang (*Dynamic Islamic Rosette Morph*)
Bina kaleidoskop berdasarkan **konstruksi Hankin (*polygons-in-contact*)** atau **WebGL Fragment Shader (GLSL) ringan** (1 quad penuh, kos GPU hampir sifar, 60fps lancar tanpa *jank* Canvas 2D) yang melakukan *morphing* berterusan antara tiga keluarga simetri tradisional Islam:
- **Fasa 0.0 (Octagonal / Rub el Hizb):** Simetri 8-lipat (tenang, klasik — sesuai untuk Hero & Hubungi).
- **Fasa 0.5 (Decagonal / Girih 10-lipat):** Sudut `36°/72°`, kompleks dan ilmiah — sesuai untuk Bab Akademik & Bidang.
- **Fasa 1.0 (Dodecagonal / Bintang 12-lipat):** Ketepatan kubah dan astrolab — sesuai untuk Pencapaian & Aplikasi.

### Parameter Konkrit (Selamat Bacaan & Tanpa *Flashing*)

| Parameter | Nilai Spesifik | Rasional |
|---|---|---|
| **Bilangan baji (*wedges*)** | **12** (simetri 6-cermin) untuk kad kecil (`.arch-kaleido`, `.contact-kaleido`); **16** (simetri 8-cermin) untuk kanvas besar (`.hero-kaleido`, `.stage-kaleido`). | Gandaan 4 dan 6 menghasilkan bintang 8 & 12 bucu yang tulen; elak angka ganjil atau >20 yang mencipta *moiré* halus. |
| **Gaya lukisan** | **Garisan nipis sahaja (`strokeWidth: 0.75px–1.1px`) + nod simpang mikro**, buang bentuk *filled blob* `55` opacity. Warna tunggal emas lembut `#c7a45e` (di atas gelap) / `#98712b` (di atas ivory) dengan maksimum 15% aksen `#1f5a45`. | Garisan halus berdisiplin jauh lebih mewah daripada bentuk berwarna-warni bertindih yang mencipta kesan kartun. |
| **Kelajuan sudut & morphing** | Putaran asas: **`0.012 rad/s`** (~8.7 minit sepusingan); kelajuan morph sudut Hankin (`theta: 22.5° ↔ 67.5°`): **`0.08 rad/s`** (kitaran penuh ~78 saat). | Perubahan berlaku pada kadar meditatif — pengguna merasai corak "bernafas dan berubah" tanpa sesekali mencetuskan *flashing* atau pening. |
| **Opacity selamat bacaan** | Latar terang (Hero ivory): **`0.07` (tepi) → `0.00` (di belakang teks)** melalui `mask-image: radial-gradient(circle at 78% 48%, #000 0%, #000 28%, transparent 64%)`.<br>Pentas gelap (`.stage-kaleido`, `.contact-kaleido`): **`0.14` maksimum**, dikurangkan kepada **`0.05`** di zon teks melalui *scrim*. | Kontras teks kekal melepasi WCAG AAA; kaleidoskop menjadi tekstur atmosfera, bukan gangguan bacaan. |
| **Pemetaan skrol (*Scroll Morph*)** | Peta kemajuan skrol bahagian `p ∈ [0, 1]` kepada:<br>- Sudut bukaan bintang `contactAngle = mix(30°, 60°, smoothstep(0, 1, p))`<br>- Putaran tambahan `deltaRot = p * 22.5°` (separuh baji sahaja, jangan 180°)<br>- Skala nafas `scale = 1.0 + sin(p * π) * 0.08`<br>Terapkan *damping* (`lerp` faktor `0.06` per bingkai) supaya skrol laju tidak menyentak corak. | Apabila pengguna menatal, bintang 8 bucu beransur-ansur mekar dan mengunci menjadi roset 12 bucu secara organik. |
| **Pemetaan penuding (*Pointer Response*)** | Hanya pada `@media (hover: hover) and (pointer: fine)`:<br>- Normalisasi penuding `nx, ny ∈ [-1, 1]` ditapis dengan *lerp* `0.04`.<br>- Peta `nx` → anjakan fasa sudut garisan dalaman `±6°`; `ny` → anjakan jejari gelang dalaman `±4%`.<br>- Jangan tukar warna atau kecerahan mengikut kursor (elak kilat). | Memberi rasa "instrumen astronomi hidup" apabila kursor melintas tanpa mengalih perhatian dari teks. |
| **Prestasi & Aksesibiliti** | Hadkan kemas kini kepada **30fps** untuk kanvas latar (`dt >= 33ms`), jeda sepenuhnya apabila `IntersectionObserver` melaporkan di luar viewport atau `motionPaused() === true`, dan kunci ke satu bingkai bersih untuk `prefers-reduced-motion`. | Sifar pembaziran bateri dan tidak berlumba dengan GPU WebGL Three.js. |

---

## 4. Seni Bina Islam Sebagai Transisi Antara Bahagian

Gantikan pembahagi gerbang bergigi (`.chapter::before`) dan garisan bintang Canva (`main > .section::before`) dengan **3 teknik seni bina sebenar** yang mengawal ruang, cahaya dan kedalaman.

### Teknik 1: Portal Gerbang Runcing Mengembang (*Pointed-Arch Portal Wipe*) — CSS `clip-path` + GSAP ScrollTrigger
**Tempat guna:** Peralihan dari zon terang (*Ivory*, contohnya `#tentang` → `#akademik` / `#jamiah`, dan `#pencapaian` → `#penerbitan`).

Daripada sempadan hitam bergigi yang melintang rata, pintu masuk ke bab gelap dibuka seperti **melangkah melalui satu gerbang seni bina besar** yang membesar memenuhi seluruh skrin apabila ditatal.

```css
/* Pembungkus masuk bab gelap */
.chapter-portal {
  clip-path: path('...'); /* atau polygon/inset dengan lengkung SVG clipPath */
  clip-path: url(#islamic-arch-clip); /* unit objectBoundingBox (0..1) */
  will-change: transform, clip-path;
}
```
```html
<!-- SVG clipPath responsif (objectBoundingBox) dikawal GSAP ScrollTrigger -->
<svg width="0" height="0" aria-hidden="true">
  <defs>
    <clipPath id="archPortalClip" clipPathUnits="objectBoundingBox">
      <!-- Morph atribut d: dari gerbang runcing sempit (0.18..0.82) ke segi empat penuh (0..1) -->
      <path id="archPortalPath" d="M 0.16,1 L 0.16,0.42 Q 0.16,0.14 0.5,0.04 Q 0.84,0.14 0.84,0.42 L 0.84,1 Z" />
    </clipPath>
  </defs>
</svg>
```
- **Koreografi skrol:** Semasa `.chapter` menghampiri bahagian tengah viewport (`start: 'top 92%'`, `end: 'top 15%'`, `scrub: 0.6`), titik kawalan gerbang melebar dari `0.16..0.84` ke `0..1` dan puncak runcing `0.04` merata ke `0`, sambil garis tepi emas `1px` menjejaki lengkung gerbang dan menghilang sebaik skrin terbuka penuh.
- **Keselamatan:** Untuk `prefers-reduced-motion` atau tanpa JS, `clip-path: none` (terus terbuka penuh tanpa sekatan).

### Teknik 2: Unjuran Bayang Mashrabiyya Bergerak (*Raking Mashrabiyya Light-Cast*) — SVG Mask + CSS Scroll-Linked Parallax
**Tempat guna:** Peralihan antara bahagian editorial terang (`#utama` → `#tentang`, `#bidang` → `#pengalaman`).

Dalam seni bina Islam, ruang tidak dipisahkan oleh garisan kartun, tetapi oleh **perubahan cahaya yang ditapis melalui kekisi mashrabiyya**.

```css
.section-light-veil {
  position: relative;
  height: clamp(96px, 14vh, 160px);
  overflow: hidden;
  pointer-events: none;
  background: linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%);
}
.section-light-veil::before {
  content: '';
  position: absolute;
  inset: -40% -10%;
  background: radial-gradient(ellipse 60% 80% at 50% 50%, color-mix(in srgb, var(--forest) 9%, transparent), transparent 72%);
  /* SVG corak girih/mashrabiyya sebenar berulang dengan sudut serong seperti bayang matahari */
  -webkit-mask: url('assets/svg/mashrabiyya-lattice.svg') center / 180px 180px repeat;
  mask: url('assets/svg/mashrabiyya-lattice.svg') center / 180px 180px repeat;
  transform: perspective(700px) rotateX(48deg) translate3d(var(--sun-x, 0px), var(--sun-y, 0px), 0);
  filter: blur(1.2px); /* penumbra lembut bayang matahari sebenar */
  opacity: 0.75;
}
```
- **Koreografi skrol:** ScrollTrigger menggerakkan `--sun-x` (`-24px → +24px`, terbalik pada `html[dir="rtl"]`) dan `--sun-y` (`-18px → +18px`) secara perlahan, mencipta ilusi bayang matahari petang menyapu lantai batu marmar di antara dua bahagian.

### Teknik 3: Pintu Kedalaman WebGL + Kabus Warna Berterusan (*Seamless Atmospheric Tunnel*) — WebGL Shader / CSS Gradient Bridge
**Tempat guna:** Keluar dari bab 3D gelap (`#jamiah`, `#penerbitan`, `#aplikasi`) kembali ke kandungan teks terang.

Daripada garis emas keras `2px` (`.chapter::after`) yang memotong gelap ke putih secara mengejut:
1. Pada `p ∈ [0.92, 1.00]` dalam babak WebGL, tambah *post-uniform* atau animasi `scene.fog.density` (`0.0115 → 0.022`) dan *vignette* tepi supaya objek 3D berundur secara halus ke dalam atmosfera gelap.
2. Di bawah `.chapter`, letakkan lapisan peralihan setinggi `120px` dengan **2 lapisan *parallax* berbentuk siluet serambi/kolonad** (SVG lutsinar 12% & 6% dalam warna `--night-1` dan `--gold-soft` dengan `translateY` berbeza `0.15x` dan `0.35x` kadar skrol) yang melarutkan warna `#07100d` ke `--bg` (`#f8f5ec`). Tiada garisan tajam melintang yang memecahkan ilusi kedalaman.

---

## 5. Butang & Mikro-Interaksi Premium

Semua butang utama (`.button-primary`, `.button-gold`, `.contact-link`, `.tool-explore`, `.to-top`) perlu dinaik taraf daripada kotak rata + `translateY(-3px)` biasa kepada sistem interaksi taktil bertaraf Awwwards.

### Spesifikasi Tepat

1. **Magnetic Hover Dwi-Lapisan (*Dual-Layer Magnetic Pull*)**
   - **Medan aktif:** Hanya apabila `@media (hover: hover) and (pointer: fine)` dan `!motionPaused()`.
   - **Radius zon tarikan:** `24px` di luar sempadan butang (atau `pointermove` di atas butang + *padding* pembalut tidak kelihatan `16px`).
   - **Jarak tarikan maksimum:**
     - Lapisan luar (`.button`): **`±9px` pada paksi X, `±6px` pada paksi Y** (`dx * 0.22`, dikepung oleh `clamp`).
     - Lapisan dalam (`.button-label` + `.icon-arrow`): **`±4.5px` pada paksi X, `±3px` pada paksi Y** (*inner parallax* 50% daripada luar, mencipta rasa kedalaman fizikal).
   - **Tempoh & Easing:**
     - Semasa menjejak penuding: `duration: 0.28s`, `ease: 'power3.out'` (atau `cubic-bezier(0.22, 1, 0.36, 1)`).
     - Semasa penuding keluar (`pointerleave` — *magnetic snap-back*): `duration: 0.62s`, `ease: 'elastic.out(1, 0.45)'` (anjal sangat halus tanpa bergegar berlebihan).

2. **Sempadan Beranimasi Cahaya Emas (*Conic Perimeter Trace*)**
   - Guna CSS `@property --border-angle` supaya GPU melicinkan putaran tanpa kos JS:
     ```css
     @property --border-angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
     ```
   - **Keadaan rehat:** Sempadan statik nipis `1px solid rgba(223, 196, 135, 0.34)` (di gelap) atau `rgba(152, 113, 43, 0.32)` (di terang).
   - **Keadaan hover:** `background-image` pada pseudo-elemen `::before` dengan `padding: 1px` dan `mask-composite: exclude` menyalakan arka cahaya emas `conic-gradient(from var(--border-angle), transparent 0deg, transparent 295deg, #dfc487 338deg, #fff4d6 355deg, transparent 360deg)`.
   - **Tempoh putaran:** **`2.6s linear infinite`** (mulakan pada sudut kursor masuk `--entry-angle` supaya cahaya menyala tepat di tempat penuding menyentuh butang!), `opacity: 0 → 1` dalam **`240ms cubic-bezier(0.22, 1, 0.36, 1)`**.

3. **Kilauan Spekular & Pengisian Ink (*Directional Fill / Specular Sweep*)**
   - Untuk `.button-secondary` & `.contact-link`: apabila *hover*, lapisan isi zamrud (`#0d3a2d` di latar terang; `#dfc4871f` di latar gelap) mengembang dari bawah menggunakan `clip-path: inset(100% 0 0 0) → inset(0 0 0 0)` dalam **`380ms cubic-bezier(0.19, 1, 0.22, 1)`**.
   - Untuk `.icon-arrow`: tukar kepada *double-arrow chase* — anak panah pertama keluar `+10px` (`opacity: 0`) dan anak panah klon masuk dari `-10px → 0` dalam **`320ms cubic-bezier(0.22, 1, 0.36, 1)`** (terbalikkan paksi X untuk `html[dir="rtl"]`).

4. **Detent Tekan & Fokus (*Tactile Press & Keyboard*)**
   - `:active`: `scale(0.965)` dalam **`90ms cubic-bezier(0.4, 0, 1, 1)`**, lepas kembali dalam **`280ms cubic-bezier(0.22, 1, 0.36, 1)`**.
   - **Sentuhan (`pointer: coarse`) & `prefers-reduced-motion`:** Matikan tarikan magnetik dan putaran sempadan; kekalkan perubahan warna latar `180ms ease` dan gelang fokus tegas `2px solid #dfc487`, `outline-offset: 4px`.

---

## 6. Senarai "AI Slop" yang Masih Kelihatan & Mesti Dibuang

| # | Elemen "AI Slop" | Fail Screenshot | Sebab Ia Rosakkan Kualiti & Gantian Wajib |
|---|---|---|---|
| **1** | **Pembahagi gerbang bergigi hitam-putih berulang** (`.chapter::before`) | `r2-desktop-ms-05-penerbitan.png`, `r2-desktop-ms-06-aplikasi.png`, `r2-mobile-ms-02-akademik.png` | Kelihatan seperti hiasan renda kek atau banner bufet Ramadan murah; terpotong separuh di tepi kanan mobile. **Buang 100%** dan ganti dengan Teknik 1 (Portal Gerbang Mengembang) atau Teknik 3. |
| **2** | **Latar lengan robot sci-fi biru di belakang potret** + bingkai sesak berlapis-lapis (`rosette` + `arch-kaleido` + bintang) | `r2-desktop-ms-00-top.png`, `r2-mobile-ms-00-top.png` | Lengan robot kelabu-biru bertembung keras dengan gerbang emas turath — menjerit imej komposit AI. **Ganti foto potret** dengan latar neutral/studio zamrud-hangat atau *cutout* kemas di atas latar gradien zamrud lembut (`#123529 → #081812`), dan kurangkan hiasan bingkai kepada 1 garis gerbang emas nipis sahaja. |
| **3** | **Pil kicker bertitik hijau (`PORTFOLIO AKADEMIK DIGITAL`)** | `r2-desktop-ms-00-top.png`, `r2-mobile-ms-00-top.png` | Klise #1 laman SaaS/portfolio janaan AI (gaya v0/Tailwind). **Buang bingkai pil bulat & titik hijau**; tukar kepada *editorial eyebrow* dengan garisan halus `28px` emas seperti tajuk bahagian lain. |
| **4** | **Gradien animasi `.sheen` pada nama "Muzzammil"** | `r2-desktop-ms-00-top.png`, `r2-mobile-ms-00-top.png` | Huruf "M" bertukar hijau-zaitun kusam separuh jalan — nampak seperti pepijat pewarnaan. **Buang `.sheen`**; guna warna dakwat penuh `#11342b` (atau italik *Cormorant Garamond* untuk *patronym* `Mohammad Najib`). |
| **5** | **Kad kaca gelap + garisan emas 2px di atas + satu bucu tajam (`.story-card`)** bertindih atas model 3D | `r2-jamiah-000.png`, `r2-jamiah-020.png`, `r2-jamiah-080.png` | Templat glassmorphism gelap tipikal AI; menutup binaan Jamiah. **Tukar kepada teks editorial bebas-kotak** di tepi *safe-zone* dengan *scrim* latar lembut dan garis paksi menegak emas `1px`. |
| **6** | **Kad `about-note` bucu asimetri `80px` + aksara Unicode `✧` gergasi** | `r2-desktop-ms-01-tentang.png` | Gaya kad kutipan Elementor/WordPress lama; aksara `✧` pudar di bawah kanan nampak murah. **Tukar kepada blok editorial berkadar tegak** dengan garis sempadan emas nipis `1px`, sudut `4px` konsisten, atau bingkai gerbang halus tanpa Unicode gergasi. |
| **7** | **Garisan pembahagi + bintang 4 bucu di tengah (`main > .section::before`)** | `r2-desktop-ms-01-tentang.png`, `r2-desktop-ms-04-pencapaian.png`, `r2-desktop-ms-05-penerbitan.png`, `r2-desktop-ms-06-aplikasi.png`, `r2-mobile-ms-02-akademik.png` | Hiasan Canva berulang secara mekanikal di setiap bahagian. **Buang** dan ganti dengan jarak ruang negatif yang yakin + Teknik 2 (bayang mashrabiyya halus). |
| **8** | **Teks penafian defensif terpapar terang di pentas** (*"Model 3D tafsiran artistik..."*, *"Model pingat generik..."*) | `r2-jamiah-000.png`, `r2-jamiah-020.png`, `r2-jamiah-080.png`, `r2-desktop-ms-04-pencapaian.png`, `r2-mobile-ms-02-akademik.png` | Membunuh ilusi sinematik serta-merta dan berbunyi seperti nota amaran AI. **Alihkan ke butang info mikro `(i)` / tooltip** di penjuru bawah atau kolofon kaki halaman. |
| **9** | **Pentas 3D gelap kosong hanya dengan kaleidoskop samar** | `r2-desktop-ms-03-bidang.png`, `r2-desktop-ms-04-pencapaian.png`, `r2-desktop-ms-05-penerbitan.png`, `r2-desktop-ms-06-aplikasi.png` | Pengguna melihat kotak gelap kosong tanpa subjek apabila menatal. **Wajib ada poster render PBR resolusi tinggi (`stage-poster`) yang terus kelihatan** sebelum WebGL aktif, dan aktifkan pramuatan (`rootMargin: '800px'`) supaya model sudah sedia sebelum masuk skrin. |
| **10** | **Tindihan dua hiasan berbeza dalam kotak Hubungi** (`contact-box::after` berlian 45° + `contact-kaleido`) | `r2-desktop-ms-08-hubungi.png` | Garisan berlian besar melanggar bulatan kaleidoskop secara serabut. **Buang `contact-box::after`** sepenuhnya; biarkan hanya satu sistem geometri (kaleidoskop *girih* nipis Bahagian 3). |
| **11** | **Kebocoran kabur di belakang navbar atas bab gelap** | `r2-jamiah-000.png` (atas kiri & tengah) | `backdrop-filter: blur(16px)` menangkap jalur bergigi putih/hitam di bawahnya, meninggalkan tompokan asap hodoh di belakang logo. Akan selesai sebaik `.chapter::before` dibuang + pastikan `site-header` di atas bab gelap menggunakan `rgba(5, 10, 8, 0.88)` bersih. |
| **12** | **Butang bulat terapung `.to-top` di bucu kanan bawah** | `r2-jamiah-000.png`, `-020.png`, `-080.png`, `r2-desktop-ms-03` hingga `-08`, `r2-mobile-ms-02-akademik.png` | Ikon panah hijau terapung yang melanggar komposisi pentas 3D dan bertembung dengan `.chapter-rail` & `.section-rail`. **Buang butang terapung ini** di atas bab 3D (pautan `Kembali ke atas ↑` di kaki halaman dan klik logo di navbar sudah memadai). |

---

## Kejujuran Tentang Had Pengamatan (Apa yang Tidak Dapat Dilihat)

1. **Empat model 3D lain tidak kelihatan langsung dalam tangkapan skrin:** Dalam `r2-desktop-ms-03-bidang.png` (kitab di atas rehal), `r2-desktop-ms-04-pencapaian.png` (pingat), `r2-desktop-ms-05-penerbitan.png` (pustaka buku), dan `r2-desktop-ms-06-aplikasi.png` (makmal peranti), pentas gelap hanya memaparkan kaleidoskop latar tanpa model 3D mahupun imej poster. Oleh itu, saya **tidak dapat menilai** kualiti geometri, bahan PBR, pencahayaan, atau komposisi keempat-empat aset tersebut — ini mesti disemak semula selepas masalah *loading/poster fallback* dibetulkan.
2. **Keadaan PBR baharu untuk bahagian belakang & halaman Jamiah:** `r2-jamiah-080.png` ialah render lama sebelum naik taraf bahan, manakala `-000` dan `-020` hanya menunjukkan fasad hadapan. Mutu bahan baharu pada kubah belakang, bumbung sayap, halaman dalaman dan menara di sudut belakang tidak dapat disahkan secara visual lagi.
3. **Kualiti gerakan sebenar & kelancaran FPS:** Semua input ialah imej pegun. Saya tidak dapat menilai rasa *scroll-scrub*, kelewatan *damping* `Rig`, transisi *intro curtain*, tirai pertukaran bahasa (`lang-veil`), kelancaran mod `Teroka 360°`, atau prestasi GPU pada peranti pertengahan.
4. **Mod gelap, versi EN/AR (RTL) dan bahagian lain:** Tiada tangkapan skrin bagi `data-theme="dark"`, antaramuka Bahasa Arab (`dir="rtl"`), jalur `#stats`, senarai penuh `#timeline`, `#penerbitan` (baris teks), grid `#aplikasi`, serta `#pengalaman`. Penilaian visual hanya merangkumi apa yang kelihatan dalam 12 imej Pusingan 2 dan 1 imej rujukan.


---

<!-- Pusingan 3 (semakan akhir): output Gemini (Antigravity CLI), disimpan tanpa suntingan oleh Claude. -->

# Semakan Kreatif & Visual — Pusingan 3 (Semakan Akhir)

> **Bahan yang diperiksa secara visual (18 tangkapan skrin dalam `qa/round3/`):** `r3-1440-dark-top-000.png`, `r3-1440-dark-jamiah-000.png`, `r3-1440-dark-jamiah-020.png`, `r3-1440-dark-jamiah-080.png`, `r3-1440-dark-jamiah-100.png`, `r3-1440-dark-manuskrip-050.png`, `r3-1440-dark-pingat-040.png`, `r3-1440-dark-pustaka-022.png`, `r3-1440-dark-makmal-016.png`, `r3-1440-dark-makmal-050.png`, `r3-1440-dark-hubungi-050.png`, `r3-1440-light-top-000.png`, `r3-1440-light-jamiah-020.png`, `r3-1440-light-pustaka-078.png`, `r3-1440-light-makmal-084.png`, `r3-390-dark-top-000.png`, `r3-390-dark-jamiah-040.png`, `r3-390-dark-pustaka-022.png` (serta semakan kod `immersive.css` dan `js/scenes/*.js` untuk ketepatan nilai pembaikan; tiada tangkapan skrin `#tentang` ditemui dalam set ini).

---

## 1. Status 12 Item "AI Slop" Pusingan 2

| # | Item "AI Slop" Pusingan 2 | Status | Bukti Nama Fail Imej & Catatan |
|---:|---|---|---|
| **1** | Pembahagi gerbang bergigi hitam-putih berulang (`.chapter::before`) | **selesai** | `r3-1440-dark-jamiah-000.png`, `r3-1440-light-jamiah-020.png`, `r3-1440-dark-pustaka-022.png`, `r3-1440-dark-makmal-016.png`, `r3-390-dark-jamiah-040.png` — jalur bergigi dibuang sepenuhnya. |
| **2** | Bingkai potret hero sesak berlapis-lapis (`rosette` + `arch-kaleido` + bintang + garis berganda; foto potret sebenar kekal mengikut kehendak pengguna) | **belum** | `r3-1440-dark-top-000.png`, `r3-1440-light-top-000.png`, `r3-390-dark-top-000.png` — walaupun wajah pendua dalam `.avatar` sudah diganti monogram `AM` dan foto sebenar dikekalkan dengan betul, kawasan `.heritage-art` masih menindan 5 lapisan hiasan (`arch-kaleido`, SVG `rosette`, bintang `s1`/`s2`, berlian puncak dan trim berganda) di sekeliling foto yang sudah berlatar kompleks. |
| **3** | Pil kicker bertitik hijau (`PORTFOLIO AKADEMIK DIGITAL`) | **selesai** | `r3-1440-dark-top-000.png`, `r3-1440-light-top-000.png`, `r3-390-dark-top-000.png` — ditukar kepada *editorial eyebrow* dengan garis halus emas yang sekata. |
| **4** | Gradien animasi `.sheen` pada nama "Muzzammil" | **selesai** | `r3-1440-dark-top-000.png`, `r3-1440-light-top-000.png`, `r3-390-dark-top-000.png` — warna dakwat penuh bersih tanpa kecacatan warna huruf, dan *patronym* `Mohammad Najib` dalam italik serif yang berwibawa. |
| **5** | Kad kaca gelap + garisan emas 2px (`.story-card`) bertindih atas model 3D | **sebahagian** | `r3-1440-dark-jamiah-000.png`, `r3-1440-dark-jamiah-020.png`, `r3-1440-light-jamiah-020.png`, `r3-1440-dark-makmal-050.png`, `r3-1440-light-makmal-084.png` — kotak kaca sudah diganti teks editorial bebas-kotak bergaris emas `1px`, tetapi teks masih bertindih dengan binaan Jamiah (`-000`, `-020`), penutup laptop (`makmal-050`) dan skrin cerah laptop (`light-makmal-084`). |
| **6** | Kad `about-note` bucu asimetri `80px` + aksara Unicode `✧` gergasi | **sebahagian** | Tiada tangkapan skrin `#tentang` dalam `qa/round3/` untuk pengesahan visual langsung; semakan kod (`immersive.css:407–410`) mengesahkan `border-radius: 4px` dan `.about-note::after { display: none; }` telah ditambah. |
| **7** | Garisan pembahagi + bintang 4 bucu di tengah (`main > .section::before`) | **selesai** | `r3-1440-dark-pingat-040.png`, `r3-1440-dark-hubungi-050.png` — hiasan pembahagi berulang sudah tiada (`immersive.css:399`). |
| **8** | Teks penafian defensif terpapar terang di pentas | **selesai** | `r3-1440-dark-jamiah-000.png`, `r3-1440-dark-manuskrip-050.png`, `r3-1440-dark-pingat-040.png`, `r3-1440-dark-pustaka-022.png`, `r3-1440-dark-makmal-016.png`, `r3-390-dark-jamiah-040.png` — semua penafian dialihkan kemas ke ikon `(i)` (*tooltip*). |
| **9** | Pentas 3D gelap kosong hanya dengan kaleidoskop samar | **selesai** | `r3-1440-dark-manuskrip-050.png`, `r3-1440-dark-pingat-040.png`, `r3-1440-dark-pustaka-022.png`, `r3-1440-light-pustaka-078.png`, `r3-1440-dark-makmal-016.png`, `r3-1440-dark-makmal-050.png`, `r3-1440-light-makmal-084.png` — kelima-lima babak 3D kini dirender penuh dan nyata. |
| **10** | Tindihan dua hiasan berbeza dalam kotak Hubungi (`contact-box::after` + `contact-kaleido`) | **selesai** | `r3-1440-dark-hubungi-050.png` — berlian 45° sudah dibuang, meninggalkan satu sistem geometri kaleidoskop garis halus sahaja. |
| **11** | Kebocoran kabur di belakang navbar atas bab gelap | **selesai** | `r3-1440-dark-jamiah-000.png`, `r3-1440-dark-jamiah-020.png`, `r3-1440-dark-pustaka-022.png`, `r3-1440-dark-makmal-016.png` — navbar kini latar gelap pejal bersih tanpa tompokan kabur. |
| **12** | Butang bulat terapung `.to-top` di bucu kanan bawah | **sebahagian** | Sudah disembunyikan dalam bab `.chapter` skrin penuh (`r3-1440-dark-jamiah-000.png`, `r3-1440-dark-pustaka-022.png`), tetapi masih muncul di sisi pentas `.feature` (`r3-1440-dark-manuskrip-050.png`, `r3-1440-dark-pingat-040.png`) dan menduplikasi pautan `Kembali ke atas ↑` tepat di sebelahnya (`r3-1440-dark-hubungi-050.png`). |

---

## 2. Penilaian Babak 3D, Hero & Hubungi

| Bahagian / Babak | Tidak Nampak Mainan / Kartun | Sinematik | Sebab Ringkas (1 Ayat) |
|---|---:|---:|---|
| **Jamiah Imam** (`jamiah-000/020/080/100`, `light-020`, `390-040`) | **6 / 10** | **7 / 10** | Khat Diwan Thuluth «جامعة الإمام محمد بن سعود الإسلامية», tekstur batu pasir dan plinth loyang berjaya mengangkat suasana maket muzium yang dramatik (terutama syot aerial `100`), tetapi barisan semak berbentuk ketulan hijau seragam, pokok kurma "labah-labah" di halaman dan *scrim* bawah hitam rosak pada mod Pagi masih menjejaskan realisme. |
| **Manuskrip di Atas Rehal** (`manuskrip-050`) | **5 / 10** | **5 / 10** | Geometri helaian yang melengkung semasa diselak dibina dengan baik, namun kertas terlalu putih terbakar hingga corak jidar lenyap seperti buku tulis kosong manakala rehal kayu di bawahnya tenggelam di balik butang `Teroka 360°`. |
| **Pingat Emas & Perak** (`pingat-040`) | **4 / 10** | **4 / 10** | Jalur tekstur logam melintang 256px yang kasar pada jarak makro, reben pudar rata seperti kertas plastik, jalur ufuk lantai kelabu di latar belakang, serta bucu pingat yang terpotong dan ditindih `Teroka 360°` menjadikannya masih terbaca seperti klip seni 3D asas. |
| **Pustaka Buku** (`pustaka-022`, `light-078`, `390-022`) | **7 / 10** | **6 / 10** | Kulit PDF sebenar kedua-dua kitab sangat tajam dan autentik, tetapi sudut pandang yang terlalu rata menyerupai poster 2D terapung dan dicacatkan oleh jalur pantulan lantai kelabu (Malam), *scrim* hitam rosak (Pagi) serta kulit terpotong di bawah navbar pada mobile 390px. |
| **Makmal Peranti** (`makmal-016/050`, `light-084`) | **7 / 10** | **5 / 10** | Perkakasan aluminium dan paparan tangkapan skrin aplikasi sebenar kelihatan moden dan jelas, namun koreografi peranti bukan fokus gagal apabila penutup laptop menutup latar teks `Fiqh Manhaji`, skrin cerah `e-Hadis40` bertembung terus di belakang teks `Haji Pintar`, dan `Teroka 360°` menindih skrin telefon. |
| **Hero** (`dark-top-000`, `light-top-000`, `390-top-000`) | **8 / 10** | **7 / 10** | Versi desktop Pagi dan Malam kini tenang, tajam dan berwibawa dengan keseimbangan *above-the-fold* yang kemas, cuma bingkai gerbang di sekeliling potret masih sarat lapisan hiasan dan paparan mobile 390px memotong wajah tepat pada garis lipatan. |
| **Hubungi** (`hubungi-050`) | **9 / 10** | **8 / 10** | Penyingkiran garisan berlian menjadikan penutup ini ruang editorial yang sangat tenang, berimbang dan premium, dengan satu sahaja kecacatan kecil iaitu butang terapung `.to-top` yang menduplikasi `Kembali ke atas ↑` di sebelahnya. |

---

## 3. Isu P0 / P1 Baharu & Baki Kritikal (Maksimum 8)

### 1. [P0] *Scrim* bawah mod Pagi (Light) kekal hitam pekat dan menenggelamkan ikon `(i)`
- **Fail imej:** `r3-1440-light-jamiah-020.png`, `r3-1440-light-pustaka-078.png`, `r3-1440-light-makmal-084.png`
- **Punca:** Pemilih `html:not([data-motion='paused']) .chapter.is-enhanced > .chapter-sticky::after` (`immersive.css:178`, kekhususan `0,3,2`) mengatasi peraturan mod Pagi `html[data-mood='day'] .chapter > .chapter-sticky::after` (`immersive.css:382`, kekhususan `0,2,2`), meninggalkan jalur hitam `#081410e0` setinggi `150px` di dasar semua bab 3D mod Pagi.
- **Pembaikan konkrit (`immersive.css:382`):**
  ```css
  html[data-mood='day']:not([data-motion='paused']) .chapter.is-enhanced > .chapter-sticky::after {
    background: linear-gradient(180deg, transparent 0%, rgba(243, 236, 223, 0.92) 100%);
  }
  ```

### 2. [P0] Peranti bukan fokus dalam Makmal bertembung di belakang teks cerita aktif dan memotong peranti di tepi skrin
- **Fail imej:** `r3-1440-light-makmal-084.png`, `r3-1440-dark-makmal-050.png`, `r3-1440-dark-makmal-016.png`
- **Punca:** Dalam `js/scenes/devices.js:106`, peranti tidak aktif (`focus = 0`) kekal terlalu dekat di zon teks sebelah (`z: -0.8..-2.1`) dengan skrin `emissiveIntensity: 1` menyala penuh (`e-Hadis40` muncul terus di belakang tajuk `Haji Pintar` pada `light-makmal-084`; penutup belakang laptop duduk di belakang teks `Fiqh Manhaji` pada `makmal-050`; telefon kanan terbelah dua pada `makmal-016`).
- **Pembaikan konkrit (`js/scenes/devices.js`):**
  - Simpan rujukan bahan skrin bagi setiap peranti dan malapkan skrin bukan fokus: `d.screenMat.emissiveIntensity = 0.16 + 0.84 * focus;`.
  - Baris 106: tolak peranti tidak aktif jauh ke belakang/sisi keluar zon teks:
    ```js
    const away = 1 - focus;
    d.root.position.set(
      phase * away * 1.45 - Math.sin(theta) * 1.6 * focus,
      1.85 + i * 0.2 + focus * 0.05,
      (-2.8 - i * 0.95) * away + Math.cos(theta) * 1.6 * focus
    );
    ```
  - Baris 5–14 (`KEYS`): laras jarak `p: 0.12–0.20` kepada `d: 0.72, sx: 0.38`, `p: 0.44–0.56` kepada `d: 0.62, sx: -0.40`, dan `p: 0.78–0.90` kepada `d: 0.58, sx: 0.40` supaya tiada peranti terpotong di tepi skrin atau menyentuh navbar/butang `Teroka 360°`.

### 3. [P0] Mobile 390px Pustaka: Bahagian atas kulit buku terpotong oleh navbar dan `Teroka 360°` menutup tajuk Arab buku
- **Fail imej:** `r3-390-dark-pustaka-022.png` (dan pertindihan `Teroka 360°` atas bucu buku dalam `r3-1440-dark-pustaka-022.png`)
- **Punca:** `js/scenes/library.js:5–6` menetapkan `syPortrait: 0.48` dan `d: 0.59`, mengangkat buku terlalu tinggi ke zon `.site-header` dan `.stage-tools` sehingga tajuk `فقه الحلال والحرام` ditutup oleh pil `Teroka 360°`.
- **Pembaikan konkrit (`js/scenes/library.js:5–6, 11–12`):**
  - Tukar `p: 0.16–0.28` dan `p: 0.72–0.84` kepada `d: 0.68, e: 8, sx: 0.42` (atau `-0.42`), `syPortrait: 0.22`, dan beri sudut serong halus `0.16 rad` (`~9°`) pada paksi Y buku semasa *plateau* bacaan supaya jilid dan susunan helaian tepi kelihatan 3D serta bucu atas buku bersih di bawah bar alat `Teroka 360°`.

### 4. [P1] Jalur pantulan lantai kelabu melintang di latar gelap memecahkan ilusi studio pada Pustaka, Makmal & Pingat
- **Fail imej:** `r3-1440-dark-pustaka-022.png`, `r3-1440-dark-makmal-016.png`, `r3-1440-dark-pingat-040.png`, `r3-390-dark-pustaka-022.png`
- **Punca:** `js/scenes/common.js:55, 65–66, 83` membina lantai segi empat `180×180` (`roughness: 0.54, metalness: 0.18`) dengan `Fog(0x091a14, 22, 65)` yang mula berkabus terlalu jauh; pantulan spekular cahaya `key` (`3.3`) dan `rim` (`2.2`) membentuk jalur kelabu melintang yang membelah latar gelap.
- **Pembaikan konkrit (`js/scenes/common.js:55, 65–68, 83`):**
  - Tukar kabus kepada `scene.fog = new THREE.FogExp2(0x091a14, 0.058);`.
  - Ganti `PlaneGeometry(180, 180)` kepada `CircleGeometry(14, 64)` dengan `alphaMap` jejari pudar ke `0` di pinggir (corak sama seperti `jamiah.js:232–243`), serta ubah `night` kepada `floorRough: 0.90`, `metalness: 0.02`, `envMapIntensity: 0.2`.

### 5. [P1] Babak Pingat: Tekstur logam berjalur kasar, reben terlalu pudar dan pingat terpotong di bawah
- **Fail imej:** `r3-1440-dark-pingat-040.png`
- **Punca:** `js/scenes/medals.js:6` (`p: 0.4, d: 0.37`) terlalu rapat sehingga tekstur `brush` 256px (garis selang 2px) kelihatan kasar, pingat emas terpotong di bahagian bawah dan ditindih `Teroka 360°`, manakala `sweep` (`35`) + `key` (`3.3`) membakar warna reben zamrud `0x184a39` menjadi kelabu pudar.
- **Pembaikan konkrit (`js/scenes/medals.js`):**
  - `KEYS`: tukar `p: 0.4` kepada `{ p: 0.4, d: 0.64, e: 10, sx: 0, syPortrait: 0.02, tx: -0.32, ty: 1.65 }` dan `p: 0.6` kepada `d: 0.66, ty: 1.55`.
  - Ganti `brush` kepada tekstur `512×512` berpusar halus (*radial micro-grain*, variasi kontras `#d4d4d4`–`#e4e4e4`), tetapkan emas `color: 0xd4a448, roughness: 0.24, metalness: 0.96`, tukar `ribbon` kepada `MeshPhysicalMaterial({ color: 0x0b2d21, roughness: 0.74, metalness: 0.02, sheen: 0.45, side: THREE.DoubleSide })`, dan turunkan `sweep` intensiti daripada `35` kepada `14`.

### 6. [P1] Manuskrip terlalu putih terbakar dan rehal kayu terselindung di balik bar alat `Teroka 360°`
- **Fail imej:** `r3-1440-dark-manuskrip-050.png`
- **Punca:** Kertas `#eee5cf` (`common.js:152`) di bawah `key: 3.3` + `exposure: 1.12` memutihkan seluruh muka surat hingga bingkai `#b19c70` hampir ghaib; sudut kamera `e: 58°`, `d: 0.50` (`manuscript.js:6–7`) terlalu menegak dari atas sehingga rehal kayu di bawah terselindung di balik butang `.stage-tools`.
- **Pembaikan konkrit (`js/scenes/common.js:152, 162` & `js/scenes/manuscript.js:6–7, 26`):**
  - Dalam `common.js`: tukar warna dasar `page` kepada perkamen hangat `#dfd0b0`, gelapkan bingkai kepada `strokeStyle = '#8a6b34'; lineWidth = 2.2`, dan tambah bayang lipatan tulang belakang (`linearGradient` `rgba(48,34,18,0.24)` → `transparent` pada 14% sisi dalam).
  - Dalam `manuscript.js`: tukar `KEYS` `p: 0.42–0.56` kepada `d: 0.70, e: 36, ty: 1.44` supaya persilangan kayu rehal kelihatan jelas di atas bar butang, serta laras lampu babak `s.key.intensity = 2.1; s.key.position.set(-5.5, 4.0, 2.8);` untuk *raking light* hangat pada lengkungan kertas.

### 7. [P1] Jamiah Imam: Teks cerita bertindih dengan binaan (`-000`, `-020`), tumbuhan semak & kurma masih nampak mainan, dan hotspot terapung tanpa *leader line*
- **Fail imej:** `r3-1440-dark-jamiah-000.png`, `r3-1440-dark-jamiah-020.png`, `r3-1440-dark-jamiah-080.png`, `r3-1440-light-jamiah-020.png`, `r3-390-dark-jamiah-040.png`
- **Punca:** Lebar `.story-card` (`min(430px, 38vw)`) + ofset `sx` terlalu kecil (`0.22`, `-0.26`) menyebabkan teks merentas dinding dan semak; anjakan bising pada sfera `shrub` (`* 0.26`) masih menghasilkan 12 ketulan hijau seragam; `glass` sisi nampak seperti tampalan coklat rata.
- **Pembaikan konkrit (`js/scenes/jamiah.js` & `immersive.css`):**
  - `immersive.css:165`: kecilkan lebar teks kepada `width: min(360px, 31vw);`.
  - `js/scenes/jamiah.js:21–22`: laras `p: 0.00` ke `d: 1.08, sx: 0.32` dan `p: 0.20` ke `d: 0.46, sx: -0.34`.
  - `js/scenes/jamiah.js:110, 190–192`: tukar `glass` kepada `color: 0x0d1b20, roughness: 0.08, metalness: 0.9, emissive: 0xdca055, emissiveIntensity: 0.48` (Malam); rendahkan kontras `shrub` (`color: 0x37402e`, anjakan `* 0.16`, atau gantikan jejari semak sfera dalam GLB dengan kotak pasu batu rendah + rimbunan berlapis + *bollard* gangsa kecil).

### 8. [P1] Hero Mobile 390px memotong potret pada garis lipatan + suis bahasa hilang dari header + butang `.to-top` bertindih/menduplikasi di luar `.chapter`
- **Fail imej:** `r3-390-dark-top-000.png`, `r3-1440-dark-manuskrip-050.png`, `r3-1440-dark-pingat-040.png`, `r3-1440-dark-hubungi-050.png`
- **Punca:** Ketinggian blok teks + 3 butang pada `390×844` menolak `.hero-card` hingga wajah potret terpotong di paras hidung/misai, `.lang-switch.in-header` tersembunyi di mobile, dan `.to-top` hanya disorokkan di dalam `.chapter` (`immersive.css:416`), bukan di `.feature` atau `#hubungi`.
- **Pembaikan konkrit (`immersive.css`):**
  - Dalam `@media (max-width: 680px)`: tetapkan `.hero-title { font-size: clamp(2.15rem, 9.6vw, 2.7rem); }`, `.hero-intro { font-size: 14px; margin-block: 10px 14px; }`, `.hero-actions .button { min-height: 44px; }` dan kekalkan pemilih bahasa padat di `.nav-actions` (atau butang kitaran `BM/EN/ع` `min-width: 44px; min-height: 44px`).
  - Pada `.heritage-art` (desktop & mobile): buang `.rosette` dan `.portrait-star` (`display: none;`) serta turunkan `.arch-kaleido { opacity: 0.12; }` supaya satu garis gerbang emas bersih membingkai foto sebenar pengguna tanpa kesesakan visual.
  - Buang `.to-top` terapung sepenuhnya (`.to-top { display: none; }`) kerana navbar melekit dan pautan `Kembali ke atas ↑` di kaki halaman sudah mencukupi.

---

## 4. Penilaian Keseluruhan

Secara jujur, **belum lagi setaraf "Awwwards SOTD / Apple product showcase", tetapi lompatan dari Pusingan 2 amat ketara** — laman ini kini sudah melepasi tahap "templat AI" dan berada pada paras **portfolio akademik berwibawa (~7.2/10)** dengan hero desktop Pagi/Malam yang matang, khat Diwan Thuluth yang meyakinkan pada fasad Jamiah, kulit kitab PDF dan skrin aplikasi sebenar, serta seksyen Hubungi yang tenang dan berkelas. Apa yang masih memisahkannya daripada taraf pameran Apple atau Awwwards bukan lagi arah seni, tetapi **disiplin kemasan akhir**: pepijat kekhususan CSS yang meninggalkan jalur hitam di bawah mod Pagi (`r3-1440-light-*`), perlanggaran peranti latar dengan teks cerita dalam Makmal (`light-makmal-084`, `dark-makmal-050`), kulit buku yang terpotong dan ditutup `Teroka 360°` di mobile (`r3-390-dark-pustaka-022`), jalur pantulan lantai kelabu dalam `common.js`, serta kualiti bahan Pingat dan Manuskrip yang masih ketinggalan jauh di belakang standard Jamiah dan Pustaka. Sebaik sahaja 3 isu P0 dan 5 isu P1 di atas diselesaikan secara tepat, laman ini akan benar-benar kukuh dan layak berdiri sebagai pameran portfolio akademik bertaraf antarabangsa.
