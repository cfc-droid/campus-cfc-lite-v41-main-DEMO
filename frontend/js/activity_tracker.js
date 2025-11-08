/* ==========================================================
✅ CFC_ACTIVITY_V11.7_FINAL_STABLE_READY_20251108
----------------------------------------------------------
• Evita rebote de evento storage (bug multi-tab)
• Ciclo 10 s estable y persistente en toda sesión
• Estado verde fijo mientras el usuario permanezca en la página
• Reinicio automático cada 10 s sin pausa intermitente
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
  let isActive = true; // ✅ inicia activo y nunca se autodesactiva

  /* ===== BLOQUE 0 — Control básico de foco ===== */
  window.addEventListener("focus", () => (isActive = true));
  window.addEventListener("blur", () => (isActive = false));

  // Eliminamos la escucha de storage que causaba el falso stop
  localStorage.setItem(TAB_KEY, TAB_ID);

  /* ===== BLOQUE 1 — Indicador QA ===== */
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

  const bell = new Audio("../../assets/audio/bell-gold.wav");
  bell.volume = 0.25;

  const updateIndicator = (ping = false) => {
    const elapsed = (Date.now() - startTime) / 1000;
    const m = Math.floor(elapsed / 60);
    const s = Math.floor(elapsed % 60);
    indicator.textContent = `🕒 ${m}m ${s.toString().padStart(2, "0")}s ${isActive ? "✅" : "⏸️"}`;
    if (ping) {
      indicator.style.boxShadow = "0 0 12px 2px #FFD700";
      setTimeout(() => (indicator.style.boxShadow = "none"), 400);
    }
  };
  indicatorTimer = setInterval(updateIndicator, 1000);

  /* ===== BLOQUE 2 — Sincronizador ===== */
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

  /* ===== BLOQUE 3 — Loop estable ===== */
  const restartSync = () => {
    if (syncTimer) clearInterval(syncTimer);
    startTime = Date.now();
    syncTimer = setInterval(() => sync("auto"), 10000);
    console.log("🔁 CFC_SYNC_LOOP activo cada 10 s (modo estable)");
  };

  /* ===== BLOQUE 4 — Unload ===== */
  window.addEventListener("beforeunload", () => {
    sync("unload");
    clearInterval(syncTimer);
  });

  /* ===== BLOQUE 5 — Inicio post-DOM ===== */
  const initAfterDOM = () => {
    setTimeout(() => {
      restartSync();
      updateIndicator(false);
    }, 500);
  };
  if (document.readyState === "complete" || document.readyState === "interactive") initAfterDOM();
  else document.addEventListener("DOMContentLoaded", initAfterDOM);

  console.log(`✅ CFC_ACTIVITY_V11.7_FINAL_STABLE_READY_20251108 | TAB:${TAB_ID}`);
})();

/* ==========================================================
🔒 CFC_LOCK: V11.7-FINAL-STABLE_READY-activity_tracker-20251108
========================================================== */
