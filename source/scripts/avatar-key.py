"""Key the 3D avatar clips off their white studio backdrop, so the character stands on the site's
dark ground instead of in a white box.

The clips arrive as opaque animated WebP on a near white, near neutral backdrop (about 248 to 251).
For every frame:

  1. Anything that is clearly not backdrop (darker than 215, or carrying colour) is character.
  2. Of the rest, only what is connected to the frame border is backdrop. That one rule is what
     keeps the whites of his eyes, his teeth and the zip highlights: they are bright, but they
     are enclosed by the character, so the flood never reaches them.
  3. Inside the backdrop, alpha comes from how far a pixel falls below the backdrop level, and
     the colour is un-mixed from white (C = a*F + (1 - a)*W, solved for F). That turns the
     anti aliased edge and the floor shadow into a clean dark edge and a soft dark shadow,
     with no white fringe left over to glow against a black page.

Every state is cropped to one shared box, so a crossfade between states never jumps.
Outputs per state, in src/img/avatar3d/: <state>.webm (VP9 with alpha, the main format),
<state>.webp (animated, for Safari) and <state>-still.webp (reduced motion, and the poster
while a clip loads).
"""
import os, sys, shutil, subprocess
import numpy as np
import cv2
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else 'private-originals/avatar-3d'
OUT = 'src/img/avatar3d'
STATES = ['idle', 'wave', 'nod', 'talking', 'thinking', 'celebrate', 'point']
OUT_H = 640                 # drawn at up to 320 CSS pixels tall, so 2x
BG = 249.0
os.makedirs(OUT, exist_ok=True)


def key(rgb):
    a = rgb.astype(np.float32)
    L = a.mean(2)
    sat = a.max(2) - a.min(2)
    h, w = L.shape
    # Near the floor, grey is shadow, not body: his shoes are near black, the baked shadow is a
    # mid grey. Without this the shadow keys as solid and every foot stands in a black puddle.
    floor = np.zeros((h, w), bool); floor[int(h * .80):, :] = True
    solid = np.where(floor, (L < 110) | (sat > 34), (L < 215) | (sat > 34))
    cand = (~solid).astype(np.uint8)
    # flood from every border pixel that is backdrop candidate
    ff = cand.copy()
    mask = np.zeros((h + 2, w + 2), np.uint8)
    seeds = [(x, 0) for x in range(0, w, 6)] + [(x, h - 1) for x in range(0, w, 6)] + \
            [(0, y) for y in range(0, h, 6)] + [(w - 1, y) for y in range(0, h, 6)]
    for (x, y) in seeds:
        if ff[y, x] == 1:
            cv2.floodFill(ff, mask, (x, y), 2)
    bg = ff == 2
    # Backdrop the flood cannot reach: the gap between his legs is enclosed by the legs and the
    # floor shadow. It is still backdrop, and it is large, whereas the whites of his eyes, his
    # teeth and the zip highlights are small. So any enclosed bright region above a size is
    # backdrop too.
    n, lab, stats, _ = cv2.connectedComponentsWithStats(((ff == 1)).astype(np.uint8), 4)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 900:
            bg |= lab == i
    alpha = np.ones((h, w), np.float32)
    ab = np.clip((BG - 6 - L) / 72.0, 0, 1)
    alpha[bg] = ab[bg]
    # The baked floor shadow goes entirely. Un-mixed through a capped alpha it turns into a pale
    # smear, and it stretches the crop to the full frame width. The site draws its own contact
    # shadow under the feet instead, which also matches the page's light.
    alpha[bg & floor] = 0
    alpha = cv2.GaussianBlur(alpha, (0, 0), .6)
    alpha = np.clip(alpha, 0, 1)
    # un-mix from white so semi transparent edges carry the character colour, not white
    A = np.maximum(alpha, 1e-3)[..., None]
    F = np.clip((a - (1 - A) * 255.0) / A, 0, 255)
    F = np.where(alpha[..., None] > .995, a, F)
    return F.astype(np.uint8), (alpha * 255).astype(np.uint8)


def frames(path):
    im = Image.open(path)
    out, durs = [], []
    for i in range(getattr(im, 'n_frames', 1)):
        im.seek(i)
        out.append(np.asarray(im.convert('RGB')))
        durs.append(im.info.get('duration', 67) or 67)
    return out, durs


# pass 1: key every frame and find one crop box that fits every state
keyed, box = {}, [10 ** 9, 10 ** 9, -1, -1]
for s in STATES:
    fs, durs = frames(os.path.join(SRC, s + '.webp'))
    ks = []
    for f in fs:
        F, A = key(f)
        ys, xs = np.where(A > 10)
        if len(xs):
            box[0] = min(box[0], xs.min()); box[1] = min(box[1], ys.min())
            box[2] = max(box[2], xs.max()); box[3] = max(box[3], ys.max())
        ks.append((F, A))
    keyed[s] = (ks, durs)
    print('keyed', s, len(ks), 'frames')

h0, w0 = keyed[STATES[0]][0][0][1].shape
pad = 10
x0, y0 = max(0, box[0] - pad), max(0, box[1] - pad)
x1, y1 = min(w0, box[2] + pad), min(h0, box[3] + pad)
print('shared box', x0, y0, x1, y1, 'size', x1 - x0, y1 - y0)
scale = OUT_H / (y1 - y0)
OW = int(round((x1 - x0) * scale)) // 2 * 2

# pass 2: crop, scale, write
for s in STATES:
    ks, durs = keyed[s]
    ims = []
    for F, A in ks:
        rgba = np.dstack([F, A])[y0:y1, x0:x1]
        im = Image.fromarray(rgba, 'RGBA').resize((OW, OUT_H), Image.LANCZOS)
        ims.append(im)
    ims[0].save(f'{OUT}/{s}-still.webp', quality=82, alpha_quality=90, method=6)
    # VP9 with alpha is the main format: a tenth of the size of animated WebP for the same
    # frames. Chrome, Edge and Firefox play it. Safari cannot decode VP9 alpha, so it gets the
    # animated WebP below instead, chosen by the browser from the source list.
    tmp = f'/tmp/avk/{s}'; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    for i, im in enumerate(ims): im.save(f'{tmp}/{i:03d}.png')
    fps = round(1000 / (sum(durs) / len(durs)))
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(fps), '-i', f'{tmp}/%03d.png',
                    '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '42', '-row-mt', '1',
                    '-deadline', 'good', '-cpu-used', '2', '-auto-alt-ref', '0', '-an', f'{OUT}/{s}.webm'], check=True)
    print(s, 'webm', f'{os.path.getsize(f"{OUT}/{s}.webm") / 1024:.0f} KB', fps, 'fps')
    ims[0].save(f'{OUT}/{s}.webp', save_all=True, append_images=ims[1:], duration=durs, loop=0,
                quality=56, alpha_quality=70, method=6, minimize_size=False)
    print(s, f'{os.path.getsize(f"{OUT}/{s}.webp") / 1024:.0f} KB', (OW, OUT_H))
