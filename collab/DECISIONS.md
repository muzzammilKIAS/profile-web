# DECISIONS

| # | Keputusan | Sebab |
|---|---|---|
| D-01 | Kerja dibuat dalam repo sedia ada pengguna (`Desktop/03 PROJEK & PERISIAN/PROFILE WEB`) pada branch `immersive-3d`; `main` tidak disentuh, tiada push. | Pengguna menyatakan repo sudah wujud; klon baharu sama sebiji (commit `a22d568`), jadi salinan pendua dibuang. |
| D-02 | Kekal statik tanpa build; Three.js dan GSAP di-vendor ke `vendor/` dan dimuat melalui import map. | Seni bina asal ialah HTML/CSS/JS biasa di GitHub Pages; tiada langkah build yang perlu diselenggara. |
| D-03 | `index.html`, `i18n.js` dan `script.js` asal dijadikan asas; kandungan tidak ditulis semula. | Menjamin semua fakta akademik, terjemahan dan fungsi asal kekal. |
| D-04 | Gemini dipanggil melalui Antigravity CLI (`~/.gemini/bin/agy`, v1.5.17); Codex melalui binari CLI sebenar dalam extension VS Code OpenAI. Skrip `~/.local/bin/codex` ialah pembalut Hermes, bukan Codex CLI, jadi tidak digunakan. | Disahkan melalui `--help`/`--version` sebenar pada mesin ini. |
