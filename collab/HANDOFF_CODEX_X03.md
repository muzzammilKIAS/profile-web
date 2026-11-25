# HANDOFF — Codex X-03 (pending)

**Status:** pending. Codex mula menjalankan tugasan ini pada 25 Nov 2026 kira-kira 20:59 tetapi berhenti pada 21:04 dengan ralat had penggunaan akaun ChatGPT ("try again at Nov 26th, 2026 1:10 AM") sebelum menulis apa-apa ke `collab/CODEX_REPORT.md`. Sebagai ganti sementara, Claude menjalankan semakan kod bebas melalui sub-agent (lihat `collab/QA.md`).

**Cara menjalankan semula** (selepas had dibuka), dari akar repo:

```sh
~/.vscode/extensions/openai.chatgpt-*/bin/macos-aarch64/codex exec -C . -s workspace-write "$(sed -n '/^---$/,$p' collab/HANDOFF_CODEX_X03.md | tail -n +2)"
```

---
Anda ialah Codex. Tugasan X-03: semakan kod + regresi/prestasi bagi versi bersepadu pada branch `immersive-3d`. JANGAN ubah fail kod sumber; tulis hanya bahagian baharu "Pusingan 3 — Semakan kod X-03" di hujung `collab/CODEX_REPORT.md`. Jangan commit.

Skop: `js/main.js`, `js/motion.js`, `js/scene-manager.js`, `js/rig.js`, `js/hud.js`, `js/scenes/*.js` (termasuk `jamiah.js` dan perubahan Claude pada fail anda: `library.js` keterlihatan helaian, `medals.js` reben, `manuscript.js` jejari, `common.js` fungsi `mood()` Pagi/Malam), `script.js` (fungsi lukis kaleidoskop baharu), `immersive.css`, `index.html`, `i18n-immersive.js`.

Cari, dengan bukti baris kod:
- Kebocoran sumber GPU / pendengar acara yang tidak dibuang (dispose, MutationObserver, ResizeObserver, ScrollTrigger) apabila babak dibuang atau konteks hilang dan dipulihkan.
- Peruntukan objek dalam gelung `update`/`frame` (tekanan GC), render berterusan tanpa sebab ketika statik.
- Pepijat logik: kemajuan skrol tidak tulen (tidak berbalik tepat), mod Teroka/Esc/fokus, i18n yang tertinggal, RTL, reduced motion/jeda, `?no3d`, pertukaran mood ketika babak tidak aktif, TDZ/susunan pengisytiharan.
- Kebolehcapaian: fokus papan kekunci, aria, sasaran sentuh < 44px, perangkap fokus.
- Prestasi mobile (tier low): saiz tekstur, shadow map, pasca-proses, draw call.
Jalankan `node --check` pada setiap fail JS dan apa-apa semakan statik lain yang berguna. Laporkan setiap isu sebagai P0/P1/P2 dengan fail:baris dan pembaikan dicadangkan (patch ringkas dibenarkan dalam laporan). Nyatakan apa yang tidak dapat disahkan tanpa browser. Claude telah menjalankan QA browser: 26/30 lulus sebelum pembaikan limpahan (lihat `collab/QA.md` jika wujud) — jangan ulang dakwaan itu sebagai hasil anda.
