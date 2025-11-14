async function verifyDeploy() {
  try {
    const response = await fetch(window.location.href);
    if (response.ok) {
      console.log("🚀 Deploy verificado en Cloudflare — todo operativo ✅");
    } else {
      console.error("⚠️ Error en el deploy — revisar build o rutas");
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
}
verifyDeploy();

/* ==========================================================
   CFC-SYNC — COMPATIBILIDAD cfc_lock_identity.js (C)
   ========================================================== */
import("/frontend/js/core/cfc_lock_identity.js").catch(() => {});

/* ==========================================================
   CFC-SYNC — JS BUNDLE (E)
   ========================================================== */
import("/frontend/js/bundle_core.min.js").catch(() => {});

/* ==========================================================
   CFC-SYNC — ROOT GUARD (F)
   ========================================================== */
(function () {
  if (!window.CFC_IDENTITY_OK) {
    console.warn("⚠️ ROOT GUARD: Identidad no validada.");
  }
})();

/* ==========================================================
   CFC-SYNC — HEARTCORE MONITOR (G)
   ========================================================== */
setInterval(() => {
  if (typeof window.renderPing === "function") {
    window.renderPing();
  }
}, 5000);

(function () {
  if (!localStorage.getItem("sessionId")) {
    console.warn("⚠️ HEARTCORE: sessionId faltante.");
  }
})();
