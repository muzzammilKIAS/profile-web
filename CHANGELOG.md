# CHANGELOG

## immersive-3d (25 Nov 2026), belum diterbitkan

### Ditambah
- **Bab Jamiah Imam (3D, berpin):** maket pintu gerbang Universiti Islam Imam Muhammad bin Saud di atas plinth galeri. Skrol mengawal satu putaran penuh 0→360°. Lapan syot sinematik: establishing, close-up kekisi gerbang, lalu rendah di sisi, orbit tinggi, pandangan belakang, close-up kubah dan menara, kamera naik, aerial reveal. Skrol ke atas membalikkan gerakan dengan tepat. Kad pendidikan (Diploma, Sarjana Muda, Sarjana) muncul pada titik semak. Hotspot hanya pada unsur fizikal (gerbang, kubah, menara).
- **Khat papan tanda penuh** «جامعة الإمام محمد بن سُعود الإسلامية» dalam Thuluth (fon Diwan Thuluth), 4096 px. Menggantikan tekstur asal yang kabur dan nampak terpotong.
- **Mod Teroka 360°:** seret, cubit atau roda untuk zum, butang Zum +/−, Set semula, Skrin penuh, Jeda gerakan, Sambung skrol dan Esc. Roda dan sentuhan menatal halaman seperti biasa di luar mod Teroka.
- **Pustaka 3D:** dua buku terapung dengan kulit sebenar daripada PDF. Kedua-duanya berputar 360°, terbuka dengan helaian diselak, dan kamera zum ke kulit. Butang Lihat buku 3D, Pratonton PDF dan Muat turun PDF.
- **Makmal Inovasi Digital 3D:** komputer riba, tablet dan telefon dengan tangkapan sebenar e-Hadis40, Fiqh Manhaji dan Haji Pintar. Pendedahan produk berlapis dengan butang Buka aplikasi sebenar.
- **Manuskrip di atas rehal** (kitab terbuka, helaian diselak, halaman neutral tanpa teks) dan **pingat emas/perak generik** (relief bintang lapan, reben zamrud/lapis).
- **Versi Pagi / Malam:** suis tema menjadi butang pil Pagi/Malam. Malam ialah galeri zamrud dengan lampu hangat dan tingkap bercahaya. Pagi ialah matahari pagi Riyadh di atas latar gading. Berlaku pada semua babak 3D, poster dan bab.
- Identiti gerakan berbeza bagi setiap bahagian: *unveil* (Tentang), *trace* (Akademik), *ledger* (Bidang, Pengalaman), *strike* (Pencapaian), *deck* (Aplikasi), *portal* (Hubungi).
- Butang magnetik (tarikan 6 px), sempadan emas beranimasi, kilau ikut penuding.
- Kaleidoskop dinaik taraf menjadi roset geometri Islam (bintang {n/k} bersarang + jalinan girih, garis emas halus) yang berubah bentuk mengikut skrol. Juga menjadi medalion pada lantai galeri Jamiah.
- Bayang mashrabiyya yang bergerak merentasi bahagian ketika ia masuk.
- SEO: canonical, Open Graph, Twitter card, JSON-LD Person (data sedia ada sahaja).
- Poster render sebenar untuk setiap pentas (Pagi dan Malam), sandaran tanpa WebGL (`?no3d`), pemulihan konteks WebGL, DPR adaptif, rel bahagian dan butang kembali ke atas.

### Diubah (semakan Gemini)
- Pengepala kabur tidak lagi dibocori kandungan; label minimum 12 px; potret tidak diulang dalam avatar; senarai penerbitan kembali kepada baris editorial; 6 pembetulan RTL (bar kemajuan, tajuk LTR dalam Arab, anak panah, hiasan dicerminkan, sheen Arab).
- Dibuang sebagai "AI slop": pil kicker, gradien kilau pada nama, aksara ✧ gergasi, pembahagi gerbang bergigi, friz bintang berulang, kad kaca gelap di atas model (kini teks editorial dengan garis paksi emas), nota penafian terang (kini butang (i)), berlian bertindih dalam kotak Hubungi, dan butang terapung di atas pentas 3D.

