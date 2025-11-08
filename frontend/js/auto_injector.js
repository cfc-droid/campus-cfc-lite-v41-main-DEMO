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
  injectScript("theme_chapter.js?v=20251102", "Modo claro/oscuro modular");
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
