// ======================================
// MENU.JS – NAVEGACIÓN ENTRE MÓDULOS CFC
// ======================================

document.addEventListener("DOMContentLoaded", () => {
  const enlaces = document.querySelectorAll("[data-module]");
  const main = document.querySelector("main") || document.body;

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", (e) => {
      e.preventDefault();
      const modulo = enlace.getAttribute("data-module");

      // Animación de salida antes de cambiar módulo
      main.style.transition = "opacity 0.3s ease";
      main.style.opacity = "0.3";
      main.innerHTML = `<p style="color:var(--gold);text-align:center;">Cargando módulo ${modulo}...</p>`;

      setTimeout(() => {
        window.location.href = `/frontend/modules/${modulo}/index.html`;
      }, 600);
    });
  });

  console.log("✅ Navegación entre módulos activa");
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
