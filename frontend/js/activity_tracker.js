/* ==========================================================
✅ CFC_ACTIVITY_V11.5_REAL_SYNC_FIX_20251108
----------------------------------------------------------
• Soluciona sobreconteo por múltiples instancias
• Garantiza que solo 1 tracker por pestaña quede activo
• Usa sendBeacon en cierre para sincronía atómica
• Compatible con profile.html y progress_v2.js
========================================================== */

(function () {
  const TAB_ID = `CFC_TAB_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const TAB_KEY = "CFC_ACTIVE_TAB";
  const LAST_SYNC_KEY = "CFC_last_sync";
  const TIME_TOTAL_KEY = "CFC_time_total";

  let startTime = Date.now();
  let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || 0);
  let isActive = false;
  let syncInterval = null;

  /* =====================================================
     BLOQUE 0 — Exclusión de pestañas duplicadas
     ===================================================== */
  const checkTab = () => {
    const activeTab = localStorage.getItem(TAB_KEY);
    if (!activeTab || activeTab === TAB_ID) {
      localStorage.setItem(TAB_KEY, TAB_ID);
      isActive = true;
    } else {
      isActive = false;
    }
  };
  checkTab();
  window.addEventListener("focus", checkTab);
  window.addEventListener("storage", (e) => {
    if (e.key === TAB_KEY) checkTab();
  });

  /* =====================================================
     BLOQUE 1 — Indicador visual dorado QA
     ===================================================== */
  const indicator = document.createElement("div");
  Object.assign(indicator.style, {
    position: "fixed",
    bottom: "10px",
    right: "20px",
    background: "rgba(255,215,0,0.15)",
    color: "#FFD700",
    padding: "6px 14px",
    border: "1px solid #FFD700",
    borderRadius: "12px",
    fontSize: "0.9rem",
    fontFamily: "Poppins,sans-serif",
    zIndex: "9999",
    backdropFilter: "blur(6px)",
  });
  document.body.appendChild(indicator);

  const updateIndicator = () => {
    const elapsed = (Date.now() - startTime) / 1000;
    const m = Math.floor(elapsed / 60);
    const s = Math.floor(elapsed % 60);
    indicator.textContent = `🕒 Sesión activa: ${m} min ${s
      .toString()
      .padStart(2, "0")} s ${isActive ? "✅" : "⏸️"}`;
  };
  setInterval(updateIndicator, 1000);

  /* =====================================================
     BLOQUE 2 — Función de sincronización
     ===================================================== */
  const sync = (origin = "auto") => {
    if (!isActive) return;
    const now = Date.now();
    const lastSync = parseInt(localStorage.getItem(LAST_SYNC_KEY) || 0);
    if (now - lastSync < 9500 && origin === "auto") return;

    const elapsed = (now - startTime) / 1000;
    startTime = now;
    totalSeconds += elapsed;
    localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
    localStorage.setItem(LAST_SYNC_KEY, now);

    const study = JSON.parse(localStorage.getItem("studyStats") || "{}");
    study.minutesActive = Math.floor(totalSeconds / 60);
    localStorage.setItem("studyStats", JSON.stringify(study));

    console.log(
      `🧩 [${origin}] +${(elapsed / 60).toFixed(1)} min → Total ${(totalSeconds / 60).toFixed(1)} min`
    );
  };

  syncInterval = setInterval(() => sync("auto"), 10000);

  /* =====================================================
     BLOQUE 3 — Sincronización al cerrar pestaña
     ===================================================== */
  window.addEventListener("beforeunload", () => {
    sync("unload");
    try {
      const payload = JSON.stringify({
        total: totalSeconds,
        time: new Date().toISOString(),
      });
      navigator.sendBeacon?.("/cfc-sync", payload);
    } catch (err) {}
  });

  /* =====================================================
     BLOQUE 4 — Reset total sincronizado
     ===================================================== */
  const performReset = () => {
    console.warn("🧹 Reset total ejecutado (CFC_forceReset)");
    totalSeconds = 0;
    startTime = Date.now();
    localStorage.setItem(TIME_TOTAL_KEY, 0);
    localStorage.setItem("CFC_time", 0);
  };

  window.addEventListener("CFC_forceReset", performReset);
  window.addEventListener("storage", (e) => {
    if (e.key === "CFC_triggerReset") performReset();
  });

  /* =====================================================
     BLOQUE 5 — Audio de ping QA (cada 10 s)
     ===================================================== */
  const bell = new Audio("../../assets/audio/bell-gold.wav");
  bell.volume = 0.25;
  setInterval(() => {
    if (isActive) bell.play().catch(() => {});
  }, 10000);

  console.log(
    `✅ CFC_ACTIVITY_V11.5_REAL_SYNC_FIX listo | TAB:${TAB_ID} | Activo:${isActive}`
  );
})();

/* ==========================================================
🔒 CFC_LOCK: V11.5-REAL_SYNC_FIX-activity_tracker-20251108
========================================================== */
