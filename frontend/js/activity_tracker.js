// ==========================================================
// ✅ CFC_ACTIVITY_V11.9_R2_FINAL_SYNC_20251108
// ----------------------------------------------------------
// • Reinicio garantizado al limpiar o reiniciar el Campus
// • Loop maestro exacto (pings cada 10 s)
// • Sincronización completa con "Mi progreso" (horas + fecha)
// • Evento global para refrescar automáticamente el perfil
// ==========================================================

(function () {
  const TAB_ID = `CFC_TAB_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
  const TIME_TOTAL_KEY = "CFC_time_total";
  const LAST_SYNC_KEY = "CFC_last_sync";
  const SESSION_ID_KEY = "CFC_session_id";

  // ===== BLOQUE 0 — Inicialización segura =====
  const currentSession = Date.now().toString();
  const savedSession = localStorage.getItem(SESSION_ID_KEY);
  let totalSeconds = parseFloat(localStorage.getItem(TIME_TOTAL_KEY) || 0);

  // 🧹 Detectar reinicio manual o limpieza de localStorage
  if (!savedSession || savedSession !== currentSession) {
    console.log("🧹 Reinicio detectado → tiempo total = 0 min.");
    totalSeconds = 0;
    localStorage.setItem(TIME_TOTAL_KEY, 0);
    localStorage.setItem(SESSION_ID_KEY, currentSession);
  }

  let startTime = Date.now();
  let lastSync = Date.now();
  const bell = new Audio("../../assets/audio/bell-gold.wav");
  bell.volume = 0.25;

  // ===== BLOQUE 1 — Indicador visual (cronómetro dorado) =====
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
    const m = Math.floor(elapsed / 60);
    const s = Math.floor(elapsed % 60);
    indicator.textContent = `🕒 ${m}m ${s.toString().padStart(2, "0")}s ✅`;
    if (ping) {
      indicator.style.boxShadow = "0 0 12px 2px #FFD700";
      setTimeout(() => (indicator.style.boxShadow = "none"), 400);
    }
  };
  setInterval(updateIndicator, 1000);

  // ===== BLOQUE 2 — Loop maestro con sincronización completa =====
  const SYNC_PERIOD = 10000; // 10s exactos
  const SYNC_TOLERANCE = 250; // ±0.25s
  const loop = () => {
    const now = Date.now();
    const diff = now - lastSync;
    if (diff >= SYNC_PERIOD - SYNC_TOLERANCE) {
      const elapsed = (now - startTime) / 1000;
      totalSeconds += elapsed;
      startTime = now;
      lastSync = now;
      localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
      localStorage.setItem(LAST_SYNC_KEY, now);

      // ✅ Actualiza estadísticas globales visibles en el perfil
      let study = JSON.parse(localStorage.getItem("studyStats") || "{}");
      if (typeof study !== "object") study = {};
      study.minutesActive = Math.floor(totalSeconds / 60);
      study.lastSession = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      localStorage.setItem("studyStats", JSON.stringify(study));

      // ✅ Notifica a todos los módulos para refrescar el progreso
      window.dispatchEvent(new Event("CFC_STATS_UPDATED"));

      console.log(
        `CFC_QA_PING → +${(elapsed / 60).toFixed(2)} min | Total ${(totalSeconds / 60).toFixed(2)}`
      );
      updateIndicator(true);
      bell.play().catch(() => {});
    }
    requestAnimationFrame(loop);
  };

  // ===== BLOQUE 3 — Inicialización =====
  const init = () => {
    startTime = Date.now();
    lastSync = Date.now();
    requestAnimationFrame(loop);
    console.log("🔁 Loop maestro CFC iniciado (exact 10s)");
  };
  if (document.readyState === "complete" || document.readyState === "interactive")
    init();
  else document.addEventListener("DOMContentLoaded", init);

  // ===== BLOQUE 4 — Guardado al cerrar =====
  window.addEventListener("beforeunload", () => {
    localStorage.setItem(TIME_TOTAL_KEY, totalSeconds);
  });

  console.log(`✅ CFC_ACTIVITY_V11.9_R2_FINAL_SYNC | TAB:${TAB_ID}`);
})();
