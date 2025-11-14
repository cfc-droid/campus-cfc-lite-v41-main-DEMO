// ✅ CFC_FUNC_15_SUBPASO_1.3 — Preload de imágenes críticas (25-10-2025)
document.addEventListener("DOMContentLoaded", () => {
  const recursos = [
    "img/logo.png",
    "img/hero.jpg",
    "img/fondo-campus.jpg"
  ];
  recursos.forEach(src => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = src;
    document.head.appendChild(link);
  });
});

/* ============================================================
   CFC-SYNC — HEARTBEAT DOMINIO (B)
   ============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/* ============================================================
   CFC-SYNC — ROOT GUARD + IDENTITY (C)(F)
   ============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";

/* ============================================================
   CFC-SYNC — HEARTCORE MONITOR (G)
   ============================================================ */
import "/frontend/js/cfc_lock_core.js?v=70";
