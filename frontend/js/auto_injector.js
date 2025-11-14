/* =========================================================
✅ CFC_FUNC_5_2_AUTOLOAD_V20251106_SAFEFIX_PLUS — Inyección global silenciosa optimizada
📄 Archivo: /frontend/js/auto_injector.js
🔒 CFC-SYNC V8.1 | QA-SYNC V10.9 — Cristian F. Choqui — 2025-11-06
---------------------------------------------------------
✔️ Elimina mensajes “Error de script ignorado (archivo HTML en lugar de JS)”
✔️ Valida existencia real del archivo antes de inyectar
✔️ 100% compatible con Cloudflare Pages (LITE V41+)
========================================================= */

(function () {
  // 🧩 Base dinámica
  const base = window.location.hostname.includes("pages.dev")
    ? "/frontend/js/"
    : "../js/";

  // 🧩 Inyección segura con validación previa
  const injectScript = async (file, description = "") => {
    const src = base + file;
    try {
      const res = await fetch(src, { method: "HEAD" });
      if (!res.ok) {
        console.warn(`⚠️ [SAFEFIX_PLUS] Omitido ${file} — No encontrado (${res.status})`);
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.defer = true;
      document.head.appendChild(s);
    } catch (err) {
      console.warn(`⚠️ [SAFEFIX_PLUS] Falla al cargar ${file}:`, err);
    }
  };

  // 🧩 Núcleo base
  injectScript("theme.js?v=20251102", "Tema global base");
  injectScript("theme_chapter_v2.js?v=20251106", "Modo claro/oscuro modular");
  injectScript("badge.js?v=20251102", "Badge motivacional persistente");
  // Opcionales
  // injectScript("daily-review.js?v=20251102");
  // injectScript("backup.js?v=20251102");

  // 🧩 Log control QA-SYNC
  console.log(
    "🧩 CFC_SYNC checkpoint: auto_injector.js | SAFEFIX_PLUS activo — QA-SYNC V10.9",
    new Date().toLocaleString()
  );
})();

/* =========================================================
✅ CFC_FUNC_9_9_FIX_FINAL_V41.25 — Inyección directa del botón “Continuar”
📄 Archivo: /frontend/js/auto_injector.js
🔒 QA-SYNC V41.25 — CFC-SYNC V9.0
========================================================= */

(function () {
  const script = document.createElement("script");
  script.src = "../../js/chapter_nav.js?v=20251107";
  script.defer = true;
  document.body.appendChild(script);

  console.log("🧩 CFC_SYNC checkpoint:", "chapter_nav.js inyectado correctamente");
})();

/* ============================================================
   CFC-SYNC — HEARTBEAT DOMINIO (B)
============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/* ============================================================
   CFC-SYNC — ROOT GUARD + COMPAT (C)(F)
============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";

/* ============================================================
   CFC-SYNC — HEARTCORE MONITOR (G)
============================================================ */
setInterval(() => {
  const sessionId = localStorage.getItem("CFC_SESSION_ID");
  if (!sessionId) {
    const ov = document.createElement("div");
    ov.style.cssText =
      "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.85);color:#ffd700;font-family:Poppins,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:22px;";
    ov.innerHTML = `<div>⚠️ Sesión inválida</div><div style="font-size:16px;margin-top:10px;">Redirigiendo…</div>`;
    document.body.appendChild(ov);
    setTimeout(() => (window.location.href = "/html/login.html"), 1500);
  }
}, 5000);
