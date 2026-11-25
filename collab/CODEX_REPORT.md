# Laporan Codex — X-01 dan X-02

Tarikh: 25 November 2026. Branch disahkan: `immersive-3d`. Tiada commit, push, reset, clean atau deploy dijalankan. `MASTER_PROMPT.md`, `PLAN.md` dan `TASKS.md` dibaca sebelum perubahan.

X-01: aset optimum, skrip, ukuran, baca semula, validator dan ujian GLTFLoader dalam Node selesai. Semakan render WebGL masih perlu oleh integrator/Gemini kerana browser tidak tersedia dalam sesi ini. X-02: empat tekstur kulit depan sebenar dan kedua-dua manifest selesai. X-03 bukan skop sesi ini; belum dijalankan.

## Fail yang ditambah oleh Codex

- `assets/models/jamiah-imam.opt.glb`.
- `assets/textures/books/fiqh-halal-haram-front-2048.webp`, `fiqh-halal-haram-front-1024.webp`, `fiqh-quran-sunnah-front-2048.webp`, `fiqh-quran-sunnah-front-1024.webp`, dan `manifest.json` dalam direktori yang sama.
- `BOOK_COVER_MANIFEST.md` dan `collab/CODEX_REPORT.md`.
- `tools/package.json`, `package-lock.json`, `.gitignore`, `README.md`.
- `tools/optimize-glb.mjs`, `extract_covers.py`, `verify-gltfloader.mjs`, `glb-check.html`, `verify_browser.py`.
- `tools/reports/glb-optimization.json`, `jamiah-imam.glb.validation.json`, `jamiah-imam.opt.glb.validation.json`, `gltfloader-validation.json`, `optimize-command.log`, `fiqh-halal-haram-inspection.jpg`, `fiqh-quran-sunnah-inspection.jpg`.

Dependencies/cache/fail sementara hanya di bawah `tools/` dan diabaikan oleh `.gitignore` setempat. Tiada PNG master besar disimpan sebagai aset repo. Fail baharu milik agent lain yang terlihat melalui `git status` tidak disentuh.

## X-01 — hasil ukuran

Pipeline: `dedup → flatten → join → weld → dedup → prune`. Weld hanya menggabungkan verteks dengan atribut yang sama secara bitwise. Tiada pengurangan segi tiga, quantization, perubahan tekstur atau mampatan yang memerlukan decoder. Dua kumpulan dikekalkan: `POSITION + COLOR_0` dan `POSITION + TEXCOORD_0`.

| Ukuran | Asal | Optimum |
|---|---:|---:|
| Saiz fail (bait) | 1,273,252 | 659,540 |
| Mesh | 1,520 | 2 |
| Primitive | 1,520 | 2 |
| Node | 1,521 | 3 |
| Anggaran draw call, satu color pass | 1,520 | 2 |
| Verteks, jumlah POSITION per primitive | 24,117 | 23,200 |
| Segi tiga dalam scene | 42,154 | 42,154 |
| Material eksplisit | 1 | 1 |
| Material lalai implisit digunakan | Ya | Ya |
| Tekstur | 1 PNG, RGB 8-bit, 355 × 49 | Sama |
| Bait PNG tertanam | 33,520 | 33,520 |
| Normal tersimpan | Tiada | Tiada |
| Animation / skin / morph target | 0 / 0 / 0 | 0 / 0 / 0 |
| Extension digunakan / diwajibkan | 0 / 0 | 0 / 0 |

Saiz turun **48.20%**; draw call anggaran turun **99.87%**. Anggaran mengandaikan semua primitive kelihatan dan satu color pass; shadow pass menambah panggilan. Ini bukan ukuran FPS atau benchmark GPU.

Bounding box ruang dunia adalah sama sebelum/selepas (nilai dibundarkan di bawah; JSON mengandungi ketepatan penuh):

| Komponen | X | Y | Z |
|---|---:|---:|---:|
| Min | -12 | -0.379999995 | -12 |
| Max | 12 | 9.689999580 | 12 |
| Size | 24 | 10.069999576 | 24 |
| Center | 0 | 4.654999793 | 0 |

