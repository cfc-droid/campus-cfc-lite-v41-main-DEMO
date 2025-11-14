/* =====================================================
   🔒 CFC-SYNC V7.6 — Subpaso 3-4 + Integración CFC-ACTIVITY
   ✅ CFC_FUNC_1_3_20251105_FINAL — Footer global + Tracker activo
   Autor: ChatGPT + CFC
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const placeholder = document.getElementById("footer-placeholder");
  if (!placeholder) return;

  // Base absoluta para evitar reinicios con el loader
  const basePath = window.location.origin.includes("pages.dev")
    ? "/frontend/pages/"
    : "./pages/";

  placeholder.innerHTML = `
    <footer class="footer-cfc">
      <div class="footer-links">
        <a href="${basePath}faq.html" class="footer-link">❓ FAQ</a>
        <a href="${basePath}profile.html" class="footer-link">👤 Perfil</a>
      </div>
      <p class="footer-copy">© ${new Date().getFullYear()} Campus CFC LITE — Cristian F. Choqui</p>
    </footer>
  `;

  // ✅ CFC_FUNC_8_2_LINK_20251105 — Vincular tracker de actividad
  const trackerScript = document.createElement("script");
  trackerScript.src = "../js/activity_tracker.js?v=20251105";
  document.body.appendChild(trackerScript);

  console.log(
    "🧩 CFC_SYNC checkpoint:",
    "footer.js | FIX_FINAL + tracker activo",
    new Date().toLocaleString()
  );
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
