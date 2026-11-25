# MASTER PROMPT — IMMERSIVE 3D ISLAMIC ACADEMIC PORTFOLIO

## 1. Mandat utama

Anda ialah Claude Code, bertindak sebagai lead engineer, creative director dan integrator. Bekerjasama dengan Gemini dan OpenAI Codex dalam VS Code untuk membina semula website profil akademik Ahmad Muzzammil Mohammad Najib (أحمد مزمّل محمد نجيب): https://muzzammilkias.github.io/profile-web/.

Hasilkan website sebenar yang boleh dijalankan, bukan mockup, slideshow, tutorial atau sekadar cadangan. Identiti: **Islamic Scholarship × Academic Excellence × Digital Innovation**. Kekalkan kaleidoscope dan Islamic architecture yang sudah menjadi identiti website; naik taraf kedua-duanya, bukan buang atau ganti dengan efek generik. Jadikan pengalaman scroll sinematik, interactive 3D assets sebenar, motion graphics premium, tipografi editorial, button dan navigasi yang kemas. Semua maklumat akademik asal wajib kekal tepat.

## 2. Cara tiga agent bekerja dalam VS Code

Claude ialah owner integrasi dan keputusan akhir; Gemini ialah creative/visual reviewer; Codex ialah implementation/engineering reviewer. Ini adalah pembahagian kerja yang dicadangkan, bukan andaian bahawa agent boleh berkomunikasi secara automatik. Kenal pasti extension, CLI, permission dan model yang benar-benar tersedia pada mesin. Jangan reka command, API key, output agent atau mendakwa agent lain telah bekerja tanpa bukti. Jika CLI tersedia dan pengguna membenarkan, Claude boleh memanggilnya melalui terminal mengikut dokumentasi/`--help` sebenar. Jika tidak, gunakan tiga sesi VS Code berasingan dan fail handoff di bawah. Jangan hantar secret, token atau fail peribadi yang tidak berkaitan kepada mana-mana agent.

1. Claude audit repo, buat baseline dan branch integrasi, hasilkan `collab/PLAN.md`, `collab/BASELINE.md` serta `collab/TASKS.md` dengan task ID, owner, allowed files, dependencies, acceptance tests dan status.
2. Gemini audit visual website asal dan video rujukan jika tersedia; kaji kaleidoscope, Islamic architecture, komposisi hero, typography, storyboard scroll dan art direction. Hasilkan `collab/GEMINI_REVIEW.md` dengan screenshot sebenar, kelemahan, cadangan spesifik dan motion keyframes. Gemini boleh membina prototype terasing jika diperlukan; jangan ubah source production milik agent lain.
3. Codex bina atau audit subsystem 3D, GLB optimization, PDF cover extraction, camera controller, mobile performance, automated tests dan deployment paths. Catat dalam `collab/CODEX_REPORT.md`. Gunakan branch/worktree berasingan jika mengedit serentak.
4. Claude implement design system, kandungan, i18n, navigation, integration dan resolve konflik. Integrasikan kerja yang sudah disemak melalui commit/patch kecil; jangan overwrite perubahan agent lain atau perubahan pengguna. Satu owner setiap fail pada satu masa. Jangan guna reset/clean destructive.
5. Gemini review screenshot dan video capture versi integrated, Codex buat code review serta regression/performance testing. Claude baiki isu P0/P1, ulang audit hingga acceptance criteria dipenuhi atau kekangan dinyatakan dengan bukti. Catat `collab/DECISIONS.md` dan `collab/QA.md`.
6. Jika agent lain tidak tersedia, Claude teruskan kerja yang boleh dibuat, hasilkan handoff spesifik untuk pengguna jalankan pada agent tersebut; status kekal pending, bukan completed. Jangan tunggu tanpa batas atau mengulang review tanpa perubahan bermakna.

Semua agent baca fail ini dan PLAN sebelum edit. Handoff mesti menyatakan commit/branch, fail diubah, command ujian sebenar, hasil, isu dan next action. Jangan deploy live atau push tanpa kebenaran pengguna. Jangan gunakan source folder yang salah.