Origin/pivot keseluruhan kekal `(0, 0, 0)`, faktor rescale `1`. Wrapper `world` mempunyai transform identiti. Paksi atas ruang dunia ialah `+Y`; transform asal daripada ruang geometri dikekalkan, jadi jangan tambah putaran pembetulan paksi tanpa semakan. Unit jarak ialah meter mengikut [konvensyen glTF](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#coordinate-system-and-units); ketepatan ukuran seni bina fizikal tidak disahkan.

SHA-256 GLB asal: `3a6f27f9b129c5a46b4d66b22f24df150120032a62ef6e5da3d922cb9b0e0a84`.

SHA-256 GLB optimum: `1557b69247a0ae2dbca9cf470345ae0d7cdf757fecc05e3f12cc54d1b064778e`.

SHA-256 PNG tertanam (sama): `ba981fa1d53a90071932f5fb52f684d99278357f7d33c807b5d9ce492ce587db`.

### Pengesahan yang benar-benar dijalankan

1. Output dibaca semula dengan NodeIO. Bounding box dibandingkan pada toleransi `1e-5`; nilai sebenar adalah sama. Material bersiri dan bait tekstur dibandingkan dan sepadan.
2. Multiset semua 42,154 segi tiga berorientasi dibandingkan, termasuk kedudukan ruang dunia, UV/warna setiap sudut dan perkaitan material. Ketepatan fingerprint ialah lima tempat perpuluhan; hash sama `257c086ce09025cda3c07704f30d2e8b6bd2277593b9bc587592f64236fba3ea`. Pembalikan winding tidak dianggap setara. Normal tidak dijana kerana sumber tiada normal; sifat flat shading dikekalkan.
3. Khronos glTF Validator `2.0.0-dev.3.10` dijalankan tanpa had jumlah isu (`maxIssues: 0`); kedua-dua laporan lengkap, tidak truncated. Kedua-duanya **0 error, 0 warning**. Asal mempunyai 1,548 hint `BUFFER_VIEW_TARGET_MISSING`; optimum 0 hint. Kedua-duanya mempunyai 2 info: PNG bukan kuasa dua dan 64 segi tiga degenerat yang sudah ada pada sumber. Segi tiga ini dikekalkan untuk mengelakkan perubahan geometri yang tidak diminta.
4. Modul **Three.js r187 dan GLTFLoader sebenar daripada `vendor/`** memuatkan kedua-dua GLB melalui `parseAsync` dalam Node 24.22.1, tanpa konfigurasi decoder. Semakan mengesahkan kiraan mesh/segi tiga, semua mesh `flatShading=true`, vertex color, satu tekstur sRGB 355 × 49 yang berjaya didekod, dan bounding box yang sama. Shim ImageBitmap menggunakan sharp 0.35.5 untuk penyahkodan PNG pada CPU. **Ini bukan ujian upload GPU atau render WebGL.** Bukti: [gltfloader-validation.json](../tools/reports/gltfloader-validation.json).
5. GLB asal dan kedua-dua PDF dibandingkan bait demi bait dengan `git show HEAD:<path>`; semuanya sama. Skrip juga menyemak hash sumber sebelum/selepas.

Nama mesh/node per bahagian dan metadata `extras` per bahagian tidak lagi sesuai selepas penggabungan; ia digantikan dengan nama agregat `jamiah-static-*`. Jangan bergantung pada nama asal untuk hotspot/animasi per bahagian. UV, warna, material dan geometri dipelihara. Rujukan pipeline: [join](https://gltf-transform.dev/modules/functions/functions/join), [flatten](https://gltf-transform.dev/modules/functions/functions/flatten).

## X-02 — kulit sebenar PDF

Kedua-dua sumber bermula `%PDF-1.4`. Semakan visual meliputi indeks `0,1,2,3` serta tiga halaman terakhir: Halal/Haram `135,136,137`; Quran/Sunnah `167,168,169`. Contact sheet disimpan di `tools/reports/*-inspection.jpg`.

Kulit depan sebenar ialah **halaman 1, indeks 0** bagi kedua-dua buku. Halaman 2 ialah judul dalaman; halaman 3 hak cipta; halaman 4 prakata. Tiga halaman terakhir ialah bibliografi/bacaan tambahan. **Tiada kulit belakang sebenar ditemui; `back_page_index=null` dan tiada fail `-back-*` dicipta.**

Render: RGB 300 DPI, 2479 × 3508 px. Resize Lanczos tanpa crop, cwebp 1.6.0 dengan `-q 95 -m 6 -sharp_yuv -metadata none`. WebP dibuka semula untuk pengesahan format/dimensi. Semakan visual output mengesahkan kulit lengkap termasuk nama pengarang dan bingkai.

| Buku / tekstur | Halaman PDF | Dimensi | Bait | Warna dominan |
|---|---:|---:|---:|---|
| fiqh-halal-haram-front-2048.webp | 138 | 1447 × 2048 | 200,616 | `#661514` |
| fiqh-halal-haram-front-1024.webp | 138 | 724 × 1024 | 81,422 | `#661514` |
| fiqh-quran-sunnah-front-2048.webp | 170 | 1447 × 2048 | 390,254 | `#022B59` |
| fiqh-quran-sunnah-front-1024.webp | 170 | 724 × 1024 | 141,254 | `#022B59` |

Nisbah halaman W/H `0.706670435`; tekstur 2048 `0.706542969`, tekstur 1024 `0.707031250`. Perbezaan kecil akibat pembundaran piksel sahaja. Warna dominan diambil daripada kulit penuh menggunakan palet median-cut 8 warna pada thumbnail 128 px; ia cadangan bahan spine neutral, bukan ekstraksi spine sebenar.

SHA-256 PDF Halal/Haram: `9d4de6f2bc5dd3a37cab1a1544e6750eac0c6649e127806a7bd840a33fd317ec`.

SHA-256 PDF Quran/Sunnah: `b8952c1d264f5105a11ed80dc234b2f8165ba2ed378223285798adbc25bf88e4`.

Metadata lengkap, hash setiap WebP dan laluan: [manifest.json](../assets/textures/books/manifest.json). Ringkasan integrasi: [BOOK_COVER_MANIFEST.md](../BOOK_COVER_MANIFEST.md). Tiada kulit rekaan atau perubahan kandungan PDF.

## Command sebenar dan persekitaran

Command utama dijalankan dari akar repo (bukan arahan yang hanya dicadangkan):

```sh
git status --short
git branch --show-current
cat collab/MASTER_PROMPT.md collab/PLAN.md collab/TASKS.md
mkdir -p tools
npm view @gltf-transform/core version --cache tools/.npm-cache
npm view @gltf-transform/functions version --cache tools/.npm-cache
npm view gltf-validator version --cache tools/.npm-cache
npm install --prefix tools --cache tools/.npm-cache --no-audit --no-fund
npm install --prefix tools --cache tools/.npm-cache --no-audit --no-fund --save-exact sharp@0.35.5
node tools/optimize-glb.mjs
node tools/optimize-glb.mjs > tools/reports/optimize-command.log
node tools/verify-gltfloader.mjs
/usr/bin/python3 tools/extract_covers.py
/usr/bin/python3 tools/extract_covers.py --inspect-only
/opt/homebrew/bin/cwebp -version
node --check tools/optimize-glb.mjs
node --check tools/verify-gltfloader.mjs
git diff --check -- tools assets/models/jamiah-imam.opt.glb assets/textures/books BOOK_COVER_MANIFEST.md collab/CODEX_REPORT.md
```

Dependencies dipin: `@gltf-transform/core` 4.5.1, `@gltf-transform/functions` 4.5.1, `gltf-validator` 2.0.0-dev.3.10, sharp 0.35.5. Python 3.9 dengan PyMuPDF 1.26.5 dan Pillow 11.3.0 yang sudah tersedia. `cwebp` melaporkan 1.6.0 (libsharpyuv 0.4.2). pdftoppm tersedia tetapi tidak digunakan; render dilakukan oleh PyMuPDF.

Skrip Python inline turut dijalankan untuk membaca header/JSON GLB, mengira SHA-256, memaparkan teks/saiz halaman PDF, menghasilkan contact sheet awal serta pratonton WebP, membaca versi dependencies dan membandingkan sumber dengan HEAD. Semakan visual dibuat dengan alat `view_image`. Semua fail perantaraan yang ditulis berada di `tools/scratch/`.

Audit akhir inline lulus: sintaks kedua-dua skrip Python melalui `ast.parse`, hash/saiz/dimensi keempat-empat WebP sepadan manifest, tiada fail belakang, hash GLB sepadan laporan, dan semua sumber masih sepadan HEAD. Semakan sintaks Node juga lulus. `git diff --check` tidak melaporkan isu; semua fail Codex masih untracked, jadi semakan itu bukan bukti pemeriksaan whitespace bagi fail baharu.

Percubaan browser sebenar:

```sh
/usr/bin/python3 -m pip install --target tools/scratch/python --no-cache-dir playwright
/usr/bin/python3 '/Users/sufyanthawry/.agents/skills/webapp-testing/scripts/with_server.py' --help
PYTHONPATH="$PWD/tools/scratch/python" TMPDIR="$PWD/tools/scratch" /usr/bin/python3 '/Users/sufyanthawry/.agents/skills/webapp-testing/scripts/with_server.py' --server '/usr/bin/python3 -m http.server 8765 --bind 127.0.0.1' --port 8765 -- /usr/bin/python3 tools/verify_browser.py
/usr/bin/python3 -m http.server 8765 --bind 127.0.0.1
```

Playwright 1.60.0 berjaya dipasang dalam scratch. Server berjaya bermula. Chrome headless keluar dengan `SIGABRT`/`TargetClosedError` sebelum halaman dibuka; log turut mengandungi `kill EPERM`. Punca khusus tidak didiagnosis. Percubaan CUA `createBrowserTab('iab', 'http://127.0.0.1:8765/tools/glb-check.html', {visible:true})` memulangkan `Browser is not available: iab`; `cua.listBrowsers()` memulangkan `[]`. Kedua-dua server yang dimulakan telah dihentikan. Tiada screenshot render, perbezaan piksel, skor prestasi atau FPS didakwa.

Percubaan awal `rg` gagal kerana tidak tersedia; `find`/`grep` digunakan. Percubaan `npm view` dengan cache lalai gagal `EPERM` pada `~/.npm`; penggunaan cache `tools/.npm-cache` menyelesaikannya tanpa mengubah permission atau fail luar skop.

## Tindakan seterusnya untuk Claude/Gemini

1. Tukar pemuatan scene kepada `assets/models/jamiah-imam.opt.glb`; putarkan keseluruhan `gltf.scene` bagi yaw scroll. Kekalkan vertex color, tekstur dan flat shading. Nama komponen asal tidak lagi tersedia.
2. Jalankan `tools/glb-check.html` melalui server tempatan pada browser yang tersedia. Harness membandingkan empat sudut dan jumlah panggilan render; `tools/verify_browser.py` menyediakan automasi/screenshot apabila Chrome boleh dilancarkan. Semak rupa, terutama papan bertekstur dan tepi/kubah, sebelum integrasi akhir.
3. Muat metadata kulit daripada manifest array; gunakan sRGB, nisbah halaman asal untuk bentuk buku, dan bahan neutral bagi belakang/spine. Pilih 1024 atau 2048 berdasarkan tahap kualiti yang diperlukan.
4. Jalankan X-03 selepas C-02 hingga C-04 siap: integrasi scroll/manual, mobile, RTL dan prestasi sebenar. Pengurangan draw call ini tidak membuktikan sasaran FPS laman sudah dicapai.

## Pusingan 2

25 November 2026 — implementasi empat babak pada branch `immersive-3d`. Fail yang dicipta: `js/scenes/library.js`, `js/scenes/devices.js`, `js/scenes/medals.js`, `js/scenes/manuscript.js`, `js/scenes/common.js`. Laporan ini hanya ditambah di hujung. Tiada commit, push, reset atau clean. Fail integrasi/CSS/markup/rig/jamiah milik agent lain tidak diubah oleh Codex.

### Kontrak dan bahan

Semua modul mengeksport `default async create(ctx)` dan memulangkan `scene`, `camera`, `update(delta)`, `resize`, `onActivate`, `onDeactivate`, `dispose`. `update` memulangkan false selepas pose/kamera stabil; tiada animasi idle berterusan, RAF tambahan, pasca-proses, dependency atau CDN baharu. Semua gerakan model/lampu ditentukan oleh p. Teroka menggunakan OrbitControls melalui `Rig`, dengan HUD sedia ada.

`common.js` mengurus sumber GPU, lantai PBR zamrud, cahaya hangat/rim, bayang sentuh lembut, geometri bevel, penggabungan geometri statik, tekstur prosedur neutral dan pengawal babak. `SceneRig extends Rig` mengekalkan API Teroka/zoom/reset tetapi mengatasi `scripted()` dengan interpolasi ke objek/vectors sedia ada; ini mengelakkan peruntukan objek `sampleKeys()` setiap pose. Tiada pembinaan geometry/material/texture/vector dalam gelung update babak. Rig asal tidak diubah. Kamera menggunakan dolly, elevation dan ayunan azimut; bukan FOV animasi. Pemerhati `dir` menandakan kamera dirty apabila RTL berubah ketika skrol berhenti.

Buku membaca `aspect_ratio`, `page_count` dan `dominant_color_hex` daripada manifest sebenar. Kulit depan menggunakan WebP 2048/1024 mengikut tier, UV penuh tanpa crop/cermin, sRGB, anisotropy maksimum. Kulit belakang/tulang neutral; ketebalan ialah anggaran daripada jumlah helaian. Peranti menggunakan tepat tiga tangkapan aplikasi yang dibekalkan dengan nisbah asal; skrin emissive, `toneMapped:false`. Bingkai kaca berasingan daripada imej supaya pantulan tidak menutup UI. Tier low mengecilkan imej peranti ke sisi panjang maksimum 1024 pada canvas sebelum upload GPU (fail sumber asal masih dimuat melalui rangkaian). Semua tekstur prosedur maksimum 512, shadow map low 1024/high 2048. `ctx.env` dikongsi dan tidak dilupuskan oleh babak.

Halaman buku/manuskrip hanya mempunyai tekstur kertas dan bingkai geometri; tiada teks/ayat/kaligrafi. Pingat generik mempunyai cakera, rim, relief bintang lapan pada kedua-dua muka, gelung, reben dan gerigi sisi; tiada nama/logo pertandingan.

### Koreografi mengikut p

| Babak | Julat p dan tindakan |
|---|---|
| Pustaka | 0–0.16: dua buku terapung, dolly ke buku pertama. 0.16–0.28: muka pertama ditahan ke kamera, subjek ke sisi bertentangan kad start; checkpoint 0.22. 0.315: makro kulit. 0.30–0.60: kulit berengsel terbuka dan 3/5 helaian berlengkung diselak; kamera naik kemudian berundur. 0.50: kedua-dua buku dalam komposisi luas. Buku pertama berputar penuh sepanjang 0.28–0.68; buku kedua sepanjang 0.06–0.70. 0.72–0.84: muka kedua ditahan, checkpoint 0.78 dan anjakan bertentangan kad end. 0.865: makro kulit kedua. 0.85–1: buku kedua dibuka/diselak dan kamera keluar. |
| Makmal | 0.015–0.12: penutup laptop dibuka dari posisi tertutup. 0.12–0.20: paparan laptop menghadap kamera, checkpoint 0.16; makro pada 0.225. 0.20–0.44: komposisi berorbit ke 180°, berundur/elevation pada 0.32, tablet dibawa ke hadapan. 0.44–0.56: tablet menghadap kamera, checkpoint 0.50; makro pada 0.585. 0.56–0.78: komposisi melengkapkan 360°, berundur pada 0.68. 0.78–0.90: telefon menghadap kamera, checkpoint 0.84; makro pada 0.925. 1: komposisi luas. Peranti utama mengimbangi orientasinya agar skrin dapat dibaca, sementara susunan keseluruhan berputar. |
| Pingat | `pass` pada `.feature#pingat`. 0.04–0.44: separuh putaran syiling, emas/perak berlawanan arah. 0.40: makro relief emas. 0.44–0.56: kedua-dua muka hadapan, termasuk pusat viewport p≈0.50. 0.60: makro perak. 0.56–0.96: lengkapkan 360° setiap pingat. Lampu sorot menyapu relief sepanjang 0.28–0.70; kamera berundur dan naik pada 0.78–1. |
| Manuskrip | `pass` pada `.feature#manuskrip`. 0–1: kitab dan dua papan rehal bersilang berputar penuh 360°. 0–0.24: kamera naik untuk melihat struktur buku. 0.24–0.42: dolly makro halaman dengan elevation hingga 62°. 0.27–0.72: satu helaian bergerak dari kanan, melengkung/terangkat, lalu mendarat di kiri; posisi dan normal dikira secara analitik dalam buffer sedia ada. 0.42–0.56: makro dekat lipatan. 0.56–1: kamera turun dan keluar untuk menunjukkan rehal. |

Makro selepas tempoh bacaan sengaja boleh memotong sebahagian permukaan objek; checkpoint kad mengekalkan seluruh kulit/skrin dalam bingkai. Semua laluan boleh berbalik. Apabila `motionPaused()`, pustaka/manuskrip menggunakan pose luas p=0; makmal/pingat menggunakan p=0.5. Klik `[data-book-view]` menatal terus ke 0.22/0.78, menyelesaikan scrub semasa, menggunakan pose checkpoint lalu memasuki Teroka. Dalam mod jeda, buku yang diklik menjadi pose stabil terpilih. HUD menyediakan rotate/zoom/reset/keluar.

Cangkuk ujian: `window.__profile3d.pustaka`, `.makmal`, `.pingat`, `.manuskrip`, masing-masing mengandungi `progress`, `yawDeg`, `distanceRatio`, `mode`, `tier`; tambahan: `secondYawDeg/firstOpen/secondOpen`, `lidOpenDeg/focus`, `silverYawDeg/lightX`, `pageTurn/pageTurnDeg`. `yawDeg` melaporkan putaran koreografi; ayunan azimut kamera kecil tidak ditambah pada bacaan itu.

### Bajet dan semakan yang dijalankan

Kiraan daripada scene graph Three.js sebenar, bukan renderer WebGL. Color pass dianggarkan satu draw call per mesh dengan satu material; frustum culling boleh mengurangkannya. Shadow pass/VSM blur boleh menambah draw call.

| Babak | Color draw call high / low | Segi tiga high / low | Mesh `castShadow` high / low |
|---|---:|---:|---:|
| Pustaka | 23 / 19 | 4,522 / 3,050 | 20 / 16 |
| Makmal | 30 / 30 | 24,154 / 24,154 | 23 / 23 |
| Pingat | 9 / 9 | 13,686 / 9,078 | 6 / 6 |
| Manuskrip | 14 / 14 | 2,952 / 2,568 | 12 / 12 |

Kekunci laptop digabungkan menjadi satu mesh, begitu juga butang sisi peranti, perincian rim/bintang/gerigi setiap pingat, reben setiap pingat, papan rehal, jalur logam dan hiasan sudut kitab. Tiada render target atau composer milik babak. `dispose()` membersihkan geometry, material, texture, light shadow maps, controls, HUD dan event/pemerhati yang dimiliki modul; environment/renderer manager dikekalkan.

Semakan lulus:

- `node --check` untuk kelima-lima fail JS baharu.
- Semua import baharu diselesaikan ke fail tempatan; `three` ke `vendor/three/three.module.min.js`, addon tambahan hanya `utils/BufferGeometryUtils.js`; OrbitControls diwarisi melalui rig.
- ID/selector `pustaka`, `makmal`, `pingat`, `manuskrip`, kedua-dua slug butang dan checkpoint 0.22/0.78 serta 0.16/0.50/0.84 dibandingkan dengan `index.html`; semuanya sepadan. Peta LOADERS sedia ada sudah memadankan nama fail.
- Harness sementara `/tmp/profile3d-round2-check.mjs` menggunakan Three.js r187 tempatan, metadata WebP sebenar melalui sharp yang sudah tersedia, dengan DOM/canvas/TextureLoader tiruan. Lapan kombinasi babak/tier berjaya dicipta.
- 101 sampel p maju dan undur bagi setiap kombinasi menghasilkan matriks objek/kamera yang sama; semua koordinat geometri finite. Panggilan kedua pada p sama memulangkan false. Pose jeda kekal apabila p skrol berubah.
- Resize 1440×900 dan 390×844, LTR/RTL, mod Teroka, zoom, reset dan kembali ke skrol lulus pada tahap logik/matriks. Di checkpoint buku/peranti, normal muka utama mempunyai dot product >0.9 dengan arah kamera dan seluruh permukaan terletak dalam NDC viewport desktop.
- Semua tekstur milik babak dalam tier low mempunyai dimensi ≤1024; shadow-map setting ikut bajet. Setiap geometry/material/texture yang dirujuk scene graph menerima event dispose sekali; dispose kedua tidak mengulang pelepasan. Cangkuk ujian dibuang apabila dispose.
- Semakan whitespace fail baharu lulus.

### Belum diuji dan permintaan kepada Claude

**Belum diuji:** browser/Chromium, kompilasi shader dan upload GPU, render sebenar, warna/pantulan/bayang, keterbacaan tajuk/UI, pertindihan kad dan bingkai gerbang, gesture sentuh, klik butang buku dengan GSAP sebenar, fullscreen, pertukaran renderer antara babak, pemulihan WebGL context, FPS, penggunaan VRAM serta `renderer.info.render.calls`. Semakan matriks tidak menggantikan QC visual Gemini. Tiada screenshot atau sasaran FPS didakwa.

1. Jalankan QC Chromium pada checkpoint dan titik makro di atas, mobile/RTL, scroll terbalik, jeda, Teroka/zoom/reset serta pertukaran babak. Perhatikan khususnya halaman yang diselak, kedalaman peranti di 180°, dan potongan subjek pada bingkai gerbang. Semak `renderer.info` bagi draw call sebenar termasuk shadow pass.
2. `chapterUI()` dalam `js/hud.js` belum memulangkan `dispose()` bagi MutationObserver bahasa; `scrollProgress()` dalam `js/scene-manager.js` belum memberi fungsi cleanup untuk listener fallback tanpa GSAP. Mohon tambah API pelupusan pada kedua-dua helper untuk menutup potensi listener/observer tertinggal selepas context restore. Modul kini membersihkan pasangan ScrollTrigger/tween miliknya dan elemen rel, tetapi tidak boleh memutuskan observer/listener dalaman yang tidak didedahkan. Tiada perubahan fail luar skop dibuat.
3. `Rig` mengikat OrbitControls kepada canvas yang dikongsi. Sila semak interaksi selepas load/restore beberapa babak: dispose/connect controls boleh menukar `touchAction` canvas bersama. Ini memerlukan QC integrator; modul menggunakan API sedia ada.

Tiada perubahan markup, CSS, LOADERS atau dependency diperlukan untuk memuatkan keempat-empat babak ini.
