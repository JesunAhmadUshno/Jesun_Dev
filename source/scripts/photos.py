"""Derivatives for the 2026 photo set. Originals stay in private-originals/ (never committed).
Each output is watermarked and sized to what the page actually asks for, so nothing is downloaded
larger than it is drawn. The diploma shot also gets a transparent cutout for the journey page."""
import os, sys, glob
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else 'private-originals/2026-11'
OUT = 'src/img'
MARK = '(c) Jesun Ahmad Ushno'
os.makedirs(OUT, exist_ok=True)

def font(size):
    for p in ('/usr/share/fonts/opentype/inter/Inter-Medium.otf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def mark(im):
    """Composite the mark onto the pixels, so a photo's own alpha channel keeps its meaning."""
    base = im.convert('RGBA')
    layer = Image.new('RGBA', base.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    s = max(10, base.width // 64); f = font(s)
    w = d.textlength(MARK, font=f)
    d.text((base.width - w - s, base.height - s * 2.2), MARK, font=f, fill=(245, 243, 238, 64))
    out = Image.alpha_composite(base, layer)
    return out if im.mode == 'RGBA' else out.convert('RGB')

def save(im, name, widths, q=80):
    for w in widths:
        if im.width < w * 0.9:
            continue
        r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        rgba = r.mode == 'RGBA'
        r.save(f'{OUT}/{name}-{w}.webp', 'WEBP', quality=q, method=6)
        if not rgba:
            r.convert('RGB').save(f'{OUT}/{name}-{w}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)
        print(name, w, 'rgba' if rgba else 'rgb')

def cutout(path, rect_frac=(0.08, 0.02, 0.84, 0.98), iters=6):
    """GrabCut the subject away from a flat studio backdrop, then feather the edge."""
    img = cv2.imread(path); H, W = img.shape[:2]
    x, y, w, h = int(W * rect_frac[0]), int(H * rect_frac[1]), int(W * rect_frac[2]), int(H * rect_frac[3])
    mask = np.zeros((H, W), np.uint8)
    cv2.grabCut(img, mask, (x, y, w, h), np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64), iters, cv2.GC_INIT_WITH_RECT)
    a = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
    a = cv2.morphologyEx(a, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(a, 8)
    if n > 1:
        a = np.where(lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA); rgba[:, :, 3] = a
    im = Image.fromarray(rgba)
    alpha = im.split()[3].filter(ImageFilter.GaussianBlur(1.2))
    im.putalpha(alpha)
    return im.crop(im.split()[3].getbbox())

JOBS = [
    ('front-skyline.jpg', 'toronto-front', [1080, 760, 480]),
    ('walking-dusk.jpg', 'walking-dusk', [1080, 760, 480]),
    ('cafe-terrace.webp', 'cafe-terrace', [498, 480]),
    ('profile-skyline.webp', 'profile-skyline', [498, 480]),
    ('grad-golden.webp', 'grad-golden', [498, 480]),
    ('cap-toss.webp', 'cap-toss', [498, 480]),
    ('grad-diploma.webp', 'grad-diploma', [498, 480]),
]
for src, name, widths in JOBS:
    p = os.path.join(SRC, src)
    if not os.path.exists(p):
        print('missing', p); continue
    save(mark(Image.open(p)), name, widths)

# The diploma shot stands on a flat studio backdrop, so the subject lifts off cleanly.
dip = os.path.join(SRC, 'grad-diploma.webp')
if os.path.exists(dip):
    cut = mark(cutout(dip)); print('cutout size', cut.size)
    save(cut, 'grad-diploma-cut', [cut.width, 360])
print('photos done')
