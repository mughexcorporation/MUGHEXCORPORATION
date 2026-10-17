(() => {
  "use strict";

  const config = window.MUGHEX_PORTFOLIO || { site: {}, filters: ["All"], projects: [] };
  const site = config.site || {};
  const MAX = Number(config.maxPerCategory) > 0 ? Number(config.maxPerCategory) : 3;
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  const grid = $("project-grid");
  const filters = $("filters");
  const empty = $("empty-note");
  const placeholderNote = $("placeholder-note");
  const dialog = $("video-dialog");
  const video = $("dialog-video");
  const closeBtn = $("dialog-close");
  const message = $("dialog-message");
  let activeFilter = "All";
  let lastTrigger = null;

  // frame shape for every video card and the player (portrait by default)
  const ratio = String(config.frameRatio || "9 / 16");
  const rm = ratio.match(/^\s*(\d+(?:\.\d+)?)\s*[\/:]\s*(\d+(?:\.\d+)?)\s*$/);
  if (rm) {
    root.style.setProperty("--thumb-ratio", rm[1] + " / " + rm[2]);
    root.classList.toggle("portrait-frames", Number(rm[2]) > Number(rm[1]));
  }

  $("year").textContent = new Date().getFullYear();

  function safeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---------- Theme switcher (Dark / Light) ---------- */
  const themeBtn = $("theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  function applyTheme(theme, save) {
    root.setAttribute("data-theme", theme);
    const isLight = theme === "light";
    themeBtn.setAttribute("aria-pressed", String(isLight));
    themeBtn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    themeBtn.title = isLight ? "Switch to dark mode" : "Switch to light mode";
    if (themeMeta) themeMeta.setAttribute("content", isLight ? "#f1f6fb" : "#060a12");
    if (save) { try { localStorage.setItem("mughex-theme", theme); } catch (e) { /* storage unavailable: theme just won't persist */ } }
    if (typeof window.__dustTheme === "function") window.__dustTheme();
  }
  themeBtn.addEventListener("click", () => applyTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true));
  applyTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);

  /* ---------- Contact details from portfolio.js ---------- */
  function whatsappNumber() {
    // "03402816840" + country code "92" -> "923402816840"
    const cc = String(site.countryCode || "92").replace(/\D/g, "");
    let n = String(site.whatsapp || "").replace(/\D/g, "");
    if (!n) return "";
    if (n.startsWith("00")) n = n.slice(2);
    else if (n.startsWith("0")) n = cc + n.slice(1);
    else if (!n.startsWith(cc)) n = cc + n;
    return n;
  }
  function prettyLocal(raw) {
    const d = String(raw || "").replace(/\D/g, "");
    return d.length === 11 ? d.slice(0, 4) + " " + d.slice(4) : raw;
  }

  function applySiteConfig() {
    // WhatsApp
    const num = whatsappNumber();
    const waLinks = document.querySelectorAll("[data-whatsapp-link]");
    if (num) {
      waLinks.forEach(a => {
        const msg = a.dataset.waMessage || site.whatsappMessage;
        a.href = "https://wa.me/" + num + (msg ? "?text=" + encodeURIComponent(msg) : "");
        a.target = "_blank"; a.rel = "noopener noreferrer";
      });
      const disp = $("whatsapp-display");
      if (disp) disp.textContent = prettyLocal(site.whatsapp);
    } else {
      waLinks.forEach(a => { a.hidden = true; });
    }

    // Email: mailto (needs a mail app), Gmail web compose (works anywhere), copy
    if (site.email) {
      const mail = $("email-link");
      mail.href = "mailto:" + site.email + "?subject=" + encodeURIComponent("Video editing project");
      $("email-display").textContent = site.email;
      $("gmail-link").href = "https://mail.google.com/mail/?view=cm&fs=1&to=" + encodeURIComponent(site.email) + "&su=" + encodeURIComponent("Video editing project");
      const copy = $("copy-email"), hint = $("email-hint");
      copy.addEventListener("click", async () => {
        let ok = false;
        try { await navigator.clipboard.writeText(site.email); ok = true; }
        catch (e) {
          const t = document.createElement("textarea");
          t.value = site.email; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
          document.body.appendChild(t); t.select();
          try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
          t.remove();
        }
        hint.textContent = ok ? "Copied to clipboard ✓" : "Copy failed — select the address above";
        hint.hidden = false;
        clearTimeout(copy._t);
        copy._t = setTimeout(() => { hint.hidden = true; }, 3000);
      });
    }

    // Instagram
    const ig = $("instagram-link");
    if (site.instagram) ig.href = site.instagram; else ig.hidden = true;

    // YouTube (placeholder until a URL is set)
    const yt = $("youtube-link");
    if (site.youtube && /^https?:\/\//i.test(site.youtube)) {
      yt.href = site.youtube; yt.target = "_blank"; yt.rel = "noopener noreferrer";
      yt.classList.remove("is-placeholder"); yt.removeAttribute("aria-disabled");
      $("youtube-display").textContent = "Watch on YouTube";
      $("youtube-cta").innerHTML = "Visit channel <b>↗</b>";
    } else {
      yt.addEventListener("click", e => e.preventDefault());
    }
  }

  /* ---------- Projects: grouped by category, max 3 per category ---------- */
  function hasVideo(p) { return typeof p.video === "string" && p.video.trim() !== ""; }

  function categoryList() {
    const base = (config.filters || []).filter(f => f !== "All");
    (config.projects || []).forEach(p => {
      if (!base.includes(p.category)) { console.warn("[MUGHEX] Project category not in `filters`:", p.category); base.push(p.category); }
    });
    return base;
  }

  function renderFilters() {
    filters.innerHTML = "";
    const cats = categoryList();
    filters.hidden = cats.length < 2;            // no filter buttons needed for a single category
    if (cats.length < 2) activeFilter = "All";
    const names = ["All", ...cats];
    names.forEach(name => {
      const button = document.createElement("button");
      button.className = "filter-btn" + (name === activeFilter ? " active" : "");
      button.textContent = name;
      button.type = "button";
      button.setAttribute("aria-pressed", String(name === activeFilter));
      button.addEventListener("click", () => { activeFilter = name; renderFilters(); renderProjects(); });
      filters.appendChild(button);
    });
  }

  function renderProjects() {
    const all = config.projects || [];
    grid.innerHTML = "";
    placeholderNote.hidden = !all.some(p => !hasVideo(p));
    placeholderNote.innerHTML = `<b>Placeholder projects.</b> These cards are templates. Add your hosted MP4 links in <code>js/portfolio.js</code> and they become playable (up to ${MAX} videos per category).`;

    const cats = categoryList().filter(c => activeFilter === "All" || c === activeFilter);
    let shown = 0;
    cats.forEach((cat, gi) => {
      const inCat = all.filter(p => p.category === cat);
      if (inCat.length > MAX) console.warn(`[MUGHEX] "${cat}" has ${inCat.length} projects; only the first ${MAX} are shown.`);
      const list = inCat.slice(0, MAX);
      grid.classList.toggle("single", cats.length === 1);
      if (!list.length) return;
      shown += list.length;

      const group = document.createElement("section");
      group.className = "project-group";
      group.style.animationDelay = (gi * 60) + "ms";
      group.innerHTML = `<div class="category-head"><h3>${safeText(cat)}</h3><span class="count">${list.length} / ${MAX}</span></div><div class="project-grid${list.length <= 2 ? " cols-2" : ""}"></div>`;
      const inner = group.querySelector(".project-grid");
      inner.style.setProperty("--cols", Math.min(MAX, 3));

      list.forEach((p, i) => {
        const live = hasVideo(p);
        const card = document.createElement("article");
        card.className = "project-card";
        card.style.setProperty("--i", i);
        const thumbContent = p.thumbnail
          ? `<img src="${safeText(p.thumbnail)}" alt="${safeText(p.title)} thumbnail" loading="lazy">`
          : `<span class="thumb-placeholder">MUGHEX / ${String(i + 1).padStart(2, "0")}${live ? "" : "<small>PLACEHOLDER</small>"}</span>`;
        const tag = p.format === "vertical" ? `<span class="format-tag">9:16</span>` : "";
        const lang = (p.tag || p.language) ? `<span class="lang-tag">${safeText(p.tag || p.language)}</span>` : "";
        const soon = (!live && p.thumbnail) ? `<span class="soon-tag">Video link not added yet</span>` : "";
        const play = live ? `<span class="play-button" aria-hidden="true">▶</span>` : "";
        card.innerHTML = `<button class="project-thumb" type="button" aria-label="${live ? "Play" : "Placeholder:"} ${safeText(p.title)}">${thumbContent}${lang}${tag}${soon}${play}</button>
          <div class="project-meta"><span>${safeText(p.category)}</span><span>${safeText(p.year)}</span></div>
          <h4>${safeText(p.title)}</h4><p>${safeText(p.description)}</p><a class="card-cta" href="#make-yours">Make yours <span aria-hidden="true">→</span></a>`;
        const btn = card.querySelector("button");
        btn.addEventListener("click", () => openProject(p, btn));
        const img = card.querySelector("img");
        if (img) img.addEventListener("error", () => img.remove());
        addTilt(card.querySelector(".project-thumb"));
        inner.appendChild(card);
      });
      grid.appendChild(group);
    });
    empty.hidden = shown !== 0;
  }

  /* subtle 3D tilt on cards (fine pointers only) */
  function addTilt(el) {
    if (reduceMotion || !window.matchMedia("(pointer:fine)").matches) return;
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateY(${(x * 7).toFixed(2)}deg) rotateX(${(-y * 7).toFixed(2)}deg) translateY(-4px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  }

  /* ---------- Video player dialog (fixed 16:9 frame) ---------- */
  function checkUrl(url) {
    if (/youtu\.?be/i.test(url)) return "This is a YouTube link, not a direct MP4 file. Use a link that ends in .mp4.";
    if (/drive\.google\.com|dropbox\.com\/(s|scl)\//i.test(url) && !/\.mp4(\?|$)/i.test(url))
      return "This looks like a Google Drive / Dropbox share page, not a direct MP4 link. See the README (Hosting your videos).";
    return "";
  }
  function resetVideo() { video.pause(); video.removeAttribute("src"); video.onerror = null; video.removeAttribute("poster"); video.load(); }
  function showMessage(text) { message.textContent = text; message.hidden = false; }

  function openProject(project, trigger) {
    lastTrigger = trigger || null;
    $("dialog-title").textContent = project.title || "Project";
    $("dialog-category").textContent = [project.category || "Video edit", project.year].filter(Boolean).join(" / ");
    $("dialog-description").textContent = project.description || "";
    message.hidden = true;
    resetVideo();

    const url = hasVideo(project) ? project.video.trim() : "";
    dialog.classList.toggle("no-video", !url);

    if (!url) {
      showMessage("No video has been added to this project yet. Paste a direct .mp4 link into the project's video field in js/portfolio.js.");
    } else {
      const warning = checkUrl(url);
      if (warning) showMessage(warning);
      video.onerror = () => showMessage("This video could not be loaded. Check that the link is a public, direct .mp4 URL (open it in a new tab to test) and that the file is H.264/AAC.");
      if (project.thumbnail) video.poster = project.thumbnail;
      video.src = url;
    }

    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    root.style.overflow = "hidden";

    if (url) {
      video.load();
      const attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(() => { /* autoplay blocked: viewer presses play */ });
    }
  }
  function closeDialog() {
    if (typeof dialog.close === "function" && dialog.open) dialog.close();
    else { dialog.removeAttribute("open"); onClosed(); }
  }
  function onClosed() {
    resetVideo();
    root.style.overflow = "";
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }
  closeBtn.addEventListener("click", closeDialog);
  dialog.addEventListener("close", onClosed);
  dialog.addEventListener("click", e => { if (e.target === dialog) closeDialog(); });

  /* ---------- Navigation ---------- */
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = $("nav");
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));

  // close the mobile menu when tapping elsewhere or pressing Escape
  document.addEventListener("click", e => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !menuToggle.contains(e.target)) {
      nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); menuToggle.focus();
    }
  });

  /* ---------- Scroll effects ---------- */
  const header = $("site-header");
  const progress = $("scroll-progress");
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      header.classList.toggle("scrolled", y > 20);
      progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  function setupReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) { items.forEach(el => el.classList.add("in")); return; }
    document.querySelectorAll(".service-list").forEach(list =>
      list.querySelectorAll(".reveal").forEach((el, i) => el.style.setProperty("--d", (i % 2) * 90 + "ms")));
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el, i) => {
      if (el.closest(".hero")) el.style.setProperty("--d", 350 + (i % 5) * 110 + "ms");
      io.observe(el);
    });
  }

  /* ---------- Ticker: duplicate content for a seamless loop ---------- */
  const track = $("ticker-track");
  if (track && track.children.length === 1) {
    const clone = track.firstElementChild.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    track.appendChild(clone);
  }

  /* ---------- Running timecode ---------- */
  const tc = $("timecode");
  if (tc && !reduceMotion) {
    const start = performance.now();
    const pad = n => String(n).padStart(2, "0");
    (function tick() {
      const t = performance.now() - start;
      const f = Math.floor((t % 1000) / 1000 * 24);
      tc.textContent = `${pad(Math.floor(t / 3600000))}:${pad(Math.floor(t / 60000) % 60)}:${pad(Math.floor(t / 1000) % 60)}:${pad(f)}`;
      setTimeout(() => requestAnimationFrame(tick), 80);
    })();
  }

  /* ---------- Cursor spotlight + logo parallax ---------- */
  const spotlight = $("spotlight");
  const logoImg = document.querySelector(".logo-frame img");
  if (!reduceMotion && window.matchMedia("(pointer:fine)").matches) {
    let raf = 0, mx = 0, my = 0;
    window.addEventListener("pointermove", e => {
      mx = e.clientX; my = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        spotlight.style.setProperty("--mx", mx + "px");
        spotlight.style.setProperty("--my", my + "px");
        if (logoImg) {
          logoImg.style.setProperty("--px", ((mx / window.innerWidth - 0.5) * 20).toFixed(1) + "px");
          logoImg.style.setProperty("--py", ((my / window.innerHeight - 0.5) * 16).toFixed(1) + "px");
        }
      });
    }, { passive: true });
  }

  /* ---------- Floating dust particles (canvas), theme-aware ---------- */
  const canvas = $("dust");
  if (canvas && !reduceMotion && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, parts = [], running = true, light = false;
    window.__dustTheme = () => { light = root.getAttribute("data-theme") === "light"; };
    window.__dustTheme();
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const small = w < 700;
      const count = small ? 18 : Math.round(Math.min(70, Math.max(24, (w * h) / 26000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.15, vy: -(Math.random() * 0.25 + 0.05),
        a: Math.random() * 0.5 + 0.1, tw: Math.random() * Math.PI * 2, warm: Math.random() < 0.35
      }));
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5; else if (p.x > w + 5) p.x = -5;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm ? `rgba(${light ? "230,110,10" : "255,170,90"},${alpha})` : (light ? `rgba(60,45,25,${alpha * 0.5})` : `rgba(255,255,255,${alpha * 0.7})`);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) requestAnimationFrame(frame); });
    requestAnimationFrame(frame);
  }

  applySiteConfig();
  renderFilters();
  renderProjects();
  setupReveal();
})();
