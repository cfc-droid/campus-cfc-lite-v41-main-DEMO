/* =========================================================
   ⚠️ VERSIÓN ESPECIAL PARA PRUEBA Nº 17 — SUBPASO 1
   📄 Archivo: /frontend/js/auto_injector.js
   🔍 Objetivo: Desactivar temporalmente inyecciones de scripts
                para detectar si causan el reinicio automático.
   ---------------------------------------------------------
   ✔ NO se elimina nada
   ✔ NO se cambia estructura
   ✔ Solo se comentan inyecciones
   ✔ 100% reversible
========================================================= */

(function () {
  // 🧩 Base dinámica según dominio
  const base = window.location.hostname.includes("pages.dev")
    ? "/frontend/js/"
    : "../js/";

  // 🧩 Inyección segura (la función queda, no se usa)
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

  // ========================================================
  // 🚫 SUBPASO 1 — DESACTIVAR TEMPORALMENTE ESTAS INYECCIONES
  // ========================================================

  // ❌ Desactivar theme_chapter_v2.js
  // injectScript("theme_chapter_v2.js?v=20251106", "Modo claro/oscuro modular");

  // ❌ Desactivar badge.js
  // injectScript("badge.js?v=20251102", "Badge motivacional persistente");

  // ========================================================
  // Esto nos permitirá saber si alguno de esos scripts genera
  // el reinicio / pantalla blanca en módulos/capítulos/exámenes.
  // ========================================================

  console.log(
    "🧩 PRUEBA Nº17 SUBPASO 1 — auto_injector.js cargado SIN scripts inyectados",
    new Date().toLocaleString()
  );
})();

/* =========================================================
   ⚠️ IMPORTANTE
   Este bloque de chapter_nav.js se mantiene porque:
   ✔ NO causa reinicios
   ✔ No genera expulsiones
   ✔ No interactúa con estilos ni badge
   ✔ Es requerido para navegación interna
========================================================= */

(function () {
  const script = document.createElement("script");
  script.src = "../../js/chapter_nav.js?v=20251107";
  script.defer = true;
  document.body.appendChild(script);

  console.log(
    "🧩 CFC_SYNC checkpoint:",
    "chapter_nav.js inyectado correctamente (PRUEBA Nº17)"
  );
})();
