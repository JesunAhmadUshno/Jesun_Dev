"""Clean cutout of the graduation photo for the Journey section.

The source (private-originals/jesun-graduation-unf.jpg) is a phone "lift subject" export on
white. Its edge carries a band of white fringe and stair steps on the cap and hair, and on the
site's near black ground that fringe glows like a halo. This rebuilds the cutout at full
resolution:

  1. Backdrop is what is near white, colourless and connected to the frame border. The folder,
     the collar and the shirt are white too, but they are enclosed by the gown, so they stay.
  2. The edge band is pulled in by two pixels, then the colours inside the remaining band are
     rebuilt from the interior (inpainting), so no white survives in a half transparent pixel.
  3. The alpha is smoothed on a curve that keeps it crisp, which takes the stair steps off the
     cap without blurring the face.

Outputs src/img/graduation-cutout-{520,820}.webp, replacing the old cutout in place.
"""
import numpy as np, cv2
from PIL import Image

SRC = 'private-originals/jesun-graduation-unf.jpg'
img = cv2.imread(SRC)
h, w = img.shape[:2]
a = img.astype(np.float32)
L = a.mean(2); sat = a.max(2) - a.min(2)
# The phone export feathered the edge against white and then flattened it, so the fringe is a
# light grey, not white. Anything light and colourless that the flood can reach from the border
# goes with the backdrop; the white folder and collar are enclosed by the gown, so they stay.
cand = ((L > 150) & (sat < 24)).astype(np.uint8)
ff = cand.copy(); mask = np.zeros((h + 2, w + 2), np.uint8)
for (x, y) in [(x, 0) for x in range(0, w, 4)] + [(x, h - 1) for x in range(0, w, 4)] + \
              [(0, y) for y in range(0, h, 4)] + [(w - 1, y) for y in range(0, h, 4)]:
    if ff[y, x] == 1:
        cv2.floodFill(ff, mask, (x, y), 2)
fg = (ff != 2).astype(np.uint8) * 255
# keep the subject only, and fill pinholes the flood may have punched
n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
if n > 1:
    fg = np.where(lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA]), 255, 0).astype(np.uint8)
fg = cv2.morphologyEx(fg, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))

# 2. pull the edge in, then rebuild the band's colour from the interior
core = cv2.erode(fg, np.ones((3, 3), np.uint8), iterations=3)
inner = cv2.erode(core, np.ones((3, 3), np.uint8), iterations=3)
band = ((fg > 0) & (inner == 0)).astype(np.uint8) * 255
rgb = cv2.inpaint(img, band, 5, cv2.INPAINT_TELEA)
rgb = np.where(inner[..., None] > 0, img, rgb)

# 3. smooth the steps, keep it crisp
al = cv2.GaussianBlur(core.astype(np.float32) / 255.0, (0, 0), 1.6)
al = np.clip((al - .5) * 2.2 + .5, 0, 1)

rgba = np.dstack([cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB), (al * 255).astype(np.uint8)])
ys, xs = np.where(al > .02)
rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
im = Image.fromarray(rgba, 'RGBA')
print('cutout', im.size)
MARK = None
for wd in (520, 820):
    r = im.resize((wd, round(im.height * wd / im.width)), Image.LANCZOS)
    r.save(f'src/img/graduation-cutout-{wd}.webp', quality=86, alpha_quality=92, method=6)
    print(wd, r.size)
