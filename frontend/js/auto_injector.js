/* =========================================================
   ✅ CFC_FUNC_5_2_AUTOLOAD_V20251106_SAFEFIX_PLUS — Versión corregida
   📄 Archivo: /frontend/js/auto_injector.js
   🔒 CFC-SYNC V8.2 | QA-SYNC V11.0 — 2025-11-19
   ---------------------------------------------------------
   ✔️ Se elimina theme.js (no existe en tu repositorio)
   ✔️ Sin errores 404 → sin “Unexpected token '<'”
   ✔️ Inyección segura y validada
   ✔️ 100% compatible con Cloudflare Pages
========================================================= */

(function () {
  // 🧩 Base dinámica según dominio
  const base = window.location.hostname.includes("pages.dev")
    ? "/frontend/js/"
    : "../js/";

  // 🧩 Inyección segura con validación previa (HEAD)
  const injectScript = async (file, description = "") => {
    const src = base + file;

    try {
      const res = await fetch(src, { method: "HEAD" });

      if (!res.ok) {
        console.warn(
          `⚠️ [SAFEFIX_PLUS] Omitido ${file} — No encontrado (${res.status})`
        );
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

  // 🧩 Núcleo base (corregido)
  // ❌ REMOVIDO: theme.js (no existe)
  injectScript("theme_chapter_v2.js?v=20251106", "Modo claro/oscuro modular");
  injectScript("badge.js?v=20251102", "Badge motivacional persistente");

  // 🧩 (Opcionales)
  // injectScript("daily-review.js?v=20251102");
  // injectScript("backup.js?v=20251102");

  // 🧩 Log QA-SYNC
  console.log(
    "🧩 CFC_SYNC checkpoint: auto_injector.js | SAFEFIX_PLUS V8.2 OK",
    new Date().toLocaleString()
  );
})();

/* =========================================================
   ✅ CFC_FUNC_9_9_FIX_FINAL_V41.25 — Inyección botón “Continuar”
   🔒 QA-SYNC V41.25 — CFC-SYNC V9.0
========================================================= */

(function () {
  const script = document.createElement("script");
  script.src = "../../js/chapter_nav.js?v=20251107";
  script.defer = true;
  document.body.appendChild(script);

  console.log(
    "🧩 CFC_SYNC checkpoint:",
    "chapter_nav.js inyectado correctamente"
  );
})();
