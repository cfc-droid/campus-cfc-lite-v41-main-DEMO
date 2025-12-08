/* ==========================================================
✅ CFC_FUNC_8_1_FIX_V1.3_20251106 — Sin overlay duplicado
Mantiene logs y sincronización, pero sin crear modal visual.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnStats");
  if (btn) {
    console.log("🧩 CFC-STATS → Listener activo pero overlay desactivado (controlado por profile.html)");
  }
});

/* 🔹 Registro pasivo del progreso */
(function passiveStatsSync() {
  try {
    const progressData = JSON.parse(localStorage.getItem("progressData") || "{}");
    const completed = (progressData.completed || []).length;
    const percent = Math.round((completed / 20) * 100);
    const totalSeconds = parseFloat(localStorage.getItem("CFC_time_total") || 0);
    const totalMin = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMin / 60);
    const days = localStorage.getItem("CFC_days") || 1;
    const totalDays = localStorage.getItem("CFC_totalDays") || 1;
    console.log(`CFC-STATS SYNC → ${completed}/20 módulos (${percent}%) | ${totalHours}h ${totalMin % 60}min | Días:${days}/${totalDays}`);
  } catch (err) {
    console.warn("⚠️ CFC-STATS passiveSync error:", err);
  }
})();

/* ==========================================================
🔒 CFC_LOCK: V1.3-STATS_PASSIVE_FIX-20251106
QA-SYNC V41.33 — Overlay duplicado eliminado
========================================================== */



/* ==========================================================
🟣 SUBPASO 1.8 — Registrar PRIMERA SESIÓN
Acción 1.1 — Guardar firstSessionDate si no existe
(AGREGADO SIN ALTERAR NADA DEL ARCHIVO ORIGINAL)
========================================================== */

(function () {
  try {
    // Cargar stats globales
    let stats = JSON.parse(localStorage.getItem("CFC_stats") || "{}");

    // Si no existe firstSessionDate, la creamos
    if (!stats.firstSessionDate) {
      const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
      stats.firstSessionDate = today;

      // Guardar nuevamente
      localStorage.setItem("CFC_stats", JSON.stringify(stats));

      console.log("📌 firstSessionDate registrado:", today);
    } else {
      console.log("📎 firstSessionDate ya existía:", stats.firstSessionDate);
    }

  } catch (err) {
    console.error("⚠️ Error registrando firstSessionDate:", err);
  }
})();
