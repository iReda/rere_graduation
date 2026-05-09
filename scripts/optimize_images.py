"""
One-off: build lightweight WebP copies under assets/webp/
Run from repo root: python scripts/optimize_images.py
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
OUT = ASSETS / "webp"
OUT.mkdir(parents=True, exist_ok=True)


def save_webp(src: Path, dest: Path, max_side: int, quality: int = 82) -> tuple[int, int]:
    im = Image.open(src)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA")
    im.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    im.save(dest, "WEBP", quality=quality, method=6)
    return src.stat().st_size, dest.stat().st_size


def main() -> None:
    jobs: list[tuple[str, int]] = [
        # flowers (on-screen small)
        ("blue_flower_1.png", 420),
        ("pink_flower_1.png", 420),
        ("pink_flower_2.png", 420),
        ("pink_flower_3.png", 420),
        ("pink_flower_4.png", 420),
        ("pink_flower_5.png", 420),
        ("purple_flower_1.png", 420),
        ("purple_flower_2.png", 420),
        ("yellow_flower_1.png", 420),
        ("yellow_flower_2.png", 420),
        ("yellow_flower_3.png", 420),
        ("pink_boquet.png", 900),
        ("watercolor_envelope_transparent.png", 720),
        ("cream_parchment.png", 1600),
        ("finale-photo-1.jpeg", 640),
        ("finale-photo-2.jpeg", 640),
        ("finale-photo-3.jpeg", 640),
    ]
    for name, mx in jobs:
        src = ASSETS / name
        if not src.exists():
            print("skip missing", name)
            continue
        stem = Path(name).stem
        dest = OUT / f"{stem}.webp"
        before, after = save_webp(src, dest, mx)
        print(f"{name}: {before/1024/1024:.1f} MB -> {after/1024:.0f} KB  {dest.name}")


if __name__ == "__main__":
    main()
