/* ==========================================================
✅ CFC_ACTIVITY_V11.6.2_GLOBAL_READY_FIX_20251108
----------------------------------------------------------
• Se asegura de iniciar incluso si DOMContentLoaded ya pasó
• Indicador QA visible en todas las páginas
• Reinicio cada 10 s exactos + actualización de studyStats
• Sincronía real en localStorage (CFC_time_total)
========================================================== */

(function initActivityTracker() {
  const startWhenReady = () => {
    if (document.readyState === "complete" || document.readyState === "interactive") {
      startTracker();
    } else {
      document.addEventListener("DOMContentLoaded", startTracker);
      // Fallback de seguridad si el evento ya pasó
      setTimeout(() => {
        if (!window.CFC_ACTIVITY_STARTED) startTracker();
      }, 1200);
    }
  };

  function startTracker() {
    if (window.CFC_ACTIVITY_STARTED) return;
    window.CFC_ACTIVITY_STARTED = true;

    const TAB_ID = `CFC_TAB_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
    const TAB_KEY = "CFC_ACTIVE_TAB";
    const LAST_SYNC_KEY = "CFC_last_sync";
    const TIME_TOTAL_KEY = "CFC_time_total";

    let startTime = Date.now();
    let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || 0);
    let syncTimer = null;
    let isActive = false;

    /* =====================================================
       BLOQUE 0 — Control de pestañas únicas
       ===================================================== */
    const stopSync = () => {
      if (syncTimer) clearInterval(syncTimer);
      syncTimer = null;
    };

    const activateTab = () => {
      localStorage.setItem(TAB_KEY, TAB_ID);
      isActive = true;
      restartSync();
    };

    const checkTab = () => {
      const active = localStorage.getItem(TAB_KEY);
      if (!active || active === TAB_ID) activateTab();
      else {
        isActive = false;
        stopSync();
      }
    };

    window.addEventListener("focus", activateTab);
    window.addEventListener("blur", () => {
      isActive = false;
      stopSync();
    });
    window.addEventListener("storage", (e) => {
      if (e.key === TAB_KEY) checkTab();
    });
    checkTab();

    /* =====================================================
       BLOQUE 1 — Indicador QA visible
       ===================================================== */
    const indicator = document.createElement("div");
    Object.assign(indicator.style, {
      position: "fixed",
      bottom: "10px",
      right: "20px",
      background: "rgba(255,215,0,0.1)",
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
        indicator.style.boxShadow = "0 0 12px 2px #FFD700";
        setTimeout(() => (indicator.style.boxShadow = "none"), 300);
      }
    };
    setInterval(updateIndicator, 1000);

    /* =====================================================
       BLOQUE 2 — Sincronización cada 10 s exactos
       ===================================================== */
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

      console.log(
        `CFC_QA_PING → +${(elapsed / 60).toFixed(2)} min | Total ${(totalSeconds / 60).toFixed(2)}`
      );
      updateIndicator(true);
      bell.play().catch(() => {});
    };

    const restartSync = () => {
      stopSync();
      startTime = Date.now();
      syncTimer = setInterval(() => sync("auto"), 10000);
    };

    /* =====================================================
       BLOQUE 3 — Unload seguro
       ===================================================== */
    window.addEventListener("beforeunload", () => {
      sync("unload");
      stopSync();
    });

    console.log(`✅ CFC_ACTIVITY_V11.6.2_GLOBAL_READY_FIX | TAB:${TAB_ID}`);
  }

  startWhenReady();
})();

/* ==========================================================
🔒 CFC_LOCK: V11.6.2-GLOBAL_READY_FIX-activity_tracker-20251108
========================================================== */
