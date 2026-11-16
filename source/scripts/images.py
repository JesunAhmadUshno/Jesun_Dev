"""Make display-size, lightly watermarked derivatives from private originals.
Originals stay in private-originals/ (gitignored). Only derivatives are committed."""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageOps
from collections import deque
SRC = sys.argv[1] if len(sys.argv) > 1 else 'private-originals'
OUT = 'src/img'
os.makedirs(OUT, exist_ok=True)
FONT = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
MARK = '© Jesun Ahmad Ushno'

def mark(im, light=True):
    im = im.convert('RGB'); d = ImageDraw.Draw(im, 'RGBA')
    s = max(11, im.width // 60); f = ImageFont.truetype(FONT, s)
    w = d.textlength(MARK, font=f)
    col = (245, 243, 238, 70) if light else (11, 11, 12, 60)
    d.text((im.width - w - s, im.height - s * 2), MARK, font=f, fill=col)
    return im

def save(im, name, widths, q=78):
    for w in widths:
        r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(f'{OUT}/{name}-{w}.webp', 'WEBP', quality=q, method=6)
        if r.mode == 'RGBA':
            r.save(f'{OUT}/{name}-{w}.png', optimize=True)
        else:
            r.save(f'{OUT}/{name}-{w}.jpg', 'JPEG', quality=q, optimize=True, progressive=True)

def cutout(im, tol=22):
    """Flood-fill near-white background from the edges to transparent."""
    im = im.convert('RGBA'); px = im.load(); W, H = im.size
    seen = bytearray(W * H); q = deque()
    for x in range(W): q.extend([(x, 0), (x, H - 1)])
    for y in range(H): q.extend([(0, y), (W - 1, y)])
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= W or y >= H: continue
        i = y * W + x
        if seen[i]: continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if r > 255 - tol and g > 255 - tol and b > 255 - tol:
            px[x, y] = (r, g, b, 0)
            q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    return im

p = lambda n: os.path.join(SRC, n)
# Canonical headshot: stable URL, never renamed.
hs = Image.open(p('jesun-headshot-toronto.jpg'))
mark(hs).resize((800, round(hs.height * 800 / hs.width)), Image.LANCZOS).save(f'{OUT}/jesun-ahmad-ushno.jpg', 'JPEG', quality=82, optimize=True, progressive=True)
save(mark(hs), 'portrait-toronto', [480, 760])
save(mark(Image.open(p('jesun-portrait-black-coat.jpg')), light=False), 'portrait-black-coat', [480, 760])
save(mark(Image.open(p('jesun-portrait-grey-suit.jpg')), light=False), 'portrait-sweater', [480, 760])
save(mark(Image.open(p('jesun-graduation-unf.jpg')), light=False), 'graduation-unf', [480, 760])
av = cutout(Image.open(p('jesun-3d-avatar-fullbody.jpg')))
av = av.crop(av.getbbox())
save(av, 'avatar-full', [240, 420])
# Head crop for foreman cursor, twin face and favicons.
W, H = av.size
head = av.crop((int(W * .28), 0, int(W * .72), int(W * .44)))
head.save(f'{OUT}/avatar-head.png', optimize=True)
head.resize((96, 96), Image.LANCZOS).save(f'{OUT}/avatar-head-96.png', optimize=True)
head.resize((96, 96), Image.LANCZOS).save(f'{OUT}/avatar-head-96.webp', 'WEBP', quality=85)
for s in (16, 32, 48, 180, 192, 512):
    bg = Image.new('RGBA', (s, s), (11, 11, 12, 255))
    h = head.copy(); h.thumbnail((int(s * .9), int(s * .9)), Image.LANCZOS)
    bg.alpha_composite(h, ((s - h.width) // 2, s - h.height))
    bg.save(f'{OUT}/icon-{s}.png', optimize=True)
print('images ok', sorted(os.listdir(OUT)))