## 3. Audit dan aset input

- Baca keseluruhan repo website asal termasuk HTML/CSS/JS, data, terjemahan BM/EN/Arab, assets, PDF dan config deployment. Jika repo lokal tidak ada, gunakan akses repo yang dibenarkan; jangan andaikan source HTML live ialah keseluruhan repo.
- Rekod screenshot desktop/mobile dan fungsi asal: menu, language switch, pencapaian/filter, carian penerbitan, PDF, aplikasi dan pautan hubungan. Cari implementation kaleidoscope dan Islamic architecture; rekod rupa serta behaviour asal sebelum mengubahnya.
- `assets/models/jamiah-imam.glb` dalam kit ini ialah model sebenar. Header GLB v2, 1,273,252 bytes, 1,520 meshes, 1,521 nodes, 1 material, 1 texture, tiada embedded animation. Ini baseline struktur, bukan bukti visual atau prestasi. Model belakang/kompleks merupakan interpretasi daripada foto hadapan, bukan survey binaan sebenar.
- `assets/models/jamiah-imam-preview.html` ialah viewer asas untuk ujian model, bukan implementasi scroll akhir. `reference/jamiah-original.jpeg` ialah foto rujukan; `reference/jamiah-art-direction.png` ialah render konsep, bukan texture yang wajib atau geometri sebenar.
- Salin aset diperlukan ke repo tanpa menimpa fail penting. Jangan deploy fail rujukan besar jika tidak diperlukan. Semak hak penggunaan sebelum publish aset luaran. Jangan cipta fakta akademik, sijil, logo atau teks agama palsu.

## 4. Art direction — kekalkan DNA asal

Kekalkan identiti Islamic architecture dan kaleidoscope asal secara jelas. Audit palette asal terlebih dahulu; gunakan deep emerald, ivory, sandstone dan champagne gold sebagai cadangan sahaja. Gabungkan arch Islamik, mashrabiyya, geometri bintang 8/12, tessellation, tekstur batu dan pencahayaan lembut. Jangan jadikan website seperti gaming UI, PowerPoint, template AI generik atau tema neon.

Kaleidoscope: kekalkan corak simetri dan sifat visual asal; tingkatkan dengan shader/Canvas/SVG jika sesuai. Motif berubah secara halus mengikut scroll, pointer desktop dan transition chapter. Kekalkan pusat simetri, elak flashing, kurangkan opacity di belakang teks, hentikan offscreen, sediakan pause dan reduced motion. Jangan gunakan ayat Quran atau kaligrafi suci sebagai tekstur yang diputar/dipecahkan. Islamic architecture boleh menjadi portal framing, arch-shaped mask, lattice shadow atau transition antara chapter. Jangan jadikan setiap section salinan motif sama.

Typography: editorial serif untuk tajuk, sans-serif untuk UI, Amiri/Noto Naskh Arabic atau font Arab asal untuk teks Arab. Kekalkan BM/EN/عربي, RTL sebenar, nama asal, potret sebenar, semua data dan pautan. Warna mesti accessible. White space dan hierarchy lebih penting daripada banyak kad.

## 5. Architecture teknikal

Utamakan architecture asal. Three.js + GLTFLoader + OrbitControls + GSAP ScrollTrigger; Lenis hanya jika tidak merosakkan native scrolling. Gunakan Vite jika diperlukan; React/R3F hanya jika manfaat migration jelas. Pin dependencies yang serasi, lockfile, relative assets/base `/profile-web/`, tiada backend wajib. Semak dokumentasi versi terpasang sebelum menggunakan API. Jangan import library berganda.

Bina scene manager yang mengurus lazy loading, camera, resize, lifecycle, adaptive quality, disposal dan visibility. Shared renderer atau hanya satu scene aktif jika praktikal; jangan render semua canvases serentak. Semantic HTML untuk semua kandungan, WebGL hanya enhancement. Jangan gantikan model 3D dengan CSS rotate PNG, GIF, video atau image sequence.

