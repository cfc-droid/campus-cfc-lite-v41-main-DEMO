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

/* =========================================================
   🔒 CFC-SYNC — ROOT GUARD + IDENTITY (C)(F)
   ========================================================= */
import "/frontend/js/core/cfc_lock_identity.js";

/* =========================================================
   🔒 CFC-SYNC — HEARTCORE MONITOR (G)
   ========================================================= */
import "/frontend/js/cfc_lock_core.js?v=70";
