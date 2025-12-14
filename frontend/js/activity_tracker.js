/* ==========================================================
✅ CFC_ACTIVITY_V12.3_USER_SCOPED_DAILY_RESET_REAL
----------------------------------------------------------
• Progreso por USUARIO (email)
• Reset automático diario
• Sin interferir con otros dispositivos
• Compatible con profile.js y studyStats
========================================================== */

(function () {

  const email = localStorage.getItem("CFC_EMAIL");
  if (!email) {
    console.warn("⛔ activity_tracker detenido: sin CFC_EMAIL");
    return;
  }

  const USER_KEY = email.replace(/[^a-zA-Z0-9]/g, "_");

  const TIME_TOTAL_KEY = `CFC_time_total_${USER_KEY}`;
  const TIME_TODAY_KEY = `CFC_time_today_${USER_KEY}`;
  const LAST_DATE_KEY = `CFC_last_date_${USER_KEY}`;
  const STUDY_STATS_KEY = `studyStats_${USER_KEY}`;

  const todayStr = new Date().toISOString().slice(0, 10);

  // ======== 🔄 RESET DIARIO REAL ========
  const lastDate = localStorage.getItem(LAST_DATE_KEY);
  if (lastDate !== todayStr) {
    localStorage.setItem(TIME_TODAY_KEY, "0");
    localStorage.setItem(LAST_DATE_KEY, todayStr);
    console.log("🔄 Reset diario aplicado:", todayStr);
  }

  let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || "0");
  let todaySeconds = parseFloat(localStorage.getItem(TIME_TODAY_KEY) || "0");

  let startTime = Date.now();
  let paused = false;
  let rafId = null;

  // ======== 🔔 Indicador ========
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
  });
  document.body.appendChild(indicator);

  const updateIndicator = () => {
    const elapsed = paused ? 0 : (Date.now() - startTime) / 1000;
    const total = totalSeconds + elapsed;
    const m = Math.floor(total / 60);
    const s = Math.floor(total % 60);
    indicator.textContent = `🕒 ${m}m ${s.toString().padStart(2, "0")}s`;
  };

  // ======== 🔁 LOOP PRINCIPAL ========
  const LOOP_MS = 10000;

  const loop = () => {
    if (paused) return;

    const now = Date.now();
    const elapsed = (now - startTime) / 1000;

    totalSeconds += elapsed;
    todaySeconds += elapsed;
    startTime = now;

    localStorage.setItem(TIME_TOTAL_KEY, totalSeconds.toString());
    localStorage.setItem(TIME_TODAY_KEY, todaySeconds.toString());

    const study = {
      minutesActive: Math.floor(totalSeconds / 60),
      hoursDisplay: `${Math.floor(totalSeconds / 3600)} h ${Math.floor((totalSeconds % 3600) / 60)} min`,
      lastSession: new Date().toLocaleDateString("es-AR"),
    };

    localStorage.setItem(STUDY_STATS_KEY, JSON.stringify(study));

    // 👉 compatibilidad con profile.js
    localStorage.setItem("studyStats", JSON.stringify(study));
    window.dispatchEvent(new Event("CFC_STATS_UPDATED"));

    updateIndicator();
    rafId = setTimeout(loop, LOOP_MS);
  };

  // ======== ⏸️ CONTROL VISIBILIDAD ========
  const pause = () => {
    if (!paused) {
      paused = true;
      clearTimeout(rafId);
    }
  };

  const resume = () => {
    if (paused) {
      paused = false;
      startTime = Date.now();
      loop();
    }
  };

  document.addEventListener("visibilitychange", () => {
    document.hidden ? pause() : resume();
  });

  window.addEventListener("beforeunload", pause);

  // ======== 🚀 START ========
  startTime = Date.now();
  loop();

  setInterval(updateIndicator, 1000);

  console.log(`✅ CFC_ACTIVITY_V12.3 activo para ${email}`);
})();