## 6. Signature experience — Jamiah Imam 360° scroll-controlled

Gunakan GLB sebenar. Optimise draw calls, merge static geometry jika selamat, kekalkan UV/texture, pivot, normals dan rupa asal; ukur sebelum/selepas. Perbaiki PBR sandstone, kubah, menara, lattice dan pencahayaan jika sumber membenarkan. Simpan model asal sebagai backup, hasilkan optimized asset berasingan. Jangan mendakwa photorealistic atau lokasi tepat tanpa rujukan.

Bina sticky canvas/pinned chapter dengan native scrolling. Progress p dalam [0,1] mengawal yaw model **0 hingga 2π** (satu putaran 360° lengkap). Scroll ke atas membalikkan animasi; apabila berhenti, animasi settle secara smooth, bukan terus auto-rotate. GSAP scrub sekitar 0.6–1.2 sebagai titik mula; jangan rotate kamera dan model serentak pada paksi yaw sehingga putaran efektif berganda. Gunakan camera distance untuk dolly/zoom, target dan elevation untuk framing; fit bounding box, clamp near/far dan min/max distance. Pastikan objek tidak terpotong kecuali close-up yang disengajakan.

Storyboard wajib:

| Progress | Yaw model | Camera & visual |
|---|---:|---|
| 0% | 0° | Wide frontal 3/4, reveal portal dan tajuk |
| 20% | 72° | Dolly in pintu gerbang/lattice; info diploma muncul |
| 40% | 144° | Elevation berubah, transition pendidikan |
| 60% | 216° | Dolly out kampus, info sarjana muda |
| 80% | 288° | Dolly in kubah/menara, info sarjana |
| 100% | 360° | Dolly out keseluruhan, kembali orientasi asal |

Camera distance relatif cadangan 1.0 → 0.72 → 0.95 → 1.15 → 0.70 → 1.0 kali framing baseline; laras melalui ujian visual. Jangan label bangunan sebagai institut tertentu tanpa bukti. Gunakan tahun/kelayakan dari repo asal. Hotspots hanya bagi unsur fizikal yang dikenal pasti.

Manual Explore mode: drag mouse/touch 360°, pinch zoom, button Zoom +/−, Reset View, Pause Motion, Resume Scroll dan fullscreen jika disokong. OrbitControls dengan damping; hentikan scroll camera writer apabila manual mode aktif, resume blend ke progress semasa tanpa jump. Wheel/touch default mesti boleh scroll halaman; tangkap input kamera hanya dalam mode eksplisit, sediakan Exit dan Esc. Reduced motion gunakan poster/pose stabil, akses manual optional. Jangan scroll hijack.

## 7. Struktur website dan 3D assets tambahan

### Hero — The Pursuit of Knowledge
Nama BM/Arab, potret asal, jawatan KIAS, intro dan CTA Terokai Profil/Penerbitan/Aplikasi. Kekalkan kaleidoscope dan Islamic architectural framing. Cinematic mask reveal, parallax ringan, ambient lighting dan entrance typography; jangan menghalang LCP atau pembacaan. Jangan ubah wajah asal.

### Profil dan pendidikan — Journey of Knowledge
Statistik sebenar, profil ringkas, pendidikan tahfiz, Tripoli, Riyadh dan kelayakan lain berdasarkan repo. Gunakan Jamiah Imam sebagai signature scene; timeline HTML accessible dan searchable. Jangan mengada-adakan kampus lain.

### Kepakaran — Islamic Scholarship
Bina GLB kitab turath, rehal, manuskrip, scholarly desk atau Islamic geometric sculpture sebenar menggunakan Blender/Python jika tersedia, atau procedural mesh Three.js/GLTFExporter. Guna material kayu, kertas, leather binding, metal ornament. Jangan cipta petikan agama; guna tekstur neutral atau teks sah daripada sumber yang dibenarkan. Manuskrip featured berputar lengkap 360° mengikut scroll, dolly in halaman, dolly out, page turn jika mesh menyokongnya. Sediakan label bidang fiqh, usul fiqh, maqasid, bahasa Arab dan kajian manuskrip berdasarkan profil.

