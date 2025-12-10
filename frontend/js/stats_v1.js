/* ==========================================================
   CFC_STATS V1.4 — SAFE MODE (NO sobrescribe campos críticos)
   Autor: CFC-DROID · 2025-12-10
   ----------------------------------------------------------
   ✔ Mantiene firstSessionDate
   ✔ Actualiza lastSessionDate sin borrar otros campos
   ✔ NO toca currentModule
   ✔ NO toca lastCompletedModule
   ✔ NO toca modulesCompleted
   ✔ NO toca CFC_stats existentes
   ✔ 100% compatible con subpasos 4.10 / 5.10 / 5.11
   ✔ NO rompe SYNC CENTRAL
========================================================== */

/* ==========================================================
   1) Inicialización segura
========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnStats");
  if (btn) {
    console.log("🧩 CFC-STATS SAFE MODE → Listener activo (Profile controlado por profile.html)");
  }
});

/* ==========================================================
   2) Cargar CFC_stats sin sobrescribir nada
========================================================== */
function loadStatsSafe() {
  let stats = {};
  try {
    stats = JSON.parse(localStorage.getItem("CFC_stats") || "{}");
  } catch {
    stats = {};
  }
  return stats;
}

function saveStatsSafe(obj) {
  localStorage.setItem("CFC_stats", JSON.stringify(obj));
}

/* ==========================================================
   3) Registrar PRIMERA SESIÓN · NO pisa si ya existe
========================================================== */
(function () {
  try {
    const stats = loadStatsSafe();

    if (!stats.firstSessionDate) {
      const d = new Date();
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      stats.firstSessionDate = `${dd}/${mm}/${yyyy}`;

      saveStatsSafe(stats);
      console.log("📌 SAFE → firstSessionDate registrado");
    } else {
      console.log("📎 SAFE → firstSessionDate preservado:", stats.firstSessionDate);
    }

  } catch (err) {
    console.error("⚠️ SAFE Error firstSessionDate:", err);
  }
})();

/* ==========================================================
   4) Registrar ÚLTIMA SESIÓN · Solo actualiza ese campo
========================================================== */
(function () {
  try {
    const stats = loadStatsSafe();

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();

    stats.lastSessionDate = `${dd}/${mm}/${yyyy}`;

    saveStatsSafe(stats);
    console.log("📌 SAFE → lastSessionDate actualizado");

  } catch (err) {
    console.error("⚠️ SAFE Error lastSessionDate:", err);
  }
})();

/* ==========================================================
   5) Registrar día estudiado · NO toca nada más
========================================================== */
(function () {
  try {
    const stats = loadStatsSafe();

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const today = `${dd}/${mm}/${yyyy}`;

    if (!stats.lastStudyDay) {
      stats.lastStudyDay = today;
      saveStatsSafe(stats);
      console.log("📌 SAFE → lastStudyDay inicializado");
      return;
    }

    if (stats.lastStudyDay !== today && stats.activeTodayMinutes > 0) {
      stats.daysStudiedTotal = (stats.daysStudiedTotal || 0) + 1;
      stats.lastStudyDay = today;
      saveStatsSafe(stats);
      console.log("🟢 SAFE → Día de estudio +1:", stats.daysStudiedTotal);
    } else {
      console.log("ℹ️ SAFE → Día no sumado");
    }

  } catch (err) {
    console.error("⚠️ SAFE Error days:", err);
  }
})();
