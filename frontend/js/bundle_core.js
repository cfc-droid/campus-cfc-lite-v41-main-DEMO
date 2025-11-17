/* ===========================================================
   CFC-SYNC V72 — bundle_core.js (Loader oficial de Campus CFC LITE V41)
   Modo: LOADER (no compila, no mezcla código, solo ordena carga dinámica)
   Arquitectura: 100% estático — JS independientes como islas controladas
   Autor: Cristian F. Choqui
   Fecha build: 2025-11-16
   =========================================================== */

(function () {
  console.log("CFC-SYNC V72 — bundle_core.js iniciado");

  /* ========= UTILIDAD PRINCIPAL PARA CARGAR ARCHIVOS ========= */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src + "?v=20251116"; // evita cache simple
      s.defer = true;
      s.onload = () => resolve(src);
      s.onerror = () => reject(src);
      document.head.appendChild(s);
    });
  }

  /* ========= LISTA DE JS A CARGAR (EXCLUYENDO LOCKS) ========= */

  const scripts = [
    /* ===== CORE ===== */
    "/frontend/js/core/voiceReader.js",

    /* ===== ESTRUCTURA ==== */
    "/frontend/js/header.js",
    "/frontend/js/footer.js",
    "/frontend/js/menu.js",
    "/frontend/js/preload.js",
    "/frontend/js/intro.js",
    "/frontend/js/chapter_nav.js",

    /* ===== PROGRESO Y TRACKERS ===== */
    "/frontend/js/progress_v2.js",
    "/frontend/js/activity_tracker.js",
    "/frontend/js/admin-progress.js",
    "/frontend/js/admin.js",
    "/frontend/js/stats_v1.js",

    /* ===== UX / UI / EXPERIENCIA ===== */
    "/frontend/js/badge.js",
    "/frontend/js/motivation.js",
    "/frontend/js/motivation_v2.js",
    "/frontend/js/profile.js",
    "/frontend/js/theme_chapter_v2.js",
    "/frontend/js/guide.js",

    /* ===== MÓDULOS, EXÁMENES Y BITÁCORA ===== */
    "/frontend/js/exam.js",
    "/frontend/js/exam_v2.js",
    "/frontend/js/exam-logic_v2.js",
    "/frontend/js/backExamButton.js",
    "/frontend/js/daily-review.js",
    "/frontend/js/bitacora.js",
    "/frontend/js/role.js",

    /* ===== SERVICIOS INTERNOS ===== */
    "/frontend/js/faqBot.js",
    "/frontend/js/frases.js",
    "/frontend/js/loader.js",

    /* ===== DEMO / MISC ===== */
    "/frontend/js/demo.js",
    "/frontend/js/backButton.js",
  ];

  /* ========= EJECUCIÓN SECUENCIAL ========= */

  (async () => {
    for (const file of scripts) {
      try {
        await loadScript(file);
        console.log("CFC-LOADER OK:", file);
      } catch (err) {
        console.warn("CFC-LOADER ERROR:", err);
      }
    }
    console.log("CFC-SYNC V72 — bundle_core.js completado");
  })();
})();
