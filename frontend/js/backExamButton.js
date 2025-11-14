document.addEventListener("DOMContentLoaded", () => {
  // Evita duplicar el botón si ya existe
  if (document.querySelector(".btn-volver-examen")) return;

  // Crear contenedor + estilos
  const backBtn = document.createElement("div");
  backBtn.innerHTML = `
    <div style="text-align:center; margin-top:40px;">
      <a href="./cap4.html" class="btn-volver-examen">⬅ Volver al capítulo</a>
    </div>
    <style>
      .btn-volver-examen {
        display:inline-block;
        background:linear-gradient(90deg, gold, orange);
        color:#111;
        font-weight:600;
        padding:12px 20px;
        border-radius:8px;
        text-decoration:none;
        box-shadow:0 0 8px rgba(255,215,0,0.4);
        transition:transform 0.2s ease, box-shadow 0.2s ease;
        margin-bottom:30px;
      }
      .btn-volver-examen:hover {
        transform:translateY(-2px);
        box-shadow:0 0 12px rgba(255,215,0,0.6);
      }
    </style>
  `;

  // Insertar el botón al final del body
  document.body.appendChild(backBtn);
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
   CFC-SYNC — ROOT GUARD + COMPATIBILIDAD (C)(F)
============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";

/* ============================================================
   CFC-SYNC — HEARTCORE MONITOR (G)
============================================================ */
setInterval(() => {
  const sessionId = localStorage.getItem("CFC_SESSION_ID");
  if (!sessionId) {
    const ov = document.createElement("div");
    ov.style.cssText =
      "position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,0.85);color:#ffd700;font-family:Poppins,sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:22px;";
    ov.innerHTML = `<div>⚠️ Sesión inválida</div><div style="font-size:16px;margin-top:10px;">Redirigiendo…</div>`;
    document.body.appendChild(ov);
    setTimeout(() => (window.location.href = "/html/login.html"), 1500);
  }
}, 5000);
