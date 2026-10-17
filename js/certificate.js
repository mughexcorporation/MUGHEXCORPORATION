/* Certificate viewer: opens the certificate full size in an in-page dialog. */
(function () {
  "use strict";
  const d = document.getElementById("cert-dialog");
  if (!d) return;
  const open = () => { if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", ""); };
  document.querySelectorAll("[data-cert-open], #cert-open, #cert-open2").forEach(b => b.addEventListener("click", open));
  document.getElementById("cert-close").addEventListener("click", () => d.close());
  d.addEventListener("click", e => { if (e.target === d) d.close(); });   // click outside the image closes it
})();
