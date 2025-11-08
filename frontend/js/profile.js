// ==========================================================
// ✅ CFC_PROFILE_SYNC_V12.2_FINAL_DOMTEXT_FIX_20251108
// ----------------------------------------------------------
// • Sincroniza en vivo las "Horas activas" y "Última sesión"
// • Detecta etiquetas <li> por su texto (no requiere clases)
// • Escucha evento CFC_STATS_UPDATED del activity_tracker
// • Compatible con todas las estructuras del perfil CFC LITE
// ==========================================================

function loadProfileStats() {
  const stats = JSON.parse(localStorage.getItem("studyStats") || "{}");

  // 🧠 Generar texto actualizado
  const totalMin = stats.minutesActive || 0;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const hoursDisplay = stats.hoursDisplay || `${h} h ${m} min`;
  const lastSession =
    stats.lastSession ||
    new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // 🎯 Buscar dinámicamente los elementos del modal "Tu progreso"
  const items = document.querySelectorAll("li, p, div, span");
  items.forEach((el) => {
    const text = el.textContent.trim();

    // Horas activas
    if (text.startsWith("Horas activas") || text.includes("Horas activas")) {
      const strong = el.querySelector("strong");
      if (strong) strong.textContent = hoursDisplay;
      else el.innerHTML = `Horas activas: <strong>${hoursDisplay}</strong>`;
    }

    // Última sesión
    if (text.startsWith("Última sesión") || text.includes("Última sesión")) {
      const strong = el.querySelector("strong");
      if (strong) strong.textContent = lastSession;
      else el.innerHTML = `Última sesión: <strong>${lastSession}</strong>`;
    }
  });

  console.log(`🔄 Perfil actualizado → ${hoursDisplay} | ${lastSession}`);
}

// 🔁 Escucha evento de sincronización global
window.addEventListener("CFC_STATS_UPDATED", loadProfileStats);

// 🔁 Ejecuta al cargar el perfil
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(loadProfileStats, 500); // pequeño delay para asegurar render completo
});

/* ==========================================================
🔒 CFC_LOCK: V12.2-FINAL-DOMTEXT-FIX-profile_sync-20251108
========================================================== */
