import { useEffect, useRef } from 'react';

// Canvas con los 4 anillos que reaccionan al mouse (misma animación del HTML)
export default function HeroRings() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const cx = cv.getContext('2d');
    const TAU = Math.PI * 2;
    const ease = (u) => 1 - Math.pow(1 - u, 3);
    const lim = (v) => Math.min(1, Math.max(0, v));
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let W = 0, H = 0, r = 0;
    let mx = 0, my = 0, tx = 0, ty = 0;
    let lx = window.innerWidth / 2, ly = window.innerHeight / 2, px = lx, py = ly;
    let visible = true, raf = 0;

    function size() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * d; cv.height = H * d;
      cx.setTransform(d, 0, 0, d, 0, 0);
      r = Math.min(W, H) * (W < 700 ? 0.28 : 0.24);
    }

    function anillos(t, esc, fi, a, lw, glow, ox, oy, p, cur, luzActiva) {
      const R = r * esc;
      for (let k = 0; k < 4; k++) {
        const al = fi + k * 1.5708, pk = lim(p * 1.35 - k * 0.12);
        if (pk <= 0) continue;
        let X = W / 2 + ox + Math.cos(al) * R, Y = H / 2 + oy + Math.sin(al) * R, pr = 0;
        if (cur) {
          const d = Math.abs(Math.hypot(cur[0] - X, cur[1] - Y) - R);
          pr = Math.exp(-((d / (R * 0.55)) ** 2));
          X += (cur[0] - X) * pr * 0.03; Y += (cur[1] - Y) * pr * 0.03;
        }
        cx.globalAlpha = a * (0.6 + 0.4 * pr);
        cx.lineWidth = lw * (1 + pr * 0.9);
        cx.shadowBlur = glow * (1 + pr * 1.5);
        cx.shadowColor = 'rgba(96,165,250,.9)';
        cx.beginPath();
        cx.arc(X, Y, R, al + Math.PI, al + Math.PI + TAU * pk);
        cx.stroke();
        cx.shadowBlur = 0;

        if (luzActiva && pk >= 1) {
          const th = al + Math.PI + t * 0.55 + k * 1.3;
          for (let m = 0; m < 22; m++) {
            const f = 1 - m / 22, q = th - m * 0.045;
            cx.globalAlpha = m ? f * 0.6 : 1;
            cx.fillStyle = '#DBEAFE';
            cx.beginPath();
            cx.arc(X + Math.cos(q) * R, Y + Math.sin(q) * R, m ? 2.2 * f : 3, 0, TAU);
            cx.fill();
            if (!m) {
              cx.globalAlpha = 0.2;
              cx.fillStyle = '#60A5FA';
              cx.beginPath();
              cx.arc(X + Math.cos(q) * R, Y + Math.sin(q) * R, 11, 0, TAU);
              cx.fill();
            }
          }
        }
      }
      cx.globalAlpha = 1;
    }

    function draw(t) {
      const p = ease(lim((t - 0.2) / 1.5)), br = 1 + 0.025 * Math.sin(t * 0.8), fi = t * 0.04 + tx * 0.3;
      const rc = cv.getBoundingClientRect(), cur = [px - rc.left, py - rc.top];

      cx.clearRect(0, 0, W, H);
      cx.globalCompositeOperation = 'lighter';

      const g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r * 2.2);
      g.addColorStop(0, `rgba(96,165,250,${0.22 * p})`);
      g.addColorStop(0.6, 'rgba(29,78,216,.07)');
      g.addColorStop(1, 'rgba(29,78,216,0)');
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);

      const gr = cx.createLinearGradient(W / 2 - 2 * r, H / 2 - 2 * r, W / 2 + 2 * r, H / 2 + 2 * r);
      gr.addColorStop(0, '#DBEAFE'); gr.addColorStop(0.5, '#60A5FA'); gr.addColorStop(1, '#2563EB');
      cx.strokeStyle = gr;

      anillos(t, br * 1.22, -fi * 0.7, 0.16, 1, 0, tx * -16, ty * -16, p, null, 0);
      anillos(t, br * 1.1, -fi * 0.35 + 0.2, 0.3, 1, 0, tx * -8, ty * -8, p, null, 0);
      anillos(t, br, fi, 0.95, 1.6, 14, tx * 3, ty * 3, p, cur, 1);

      const u = (t % 5) / 5;
      cx.strokeStyle = `rgba(96,165,250,${0.2 * (1 - u) * p})`; cx.lineWidth = 1;
      cx.beginPath(); cx.arc(W / 2, H / 2, r * (0.1 + 2 * u), 0, TAU); cx.stroke();

      cx.globalCompositeOperation = 'source-over';
      const v = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r * 1.2);
      v.addColorStop(0, 'rgba(4,6,12,.5)'); v.addColorStop(1, 'rgba(4,6,12,0)');
      cx.fillStyle = v; cx.fillRect(0, 0, W, H);

      cx.globalCompositeOperation = 'lighter';
      const n = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r * 0.14);
      n.addColorStop(0, `rgba(219,234,254,${0.8 * p * (0.8 + 0.2 * Math.sin(t * 1.6))})`);
      n.addColorStop(1, 'rgba(96,165,250,0)');
      cx.fillStyle = n; cx.fillRect(W / 2 - r * 0.2, H / 2 - r * 0.2, r * 0.4, r * 0.4);
      cx.globalCompositeOperation = 'source-over';
    }

    const onMove = (e) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      lx = e.clientX; ly = e.clientY;
    };

    size();
    window.addEventListener('resize', size);
    window.addEventListener('pointermove', onMove);
    // Solo dibuja mientras el hero está en pantalla (ahorra batería)
    const io = new IntersectionObserver((e) => { visible = e[0].isIntersecting; });
    io.observe(cv);

    const tick = (ms) => {
      tx += (mx - tx) * 0.05; ty += (my - ty) * 0.05;
      px += (lx - px) * 0.08; py += (ly - py) * 0.08;
      if (visible) draw(reducido ? 4 : ms * 0.001);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas id="icono" ref={ref} aria-hidden="true"></canvas>;
}