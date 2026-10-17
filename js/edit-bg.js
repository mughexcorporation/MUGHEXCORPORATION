/* Interactive editor in the hero: click a clip to cut it, drag clips to rearrange, drag the playhead to scrub (it also scrubs the hero footage).
   Also: soft cursor spotlight and hoverable letters in headings. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hero = $("#home"); if (!hero) return;

  /* cursor spotlight */
  const spot = document.createElement("div"); spot.className = "spot"; spot.setAttribute("aria-hidden", "true"); document.body.append(spot);
  if (matchMedia("(pointer: fine)").matches && !RM) { let q = 0; addEventListener("pointermove", e => { if (q) return; q = 1; requestAnimationFrame(() => { spot.style.setProperty("--x", e.clientX + "px"); spot.style.setProperty("--y", e.clientY + "px"); spot.classList.add("on"); q = 0; }); }, { passive: true }); }

  /* hoverable letters */
  function split(root) {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) { if (!c.textContent.trim()) return; const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => { if (!t) return; if (/^\s+$/.test(t)) { f.append(" "); return; } const w = document.createElement("span"); w.className = "wd"; w.setAttribute("aria-hidden", "true");
          [...t].forEach(ch => { const s = document.createElement("span"); s.className = "ch"; s.textContent = ch; w.append(s); }); f.append(w); }); c.replaceWith(f); }
      else if (c.nodeType === 1 && !["SMALL", "BR"].includes(c.tagName) && !c.classList.contains("bar")) walk(c);
    });
    root.setAttribute("aria-label", root.textContent.replace(/\s+/g, " ").trim()); walk(root);
  }
  document.querySelectorAll(".hero-name, .hero-title, main h2").forEach(h => { if (!h.closest(".mf-w, dialog")) split(h); });

  /* interactive timeline */
  const wrap = document.createElement("div"); wrap.className = "ed"; const cv = document.createElement("canvas"); cv.tabIndex = 0;
  cv.setAttribute("role", "img"); cv.setAttribute("aria-label", "Interactive timeline. Click a clip to cut it, drag clips to move them, drag the playhead to scrub. Keys: space play or pause, arrows scrub, C cut, R reset.");
  wrap.append(cv); hero.append(wrap); const g = cv.getContext("2d"); if (!g) return;
  const mk = a => a.map(w => ({ w })), start = () => [mk([.18, .12, .22, .16, .14, .18]), mk([.1, .2, .14, .2, .16, .2])];
  let lanes = start(), W = 0, H = 0, p = 0, playing = true, idle = 0, hover = null, drag = null, pend = null, scrub = false, hint = true, flash = null, vis = true, ac = "#38bdf8", last = 0;
  const ROW = [{ y: 30, h: 34 }, { y: 70, h: 34 }], AY = 128, PAD = 12, GAP = 4;
  const bars = Array.from({ length: 200 }, (_, i) => Math.abs(Math.sin(i * .37) * .6 + Math.sin(i * .113) * .4));
  const layout = l => { const av = W - PAD * 2 - GAP * (l.length - 1); let x = PAD; return l.map(c => { const r = { x, w: c.w * av, c }; x += r.w + GAP; return r; }); };
  const vid = () => { const v = $(".hv-video"); return v && v.src && v.duration ? v : null; };
  const xp = () => window.MUGHEX_XP || {};
  function resize() { const d = Math.min(devicePixelRatio || 1, 2); W = wrap.clientWidth; H = wrap.clientHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); draw(); }
  function box(x, y, w, h, fa, sa) { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, 6) : g.rect(x, y, w, h); g.globalAlpha = fa; g.fillStyle = ac; g.fill(); g.globalAlpha = sa; g.strokeStyle = ac; g.lineWidth = 1; g.stroke(); }
  function draw() {
    const light = document.documentElement.dataset.theme === "light", tx = light ? "#0b1522" : "#f2f6fa", px = PAD + p * (W - PAD * 2); ac = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#38bdf8";
    g.clearRect(0, 0, W, H); g.fillStyle = tx; g.globalAlpha = .25; for (let x = PAD; x < W - PAD; x += 20) { const big = ((x - PAD) / 20) % 5 === 0; g.fillRect(x, 22 - (big ? 12 : 6), 1, big ? 12 : 6); }
    lanes.forEach((l, li) => layout(l).forEach(r => { if (drag && drag.c === r.c) return; const hot = hover && hover.c === r.c; box(r.x, ROW[li].y, r.w, ROW[li].h, hot ? .3 : .15, hot ? .85 : .42); }));
    if (drag) box(drag.x - drag.w / 2, ROW[drag.li].y - 3, drag.w, ROW[drag.li].h, .4, 1);
    g.fillStyle = ac; for (let i = 0, n = Math.floor((W - PAD * 2) / 6); i < n; i++) { const x = PAD + i * 6, h = 3 + bars[i % 200] * 22; g.globalAlpha = x < px ? .7 : .22; g.fillRect(x, AY - h / 2, 3, h); }
    if (hover && hover.mx != null && !drag && !scrub) { g.strokeStyle = tx; g.globalAlpha = .5; g.setLineDash([3, 4]); g.beginPath(); g.moveTo(hover.mx, 26); g.lineTo(hover.mx, 112); g.stroke(); g.setLineDash([]); g.globalAlpha = .8; g.font = "12px sans-serif"; g.fillStyle = tx; g.fillText("✂", hover.mx - 6, 20); }
    if (flash) { const a = 1 - (performance.now() - flash.t) / 500; if (a > 0) { g.globalAlpha = a; g.fillStyle = "#fff"; g.fillRect(flash.x - 1, 26, 2, 86); } else flash = null; }
    g.globalAlpha = .18; g.fillStyle = ac; g.fillRect(px - 5, 24, 10, 94); g.globalAlpha = 1; g.fillRect(px - 1, 24, 2, 94); g.beginPath(); g.moveTo(px - 7, 22); g.lineTo(px + 7, 22); g.lineTo(px, 32); g.fill();
    if (hint) { g.globalAlpha = .5; g.fillStyle = tx; g.font = "11px system-ui,sans-serif"; g.textAlign = "right"; g.fillText("Click to cut  ·  Drag clips  ·  Scrub the playhead", W - PAD, 14); g.textAlign = "left"; } g.globalAlpha = 1;
  }
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  function hit(x, y) { for (let li = 0; li < 2; li++) if (y >= ROW[li].y && y <= ROW[li].y + ROW[li].h) { const r = layout(lanes[li]).find(r => x >= r.x && x <= r.x + r.w); if (r) return { li, ...r }; } return null; }
  function setP(x) { p = Math.min(1, Math.max(0, (x - PAD) / (W - PAD * 2))); const v = vid(); if (v) { v.pause(); v.currentTime = p * v.duration; } }
  cv.addEventListener("pointerdown", e => {
    const [x, y] = pos(e), px = PAD + p * (W - PAD * 2); hint = false; playing = false; idle = performance.now(); cv.setPointerCapture(e.pointerId);
    if (y < 26 || Math.abs(x - px) < 10) { scrub = true; setP(x); } else { const h = hit(x, y); if (h) pend = { ...h, sx: x }; }
  });
  cv.addEventListener("pointermove", e => {
    const [x, y] = pos(e); idle = performance.now();
    if (scrub) setP(x); else if (pend) { if (!drag && Math.abs(x - pend.sx) > 5) drag = { li: pend.li, c: pend.c, w: pend.w, x }; if (drag) drag.x = x; }
    else hover = { mx: x, ...(hit(x, y) || {}) };
    if (RM) draw();
  });
  cv.addEventListener("pointerup", e => {
    const [x] = pos(e);
    if (drag) { const l = lanes[drag.li], others = layout(l).filter(r => r.c !== drag.c), idx = others.filter(r => r.x + r.w / 2 < drag.x).length; l.splice(l.indexOf(drag.c), 1); l.splice(idx, 0, drag.c); if (xp().tick) xp().tick(); }
    else if (pend && pend.w > 50 && lanes[pend.li].length < 12) { const l = lanes[pend.li], k = l.indexOf(pend.c), a = Math.min(pend.c.w * .9, Math.max(pend.c.w * .1, (x - pend.x) / pend.w * pend.c.w)); l.splice(k, 1, { w: a }, { w: pend.c.w - a }); flash = { x, t: performance.now() }; if (xp().cut) xp().cut(); }
    drag = null; pend = null; scrub = false; idle = performance.now(); draw();
  });
  cv.addEventListener("pointerleave", () => { hover = null; if (RM) draw(); });
  cv.addEventListener("dblclick", () => { lanes = start(); draw(); });
  cv.addEventListener("keydown", e => {
    const k = e.key.toLowerCase(); if (k === " ") { e.preventDefault(); playing = !playing; const v = vid(); if (v) playing ? v.play().catch(() => {}) : v.pause(); } else if (k === "arrowright" || k === "arrowleft") { e.preventDefault(); playing = false; setP(PAD + (p + (k === "arrowright" ? .02 : -.02)) * (W - PAD * 2)); idle = performance.now(); }
    else if (k === "r") lanes = start(); else if (k === "c") { const x = PAD + p * (W - PAD * 2), h = lanes.map((_, li) => hit(x, ROW[li].y + 5)).find(Boolean); if (h && h.w > 50) { const l = lanes[h.li], j = l.indexOf(h.c), a = Math.min(h.c.w * .9, Math.max(h.c.w * .1, (x - h.x) / h.w * h.c.w)); l.splice(j, 1, { w: a }, { w: h.c.w - a }); flash = { x, t: performance.now() }; if (xp().cut) xp().cut(); } } draw();
  });
  new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(hero); addEventListener("resize", resize);
  new MutationObserver(draw).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  resize(); window.MUGHEX_ED = { lanes: () => lanes.map(l => l.map(c => +c.w.toFixed(3))), p: () => p };
  if (RM) return;
  (function loop(now) {
    requestAnimationFrame(loop); if (!vis || document.hidden || now - last < 33) return; const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (!playing && !scrub && !drag && !pend && now - idle > 4000) { playing = true; const v = vid(); if (v) v.play().catch(() => {}); }
    if (playing) { const v = vid(); p = v ? v.currentTime / v.duration : (p + dt / 24) % 1; } draw();
  })(0);
})();
