/* ==========================================================
✅ CFC_ACTIVITY_V12.2_FIX_PAUSE_REAL_20251110
----------------------------------------------------------
• Pausa automática al cambiar pestaña o cerrar navegador
• Reanuda desde el tiempo exacto al volver
• Compatible con LOCK_TOTAL_PERSIST_REAL + stats_v1.js
========================================================== */

(function () {
  const TAB_ID = `CFC_TAB_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const TIME_TOTAL_KEY = "CFC_time_total";
  const LAST_SYNC_KEY = "CFC_last_sync";
  const RESET_FLAG = "CFC_reset_done";

  let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || 0);
  let startTime = Date.now();
  let lastSync = Date.now();
  let paused = false;
  let rafId = null;

  const bell = new Audio("../../assets/audio/bell-gold.wav");
  bell.volume = 0.25;

  // ======== 🧠 Reinicio manual seguro ========
  window.CFC_resetTimer = function () {
    localStorage.removeItem(TIME_TOTAL_KEY);
    localStorage.removeItem(LAST_SYNC_KEY);
    localStorage.removeItem("studyStats");
    localStorage.removeItem(RESET_FLAG);
    totalSeconds = 0;
    indicator.textContent = "🕒 0m 00s ✅";
    console.log("🔄 CFC_resetTimer → Temporizador reiniciado a 0 ✅");
  };

  // ======== 🔹 Estado inicial ========
  let study = {};
  try {
    study = JSON.parse(localStorage.getItem("studyStats") || "{}");
  } catch {
    study = {};
  }

  const hasValidStudy =
    typeof study === "object" &&
    Object.keys(study).length > 0 &&
    !isNaN(totalSeconds) &&
    totalSeconds > 0;

  if (!hasValidStudy) {
    console.log("🧠 Modo nuevo: inicializando sin estudio previo.");
    localStorage.setItem("studyStats", JSON.stringify({ minutesActive: 0 }));
    localStorage.setItem(RESET_FLAG, "true");
    totalSeconds = 0;
  } else {
    console.log("✅ Reanudando sesión previa — tiempo acumulado preservado.");
  }

  // ======== 🔔 Indicador visual ========
  const indicator = document.createElement("div");
  Object.assign(indicator.style, {
    position: "fixed",
    bottom: "10px",
    right: "20px",
    background: "rgba(255,215,0,0.08)",
    color: "#FFD700",
    padding: "6px 14px",
    border: "1px solid #FFD700",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontFamily: "Poppins,sans-serif",
    zIndex: "9999",
    transition: "box-shadow 0.3s ease",
  });
  document.body.appendChild(indicator);

  const updateIndicator = (ping = false) => {
    const elapsed = paused ? 0 : (Date.now() - startTime) / 1000;
    const m = Math.floor((totalSeconds + elapsed) / 60);
    const s = Math.floor((totalSeconds + elapsed) % 60);
    indicator.textContent = `🕒 ${m}m ${s.toString().padStart(2, "0")}s ✅`;
    if (ping) {
      indicator.style.boxShadow = "0 0 12px 2px #FFD700";
      setTimeout(() => (indicator.style.boxShadow = "none"), 400);
    }
  };

  // ======== 🔁 Loop maestro persistente ========
  const SYNC_PERIOD = 10000;
  const SYNC_TOLERANCE = 250;

  const forcedLoop = () => {
    if (paused) return;
    const now = Date.now();
    const diff = now - lastSync;

    if (diff >= SYNC_PERIOD - SYNC_TOLERANCE) {
      const elapsed = (now - startTime) / 1000;
totalSeconds += elapsed;
startTime = now;
lastSync = now;

localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);

// --- TIEMPO ACTIVO HOY (sumar solo dentro del día actual)
let todaySec = parseInt(localStorage.getItem("CFC_time_today") || "0", 10);
todaySec += elapsed;
localStorage.setItem("CFC_time_today", todaySec.toString());

localStorage.setItem(LAST_SYNC_KEY, now);

      let study = JSON.parse(localStorage.getItem("studyStats") || "{}");
      if (typeof study !== "object") study = {};
      study.minutesActive = Math.floor(totalSeconds / 60);
      localStorage.setItem("studyStats", JSON.stringify(study));

      updateIndicator(true);
      bell.play().catch(() => {});
      console.log(`CFC_QA_PING → +${(elapsed / 60).toFixed(2)} min | Total ${(totalSeconds / 60).toFixed(2)}`);
    }

    rafId = requestAnimationFrame(forcedLoop);
  };

  const startLoop = () => {
    if (paused) {
      paused = false;
      startTime = Date.now();
      lastSync = Date.now();
      rafId = requestAnimationFrame(forcedLoop);
      console.log("▶️ CFC_TIMER reanudado.");
    }
  };

  const stopLoop = () => {
    if (!paused) {
      paused = true;
      cancelAnimationFrame(rafId);
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      totalSeconds += elapsed;
      localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
      localStorage.setItem(LAST_SYNC_KEY, now);
      console.log("⏸️ CFC_TIMER pausado (pestaña oculta o cierre).");
    }
  };

  // ======== 🎯 Control de visibilidad y cierre ========
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else startLoop();
  });

  window.addEventListener("beforeunload", stopLoop);

  // ======== 🚀 Inicio ========
  const initAfterDOM = () => {
    startTime = Date.now();
    lastSync = Date.now();
    paused = false;
    rafId = requestAnimationFrame(forcedLoop);
    console.log("🔁 Loop maestro CFC iniciado (10 s exactos)");
  };

  if (document.readyState === "complete" || document.readyState === "interactive")
    initAfterDOM();
  else document.addEventListener("DOMContentLoaded", initAfterDOM);

  setInterval(() => updateIndicator(), 1000);

  console.log(`✅ CFC_ACTIVITY_V12.2_FIX_PAUSE_REAL | TAB:${TAB_ID}`);
})();
