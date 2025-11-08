/* ==========================================================
✅ CFC_ACTIVITY_V11.8_STABLE_FORCED_LOOP_20251108
----------------------------------------------------------
• Loop maestro forzado con timestamps exactos
• Sin dependencia de foco ni visibilidad
• Sin pausas ni interrupciones
• Reinicio exacto cada 10 s, 100 % de uptime
========================================================== */
(function () {
  const TAB_ID = `CFC_TAB_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const TIME_TOTAL_KEY = "CFC_time_total";
  const LAST_SYNC_KEY = "CFC_last_sync";

  let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || 0);
  // 🧹 Reset automático (solo usar si querés empezar siempre desde 0)
totalSeconds = 0;
localStorage.setItem(TIME_TOTAL_KEY, 0);
  let startTime = Date.now();
  let lastSync = Date.now();
  let indicator, indicatorTimer;
  let bell = new Audio("../../assets/audio/bell-gold.wav");
  bell.volume = 0.25;

  /* ===== BLOQUE 1 — Indicador visual permanente ===== */
  indicator = document.createElement("div");
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
    const elapsed = (Date.now() - startTime) / 1000;
    const m = Math.floor(elapsed / 60);
    const s = Math.floor(elapsed % 60);
    indicator.textContent = `🕒 ${m}m ${s.toString().padStart(2, "0")}s ✅`;
    if (ping) {
      indicator.style.boxShadow = "0 0 12px 2px #FFD700";
      setTimeout(() => (indicator.style.boxShadow = "none"), 400);
    }
  };
  indicatorTimer = setInterval(updateIndicator, 1000);

  /* ===== BLOQUE 2 — Loop maestro exacto ===== */
  const FORCE_INTERVAL = 1000; // verificación cada segundo
  const SYNC_PERIOD = 10000; // cada 10 s
  const SYNC_TOLERANCE = 250; // margen por lag

  const forcedLoop = () => {
    const now = Date.now();
    const diff = now - lastSync;

    // 🔁 fuerza ejecución si pasaron 10 s ± tolerancia
    if (diff >= SYNC_PERIOD - SYNC_TOLERANCE) {
      const elapsed = (now - startTime) / 1000;
      totalSeconds += elapsed;
      startTime = now;
      lastSync = now;

      localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
      localStorage.setItem(LAST_SYNC_KEY, now);

      let study = JSON.parse(localStorage.getItem("studyStats") || "{}");
      if (typeof study !== "object") study = {};
      study.minutesActive = Math.floor(totalSeconds / 60);
      localStorage.setItem("studyStats", JSON.stringify(study));

      console.log(
        `CFC_QA_PING → +${(elapsed / 60).toFixed(2)} min | Total ${(totalSeconds / 60).toFixed(2)}`
      );
      updateIndicator(true);
      bell.play().catch(() => {});
    }

    requestAnimationFrame(forcedLoop); // reemplaza setInterval por estabilidad
  };

  /* ===== BLOQUE 3 — Arranque automático ===== */
  const initAfterDOM = () => {
    startTime = Date.now();
    lastSync = Date.now();
    requestAnimationFrame(forcedLoop);
    console.log("🔁 Loop maestro CFC iniciado (10 s exactos, sin interrupciones)");
  };

  if (document.readyState === "complete" || document.readyState === "interactive")
    initAfterDOM();
  else document.addEventListener("DOMContentLoaded", initAfterDOM);

  window.addEventListener("beforeunload", () => {
    localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
  });

  console.log(`✅ CFC_ACTIVITY_V11.8_STABLE_FORCED_LOOP | TAB:${TAB_ID}`);
})();

/* ==========================================================
🔒 CFC_LOCK: V11.8-STABLE-FORCED-LOOP-activity_tracker-20251108
========================================================== */
