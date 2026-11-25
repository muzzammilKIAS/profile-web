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
