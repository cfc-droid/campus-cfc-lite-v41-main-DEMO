/* ==========================================================
   Archivo: /frontend/js/frases.js
   Sistema de Frases Motivacionales — Campus CFC Trading LITE V37 FINAL
   © 2025 Cristian F. Choqui — Todos los derechos reservados
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

  // 📘 Colección oficial de frases CFC — versión LITE V37 FINAL
  const frasesCFC = [
    "El trader consciente no persigue ganancias, cultiva claridad.",
    "Cada operación es un espejo de tu mente, no del mercado.",
    "Respirá, observá, esperá: el silencio es una ventaja operativa.",
    "Tu bitácora no juzga: te enseña quién sos en los mercados.",
    "Una mente calmada ejecuta con precisión. Una mente tensa improvisa.",
    "El mercado premia la coherencia más que la euforia.",
    "Antes de buscar resultados, buscá comprensión.",
    "La disciplina es el lenguaje de la libertad financiera.",
    "El control emocional no se impone, se entrena con humildad.",
    "Cada error documentado es un ladrillo en tu maestría.",
    "El verdadero riesgo está en operar sin conciencia de tus sesgos.",
    "El tiempo recompensa a quien se detiene a reflexionar.",
    "Sin bitácora no hay evolución, sólo repetición.",
    "Los grandes traders dominan su mente antes que su estrategia.",
    "El mercado no castiga, sólo devuelve lecciones sin adornos.",
    "Tu respiración es el primer indicador de tu estado mental.",
    "Si tu mente está tranquila, tu análisis será claro.",
    "La constancia vence donde la impulsividad fracasa.",
    "Cada cierre de sesión es una oportunidad para agradecer y mejorar.",
    "El dominio personal precede al dominio financiero."
  ];

  // 📅 Obtener índice según el día del año (rotación diaria automática)
  const fecha = new Date();
  const diaDelAño = Math.floor(
    (fecha - new Date(fecha.getFullYear(), 0, 0)) / 86400000
  );
  const indice = diaDelAño % frasesCFC.length;

  // 💬 Insertar frase motivacional en el elemento HTML designado
  const contenedorFrase = document.getElementById("frase-cfc");
  if (contenedorFrase) {
    contenedorFrase.textContent = `"${frasesCFC[indice]}"`;
  }

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
