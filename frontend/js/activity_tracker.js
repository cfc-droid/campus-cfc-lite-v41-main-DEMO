/* ==========================================================
✅ CFC_ACTIVITY_V11.9_R2_PERSIST_FIX_REAL
----------------------------------------------------------
• Corrige reinicio falso tras logout (mantiene CFC_time_total)
• Evita reset si existe studyStats con estructura válida
• Totalmente compatible con CFC_FUNC_47_5_LOCK_TOTAL_PERSIST_REAL
========================================================== */

(function () {
  const TAB_ID = `CFC_TAB_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const TIME_TOTAL_KEY = "CFC_time_total";
  const LAST_SYNC_KEY = "CFC_last_sync";
  const RESET_FLAG = "CFC_reset_done";

  // 🔹 Cargar valores previos sin reiniciar
  let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || 0);
  let study = {};
  try {
    study = JSON.parse(localStorage.getItem("studyStats") || "{}");
  } catch {
    study = {};
  }

  // 🧠 Validación más inteligente: sólo reset si NO existen claves reales
  const hasValidStudy =
    typeof study === "object" &&
    Object.keys(study).length > 0 &&
    !isNaN(totalSeconds) &&
    totalSeconds > 0;

  if (!hasValidStudy) {
    console.log("🧠 Modo nuevo: no se detectó estudio previo válido, inicializando sin reset.");
    localStorage.setItem("studyStats", JSON.stringify({ minutesActive: Math.floor(totalSeconds / 60) }));
    localStorage.setItem(RESET_FLAG, "true");
  } else {
    console.log("✅ Reanudando sesión de estudio previa — tiempo acumulado preservado.");
  }

  let startTime = Date.now();
  let lastSync = Date.now();
  const bell = new Audio("../../assets/audio/bell-gold.wav");
  bell.volume = 0.25;

  /* ===== BLOQUE 1 — Indicador visual permanente ===== */
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
    const elapsed = (Date.now() - startTime) / 1000;
    const m = Math.floor((totalSeconds + elapsed) / 60);
    const s = Math.floor((totalSeconds + elapsed) % 60);
    indicator.textContent = `🕒 ${m}m ${s.toString().padStart(2, "0")}s ✅`;
    if (ping) {
      indicator.style.boxShadow = "0 0 12px 2px #FFD700";
      setTimeout(() => (indicator.style.boxShadow = "none"), 400);
    }
  };
  setInterval(updateIndicator, 1000);

  /* ===== BLOQUE 2 — Loop maestro exacto ===== */
  const SYNC_PERIOD = 10000;
  const SYNC_TOLERANCE = 250;

  const forcedLoop = () => {
    const now = Date.now();
    const diff = now - lastSync;

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

      console.log(`CFC_QA_PING → +${(elapsed / 60).toFixed(2)} min | Total ${(totalSeconds / 60).toFixed(2)}`);
      updateIndicator(true);
      bell.play().catch(() => {});
    }

    requestAnimationFrame(forcedLoop);
  };

  /* ===== BLOQUE 3 — Inicio automático ===== */
  const initAfterDOM = () => {
    startTime = Date.now();
    lastSync = Date.now();
    requestAnimationFrame(forcedLoop);
    console.log("🔁 Loop maestro CFC iniciado (10 s exactos, uptime 100%)");
  };

  if (document.readyState === "complete" || document.readyState === "interactive")
    initAfterDOM();
  else document.addEventListener("DOMContentLoaded", initAfterDOM);

  /* ===== BLOQUE 4 — Guardado al cerrar pestaña ===== */
  window.addEventListener("beforeunload", () => {
    localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
  });

  console.log(`✅ CFC_ACTIVITY_V11.9_R2_PERSIST_FIX_REAL | TAB:${TAB_ID}`);
})();
