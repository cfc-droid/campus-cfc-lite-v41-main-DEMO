// ==========================================================
// ✅ CFC_PROFILE_SYNC_V12.3_REALTIME_FORCE_REFRESH_20251108
// ----------------------------------------------------------
// • Actualiza “Tu progreso” cada 5 s leyendo studyStats
// • Compatible con estructuras dinámicas (íconos, emojis, etc.)
// • No requiere clases ni textos específicos
// • Sin dependencia del evento ni del orden del DOM
// ==========================================================

(function () {
  const SYNC_INTERVAL = 5000;

  function getStats() {
    const stats = JSON.parse(localStorage.getItem("studyStats") || "{}");

    // ======== 🕒 HORAS ACTIVAS (TOTAL) ========
    const totalMin = stats.minutesActive || 0;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const hoursDisplay = stats.hoursDisplay || `${h} h ${m} min`;

    // ======== ⏱️ TIEMPO ACTIVO HOY (REAL) ========
    const todaySeconds = parseFloat(localStorage.getItem("CFC_time_today") || 0);
    const todayMin = Math.floor(todaySeconds / 60);
    const todaySec = Math.floor(todaySeconds % 60);
    const todayDisplay = `${todayMin} min ${todaySec.toString().padStart(2, "0")} s`;

    // ======== 📅 ÚLTIMA SESIÓN ========
    const lastSession =
      stats.lastSession ||
      new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

    return { hoursDisplay, todayDisplay, lastSession };
  }

  function updateUI() {
    const { hoursDisplay, todayDisplay, lastSession } = getStats();

    // Buscar por texto aproximado dentro de <li>, <p>, <div> o <span>
    document.querySelectorAll("li, p, div, span").forEach((el) => {
      const text = el.textContent.trim();

      // 🕒 Horas activas
      if (text.match(/Horas\s+activas/i) || text.includes("🕒")) {
        const strong = el.querySelector("strong");
        if (strong) strong.textContent = hoursDisplay;
        else el.innerHTML = `🕒 Horas activas: <strong>${hoursDisplay}</strong>`;
      }

      // ⏱️ Tiempo activo hoy
      if (text.match(/Tiempo\s+activo\s+hoy/i) || text.includes("⏱️")) {
        const strong = el.querySelector("strong");
        if (strong) strong.textContent = todayDisplay;
        else el.innerHTML = `⏱️ Tiempo activo hoy: <strong>${todayDisplay}</strong>`;
      }

      // 📅 Última sesión
      if (text.match(/Última\s+sesión/i) || text.includes("📅")) {
        const strong = el.querySelector("strong");
        if (strong) strong.textContent = lastSession;
        else el.innerHTML = `📅 Última sesión: <strong>${lastSession}</strong>`;
      }
    });

    console.log(`🔄 Perfil actualizado → Total: ${hoursDisplay} | Hoy: ${todayDisplay}`);
  }

  // Primer refresco después del render
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(updateUI, 1000);
  });

  // Refresco automático cada 5 s
  setInterval(updateUI, SYNC_INTERVAL);

  // También se ejecuta si se recibe evento del tracker
  window.addEventListener("CFC_STATS_UPDATED", updateUI);

  console.log("✅ CFC_PROFILE_SYNC_V12.3 activo (refresco automático 5 s)");
})();

/* ==========================================================
🔒 CFC_LOCK: V12.3-REALTIME-FORCE-REFRESH-profile_sync-20251108
========================================================== */
