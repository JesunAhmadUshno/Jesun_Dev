"""Background removal for every portrait: flood fill for white backdrops, GrabCut for the skyline headshot.
Outputs transparent WebP derivatives only. Originals stay private."""
import sys, numpy as np, cv2
from PIL import Image, ImageFilter
from collections import deque
SRC = sys.argv[1] if len(sys.argv) > 1 else 'private-originals'
OUT = 'src/img'

def flood_white(path, tol=26):
    im = Image.open(path).convert('RGBA'); a = np.array(im); H, W = a.shape[:2]
    white = (a[:, :, :3] > 255 - tol).all(2)
    mask = np.zeros((H + 2, W + 2), np.uint8); fill = white.astype(np.uint8)
    reach = np.zeros_like(fill)
    q = deque([(x, 0) for x in range(W)] + [(x, H - 1) for x in range(W)] + [(0, y) for y in range(H)] + [(W - 1, y) for y in range(H)])
    seen = np.zeros((H, W), bool)
    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= W or y >= H or seen[y, x] or not white[y, x]: continue
        seen[y, x] = True; q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])
    alpha = np.where(seen, 0, 255).astype(np.uint8)
    return finish(a, alpha)

def grabcut(path, rect_frac=(0.12, 0.04, 0.76, 0.96)):
    img = cv2.imread(path); H, W = img.shape[:2]
    x, y, w, h = int(W * rect_frac[0]), int(H * rect_frac[1]), int(W * rect_frac[2]), int(H * rect_frac[3])
    mask = np.zeros((H, W), np.uint8); bg = np.zeros((1, 65), np.float64); fg = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, (x, y, w, h), bg, fg, 8, cv2.GC_INIT_WITH_RECT)
    m = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lights = ((hsv[:, :, 0] > 75) & (hsv[:, :, 0] < 135) & (hsv[:, :, 1] > 60) & (hsv[:, :, 2] > 90))  # cyan and blue skyline lights
    m[lights] = 0
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((15, 15), np.uint8))  # break thin bridges to skyline lights
    # keep the largest component, fill holes
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    if n > 1: big = 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]); m = np.where(lab == big, 255, 0).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))
    rgba = cv2.cvtColor(img, cv2.COLOR_BGR2RGBA)
    return finish(rgba, m)

def finish(rgba, alpha):
    alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8), iterations=1)  # drop the light halo from the old backdrop
    alpha = cv2.GaussianBlur(alpha, (0, 0), 1.0)
    rgba = rgba.copy(); rgba[:, :, 3] = alpha
    im = Image.fromarray(rgba, 'RGBA'); return im.crop(im.getbbox())

def save(im, name, widths=(520, 820)):
    for w in widths:
        r = im if im.width <= w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(f'{OUT}/{name}-{w}.webp', 'WEBP', quality=82, method=6)
    print(name, im.size)

if __name__ == '__main__':
    p = lambda n: f'{SRC}/{n}'
    save(flood_white(p('jesun-portrait-black-coat.jpg')), 'portrait-cutout')
    save(flood_white(p('jesun-portrait-grey-suit.jpg'), tol=7), 'sweater-cutout')
    save(flood_white(p('jesun-graduation-unf.jpg')), 'graduation-cutout')
    save(grabcut(p('jesun-headshot-toronto.jpg')), 'headshot-cutout')
