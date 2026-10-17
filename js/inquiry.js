/* Inquiry form: sends the message by email through the endpoint in js/portfolio.js (site.formEndpoint).
   A success message is shown ONLY when the service confirms success. */
(function () {
  "use strict";
  const form = document.getElementById("inquiry-form");
  if (!form) return;
  const site = (window.MUGHEX_PORTFOLIO && window.MUGHEX_PORTFOLIO.site) || {};
  const btn = document.getElementById("inq-send"), msg = document.getElementById("inq-msg");
  const say = (t, ok) => { msg.textContent = t; msg.className = "inq-msg " + (ok ? "ok" : "err"); };
  if (!site.formEndpoint) { btn.disabled = true; say("The inquiry form is not connected yet. Please use WhatsApp or email.", false); return; }
  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (btn.disabled) return;
    const d = new FormData(form);
    if (d.get("_honey")) return;
    const name = String(d.get("name")).trim(), email = String(d.get("email")).trim(), text = String(d.get("message")).trim();
    if (!name) return say("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return say("Please enter a valid email address.");
    if (!d.get("service")) return say("Please choose what you need.");
    if (text.length < 20) return say("Please describe your project in at least 20 characters.");
    let last = 0; try { last = +localStorage.getItem("mughex-inq") || 0; } catch (x) {}
    if (Date.now() - last < 30000) return say("Please wait a few seconds before sending another inquiry.");
    d.set("submitted_at", new Date().toString());
    d.set("_subject", "New project inquiry from " + name);
    d.set("_template", "table"); d.set("_captcha", "false");
    btn.disabled = true; btn.textContent = "Sending…"; say("");
    try {
      const r = await fetch(site.formEndpoint, { method: "POST", body: d, headers: { Accept: "application/json" } });
      let j = {}; try { j = await r.json(); } catch (x) {}
      const ok = r.ok && (j.success === true || j.success === "true" || j.ok === true);
      if (ok) { form.reset(); try { localStorage.setItem("mughex-inq", String(Date.now())); } catch (x) {} say("Thank you! Your inquiry was sent. I'll reply by email soon.", true); }
      else say("Sorry, your inquiry could not be sent. Please try again, or use WhatsApp or email.", false);
    } catch (x) { say("Network error: your inquiry was not sent. Please try again, or use WhatsApp or email.", false); }
    btn.textContent = "Send Project Inquiry"; setTimeout(() => { btn.disabled = false; }, 4000);
  });
})();