### Pencapaian — Milestones of Excellence
Pingat generik emas/perak 3D dengan metallic reflection, scroll rotation 360° dan zoom. Sijil sebenar jika tersedia; model generik bukan replika rasmi. Kekalkan filter dan semua rekod pencapaian. Jangan cipta logo pertandingan atau kelayakan.

### Digital Library — wajib download PDF dan extract kulit sebenar
1. Baca data penerbitan dan URL PDF dari repo asal. Cari fail lokal terlebih dahulu. Jika tiada, download sendiri PDF awam daripada URL sebenar menggunakan curl/requests/fetch atau browser automation yang tersedia. Jangan minta pengguna upload kulit buku jika PDF tersedia. Jangan bypass login/paywall/permission. Jangan ubah PDF asal.
2. Proses sekurang-kurangnya buku Fiqh Halal dan Haram serta Fiqh Al-Quran dan Sunnah, kemudian semua buku lain yang ada PDF. Sahkan PDF magic bytes dan bukan HTML error page. Jika link gagal, rekod URL/status dan teruskan buku lain.
3. Guna PyMuPDF/Poppler untuk render halaman pertama sekitar 200–300 DPI; semak visual halaman awal untuk kulit sebenar jika page 1 bukan cover. Kekalkan aspek, teks, pengarang, logo dan warna. Jangan generate cover dengan AI. Extract kulit belakang jika benar-benar ada; spine/back neutral jika tiada. Jangan crop maklumat penting.
4. Simpan master texture dan versi WebP/PNG optimized (contohnya 1024–2048 px mengikut keperluan) di `assets/textures/books/`. Rekod sumber URL, page index, hash PDF, saiz dan lokasi texture. Jangan simpan PDF awam berlebihan dalam repo jika link asal sudah memadai.
5. Cipta geometri buku sebenar: front/back cover, spine, page block, beveled edges, UV dan PBR. Export GLB atau gunakan reusable mesh dengan texture unik. Semak orientasi dan ketajaman cover. Jangan reka ketebalan sebagai ukuran tepat; anggar berdasarkan jumlah halaman jika sesuai.
6. Featured books mesti berputar 360° pada scroll, reverse apabila scroll balik, zoom in cover dan zoom out koleksi; checkpoint muka depan kekal cukup lama untuk dibaca. Manual selection membawa buku ke fokus, membolehkan rotate/zoom/reset. Button View Book, Preview PDF, Download PDF guna link sebenar; kekalkan search, filter, metadata, list view dan semua penerbitan bukan buku.
7. Jika cover tak dapat diperoleh, gunakan placeholder neutral yang dilabel jelas, bukan cover palsu. Laporkan dalam `BOOK_COVER_MANIFEST.md`.

### Digital Innovation Lab
Bina laptop, tablet, smartphone sebagai mesh sebenar; capture screenshot aplikasi sebenar seperti e-Hadis40 dan projek lain dari URL profil menggunakan browser automation jika tersedia, atau guna screenshot lokal. Gunakan texture skrin sebenar tanpa mencipta interface palsu. Scroll 360° orbit efektif bagi featured composition, zoom in interface, zoom out peranti, transition projek, button Launch Application sebenar. Elak tekstur besar serentak.

### Pengalaman dan Hubungi
Editorial timeline, maklumat sebenar, CTA dan footer yang profesional. Tidak perlu 3D berat pada semua section. Gunakan kaleidoscope/arch yang subtle untuk penutup.

## 8. Motion graphics, button dan scroll

Bina motion tokens untuk duration, easing, stagger dan transform. Gunakan mask reveal, typography stagger, arch portal transition, parallax depth, controlled lighting, object choreography, crossfade antara chapter. No flashing, excessive bloom, bouncy animation, blank canvas atau layout shift. Utamakan readability. Semua featured 3D assets mempunyai scroll-driven satu putaran penuh 360° dan zoom in/out; decorative assets tidak perlu. Elakkan semua aset bergerak serentak. Kamera mesti reverse tepat apabila scroll naik.

