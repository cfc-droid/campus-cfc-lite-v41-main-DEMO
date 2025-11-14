/* ==========================================================
   Archivo: /frontend/js/admin-progress.js
   Acción 1 — Mostrar progreso del alumno (PUNTO 7/15)
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const barra = document.getElementById("barra-progreso");
  const texto = document.getElementById("porcentaje-progreso");
  if (!barra || !texto) return;

  let modulosCompletados = 0;
  const totalModulos = 20;

  for (let i = 1; i <= totalModulos; i++) {
    if (localStorage.getItem(`modulo${i}_completado`) === "true") {
      modulosCompletados++;
    }
  }

  const progreso = (modulosCompletados / totalModulos) * 100;

  barra.style.width = `${progreso}%`;
  texto.textContent = `Progreso general: ${progreso.toFixed(1)}%`;

  if (progreso < 33) barra.style.background = "#e74c3c";
  else if (progreso < 66) barra.style.background = "#f1c40f";
  else barra.style.background = "#2ecc71";
});

/* ============================================================
   (B) HEARTBEAT DE DOMINIO
============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/* ============================================================
   (C)(F) COMPATIBILIDAD + ROOT GUARD
============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";

/* ============================================================
   (G) HEARTCORE MONITOR
============================================================ */
setInterval(() => {
  const sessionId = localStorage.getItem("CFC_SESSION_ID");
  if (!sessionId) {
    const ov = document.createElement("div");
    ov.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.85);color:#ffd700;font-family:Poppins,sans-serif;display:flex;align-items:center;justify-content:center;z-index:999999;";
    ov.innerHTML = "<div>⚠️ Sesión inválida</div>";
    document.body.appendChild(ov);
    setTimeout(() => (window.location.href = '/html/login.html'), 1500);
  }
}, 5000);
