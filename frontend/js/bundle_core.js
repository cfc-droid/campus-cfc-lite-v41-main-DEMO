/* ===========================================================
   CFC-SYNC V72.1 — bundle_core.js (Loader reparado)
   -----------------------------------------------------------
   🔥 ESTA VERSIÓN ELIMINA SCRIPTS PROHIBIDOS:
   - progress_v2.js
   - exam.js
   - exam_v2.js
   - exam-logic_v2.js
   - activity_tracker.js
   - backExamButton.js
   (ya se cargan por HTML o por auto_injector.js)
   -----------------------------------------------------------
*/

(function(){

  console.log("CFC-SYNC V72.1 — bundle_core.js REPARADO iniciado");

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

  // ==========================================================
  // 🚫 LISTA DEPURADA — SIN scripts que rompen examen/progreso
  // ==========================================================

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

    /* ===== PROGRESO / ADMIN ===== */
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

    /* ===== OTRAS FUNCIONALIDADES ===== */
    "/frontend/js/daily-review.js",
    "/frontend/js/bitacora.js",
    "/frontend/js/role.js",

    /* ===== SERVICIOS ===== */
    "/frontend/js/faqBot.js",
    "/frontend/js/frases.js",
    "/frontend/js/loader.js",

    /* ===== DEMO / MISC ===== */
    "/frontend/js/demo.js",
    "/frontend/js/backButton.js"
  ];

  // ==========================================================
  // EJECUCIÓN
  // ==========================================================
  (async ()=>{
    for(const file of scripts){
      try{
        await loadScript(file);
        console.log("CFC-LOADER OK:", file);
      }catch(err){
        console.warn("CFC-LOADER ERROR:", err);
      }
    }
    console.log("CFC-SYNC V72.1 — bundle_core.js REPARADO completado");
  })();

})();
