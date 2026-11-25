# QA REPORT

**Kaedah.** Ujian automatik Playwright (`_qa/qa.mjs`, di luar repo) terhadap pelayan lokal, 25 Nov 2026. Chromium headless menggunakan WebGL sebenar (ANGLE/Metal). Keputusan: **30/30 lulus** (larian kedua, selepas pembaikan limpahan mendatar).

| | Ujian | Butiran |
|---|---|---|
| ✅ | Inventori kandungan sama dengan baseline | {"timeline":7,"research":3,"awards":2,"honours":4,"certs":10,"pubs":12,"apps":9,"exp":6,"courses":7,"pdfLinks":6} |
| ✅ | PDF kitab/Fiqh-Halal-dan-Haram_Ahmad-Muzzammil_2026.pdf | 200 7854378 bait |
| ✅ | PDF kitab/Fiqh-Al-Quran-dan-Sunnah_Ahmad-Muzzammil_2026.pdf | 200 10726579 bait |
| ✅ | Carian dan tapisan penerbitan/sijil | cari "Fiqh"=7, buku=2, ijazah=2 |
| ✅ | Semua pautan anchor mempunyai sasaran | 13 sasaran; hilang: tiada |
| ✅ | Pautan aplikasi luar kekal | 18 pautan |
| ✅ | Tukar bahasa BM/EN/عربي termasuk teks 3D baharu | جامعة الإمام محمد بن سعود الإسلامية / أحمد مزمّل / Imam Muhammad ibn Saud Islamic University |
| ✅ | Tiada ralat konsol (muat awal) |  |
| ✅ | Tiada aset 404 |  |
| ✅ | Jamiah: yaw 0/90/180/270/360° pada skrol 0/25/50/75/100% | yaw=0,90,180,270,360 jarak=1.02,0.48,1.02,0.47,1.16 |
| ✅ | Jamiah: jarak kamera berubah (zoom in/out) | 1.02,0.48,0.47,1.16 |
| ✅ | Jamiah: skrol ke atas membalikkan putaran | yaw selepas undur ke 25% = 90.0 |
| ✅ | Jamiah: Teroka 360° / zum / seret / set semula / Esc | mode=explore zum 0.48→0.37 keluar=scroll; roda dalam mod Teroka menggerakkan halaman: true |
| ✅ | Jamiah: tiada ralat konsol |  |
| ✅ | pustaka: pose sama selepas skrol ke hadapan dan balik | yaw 213.5→213.5 |
| ✅ | pustaka: tiada ralat konsol |  |
| ✅ | makmal: pose sama selepas skrol ke hadapan dan balik | yaw 180.0→180.0 |
| ✅ | makmal: tiada ralat konsol |  |
| ✅ | Viewport 360×740: tiada skrol mendatar, tiada ralat | limpahan=0px ralat=0 404=0 tier=low |
| ✅ | Viewport 390×844: tiada skrol mendatar, tiada ralat | limpahan=0px ralat=0 404=0 tier=low |
| ✅ | Viewport 430×932: tiada skrol mendatar, tiada ralat | limpahan=0px ralat=0 404=0 tier=low |
| ✅ | Viewport 768×1024: tiada skrol mendatar, tiada ralat | limpahan=0px ralat=0 404=0 tier=low |
| ✅ | Viewport 1024×768: tiada skrol mendatar, tiada ralat | limpahan=0px ralat=0 404=0 tier=high |
| ✅ | Viewport 1440×900: tiada skrol mendatar, tiada ralat | limpahan=0px ralat=0 404=0 tier=high |
| ✅ | Viewport 1920×1080: tiada skrol mendatar, tiada ralat | limpahan=0px ralat=0 404=0 tier=high |
| ✅ | Gerakan dikurangkan: bab tidak dipin, pose stabil, kandungan kekal | tinggi bab=1327px yaw=0 |
| ✅ | Tanpa WebGL (?no3d): poster + kandungan HTML kekal, tiada kanvas 3D | {"cls":"no-webgl","canvases":0,"cards":6}  |
| ✅ | RTL mobile: tiada limpahan, tiada ralat | limpahan=0 |
| ✅ | Kehilangan konteks WebGL dikesan dan dipulihkan | {"lost":true,"after":false,"live":true}  |
| ✅ | webkit: Jamiah dirender pada 50% | yaw=180 ralat= |

## Pelayar
- chromium: diuji (semua ujian di atas)
- firefox: tidak dapat dilancarkan dalam persekitaran ini
- webkit: diuji, yaw=180
- Firefox: pakej dipasang tetapi pelancar Playwright gagal ("Could not find profile folder"). **Tidak diuji.**

## Ujian manual/visual tambahan (Claude, melalui tangkapan skrin)
- Bab Jamiah pada 8 titik (0, 20, 30, 40, 60, 80, 90, 100%) dalam versi Malam dan Pagi: khat Thuluth lengkap dan terbaca dari dekat.
- Pustaka: kulit PDF sebenar menghadap kamera pada titik semak 22% dan 78%; buku terbuka dan helaian diselak pada ~40%.
- Makmal: tangkapan aplikasi sebenar pada skrin (tanpa dialog penafian).
- Mod Teroka: roda tetikus menzum kamera dan tidak menatal halaman (diuji terasing: jarak 0.56→0.63, scrollY tidak berubah).
- Arab/RTL desktop dan mobile: susun atur dicerminkan, kawalan 3D di sisi bertentangan.
- Mobile 390 px: pengepala (Pagi/Malam, menu) lengkap; kabus Malam diskalakan supaya model tidak tenggelam.

Tangkapan: `qa/round3/` (versi akhir), `qa/round2/`, `qa/baseline/`.

## Pepijat yang ditemui dan dibaiki semasa QA
| Isu | Punca | Pembaikan |
|---|---|---|
| Kulit PDF buku tidak kelihatan pada titik semak | Helaian melengkung menembusi kulit depan | Helaian hanya dipaparkan semasa buku dibuka (`library.js`) |
| Skrin e-Hadis40 / Haji Pintar menunjukkan dialog penafian | Tangkapan lama digunakan | Tangkap semula selepas dialog ditutup |
| Manuskrip nampak seperti kain putih gergasi | Jejari kamera 2.15 terlalu kecil | Jejari 3.05, sasaran direndahkan |
| Reben pingat berbentuk "V V" gergasi | Jalur rata 1.32 unit mengembang ke luar | Reben pendek berlipat, zamrud/lapis |
| Limpahan mendatar 700–940 px pada ≥768 px | Lapisan mashrabiyya `skewX` | `overflow-x: clip` pada bahagian |
| Model Jamiah malap pada telefon (Malam) | Kabus tetap + kamera lebih jauh pada potret | Ketumpatan kabus diskalakan dengan jarak kamera |
| Bar alat 3D pudar di bawah scrim | Pentas mengasingkan susunan lapisan | `isolation: auto` dalam bab |
| Butang (i) bertindih dail pada mobile | Kedudukan sama | Dialihkan ke atas kiri |
| Babak Codex tidak ikut Pagi/Malam | Latar tetap | Fungsi `mood()` dalam `common.js` |

## Belum diuji / had
Telefon dan tablet fizikal; Safari iOS sebenar (WebKit desktop Playwright sahaja); Firefox; pembaca skrin sebenar (VoiceOver/NVDA); Lighthouse; laman yang diterbitkan di GitHub Pages (belum ditolak).