Sticky nav dengan active section, progress indicator, animated underline, menu mobile, language switch BM/EN/Arab, back-to-top. Buttons ada hover/focus/active/disabled states, minimum touch target sekitar 44px, label jelas, keyboard dan ARIA yang sesuai. Tiada button dummy. Native anchor/history/back navigation mesti berfungsi. Jika Lenis digunakan, sync GSAP ticker, refresh selepas resize/font/asset load dan jangan intercept input OrbitControls. Elak nested scroll trap. Sediakan Skip to content dan pause/reduced motion. Jangan halang user lompat terus ke penerbitan.

## 9. Performance, accessibility, SEO

Lazy load GLB dan texture, pause offscreen/tab hidden, dispose GPU resources, adaptive DPR (mobile rendah), shadow quality tier, instancing/mesh merge, compressed textures/GLB jika decoder tersedia, fallback poster untuk WebGL failure. Test context loss. Jangan render setiap model serentak. Target 60fps desktop yang mampu, 30fps stabil mobile; Lighthouse performance 90 jika realistik, LCP <=2.5s, CLS <=0.1, INP <=200ms sebagai sasaran bukan jaminan. Rekod device/network/method dan measured metrics; jangan cipta skor. Sediakan low quality/reduced motion; semua data tetap tersedia tanpa JS/WebGL sejauh praktikal. Semantic headings, contrast, keyboard, accessible descriptions, focus trap modal dan return focus. SEO: title, meta, Open Graph, canonical, sitemap, robots, Person schema berdasarkan data sah. Kekalkan RTL.

## 10. QA, acceptance dan delivery

Jalankan baseline dan production build, local preview, Playwright/browser tests jika tersedia. Uji viewport 360, 390, 430, 768, 1024, 1440, 1920; Chrome/Firefox/WebKit jika tersedia. Ambil screenshot desktop/mobile/RTL dan capture scroll sequence. Uji 0/25/50/75/100% scroll: expected yaw 0/90/180/270/360°, kamera berubah jarak, reverse, manual rotate/zoom/reset/resume, touch scroll, reduced motion, no-WebGL, resize dan context loss. Uji semua nav, CTA, search, filter, language, PDF dan app links. Bandingkan inventori kandungan dengan baseline; tiada kehilangan rekod. Semak console/network errors, relative paths di `/profile-web/`, CORS dan asset 404. Jangan claim browser atau device yang tidak diuji.

Deliver source code lengkap, optimized GLB dan model tambahan, cover textures, README, CHANGELOG, ASSET_MANIFEST (sumber/lesen/saiz/section), BOOK_COVER_MANIFEST, PERFORMANCE_REPORT, QA_REPORT, screenshot/capture dan fail kolaborasi. Sediakan production build jika diperlukan dan arahan GitHub Pages. Jangan push/deploy tanpa izin.

P0: kaleidoscope dan Islamic architecture kekal, semua kandungan asal, hero, Jamiah Imam true scroll 360° + zoom, smooth navigation, mobile/RTL, fallback. P1: 3D library dengan cover PDF sebenar, innovation lab, manuskrip, pencapaian. P2: efek dekoratif tambahan. Semua featured scenes yang dihantar mesti berfungsi; jangan guna placeholder tanpa label.

**Definition of done:** website boleh dijalankan; model GLB sebenar boleh rotate 360° melalui scroll dan manual; zoom in/out dan reverse berfungsi; cover PDF sebenar diextract; UI kemas, kaleidoscope dan Islamic architecture jelas; semua fungsi dan fakta asal kekal; hasil ujian serta kekangan dilaporkan. Jangan berhenti selepas plan. Teruskan implementasi mengikut akses sebenar dan selesaikan semua P0/P1 yang boleh dibuat. Jika ada blocker, dokumentasikan bukti dan teruskan kerja lain.

**START NOW — Claude lead, Gemini visual review, Codex engineering, evidence-based integration.**
