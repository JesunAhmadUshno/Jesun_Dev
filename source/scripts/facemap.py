"""Turn the studio portrait into a point cloud, so the avatar's face is his face.

Source: private-originals/jesun-portrait-black-coat.jpg. It is sharp, head on, evenly lit and
already standing on a white background, so the subject lifts out cleanly and every dot that
survives belongs to him. The dusk skyline shot was tried first and could not carry the detail:
its tonal range is too narrow and the city behind it bleeds into the edge map.

The sampler is importance driven: a dot is more likely where the photo has structure (hair line,
brow, lash line, nostril, lip edge, jaw, collar) and inside the eye, nose and mouth band, which
is what the eye reads a face by. Spacing is adaptive, so busy areas pack tight and a plain cheek
stays open. That contrast is the whole trick: an even spread is a grey mask, not a likeness.

Depth comes from a head model, not a guess. Points sit on an ellipsoid, the nose ridge is pushed
forward, the shoulders sit back, the hair at the crown curves away. The browser rotates that
cloud, so the avatar turns like a head rather than a flat picture.

Output: src/scripts/face-map.js, flat integers [x, y, z, luminance, region] in a 0 to 1000 box.
The photograph never ships. Only these numbers do.
"""
import json, math, os, sys
import numpy as np
import cv2

SRC = sys.argv[1] if len(sys.argv) > 1 else 'private-originals/jesun-portrait-black-coat.jpg'
OUT = 'src/scripts/face-map.js'
DBG = '/tmp/facemap'
N = 4200          # candidate points; the avatar draws a subset of these
BOX = 1000        # integer grid the browser scales from
CROP = 480        # working resolution

# Face box per source, measured once, as fractions of the frame: x, y, w, h. The build has no
# cascade data installed, so a measured box beats a detector that is not there.
BOXES = {
    'jesun-portrait-black-coat.jpg': (0.321, 0.213, 0.351, 0.241),
    'front-skyline.jpg': (0.328, 0.312, 0.375, 0.250),
}
# How much frame to keep around the face box, and where the face sits inside it.
FRAME = {'jesun-portrait-black-coat.jpg': (2.00, 0.56)}

img = cv2.imread(SRC)
if img is None:
    raise SystemExit('cannot read ' + SRC)
H0, W0 = img.shape[:2]
base = os.path.basename(SRC)
os.makedirs(DBG, exist_ok=True)

