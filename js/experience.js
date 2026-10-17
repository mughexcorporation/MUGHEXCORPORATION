/* MUGHEX scroll experience: sound gate + countdown, motion-linked sound, pinned manifesto, HUD, command menu, cursor, scroll marquee. */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches, FINE = matchMedia("(pointer: fine)").matches;
  const site = (window.MUGHEX_PORTFOLIO && window.MUGHEX_PORTFOLIO.site) || {};
  const B = document.body, clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };

  /* ---------- Sound (Web Audio, synthesized: no audio files) ---------- */
  let ac = null, master, bedG, bedF, on = false;
  function startAudio() {
    if (ac) return; const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
    ac = new A(); master = ac.createGain(); master.gain.value = 0; master.connect(ac.destination);
    const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 380; lp.connect(master);
    [[55, "sawtooth", .12], [82.41, "sine", .3], [110.3, "sine", .2]].forEach(([f, ty, v]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = ty; o.frequency.value = f; g.gain.value = v; o.connect(g); g.connect(lp); o.start(); });
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .07; lg.gain.value = 160; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const n = ac.sampleRate * 2, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; bedF = ac.createBiquadFilter(); bedF.type = "bandpass"; bedF.frequency.value = 300; bedF.Q.value = .8;
    bedG = ac.createGain(); bedG.gain.value = 0; src.connect(bedF); bedF.connect(bedG); bedG.connect(master); src.start();
  }
  function setSound(v) {
    on = v; if (v) { startAudio(); if (ac) { ac.resume(); master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(.22, ac.currentTime + 2.5); } }
    else if (ac) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.linearRampToValueAtTime(0, ac.currentTime + .4); }
    B.classList.toggle("snd-on", v); const b = $("#snd"); if (b) { b.setAttribute("aria-pressed", v); $(".snd-t", b).textContent = v ? "SOUND ON" : "SOUND OFF"; }
    try { localStorage.setItem("mughex-snd", v ? "1" : "0"); } catch (e) {}
  }
  function blip(f, dur, vol, type, slide) {
    if (!on || !ac) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05);
  }
  const tick = () => blip(1500, .05, .05, "sine", 1100), thud = () => blip(140, .25, .18, "sine", 50), chime = () => { blip(660, .9, .05); setTimeout(() => blip(990, 1.1, .035), 90); };

  /* ---------- Gate + film countdown ---------- */
  function enter(withSound) {
    const g = $("#gate"); try { sessionStorage.setItem("mughex-in", "1"); } catch (e) {}
    if (withSound) setSound(true);
    const finish = () => { g.classList.add("out"); B.classList.remove("locked"); setTimeout(() => g.remove(), 1000); thud(); };
    finish();
  }
  let entered = false; try { entered = sessionStorage.getItem("mughex-in") === "1"; } catch (e) {}
  if (!entered) {
    B.classList.add("locked"); const g = el("div", "gate", '<div class="g-ring"></div><div class="g-in"><p class="g-k">MUGHEX CORPORATION</p><h2>Abdullah<br>Iqbal</h2><p class="g-s">Video editor · Lahore, Pakistan</p><div class="g-num" aria-live="polite"></div><div class="g-b"><button class="gb gb-p" id="g-on" type="button">Enter with sound</button><button class="gb" id="g-off" type="button">Enter silent</button></div><p class="g-n">Sound is soft and follows your scroll. Switch it off anytime.</p></div>');
    g.id = "gate"; g.setAttribute("role", "dialog"); g.setAttribute("aria-modal", "true"); g.setAttribute("aria-label", "Welcome"); B.append(g);
    $("#g-on").onclick = () => enter(true); $("#g-off").onclick = () => enter(false); $("#g-on").focus();
    g.addEventListener("keydown", e => { if (e.key === "Escape") enter(false); });
  } else { try { if (localStorage.getItem("mughex-snd") === "1") { /* needs a user gesture; offered via the sound button */ } } catch (e) {} }

  /* ---------- HUD: sound + scroll % + section dots ---------- */
  const hud = el("div", "hud", '<button id="snd" type="button" aria-pressed="false" aria-label="Toggle sound"><span class="eq"><i></i><i></i><i></i><i></i></span><span class="snd-t">SOUND OFF</span></button><span class="pct" id="pct" aria-hidden="true">SCROLL 000%</span>');
  B.append(hud); $("#snd").onclick = () => { setSound(!on); if (on) chime(); };
  const manifesto = [["CUT.", "Precise cuts and hooks that stop the scroll"], ["PACE.", "Rhythm that holds attention to the last second"], ["CAPTION.", "Dynamic captions people actually read"], ["SOUND.", "Sound design and SFX you can feel"], ["STORY.", "B-roll, color and flow that say it clearly"], ["EVERY FRAME<br>HAS A PURPOSE.", "Abdullah Iqbal · MUGHEX Corporation"]];
  const mf = el("section", "manifesto", '<div class="mf-stick"><p class="mf-k">[ 01 ] MANIFESTO <span id="mf-c">01 / 06</span></p><div class="mf-words">' + manifesto.map((m, i) => `<div class="mf-w${i === 5 ? " last" : ""}"><h2>${m[0]}</h2><p>${m[1]}</p></div>`).join("") + '</div><div class="mf-scrub"><div class="mf-bar"><i id="mf-fill"></i></div><span id="mf-tc">00:00:00:00</span></div></div>');
  mf.id = "manifesto"; mf.setAttribute("aria-label", "Editing philosophy"); mf.style.setProperty("--n", manifesto.length);
  const tk = $(".ticker"); if (tk) tk.after(mf);
  const secs = [["home", "Intro"], ["manifesto", "Manifesto"], ["work", "Work"], ["services", "Services"], ["about", "About"], ["certificates", "Certificate"], ["contact", "Contact"]].filter(s => $("#" + s[0]));
  const dots = el("nav", "dots"); dots.setAttribute("aria-label", "Sections");
  secs.forEach(([id, name], i) => { const b = el("button", "", `<span>${String(i + 1).padStart(2, "0")} ${name}</span>`); b.type = "button"; b.setAttribute("aria-label", "Go to " + name); b.onclick = () => $("#" + id).scrollIntoView({ behavior: RM ? "auto" : "smooth" }); dots.append(b); });
  B.append(dots);
  const heroCue = el("a", "cue", '<i></i>Scroll to start exploring'); heroCue.href = "#manifesto"; const hero = $("#home"); if (hero) hero.append(heroCue);

  /* about text: words light up with scroll */
  const lit = $$(".about-section p").filter(p => !p.children.length && p.textContent.length > 60).map(p => { const w = p.textContent.trim().split(/\s+/); p.innerHTML = w.map(x => `<span class="w">${x}</span>`).join(" "); return { p, w: $$(".w", p) }; });

  /* ---------- Scroll loop ---------- */
  let ly = scrollY, lt = performance.now(), vel = 0, q = false, active = -1, secIdx = -1, mqW = 0;
  const projCards = () => $$(".project-card");
  function frame() {
    q = false; const y = scrollY, vh = innerHeight, now = performance.now(), dy = y - ly, dt = Math.max(1, now - lt);
    vel += (Math.abs(dy) / dt - vel) * .25; ly = y; lt = now;
    if (bedG) { bedG.gain.setTargetAtTime(on ? Math.min(vel * .045, .07) : 0, ac.currentTime, .08); bedF.frequency.setTargetAtTime(220 + Math.min(vel, 6) * 380, ac.currentTime, .1); }
    const max = Math.max(1, document.documentElement.scrollHeight - vh); $("#pct").textContent = "SCROLL " + String(Math.round(y / max * 100)).padStart(3, "0") + "%";
    if (hero) hero.style.setProperty("--hs", clamp(y / vh).toFixed(3));
    const r = mf.getBoundingClientRect(), span = mf.offsetHeight - vh, p = clamp(-r.top / Math.max(1, span)), n = manifesto.length, idx = Math.min(n - 1, Math.floor(p * n));
    $$(".mf-w", mf).forEach((w, i) => w.classList.toggle("on", i === idx && r.top < vh * .6 && r.bottom > vh * .4));
    if (idx !== active && r.top < vh * .5 && r.bottom > vh * .5) { if (active !== -1) { tick(); } active = idx; $("#mf-c").textContent = String(idx + 1).padStart(2, "0") + " / 0" + n; }
    $("#mf-fill").style.transform = `scaleX(${p})`; const f = Math.floor(p * 60 * 24); $("#mf-tc").textContent = "00:00:" + String(Math.floor(f / 24)).padStart(2, "0") + ":" + String(f % 24).padStart(2, "0");
    B.classList.toggle("cine", r.top < vh * .3 && r.bottom > vh * .7);
    projCards().forEach(c => { const b = c.getBoundingClientRect(), d = clamp((b.top + b.height / 2 - vh / 2) / vh, -1, 1); c.style.setProperty("--s", (1 - Math.abs(d) * .07).toFixed(3)); c.style.setProperty("--d", d.toFixed(3)); });
    lit.forEach(({ p: pe, w }) => { const b = pe.getBoundingClientRect(), t = clamp((vh * .85 - b.top) / (vh * .55 + b.height * .5)); w.forEach((s, i) => s.classList.toggle("lit", i / w.length < t)); });
    let cur = 0; secs.forEach(([id], i) => { const b = $("#" + id).getBoundingClientRect(); if (b.top < vh * .5) cur = i; }); $$("button", dots).forEach((b, i) => b.classList.toggle("on", i === cur));
    window.dispatchEvent(new CustomEvent("mughex:scroll", { detail: { p: y / max, id: secs[cur][0], idx: cur, vel } }));
    if (cur !== secIdx) { if (secIdx !== -1) chime(); secIdx = cur; }
  }
  const req = () => { if (!q) { q = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, { passive: true }); addEventListener("resize", () => { mqW = 0; req(); }); frame();
  setInterval(() => { if (vel > .02) { vel *= .8; req(); } }, 120);

  /* ---------- Hover sounds ---------- */
  document.addEventListener("pointerover", e => { const t = e.target.closest && e.target.closest("a,button,.project-card"); if (t && t !== document._lastHot) { document._lastHot = t; tick(); } }, { passive: true });
  document.addEventListener("pointerout", e => { if (!e.relatedTarget || !e.relatedTarget.closest || !e.relatedTarget.closest("a,button,.project-card")) document._lastHot = null; }, { passive: true });
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("a,button")) thud(); }, { passive: true });

  /* ---------- Command menu (Ctrl/Cmd + K) ---------- */
  const acts = secs.map(([id, n]) => ["Go to " + n, () => $("#" + id).scrollIntoView({ behavior: RM ? "auto" : "smooth" })]).concat([
    ["Chat on WhatsApp", () => { const a = $("[data-whatsapp-link]"); if (a) open(a.href, "_blank", "noopener"); }], ["Email me", () => { location.href = "mailto:" + (site.email || ""); }],
    ["Toggle light / dark theme", () => { const t = $("#theme-toggle"); if (t) t.click(); }], ["Toggle sound", () => { setSound(!on); }]]);
  const pal = el("div", "pal", '<div class="pal-box" role="dialog" aria-modal="true" aria-label="Quick menu"><input id="pal-in" placeholder="Type a command…  (Esc to close)" aria-label="Search commands"><ul id="pal-ul"></ul></div>'); pal.hidden = true; B.append(pal);
  let sel = 0, shown = acts;
  function draw() { $("#pal-ul").innerHTML = shown.map((a, i) => `<li class="${i === sel ? "on" : ""}" data-i="${i}">${a[0]}</li>`).join("") || "<li>No match</li>"; }
  function openPal() { pal.hidden = false; $("#pal-in").value = ""; shown = acts; sel = 0; draw(); $("#pal-in").focus(); tick(); }
  const closePal = () => { pal.hidden = true; };
  $("#pal-in").oninput = e => { const v = e.target.value.toLowerCase(); shown = acts.filter(a => a[0].toLowerCase().includes(v)); sel = 0; draw(); };
  $("#pal-ul").onclick = e => { const li = e.target.closest("li[data-i]"); if (li) { const a = shown[+li.dataset.i]; closePal(); a[1](); } };
  pal.addEventListener("click", e => { if (e.target === pal) closePal(); });
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPal() : closePal(); return; }
    if (pal.hidden) return;
    if (e.key === "Escape") closePal(); else if (e.key === "ArrowDown") { e.preventDefault(); sel = Math.min(shown.length - 1, sel + 1); draw(); } else if (e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, sel - 1); draw(); }
    else if (e.key === "Enter" && shown[sel]) { const a = shown[sel]; closePal(); a[1](); }
  });

  /* ---------- Visitor counter (GoatCounter, only when configured) ---------- */
  if (site.goatcounter) {
    const base = "https://" + site.goatcounter + ".goatcounter.com", s = document.createElement("script"); s.async = true; s.src = "https://gc.zgo.at/count.js"; s.dataset.goatcounter = base + "/count"; document.head.append(s);
    fetch(base + "/counter/TOTAL.json").then(r => r.ok ? r.json() : Promise.reject()).then(x => { const f = $(".footer"); if (f && x.count) f.append(el("span", "vis", "Visitors <b>" + x.count + "</b>")); }).catch(() => {});
  }
  window.MUGHEX_XP = { audioState: () => (ac ? ac.state : "off"), cut: () => blip(2600, .035, .05, "square", 1800), tick: () => tick() };
})();
