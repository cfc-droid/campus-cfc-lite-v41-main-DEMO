// ==========================================================
// ✅ CFC_PROFILE_SYNC_V12.1_FINAL_FIX_20251108
// ----------------------------------------------------------
// • Sincroniza en vivo las "Horas activas" y "Última sesión"
// • Escucha evento CFC_STATS_UPDATED del activity_tracker
// • Compatible con versiones V40–V42 (Campus LITE)
// ==========================================================

function loadProfileStats() {
  const stats = JSON.parse(localStorage.getItem("studyStats") || "{}");

  // Valores base
  const hoursDisplay =
    stats.hoursDisplay ||
    (() => {
      const totalMin = stats.minutesActive || 0;
      const h = Math.floor(totalMin / 60);
      const m = totalMin % 60;
      return `${h} h ${m} min`;
    })();

  const lastSession =
    stats.lastSession ||
    new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // Inserta en la interfaz si los elementos existen
  const progressBox = document.querySelector(".progress-box, .progress-modal, .progress-stats");
  if (progressBox) {
    const activeNode = progressBox.querySelector(".active-hours");
    const dateNode = progressBox.querySelector(".last-session");
    if (activeNode) activeNode.textContent = hoursDisplay;
    if (dateNode) dateNode.textContent = lastSession;
  }

  console.log(`🔄 Perfil actualizado → ${hoursDisplay} | ${lastSession}`);
}

// 🔁 Refrescar automáticamente al recibir el evento del tracker
window.addEventListener("CFC_STATS_UPDATED", loadProfileStats);

// 🔁 También ejecutar al cargar la página de perfil
document.addEventListener("DOMContentLoaded", loadProfileStats);

/* ==========================================================
🔒 CFC_LOCK: V12.1-FINAL-FIX-profile_sync-20251108
========================================================== */
