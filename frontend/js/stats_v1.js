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
(Formato requerido: dd/mm/yyyy)
========================================================== */

(function () {
  try {
    // Cargar stats globales
    let stats = JSON.parse(localStorage.getItem("CFC_stats") || "{}");

    // Convertir hoy a formato dd/mm/yyyy
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const todayFormatted = `${dd}/${mm}/${yyyy}`;

    // Si no existe firstSessionDate, la creamos
    if (!stats.firstSessionDate) {
      stats.firstSessionDate = todayFormatted;

      // Guardar nuevamente
      localStorage.setItem("CFC_stats", JSON.stringify(stats));

      console.log("📌 firstSessionDate registrado:", todayFormatted);
    } else {
      console.log("📎 firstSessionDate ya existía:", stats.firstSessionDate);
    }

  } catch (err) {
    console.error("⚠️ Error registrando firstSessionDate:", err);
  }
})();

/* ==========================================================
🟣 SUBPASO 2.8 — Registrar ÚLTIMA SESIÓN
Acción 1.1 — Guardar lastSessionDate SIEMPRE al cargar el Campus
(AGREGADO SIN ALTERAR NADA DEL ARCHIVO ORIGINAL)
========================================================== */

(function () {
  try {
    // Cargar stats globales
    let stats = JSON.parse(localStorage.getItem("CFC_stats") || "{}");

    // Convertir fecha actual a dd/mm/aaaa
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const todayFormatted = `${day}/${month}/${year}`;

    // Registrar SIEMPRE la última sesión
    stats.lastSessionDate = todayFormatted;

    // Guardar cambios
    localStorage.setItem("CFC_stats", JSON.stringify(stats));

    console.log("📌 lastSessionDate actualizada:", todayFormatted);

  } catch (err) {
    console.error("⚠️ Error registrando lastSessionDate:", err);
  }
})();
