/* ==========================================================
✅ CFC_ACTIVITY_V11.6.4_FINAL_STABLE_SYNC_FIX_20251108
----------------------------------------------------------
• Reinicio garantizado incluso en pestañas inactivas
• setInterval forzado tras DOM + delay QA
• Indicador QA activo 1 Hz con estado dinámico
• Actualiza studyStats y localStorage cada 10 s
• Evita doble inicialización y deadlocks
========================================================== */
(function () {
  const TAB_ID = `CFC_TAB_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const TAB_KEY = "CFC_ACTIVE_TAB";
  const LAST_SYNC_KEY = "CFC_last_sync";
  const TIME_TOTAL_KEY = "CFC_time_total";

  let startTime = Date.now();
  let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || 0);
  let syncTimer = null;
  let indicatorTimer = null;
  let isActive = false;

  /* =============== BLOQUE 0 — Control de pestañas únicas =============== */
  const stopSync = () => {
    if (syncTimer) clearInterval(syncTimer);
    syncTimer = null;
  };

  const activateTab = () => {
    localStorage.setItem(TAB_KEY, TAB_ID);
    isActive = true;
  };

  const checkTab = () => {
    const active = localStorage.getItem(TAB_KEY);
    if (!active || active === TAB_ID) isActive = true;
    else isActive = false;
  };

  window.addEventListener("focus", () => {
    activateTab();
  });
  window.addEventListener("blur", () => (isActive = false));
  window.addEventListener("storage", (e) => {
    if (e.key === TAB_KEY) checkTab();
  });
  checkTab();

  /* =============== BLOQUE 1 — Indicador QA visible =============== */
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
    transition: "box-shadow 0.2s ease",
  });
  document.body.appendChild(indicator);

  const bell = new Audio("../../assets/audio/bell-gold.wav");
  bell.volume = 0.25;

  const updateIndicator = (ping = false) => {
    const elapsed = (Date.now() - startTime) / 1000;
    const m = Math.floor(elapsed / 60);
    const s = Math.floor(elapsed % 60);
    indicator.textContent = `🕒 ${m}m ${s.toString().padStart(2, "0")}s ${isActive ? "✅" : "⏸️"}`;
    if (ping) {
      indicator.style.boxShadow = "0 0 10px 2px #FFD700";
      setTimeout(() => (indicator.style.boxShadow = "none"), 400);
    }
  };
  indicatorTimer = setInterval(updateIndicator, 1000);

  /* =============== BLOQUE 2 — Sincronía real cada 10 s =============== */
  const sync = (origin = "auto") => {
    if (!isActive) return;
    const now = Date.now();
    const elapsed = (now - startTime) / 1000;
    if (elapsed <= 0) return;

    totalSeconds += elapsed;
    startTime = now;
    localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
    localStorage.setItem(LAST_SYNC_KEY, now);

    let study = JSON.parse(localStorage.getItem("studyStats") || "{}");
    if (typeof study !== "object") study = {};
    study.minutesActive = Math.floor(totalSeconds / 60);
    localStorage.setItem("studyStats", JSON.stringify(study));

    console.log(`CFC_QA_PING → +${(elapsed / 60).toFixed(2)} min | Total ${(totalSeconds / 60).toFixed(2)}`);
    updateIndicator(true);
    bell.play().catch(() => {});
  };

  /* =============== BLOQUE 3 — Iniciador de ciclo seguro =============== */
  const restartSync = () => {
    stopSync();
    startTime = Date.now();
    // 🔁 inicia siempre, incluso si la pestaña aún no fue activada
    syncTimer = setInterval(() => {
      sync("auto");
    }, 10000);
    console.log("⏳ CFC_SYNC_LOOP iniciado cada 10 s");
  };

  /* =============== BLOQUE 4 — Unload seguro =============== */
  window.addEventListener("beforeunload", () => {
    sync("unload");
    stopSync();
  });

  /* =============== BLOQUE 5 — Inicio tras DOM completo =============== */
  const initAfterDOM = () => {
    // delay de 1 s para garantizar render completo
    setTimeout(() => {
      activateTab();
      restartSync();
      updateIndicator(false);
    }, 1000);
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    initAfterDOM();
  } else {
    document.addEventListener("DOMContentLoaded", initAfterDOM);
  }

  console.log(`✅ CFC_ACTIVITY_V11.6.4_FINAL_STABLE_SYNC_FIX | TAB:${TAB_ID}`);
})();

/* ==========================================================
🔒 CFC_LOCK: V11.6.4-FINAL_STABLE_SYNC_FIX-activity_tracker-20251108
========================================================== */
