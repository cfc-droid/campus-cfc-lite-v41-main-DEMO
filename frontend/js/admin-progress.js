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
