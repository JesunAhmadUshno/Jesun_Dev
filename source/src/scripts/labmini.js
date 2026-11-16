// Home Lab tile: a small wavelet-style scan over a synthetic weave. It flags the block that breaks
// the pattern, the same idea as his 2023 paper, drawn at low cost. Copyright Jesun Ahmad Ushno.
const rm = () => { try { if (localStorage.getItem('jesun.rm') === '1') return true; } catch (e) { /* blocked */ } return matchMedia('(prefers-reduced-motion: reduce)').matches; };
export function waveMini() {
  const c = document.querySelector('.wave-mini'); if (!c) return;
  const x = c.getContext('2d'); let W = 0, H = 0, defect = { gx: 0, gy: 0 }, t = 0, raf = 0, on = false;
  const B = 18;
  const size = () => { const r = c.getBoundingClientRect(), d = Math.min(1.5, devicePixelRatio || 1); W = r.width; H = r.height; c.width = W * d; c.height = H * d; x.setTransform(d, 0, 0, d, 0, 0); pick(); };
  const pick = () => { defect = { gx: 2 + Math.floor(Math.random() * Math.max(1, W / B - 4)), gy: 1 + Math.floor(Math.random() * Math.max(1, H / B * .45 - 1)) }; };
  const weave = () => {
    x.fillStyle = '#0B0B10'; x.fillRect(0, 0, W, H);
    for (let gy = 0; gy * B < H; gy++) for (let gx = 0; gx * B < W; gx++) {
      const bad = gx === defect.gx && gy === defect.gy;
      for (let k = 0; k < 3; k++) { const v = (gx + gy + k) % 2; x.fillStyle = bad ? (k === 1 ? '#3A2328' : '#151116') : (v ? '#1E1F2A' : '#14151D'); x.fillRect(gx * B + k * 6, gy * B, 5, B - 1); }
    }
  };
  const frame = () => {
    weave();
    const sx = (t % 1) * (W + 60) - 30;
    const g = x.createLinearGradient(sx - 40, 0, sx, 0); g.addColorStop(0, 'rgba(255,70,85,0)'); g.addColorStop(1, 'rgba(255,70,85,.35)');
    x.fillStyle = g; x.fillRect(sx - 40, 0, 40, H); x.fillStyle = '#FF4655'; x.fillRect(sx, 0, 2, H);
    if (sx > defect.gx * B) { const px = defect.gx * B - 3, py = defect.gy * B - 3; x.strokeStyle = '#FF4655'; x.lineWidth = 2; x.strokeRect(px, py, B + 6, B + 6); x.font = '600 10px "IBM Plex Mono", monospace'; x.fillStyle = '#FF4655'; x.fillText('z > 2.6', px + B + 12, py + 12); }
  };
  const loop = () => { if (!on) return; t += .004; if (t % 1 < .004) pick(); frame(); raf = requestAnimationFrame(loop); };
  size(); addEventListener('resize', () => { size(); frame(); });
  if (rm()) { t = .99; frame(); return; }
  new IntersectionObserver(es => { for (const e of es) { on = e.isIntersecting && !document.hidden; cancelAnimationFrame(raf); if (on) loop(); } }).observe(c);
}