# ---- 1. frame the head ----
fr = tuple(float(v) for v in sys.argv[2:6]) if len(sys.argv) > 5 else BOXES.get(base)
if fr is None:
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    faces = () if cascade.empty() else cascade.detectMultiScale(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 1.15, 6, minSize=(W0 // 10, W0 // 10))
    if len(faces):
        fx, fy, fw, fh = sorted(faces, key=lambda r: -r[2] * r[3])[0]
    else:
        fw = fh = W0 // 3
        fx, fy = (W0 - fw) // 2, H0 // 6
else:
    fx, fy, fw, fh = int(fr[0] * W0), int(fr[1] * H0), int(fr[2] * W0), int(fr[3] * H0)
print('face box', fx, fy, fw, fh)

mul, up = FRAME.get(base, (2.45, 0.56))
cx, cy = fx + fw / 2, fy + fh / 2
S = fw * mul
x0, y0 = int(cx - S / 2), int(cy - S * up)
x1, y1 = x0 + int(S), y0 + int(S)
pad = [max(0, -x0), max(0, -y0), max(0, x1 - W0), max(0, y1 - H0)]
crop = img[max(0, y0):min(H0, y1), max(0, x0):min(W0, x1)]
if any(pad):   # pad with the backdrop so the framing never shifts
    crop = cv2.copyMakeBorder(crop, pad[1], pad[3], pad[0], pad[2], cv2.BORDER_REPLICATE)
crop = cv2.resize(crop, (CROP, CROP), interpolation=cv2.INTER_AREA)
cv2.imwrite(DBG + '/crop.png', crop)
H = W = CROP

# ---- 2. lift the subject off the backdrop ----
# The studio shot stands on near white, so anything bright and colourless is background. On any
# other source nothing is bright enough to qualify and the whole frame stays in play.
hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
bg = ((hsv[:, :, 2] > 238) & (hsv[:, :, 1] < 26)).astype(np.uint8) * 255
bg = cv2.morphologyEx(bg, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
subject = 255 - bg
n, lab, stats, _ = cv2.connectedComponentsWithStats((subject > 0).astype(np.uint8), 8)
if n > 1:
    subject = np.where(lab == 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
subject = cv2.erode(subject, np.ones((3, 3), np.uint8), iterations=1)
mask = cv2.GaussianBlur(subject.astype(np.float32) / 255.0, (0, 0), 1.4)
print('subject covers', round(float((mask > .5).mean()) * 100, 1), 'percent of the crop')

# ---- 3. tone ----
g8 = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
# Bilateral first: it flattens skin noise without softening the lash line, the lip edge or the
# hair, which are exactly the edges the sampler needs.
g8 = cv2.bilateralFilter(g8, 9, 45, 9)
g8 = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8)).apply(g8)
gray = g8.astype(np.float32) / 255.0
# A soft studio portrait does not stipple. The features have to be driven apart first: unsharp
# lifts the lash line, the nostril and the lip edge off the skin, and the S curve then pushes
# the lit planes up and the sockets down so the sampler has something definite to follow.
gray = np.clip(gray + 1.15 * (gray - cv2.GaussianBlur(gray, (0, 0), 5.0)), 0, 1)
gray = np.clip((gray - 0.5) * 1.52 + 0.47, 0, 1)
gray = 0.5 - 0.5 * np.cos(np.pi * gray)          # a gentle S, no clipping at either end
soft = cv2.GaussianBlur(gray, (0, 0), 0.8)
cv2.imwrite(DBG + '/tone.png', (soft * 255).astype(np.uint8))

# ---- 4. where should a dot go? ----
gx = cv2.Sobel(soft, cv2.CV_32F, 1, 0, ksize=3)
gy = cv2.Sobel(soft, cv2.CV_32F, 0, 1, ksize=3)
edge = cv2.GaussianBlur(np.sqrt(gx * gx + gy * gy), (0, 0), 0.9)
edge = np.clip(edge / (np.percentile(edge, 98.5) + 1e-6), 0, 1)
# Light dots on a black field have to follow the light, not the dark mass. Dot density is
# brightness: his lit cheek, brow, nose ridge and the specular in his hair pack with dots, and
# the hair, the eye sockets and the coat stay as voids. That is how a photograph reads on black.
# Weighting the dark instead fills those voids with grey and the face turns into a mask.
lit = np.clip(soft - 0.14, 0, 1)
# Clip against a high percentile so one specular highlight on the nose cannot swallow the dot
# budget and leave the rest of the face bare.
lit = np.clip(lit / (np.percentile(lit[mask > .5], 94) + 1e-6), 0, 1)
weight = 0.50 * edge + 0.50 * lit

# The eyes, nose and mouth are what a face is recognised by, so that band gets more dots. The
# numbers are fractions of the crop, taken from where those features actually sit in it.
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
def blob(fx_, fy_, rx_, ry_):
    return np.exp(-(((xx - W * fx_) / (W * rx_)) ** 2) - (((yy - H * fy_) / (H * ry_)) ** 2))
feat = blob(.50, .447, .21, .055) * 1.55      # the lash line and eye
feat += blob(.50, .545, .09, .060) * 0.75     # nose and nostrils
feat += blob(.50, .636, .12, .035) * 1.35    # the lip line
feat += blob(.50, .352, .23, .035) * 1.15    # brows
# The coat is a silhouette, not a face. It keeps enough dots to hold the shape and no more,
# so the budget goes where the likeness is.
body = np.clip((yy - H * .74) / (H * .06), 0, 1)
weight = weight * (1.0 + 1.9 * np.clip(feat, 0, 1.9)) * mask * (1.0 - .62 * body)
weight[weight < 0.03] = 0.0
if weight.sum() <= 0:
    raise SystemExit('no weight: check the crop')
cv2.imwrite(DBG + '/weight.png', (np.clip(weight / weight.max(), 0, 1) * 255).astype(np.uint8))

# ---- 5. sample with adaptive spacing ----
# A flat minimum distance spreads points evenly and erases the density contrast that makes a
# stipple portrait legible, so the required gap shrinks where the photo is busy.
flat = weight.ravel().astype(np.float64); flat /= flat.sum()
rs = np.random.RandomState(7)
pick = rs.choice(flat.size, size=N * 14, replace=True, p=flat)
cand = np.stack([pick % W, pick // W], 1).astype(np.float32) + rs.uniform(-.5, .5, (N * 14, 2))
wn = weight / weight.max()
span = math.sqrt(W * H / N) * 0.80
grid, kept = {}, []
for p in cand:
    w = wn[min(H - 1, max(0, int(p[1]))), min(W - 1, max(0, int(p[0])))]
    need = max(1.5, span * (1.0 - 0.78 * float(w)))
    k = (int(p[0] / span), int(p[1] / span))
    near = False
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            for q in grid.get((k[0] + dx, k[1] + dy), ()):
                if (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 < need * need:
                    near = True; break
            if near: break
        if near: break
    if near: continue
    grid.setdefault(k, []).append(p); kept.append(p)
    if len(kept) >= N: break
pts = np.array(kept, np.float32)
print('points', len(pts))

# ---- 6. depth ----
hx, hy = W * .50, H * .46
rx, ry = W * .215, H * .285
nx = (pts[:, 0] - hx) / rx
ny = (pts[:, 1] - hy) / ry
z = np.sqrt(np.clip(1.0 - nx * nx - ny * ny, 0, 1)) * (W * .26)
z += np.exp(-((nx / .22) ** 2)) * np.exp(-(((ny - .12) / .55) ** 2)) * (W * .05)   # nose and brow ridge
low = pts[:, 1] > H * .78
z[low] = -W * .05 - np.abs(nx[low]) * W * .04                                      # shoulders sit back
top = pts[:, 1] < H * .16
z[top] *= .70                                                                       # crown curves away

lum = soft[np.clip(pts[:, 1].astype(int), 0, H - 1), np.clip(pts[:, 0].astype(int), 0, W - 1)]
# Stretch what the dots actually sampled across the full range. This is what carries the likeness.
lo, hi = np.percentile(lum, 2), np.percentile(lum, 98)
lum = np.clip((lum - lo) / (hi - lo + 1e-6), 0, 1) ** 0.72
# Lift the floor. Every dot has to be visible or the silhouette vanishes: density draws the dark
# mass, brightness draws the light on top of it.
lum = 0.34 + 0.66 * lum

# ---- 7. tag the parts that move on their own ----
# 0 face, 1 left eye, 2 right eye, 3 mouth, 4 hair, 5 shoulders.
EYE = [(.413, .447, .072, .042), (.590, .447, .072, .042)]
MOUTH = (.500, .636, .105, .042)
region = np.zeros(len(pts), np.int32)
px_, py_ = pts[:, 0] / W, pts[:, 1] / H
for i, (ex, ey, erx, ery) in enumerate(EYE):
    region[(((px_ - ex) / erx) ** 2 + ((py_ - ey) / ery) ** 2) <= 1.0] = i + 1
mx, my, mrx, mry = MOUTH
region[(((px_ - mx) / mrx) ** 2 + ((py_ - my) / mry) ** 2) <= 1.0] = 3
region[(region == 0) & (py_ < .24)] = 4
region[(region == 0) & (py_ > .78)] = 5
print('regions', {int(k): int(v) for k, v in zip(*np.unique(region, return_counts=True))})

# ---- 8. a preview at the size the panel actually draws ----
# Judging a dot portrait at poster size is how you ship a mush: it is previewed here at the real
# stage height, then again at 3x so the structure can be checked.
zmin, zmax = z.min(), z.max()
def preview(px, scale, path):
    im = np.zeros((px, px, 3), np.float32)
    for (X, Y), Z, L in zip(pts, z, lum):
        d = (Z - zmin) / (zmax - zmin + 1e-6)
        a = (.10 + .90 * float(L)) * (.46 + .54 * d)
        s = max(1, int(round(scale * (.58 + float(L) * .5) * (.62 + d * .55))))
        col = np.array([(140 + 85 * L) / 255, (150 + 95 * L) / 255, 1.0]) * a
        cv2.circle(im, (int(X / W * px), int(Y / H * px)), s, col.tolist(), -1, cv2.LINE_AA)
    cv2.imwrite(path, np.clip(im * 255, 0, 255).astype(np.uint8))
preview(300, 1.0, DBG + '/preview.png')
preview(900, 3.0, DBG + '/preview-big.png')

# ---- 9. write the compact integer cloud ----
X = np.round(pts[:, 0] / W * BOX).astype(int)
Y = np.round(pts[:, 1] / H * BOX).astype(int)
Z = np.round(np.clip(z / W * BOX, -BOX, BOX)).astype(int)
L = np.round(np.clip(lum, 0, 1) * 255).astype(int)
out = np.stack([X, Y, Z, L, region], 1).ravel().tolist()

body = (
    '// His face, as a point cloud. Built by scripts/facemap.py from the studio portrait.\n'
    '// Flat integers, five per point: x, y, z, luminance, region. x and y run 0 to 1000 across the\n'
    '// frame, z is depth in the same units (positive toward the viewer), luminance is 0 to 255 and\n'
    '// sets how a dot lights. Region: 0 face, 1 left eye, 2 right eye, 3 mouth, 4 hair, 5 shoulders,\n'
    '// which is how the eyes blink and the mouth speaks.\n'
    '// The photograph is not shipped. Only these numbers are.\n'
    '// Copyright Jesun Ahmad Ushno. All rights reserved.\n'
    'export const FACE = ' + json.dumps(out, separators=(',', ':')) + ';\n'
    'export const FACE_N = ' + str(len(pts)) + ';\n'
)
with open(OUT, 'w') as f:
    f.write(body)
print('wrote', OUT, round(len(body) / 1024, 1), 'KB')
