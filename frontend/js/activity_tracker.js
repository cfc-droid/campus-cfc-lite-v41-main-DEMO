/* ==========================================================
   ✅ CFC_ACTIVITY_V11.3_FIX_TIME_DUPLICATION_20251108
   ----------------------------------------------------------
   • Bloquea incrementos duplicados por recarga o re-render
   • Sincroniza con progress_v2.js V10.7 (CFC-SYNC REAL)
   • Mantiene persistencia exacta de horas activas
   • Restablece días consecutivos y totales correctamente
   ========================================================== */

(function () {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  let startTime = Date.now();
  let totalSeconds = parseFloat(localStorage.getItem("CFC_time_total") || 0);
  let isResetting = false;

  /* =====================================================
     BLOQUE 0 — Bloqueo anti-duplicación (núcleo)
     ===================================================== */
  const lastSync = parseInt(localStorage.getItem("CFC_last_sync") || 0);
  const diffSinceLast = Date.now() - lastSync;
  // Si pasaron menos de 60 s desde el último sync → no volver a sumar
  if (diffSinceLast < 60000) {
    console.log("⏸️ CFC_ACTIVITY → Bloqueo de recuento duplicado (reload rápido)");
    return;
  }
  localStorage.setItem("CFC_last_sync", Date.now());

  /* 🗓️ Control de días */
  const storedDate = localStorage.getItem("CFC_lastDate") || todayStr;
  let consecutiveDays = parseInt(localStorage.getItem("CFC_days") || 1);
  let totalDays = parseInt(localStorage.getItem("CFC_totalDays") || 1);

  const normalizeDate = (s) => s.replace(/-/g, "/").slice(0, 10);
  const last = normalizeDate(storedDate);
  const curr = normalizeDate(todayStr);

  if (curr !== last) {
    const diffMs = today - new Date(storedDate);
    const diffHours = diffMs / 36e5;
    const diffDays = Math.floor(diffHours / 24);
    const totalHoursActive = totalSeconds / 3600;
    if (diffDays >= 1 && totalHoursActive >= 24) {
      consecutiveDays = diffDays === 1 ? consecutiveDays + 1 : 1;
      totalDays += 1;
      console.log(`📅 Día completo detectado | Totales:${totalDays}`);
    }
    localStorage.setItem("CFC_lastDate", todayStr);
    localStorage.setItem("CFC_days", consecutiveDays);
    localStorage.setItem("CFC_totalDays", totalDays);
  }

  /* 🎯 Indicador visual */
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
    if (isResetting) return;
    const elapsed = (Date.now() - startTime) / 1000;
    const m = Math.floor(elapsed / 60);
    const s = Math.floor(elapsed % 60);
    indicator.textContent = `🕒 Sesión activa: ${m} min ${s.toString().padStart(2, "0")} s`;
  };
  setInterval(updateIndicator, 1000);

  /* =====================================================
     BLOQUE 1 — Sincronización principal
     ===================================================== */
  const sync = () => {
    if (isResetting) return;
    // Evita doble conteo si otra pestaña sincronizó hace poco
    const lastSyncCheck = parseInt(localStorage.getItem("CFC_last_sync") || 0);
    if (Date.now() - lastSyncCheck < 60000) return;
    localStorage.setItem("CFC_last_sync", Date.now());

    const elapsed = (Date.now() - startTime) / 1000;
    startTime = Date.now();
    totalSeconds += elapsed;
    localStorage.setItem("CFC_time_total", totalSeconds);
    localStorage.setItem("CFC_time", totalSeconds);

    const study = JSON.parse(localStorage.getItem("studyStats") || "{}");
    study.minutesActive = Math.floor(totalSeconds / 60);
    study.sessions = totalDays;
    localStorage.setItem("studyStats", JSON.stringify(study));

    console.log(`🧩 +${(elapsed / 60).toFixed(1)} min | Total ${(totalSeconds / 60).toFixed(1)} min`);
  };
  const syncInterval = setInterval(sync, 10000);

  /* =====================================================
     BLOQUE 2 — Guardar al cerrar pestaña
     ===================================================== */
  window.addEventListener("beforeunload", () => {
    if (!isResetting) sync();
  });

  /* =====================================================
     BLOQUE 3 — Evento de examen (sólo suma real)
     ===================================================== */
  window.addEventListener("examCompleted", (e) => {
    const data = e.detail;
    if (!data || !data.duracionSegundos) return;
    totalSeconds += data.duracionSegundos;
    localStorage.setItem("CFC_time_total", totalSeconds);
    console.log(`📘 Examen → +${(data.duracionSegundos / 60).toFixed(1)} min`);
  });

  /* =====================================================
     BLOQUE 4 — Reinicio global (manual o QA)
     ===================================================== */
  const performReset = (origin = "auto") => {
    if (origin === "exam") return;
    console.warn(`🧹 Reinicio total detectado (${origin})`);
    isResetting = true;
    clearInterval(syncInterval);

    totalSeconds = 0;
    startTime = Date.now();
    localStorage.setItem("CFC_time_total", 0);
    localStorage.setItem("CFC_time", 0);
    localStorage.setItem(
      "studyStats",
      JSON.stringify({ minutesActive: 0, sessions: totalDays })
    );
    indicator.textContent = "🕒 Sesión activa: 0 min 00 s";

    setTimeout(() => {
      isResetting = false;
      startTime = Date.now();
      setInterval(sync, 10000);
      console.log("✅ Reinicio confirmado y tracking limpio.");
    }, 2000);
  };

  window.addEventListener("storage", (e) => {
    if (e.key === "CFC_triggerReset") performReset("storage");
  });
  window.addEventListener("CFC_forceReset", () => performReset("manual"));

  console.log(
    `✅ CFC_ACTIVITY_V11.3 — Día:${todayStr} | Consecutivos:${consecutiveDays} | Totales:${totalDays}`
  );
})();

/* ==========================================================
🔒 CFC_LOCK: V11.3-FIX_TIME_DUPLICATION-activity_tracker-20251108
========================================================== */
