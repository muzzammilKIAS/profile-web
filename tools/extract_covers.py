#!/usr/bin/env python3
"""Render reviewed PDF covers at 300 DPI; encode uncropped 2048/1024px WebP.

Usage: /usr/bin/python3 tools/extract_covers.py [--inspect-only]
Dependencies: PyMuPDF, Pillow, cwebp (Homebrew). All paths are repo-relative.
Page choices below are visually reviewed, not inferred from text extraction.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile

import fitz
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/textures/books"
SCRATCH = ROOT / "tools/scratch"
REPORTS = ROOT / "tools/reports"
DPI = 300
BOOKS = [
    dict(slug="fiqh-halal-haram", title="Fiqh Halal dan Haram",
         pdf="kitab/Fiqh-Halal-dan-Haram_Ahmad-Muzzammil_2026.pdf",
         sha256="9d4de6f2bc5dd3a37cab1a1544e6750eac0c6649e127806a7bd840a33fd317ec",
         front_page_index=0, back_page_index=None,
         back_cover_status="Tiada; halaman akhir ialah Bacaan Tambahan, didahului bibliografi."),
    dict(slug="fiqh-quran-sunnah", title="Fiqh Al-Quran dan Sunnah",
         pdf="kitab/Fiqh-Al-Quran-dan-Sunnah_Ahmad-Muzzammil_2026.pdf",
         sha256="b8952c1d264f5105a11ed80dc234b2f8165ba2ed378223285798adbc25bf88e4",
         front_page_index=0, back_page_index=None,
         back_cover_status="Tiada; halaman akhir ialah bibliografi dan bacaan tambahan."),
]


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def render(page, dpi):
    pix = page.get_pixmap(dpi=dpi, colorspace=fitz.csRGB, alpha=False)
    return Image.frombytes("RGB", (pix.width, pix.height), pix.samples)


def inspect(doc, slug):
    indices = sorted(set(list(range(min(4, len(doc)))) + list(range(max(0, len(doc)-3), len(doc)))))
    sheet = Image.new("RGB", (260*len(indices), 410), "#dddddd")
    draw = ImageDraw.Draw(sheet)
    for col, index in enumerate(indices):
        thumb = render(doc[index], 72)
        thumb.thumbnail((250, 365), Image.Resampling.LANCZOS)
        sheet.paste(thumb, (col*260+(260-thumb.width)//2, 30))
        draw.text((col*260+5, 5), f"index {index} / page {index+1}", fill="black")
    REPORTS.mkdir(parents=True, exist_ok=True)
    sheet.save(REPORTS / f"{slug}-inspection.jpg", quality=92)
    return indices


def dominant_color(image):
    sample = image.copy()
    sample.thumbnail((128, 128), Image.Resampling.LANCZOS)
    paletted = sample.quantize(colors=8, method=Image.Quantize.MEDIANCUT)
    index = Counter(paletted.getdata()).most_common(1)[0][0]
    rgb = paletted.getpalette()[index*3:index*3+3]
    return "#" + "".join(f"{v:02X}" for v in rgb)


def extract(book, cwebp, inspect_only):
    source = ROOT / book["pdf"]
    with source.open("rb") as stream:
        assert stream.read(4) == b"%PDF", f"Not a PDF: {source}"
    digest = sha256(source)
    with fitz.open(source) as doc:
        indices = inspect(doc, book["slug"])
        if inspect_only:
            print(json.dumps(dict(pdf=book["pdf"], sha256=digest, page_count=len(doc),
                                  inspected_indices=indices), ensure_ascii=False))
            return
        assert digest == book["sha256"], "PDF changed: inspect pages and update reviewed configuration first"
        entry = dict(book, pdf_sha256=digest, page_count=len(doc), pdf_magic="%PDF",
                     page_index_base=0, inspected_page_indices=indices,
                     render_dpi=DPI, textures=[])
        del entry["sha256"]
        for side in ("front", "back"):
            index = book[f"{side}_page_index"]
            if index is None:
                continue
            page = doc[index]
            master = render(page, DPI)
            entry[f"{side}_page_size_points"] = [page.rect.width, page.rect.height]
            entry[f"{side}_render_pixels"] = list(master.size)
            if side == "front":
                entry["aspect_ratio"] = page.rect.width / page.rect.height
                entry["dominant_color_hex"] = dominant_color(master)
                entry["dominant_color_method"] = "Most populous of 8 median-cut colors from full cover resized within 128px; suggested neutral spine color, not an extracted spine."
            with tempfile.TemporaryDirectory(prefix="cover-", dir=SCRATCH) as tmp:
                for long_edge in (2048, 1024):
                    scale = long_edge / max(master.size)
                    dimensions = tuple(round(n*scale) for n in master.size)
                    resized = master.resize(dimensions, Image.Resampling.LANCZOS)
                    png = Path(tmp) / f"{long_edge}.png"
                    resized.save(png)
                    output = OUT / f"{book['slug']}-{side}-{long_edge}.webp"
                    command = [cwebp, "-quiet", "-q", "95", "-m", "6", "-sharp_yuv",
                               "-metadata", "none", str(png), "-o", str(output)]
                    subprocess.run(command, check=True)
                    with Image.open(output) as check:
                        check.load()
                        assert check.format == "WEBP" and check.size == dimensions
                        assert max(check.size) == long_edge
                    entry["textures"].append(dict(side=side, page_index=index,
                        path=output.relative_to(ROOT).as_posix(), long_edge=long_edge,
                        width=dimensions[0], height=dimensions[1], bytes=output.stat().st_size,
                        aspect_ratio=dimensions[0]/dimensions[1], sha256=sha256(output),
                        format="image/webp", quality=95))
        assert sha256(source) == digest, "Source PDF modified"
        return entry


def human_manifest(entries):
    lines = ["# Manifest kulit buku sebenar", "",
             "Dijana oleh `tools/extract_covers.py`. Sumber ialah PDF tempatan yang disahkan bermula dengan `%PDF`.", "",
             "Halaman 1-4 dan tiga halaman terakhir setiap PDF disemak secara visual. Indeks halaman bermula dengan 0. "
             "Kulit depan ialah halaman 1 (indeks 0), diikuti halaman judul dalaman, hak cipta dan prakata. "
             "Tiada kulit belakang sebenar dalam kedua-dua PDF; tiada tekstur belakang direka atau dieksport.", "",
             "Render RGB pada 300 DPI, kemudian resize Lanczos tanpa crop kepada sisi panjang 2048/1024 px. "
             "WebP: cwebp `-q 95 -m 6 -sharp_yuv -metadata none`. Nisbah mungkin berbeza kurang daripada satu piksel akibat pembundaran. "
             "PNG perantaraan dipadam secara automatik; PDF asal tidak diubah.", ""]
    for e in entries:
        lines += [f"## {e['title']}", "", f"- Slug: `{e['slug']}`",
                  f"- PDF: [`{e['pdf']}`]({e['pdf']})", f"- SHA-256 PDF: `{e['pdf_sha256']}`",
                  f"- Jumlah halaman: {e['page_count']}; depan: indeks {e['front_page_index']}; belakang: `null`.",
                  f"- Kulit belakang: {e['back_cover_status']}",
                  f"- Halaman disemak (indeks): {', '.join(map(str,e['inspected_page_indices']))}.",
                  f"- Render 300 DPI: {e['front_render_pixels'][0]} × {e['front_render_pixels'][1]} px; nisbah PDF W/H: {e['aspect_ratio']:.9f}.",
                  f"- Warna dominan cadangan untuk spine: `{e['dominant_color_hex']}`. Ini warna sampel kulit, bukan imej spine sebenar.", "",
                  "| Tekstur | Lebar × tinggi | Bait | Nisbah W/H |", "|---|---:|---:|---:|"]
        for t in e['textures']:
            lines.append(f"| [{Path(t['path']).name}]({t['path']}) | {t['width']} × {t['height']} | {t['bytes']:,} | {t['aspect_ratio']:.9f} |")
        lines += [""]
    lines += ["## Integrasi", "", "`assets/textures/books/manifest.json` ialah array metadata lengkap termasuk hash tekstur. "
              "Gunakan `aspect_ratio` untuk bentuk buku, `textures[].path` relatif kepada akar laman, dan `dominant_color_hex` untuk spine neutral. "
              "Gunakan bahan neutral bagi belakang kerana `back_page_index` ialah `null`. "
              "Tetapkan tekstur kulit sebagai sRGB pada Three.js. Ketebalan buku bukan ukuran fizikal yang disahkan.", "",
              "Warna dominan dipilih daripada warna paling banyak dalam palet median-cut 8 warna bagi keseluruhan kulit yang dikecilkan ke 128 px. "
              "Tekstur 2048 px meningkatkan resolusi fail keluaran; ia tidak menambah butiran kepada imej raster yang sudah terkandung dalam PDF.", ""]
    (ROOT / "BOOK_COVER_MANIFEST.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--inspect-only", action="store_true")
    args = parser.parse_args()
    SCRATCH.mkdir(parents=True, exist_ok=True)
    cwebp = shutil.which("cwebp") or "/opt/homebrew/bin/cwebp"
    if not args.inspect_only:
        assert Path(cwebp).is_file(), "cwebp not found"
        OUT.mkdir(parents=True, exist_ok=True)
    entries = [extract(book, cwebp, args.inspect_only) for book in BOOKS]
    if not args.inspect_only:
        (OUT / "manifest.json").write_text(json.dumps(entries, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
        human_manifest(entries)
        print(json.dumps(entries, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
