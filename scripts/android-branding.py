"""Generate Android PNG assets from the project's transparent logo (requires Pillow)."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
RES = ROOT / "android/app/src/main/res"
PAPER = "#f7f1e3"
logo = Image.open(ROOT / "public/rkeb-logo.png").convert("RGBA")
logo = logo.crop(logo.getbbox())


def centered(size, fraction, background):
    canvas = Image.new("RGBA", size, background)
    art = logo.copy()
    art.thumbnail((round(size[0] * fraction), round(size[1] * fraction)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(art, ((size[0] - art.width) // 2, (size[1] - art.height) // 2))
    return canvas


for density, scale in {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}.items():
    folder = RES / f"mipmap-{density}"
    assert folder.is_dir(), folder
    side = round(48 * scale)
    for name in ("ic_launcher.png", "ic_launcher_round.png"):
        centered((side, side), .72, PAPER).save(folder / name)
    side = round(108 * scale)
    # Keep the entire mark inside the 66dp adaptive-icon safe zone.
    centered((side, side), .56, (0, 0, 0, 0)).save(folder / "ic_launcher_foreground.png")

for file in RES.glob("drawable*/splash.png"):
    with Image.open(file) as existing:
        size = existing.size
    art = centered((min(size), min(size)), .34, PAPER)
    canvas = Image.new("RGBA", size, PAPER)
    canvas.alpha_composite(art, ((size[0] - art.width) // 2, (size[1] - art.height) // 2))
    canvas.convert("RGB").save(file)

print("Generated launcher, adaptive foreground and splash assets from public/rkeb-logo.png")
