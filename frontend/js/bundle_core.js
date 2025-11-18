/* ===========================================================
   CFC-SYNC V72 — bundle_core.js (Loader oficial de Campus CFC LITE V41)
   FIX 2025-11-18 — Removido activity_tracker.js + progress_v2.js 
   para evitar duplicación de temporizador, loops y listeners.
   =========================================================== */

(function(){

  console.log("CFC-SYNC V72 — bundle_core.js iniciado (FIX 2025-11-18)");

  /* ========= UTILIDAD PRINCIPAL PARA CARGAR ARCHIVOS ========= */
  function loadScript(src){
    return new Promise((resolve, reject)=>{
      const s = document.createElement("script");
      s.src = src + "?v=20251116";
      s.defer = true;
      s.onload = ()=> resolve(src);
      s.onerror = ()=> reject(src);
      document.head.appendChild(s);
    });
  }

  /* ========= LISTA DE JS A CARGAR (SIN TRACKER NI PROGRESS) ========= */

  const scripts = [

    /* ===== CORE ===== */
    "/frontend/js/core/cfc_api.js",
    "/frontend/js/core/voiceReader.js",

    /* ===== ESTRUCTURA ===== */
    "/frontend/js/header.js",
    "/frontend/js/footer.js",
    "/frontend/js/menu.js",
    "/frontend/js/preload.js",
    "/frontend/js/intro.js",
    "/frontend/js/chapter_nav.js",

    /* ===== PROGRESO / TRACKERS (REMOVIDOS) ===== */
    // "/frontend/js/progress_v2.js",
    // "/frontend/js/activity_tracker.js",
    "/frontend/js/admin-progress.js",
    "/frontend/js/admin.js",
    "/frontend/js/stats_v1.js",

    /* ===== UX / UI ===== */
    "/frontend/js/badge.js",
    "/frontend/js/motivation.js",
    "/frontend/js/motivation_v2.js",
    "/frontend/js/profile.js",
    "/frontend/js/theme_chapter_v2.js",
    "/frontend/js/sync_theme_v8.7.js",
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

    /* ===== DEMO ===== */
    "/frontend/js/demo.js",
    "/frontend/js/backButton.js"
  ];

  /* ========= EJECUCIÓN SECUENCIAL ========= */

  (async ()=>{
    for(const file of scripts){
      try{
        await loadScript(file);
        console.log("CFC-LOADER OK:", file);
      }catch(err){
        console.warn("CFC-LOADER ERROR:", err);
      }
    }
    console.log("CFC-SYNC V72 — bundle_core.js completado (FIX aplicado)");
  })();

})();
