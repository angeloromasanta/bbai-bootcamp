/* lesson/sim.js: a small kit for simulations shown inside lesson.html.

   A simulation is one HTML file in learn/sims/ that loads this script and calls Sim().
   It also opens on its own with a double-click. See .kiro/skills/learn/references/sim.md.

     const sim = Sim({ title: 'Totals of coin flips', caption: 'Drag n and watch the shape.' });
     const n = sim.slider('flips', 1, 100, 10);
     const plot = sim.canvas(300);
     sim.draw(() => { plot.clear(); plot.bars(counts(n.value)); });
*/
(function () {
  const CSS = `
  :root { --bg:#ffffff; --ink:#1c1d22; --soft:#62646e; --line:#e2e0d8; --accent:#1f4fd8; --accent-soft:#e8eefc; --good:#1c7c4a; --warn:#b4530a; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#1e2026; --ink:#ecedf1; --soft:#a2a5b1; --line:#33363f; --accent:#8fb0ff; --accent-soft:#263150; --good:#6fd39b; --warn:#f0b070; }
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  .sim { padding: 14px 16px 12px; max-width: 760px; margin: 0 auto; }
  .sim h2 { font-size: 16px; margin: 0 0 2px; }
  .sim .cap { color: var(--soft); font-size: 13.5px; margin: 0 0 10px; }
  .sim .controls { display: flex; flex-wrap: wrap; gap: 10px 18px; align-items: center; margin: 8px 0; }
  .sim label { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--soft); }
  .sim label b { color: var(--ink); font-variant-numeric: tabular-nums; min-width: 2.5em; }
  .sim input[type=range] { accent-color: var(--accent); width: 170px; }
  .sim input[type=checkbox] { accent-color: var(--accent); }
  .sim select { font: inherit; color: var(--ink); background: var(--bg); border: 1px solid var(--line); border-radius: 7px; padding: 2px 6px; }
  .sim button { font: inherit; font-weight: 600; color: var(--accent); background: var(--accent-soft); border: 1px solid transparent; border-radius: 8px; padding: 5px 14px; cursor: pointer; }
  .sim button:hover { border-color: var(--accent); }
  .sim canvas { display: block; width: 100%; margin: 6px 0; }
  .sim .readouts { display: flex; flex-wrap: wrap; gap: 6px 22px; font-size: 13.5px; color: var(--soft); margin-top: 6px; }
  .sim .readouts b { color: var(--ink); font-variant-numeric: tabular-nums; }
  .sim .note { font-size: 13px; color: var(--soft); margin: 8px 0 0; }
  .sim-error { margin: 12px 16px; padding: 10px 14px; border-radius: 8px; background: #fbe4e1; color: #7d1a10; font-size: 13.5px; }
  .sim-error code { display: block; margin-top: 6px; white-space: pre-wrap; }
  `;
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.appendChild(style);

  /* a bug in the simulation should be readable, and easy to hand back to the agent */
  function showError(msg) {
    if (!document.body) return;
    let box = document.querySelector('.sim-error');
    if (!box) { box = document.createElement('div'); box.className = 'sim-error'; document.body.prepend(box); }
    box.innerHTML = 'This simulation has a bug. Paste this into Kiro and say <b>fix the simulation</b>:<code></code>';
    box.querySelector('code').textContent = msg;
  }
  /* run the simulation's own code so that a bug in it is reported with its real message */
  function safe(fn) { return function () { try { return fn.apply(this, arguments); } catch (e) { showError(e && e.message ? e.message : String(e)); } }; }
  window.addEventListener('error', e => showError((e.message || 'error') + (e.lineno ? ' (line ' + e.lineno + ')' : '')));

  function tellHeight() {
    if (parent !== window && document.body) parent.postMessage({ lessonSim: true, height: document.body.offsetHeight }, '*');
  }

  function niceTicks(lo, hi, n) {
    const span = hi - lo || 1, raw = span / Math.max(1, n), mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const step = [1, 2, 5, 10].map(m => m * mag).find(s => s >= raw) || raw;
    const out = [];
    for (let v = Math.ceil(lo / step) * step; v <= hi + step * 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }
  const fmt = v => Math.abs(v) >= 1000 || Number.isInteger(v) ? String(Math.round(v * 100) / 100) : String(+v.toPrecision(3));

  window.Sim = function (opts) {
    opts = opts || {};
    const root = document.createElement('div');
    root.className = 'sim';
    if (opts.title) { const h = document.createElement('h2'); h.textContent = opts.title; root.appendChild(h); document.title = opts.title; }
    if (opts.caption) { const c = document.createElement('p'); c.className = 'cap'; c.textContent = opts.caption; root.appendChild(c); }
    const controls = document.createElement('div'); controls.className = 'controls'; root.appendChild(controls);
    let readouts = null;
    (document.body || document.documentElement).appendChild(root);

    const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const sim = { root, plots: [], _draw: null, _queued: false };
    Object.defineProperty(sim, 'colors', { get: () => ({ ink: cssVar('--ink'), soft: cssVar('--soft'), line: cssVar('--line'), accent: cssVar('--accent'), accentSoft: cssVar('--accent-soft'), good: cssVar('--good'), warn: cssVar('--warn'), bg: cssVar('--bg') }) });

    sim.redraw = function () {
      if (sim._queued) return;
      sim._queued = true;
      requestAnimationFrame(() => { sim._queued = false; sim.plots.forEach(p => p._fit()); if (sim._draw) safe(sim._draw)(); tellHeight(); });
    };
    /* draw(fn): fn runs after every control change, button press, resize and animation frame */
    sim.draw = function (fn) { sim._draw = fn; sim.redraw(); };

    sim.slider = function (label, min, max, value, step) {
      const l = document.createElement('label'), i = document.createElement('input'), b = document.createElement('b');
      i.type = 'range'; i.min = min; i.max = max; i.step = step || 1; i.value = value;
      b.textContent = fmt(+i.value);
      l.append(label + ' ', i, b); controls.appendChild(l);
      const c = { get value() { return +i.value; }, set(v) { i.value = v; b.textContent = fmt(+i.value); sim.redraw(); }, onchange: null };
      i.addEventListener('input', () => { b.textContent = fmt(+i.value); if (c.onchange) safe(c.onchange)(+i.value); sim.redraw(); });
      return c;
    };
    sim.toggle = function (label, on) {
      const l = document.createElement('label'), i = document.createElement('input');
      i.type = 'checkbox'; i.checked = !!on; l.append(i, ' ' + label); controls.appendChild(l);
      const c = { get value() { return i.checked; }, onchange: null };
      i.addEventListener('change', () => { if (c.onchange) safe(c.onchange)(i.checked); sim.redraw(); });
      return c;
    };
    sim.select = function (label, options, value) {
      const l = document.createElement('label'), s = document.createElement('select');
      options.forEach(o => { const e = document.createElement('option'); e.value = e.textContent = o; s.appendChild(e); });
      s.value = value || options[0]; l.append(label + ' ', s); controls.appendChild(l);
      const c = { get value() { return s.value; }, onchange: null };
      s.addEventListener('change', () => { if (c.onchange) safe(c.onchange)(s.value); sim.redraw(); });
      return c;
    };
    sim.button = function (label, fn) {
      const b = document.createElement('button'); b.textContent = label; controls.appendChild(b);
      b.addEventListener('click', () => { safe(fn)(); sim.redraw(); });
      return b;
    };
    /* readout(label) returns a setter: const mean = sim.readout('mean'); mean(4.98) */
    sim.readout = function (label) {
      if (!readouts) { readouts = document.createElement('div'); readouts.className = 'readouts'; root.appendChild(readouts); }
      const s = document.createElement('span'), b = document.createElement('b');
      s.append(label + ' ', b); readouts.appendChild(s);
      return v => { b.textContent = typeof v === 'number' ? fmt(v) : v; };
    };
    sim.note = function (text) { const p = document.createElement('p'); p.className = 'note'; p.textContent = text; root.appendChild(p); return p; };

    /* animate(fn): fn(dt, t) in seconds, every frame while running. Returns start/stop/toggle. */
    sim.animate = function (fn) {
      const a = { running: false, _last: 0, _t: 0 };
      const frame = now => {
        if (!a.running) return;
        const dt = Math.min(0.1, (now - a._last) / 1000); a._last = now; a._t += dt;
        safe(fn)(dt, a._t); sim.redraw(); requestAnimationFrame(frame);
      };
      a.start = () => { if (!a.running) { a.running = true; a._last = performance.now(); requestAnimationFrame(frame); } };
      a.stop = () => { a.running = false; };
      a.toggle = () => (a.running ? a.stop() : a.start());
      return a;
    };

    /* canvas(height) returns a plot: clear, axes, line, fn, points, bars, text, and the raw ctx */
    sim.canvas = function (height) {
      const cv = document.createElement('canvas');
      root.insertBefore(cv, readouts);
      const ctx = cv.getContext('2d');
      const P = { ctx, canvas: cv, w: 0, h: height || 300, _s: null };
      P._fit = function () {
        const w = Math.max(200, Math.round(cv.clientWidth || root.clientWidth - 32)), r = window.devicePixelRatio || 1;
        if (cv.width !== Math.round(w * r) || cv.height !== Math.round(P.h * r)) {
          cv.width = Math.round(w * r); cv.height = Math.round(P.h * r); cv.style.height = P.h + 'px';
        }
        ctx.setTransform(r, 0, 0, r, 0, 0); P.w = w;
      };
      P.clear = function () { ctx.clearRect(0, 0, P.w, P.h); P._s = null; };
      /* axes({xmin,xmax,ymin,ymax,xlabel,ylabel}) sets the scale used by line, fn, points and text */
      P.axes = function (o) {
        const c = sim.colors, L = 44, R = 12, T = 10, B = o.xlabel ? 40 : 26;
        const s = P._s = { xmin: o.xmin, xmax: o.xmax, ymin: o.ymin, ymax: o.ymax, box: [L, T, P.w - L - R, P.h - T - B],
          X: x => L + (x - o.xmin) / (o.xmax - o.xmin || 1) * (P.w - L - R),
          Y: y => P.h - B - (y - o.ymin) / (o.ymax - o.ymin || 1) * (P.h - T - B) };
        ctx.lineWidth = 1; ctx.font = '11px system-ui, sans-serif'; ctx.fillStyle = c.soft;
        ctx.strokeStyle = c.line;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        niceTicks(o.xmin, o.xmax, 8).forEach(v => { ctx.beginPath(); ctx.moveTo(s.X(v), s.Y(o.ymin)); ctx.lineTo(s.X(v), s.Y(o.ymin) + 4); ctx.stroke(); ctx.fillText(fmt(v), s.X(v), s.Y(o.ymin) + 6); });
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        niceTicks(o.ymin, o.ymax, 5).forEach(v => { ctx.beginPath(); ctx.moveTo(L, s.Y(v)); ctx.lineTo(P.w - R, s.Y(v)); ctx.stroke(); ctx.fillText(fmt(v), L - 6, s.Y(v)); });
        ctx.strokeStyle = c.soft; ctx.beginPath(); ctx.moveTo(L, s.Y(o.ymin)); ctx.lineTo(P.w - R, s.Y(o.ymin)); ctx.stroke();
        if (o.xlabel) { ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(o.xlabel, (L + P.w - R) / 2, P.h - 2); }
        if (o.ylabel) { ctx.save(); ctx.translate(11, (T + P.h - B) / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.ylabel, 0, 0); ctx.restore(); }
        return s;
      };
      const scale = () => { if (!P._s) throw new Error('call plot.axes({...}) before plot.line / fn / points / text'); return P._s; };
      /* line([[x,y],...], {color, width, dash}) */
      P.line = function (pts, o) {
        const s = scale(); o = o || {};
        ctx.save(); ctx.beginPath(); ctx.rect(s.box[0], s.box[1], s.box[2], s.box[3]); ctx.clip();   // stay inside the axes
        ctx.strokeStyle = o.color || sim.colors.accent; ctx.lineWidth = o.width || 2; ctx.setLineDash(o.dash || []);
        ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(s.X(p[0]), s.Y(p[1])) : ctx.moveTo(s.X(p[0]), s.Y(p[1])))); ctx.stroke();
        ctx.restore();
      };
      /* fn(x => y, {color, width, dash}) draws a function across the x range */
      P.fn = function (f, o) {
        const s = scale(), pts = [];
        for (let i = 0; i <= 200; i++) { const x = s.xmin + (s.xmax - s.xmin) * i / 200, y = f(x); if (isFinite(y)) pts.push([x, y]); }
        P.line(pts, o);
      };
      /* points([[x,y],...], {color, r}) */
      P.points = function (pts, o) {
        const s = scale(); o = o || {}; ctx.fillStyle = o.color || sim.colors.accent;
        pts.forEach(p => { ctx.beginPath(); ctx.arc(s.X(p[0]), s.Y(p[1]), o.r || 3, 0, 7); ctx.fill(); });
      };
      /* text('label', x, y, {color, align}) in axes units */
      P.text = function (str, x, y, o) {
        const s = scale(); o = o || {}; ctx.fillStyle = o.color || sim.colors.ink; ctx.font = (o.size || 12) + 'px system-ui, sans-serif';
        ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(str, s.X(x), s.Y(y) - 3);
      };
      /* bars(values, {labels, max, color, highlight: i => bool, overlay: [y...], xlabel}):
         one bar per value; overlay draws a curve through the same positions (a theory line) */
      P.bars = function (values, o) {
        o = o || {};
        const c = sim.colors, n = values.length, L = 40, R = 10, T = 12, B = o.xlabel ? 40 : 24;
        const max = o.max || Math.max(1e-9, ...values, ...(o.overlay || [])) * 1.08;
        const bw = (P.w - L - R) / n, Y = v => P.h - B - v / max * (P.h - T - B), X = i => L + (i + 0.5) * bw;
        ctx.font = '11px system-ui, sans-serif'; ctx.strokeStyle = c.line; ctx.fillStyle = c.soft; ctx.lineWidth = 1;
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        niceTicks(0, max, 4).forEach(v => { ctx.beginPath(); ctx.moveTo(L, Y(v)); ctx.lineTo(P.w - R, Y(v)); ctx.stroke(); ctx.fillText(fmt(v), L - 6, Y(v)); });
        values.forEach((v, i) => {
          ctx.fillStyle = o.highlight && o.highlight(i) ? c.warn : (o.color || c.accent);
          ctx.fillRect(X(i) - Math.max(1, bw * 0.42), Y(v), Math.max(1, bw * 0.84), P.h - B - Y(v));
        });
        const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor((P.w - L - R) / 34))));
        ctx.fillStyle = c.soft; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        for (let i = 0; i < n; i += every) ctx.fillText(o.labels ? o.labels[i] : i, X(i), P.h - B + 5);
        if (o.xlabel) { ctx.textBaseline = 'bottom'; ctx.fillText(o.xlabel, (L + P.w - R) / 2, P.h - 2); }
        if (o.overlay) {
          ctx.strokeStyle = c.ink; ctx.lineWidth = 2; ctx.beginPath();
          o.overlay.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.stroke();
        }
      };
      sim.plots.push(P); P._fit();
      return P;
    };

    window.addEventListener('resize', sim.redraw);
    if (window.ResizeObserver) new ResizeObserver(tellHeight).observe(document.documentElement);
    setTimeout(tellHeight, 50);
    return sim;
  };
})();
