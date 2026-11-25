# DECISIONS

| # | Keputusan | Sebab |
|---|---|---|
| D-01 | Kerja dibuat dalam repo sedia ada pengguna (`Desktop/03 PROJEK & PERISIAN/PROFILE WEB`) pada branch `immersive-3d`; `main` tidak disentuh, tiada push. | Pengguna menyatakan repo sudah wujud; klon baharu sama sebiji (commit `a22d568`), jadi salinan pendua dibuang. |
| D-02 | Kekal statik tanpa build; Three.js dan GSAP di-vendor ke `vendor/` dan dimuat melalui import map. | Seni bina asal ialah HTML/CSS/JS biasa di GitHub Pages; tiada langkah build yang perlu diselenggara. |
| D-03 | `index.html`, `i18n.js` dan `script.js` asal dijadikan asas; kandungan tidak ditulis semula. | Menjamin semua fakta akademik, terjemahan dan fungsi asal kekal. |
| D-04 | Gemini dipanggil melalui Antigravity CLI (`~/.gemini/bin/agy`, v1.5.17); Codex melalui binari CLI sebenar dalam extension VS Code OpenAI. Skrip `~/.local/bin/codex` ialah pembalut Hermes, bukan Codex CLI, jadi tidak digunakan. | Disahkan melalui `--help`/`--version` sebenar pada mesin ini. |
| D-05 | Model Jamiah dipecahkan kepada 8 mesh mengikut jenis bahan (`jamiah-imam.parts.glb`), bukan 2 mesh optimum Codex. | Satu bahan tunggal menjadikan model nampak seperti mainan plastik. Bahan berasingan (batu bersusun, gangsa, kubah berusuk, kaca bercahaya, tumbuhan) membolehkan rupa maket seni bina. Draw call kekal rendah (8 + plinth/lantai). |
| D-06 | Papan tanda dirender semula dengan fon sistem Diwan Thuluth menjadi tekstur 4096 px. | Tekstur asal 355×49 diregang 2.6× dan kabur. Pengguna meminta khat lengkap seperti gambar rujukan. Fon AAT ditolak oleh FontFace Chromium, jadi ia dimuat sebagai fon sistem. |
| D-07 | Versi Pagi/Malam disambung pada suis tema asal (`data-theme`), bukan suis baharu. | Mengekalkan keutamaan pelawat yang sedia tersimpan; satu sumber kebenaran untuk CSS dan WebGL. |
| D-08 | Cadangan Gemini untuk menukar foto potret **tidak** diikut. | Master prompt: "Jangan ubah wajah asal"; potret ialah foto sebenar pengguna. |
| D-09 | Arahan "seret untuk memutar" hanya dalam mod Teroka; di luar mod itu roda dan sentuhan sentiasa menatal halaman. | Master prompt melarang scroll hijack. |
| D-10 | `?no3d` dan reduced motion memaparkan poster render sebenar + kandungan HTML penuh; bab tidak dipin. | Semua data tersedia tanpa WebGL. |