### Pusingan 3 (semakan kod bebas + Gemini)
- Kebocoran sumber dan keadaan basi selepas pemulihan konteks WebGL dibaiki; gelung render berhenti apabila senyap; pendedahan per babak; kamera ikut arah bahasa.
- Peralihan **portal gerbang runcing** berbingkai emas ke dalam setiap bab 3D.
- Scrim versi Pagi, susun lapis Makmal, pembingkaian buku mobile, lantai studio, bahan pingat dan manuskrip, lajur teks Jamiah.

### Pusingan 4 (26 Nov 2026, permintaan pemilik)
- **Buku ketiga dalam Pustaka 3D:** *Bahasa Arab Asas untuk Muamalat* (اللغة العربية الأساسية للمعاملات), kulit sebenar daripada halaman 1 PDF. PDF 201 halaman dimampatkan daripada 43 MB kepada 6 MB (imej 150 dpi). eISBN ditulis "dalam permohonan" kerana PNM belum mengeluarkan nombor. Koreografi Pustaka ditulis semula untuk tiga buku: setiap buku mara sambil berputar 360°, berhenti pada kulit, terbuka dan diselak; buku lain beralih ke sisi bertentangan dengan teks.
- **Artikel Rabbanica** (*Analisis Pragmatik dan Siyāq Hadis Adab Membuang Air serta Implikasi Hukumnya*) dinaikkan sebagai artikel pertama dan ditanda "Disember 2026" atas makluman pemilik. Jilid, halaman dan pautan tidak ditambah: setakat 26 Nov 2026 laman jurnal masih memaparkan Vol. 7 No. 1 (Mei 2026) sebagai isu terkini.
- **Dibuang atas permintaan pemilik:** tajuk "Kitab di atas rehal" dan ayat arahannya; ayat pembuka Jamiah ("Tiga kelayakan saya diperoleh di sini…"); tiga label hotspot (pintu gerbang berkekisi, kubah masjid, menara).
- **Kitab di atas rehal:** halaman berhias roset geometri emas (tanpa teks), helaian mempunyai muka depan dan belakang berasingan, kamera lebih rapat, dan susunan gerakan baharu: pusingan penuh, mendekati halaman, kemudian helaian diselak. Skrub dilicinkan (1.1 s bagi babak ciri, 0.8 s bagi bab berpin).
- **Pepijat dibaiki:** kad "Bidang" dan panel "Pengalaman" tidak pernah muncul kerana animasi masuknya menggunakan `clip-path` penuh, yang menjadikan luas elemen sifar bagi IntersectionObserver. Kini menggunakan topeng (`mask-size`).
- Inventori kini 13 penerbitan (3 buku). QA automatik: 31/31 lulus.

### Pusingan 5 (26 Nov 2026, permintaan pemilik: warna 3D lebih terang, jelas dan tajam)
- **Gred warna dalam shader:** tone mapping ACES (yang melunturkan warna) diganti dengan Neutral, ditambah sedikit ketepuan dan lengkung-S kontras. Tiada pas tambahan, jadi tiada kos prestasi.
- **Buku:** kulit sebenar kini memaparkan merah, biru dan emas asalnya (sedikit emisif, tidak dikaburkan kabus).
- **Peranti:** skrin tidak lagi berkabus atau memantul; tangkapan aplikasi sebenar jelas dalam Pagi dan Malam.
- **Jamiah:** kubah biru lebih kaya, tingkap bercahaya ambar pada waktu Malam, tumbuhan lebih hijau, langit Pagi lebih biru, bayang lebih tegas.
- **Kitab di atas rehal:** bingkai lapis dan emas serta roset berisi lapis (masih tanpa teks). **Pingat:** emas dan reben lebih kaya.
- Poster semua pentas dijana semula. QA automatik: 31/31 lulus (Chromium dan WebKit).

### Tidak diubah
- Semua fakta akademik, terjemahan, potret, PDF dan pautan. Inventori disahkan sama dengan baseline: 7 pendidikan, 3 bidang, 2 anugerah, 4 kepujian, 10 sijil, 13 penerbitan (12 asal + buku ketiga), 9 aplikasi, 6 pengalaman, 7 kursus.
