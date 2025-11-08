/* ==========================================================
   ✅ CFC_ACTIVITY_V11.2_REAL_FIX_ANTI_DUPLICATE_20251108
   ----------------------------------------------------------
   • Mantiene horas activas persistentes (no se reinician)
   • Corrige cálculo de días consecutivos y totales
   • Evita duplicaciones al recargar o volver al perfil
   • Conserva indicador visual 🕒 y sincronía con profile.html
   ========================================================== */

(function () {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  let startTime = Date.now();
  let totalSeconds = parseFloat(localStorage.getItem("CFC_time_total") || 0);
  let isResetting = false;

  /* =====================================================
     🧩 BLOQUE 0 — Bloqueo anti-duplicación global
     ===================================================== */
  const lastSync = parseInt(localStorage.getItem("CFC_last_sync") || 0);
  if (Date.now() - lastSync < 60000) {
    console.log("⏸️ CFC_ACTIVITY → Bloqueo de recuento duplicado (reload rápido)");
  }
  localStorage.setItem("CFC_last_sync", Date.now());

  /* 🗓️ Control de días reales */
  const storedDate = localStorage.getItem("CFC_lastDate") || todayStr;
  let consecutiveDays = parseInt(localStorage.getItem("CFC_days") || 1);
  let totalDays = parseInt(localStorage.getItem("CFC_totalDays") || 1);

  // Normalizar formato de fecha (ISO)
  const normalizeDate = (str) => str.replace(/-/g, "/").slice(0, 10);
  const last = normalizeDate(storedDate);
  const curr = normalizeDate(todayStr);

  // 🧠 Revisión de días reales con control de horas activas
  if (curr !== last) {
    const diffMs = today - new Date(storedDate);
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = Math.floor(diffHours / 24);

    // Solo contar un nuevo "día total" si pasaron >= 24h de actividad total real
    const totalHoursActive = totalSeconds / 3600;
    if (diffDays >= 1 && totalHoursActive >= 24) {
      consecutiveDays = diffDays === 1 ? consecutiveDays + 1 : 1;
      totalDays += 1;
      localStorage.setItem("CFC_lastDate", todayStr);
      localStorage.setItem("CFC_days", consecutiveDays);
      localStorage.setItem("CFC_totalDays", totalDays);
      console.log(
        `📅 CFC_ACTIVITY → Día completo detectado (≥24h de estudio) | Totales:${totalDays}`
      );
    } else {
      // Si aún no pasaron 24h, solo actualizar la fecha sin sumar día total
      localStorage.setItem("CFC_lastDate", todayStr);
      console.log(
        `⏳ CFC_ACTIVITY → Fecha nueva detectada pero <24h activas, día total no sumado`
      );
    }
  }

  /* 🎯 Indicador visual (temporizador activo) */
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
    const min = Math.floor(elapsed / 60);
    const sec = Math.floor(elapsed % 60);
    indicator.textContent = `🕒 Sesión activa: ${min} min ${sec
      .toString()
      .padStart(2, "0")} s`;
  };
  setInterval(updateIndicator, 1000);

  /* =====================================================
     BLOQUE 1 — Sincronización principal
     ===================================================== */
  const sync = () => {
    if (isResetting) return;

    // ⏸️ Evita sumar si otra pestaña o recarga ya sincronizó en menos de 60 s
    const last = parseInt(localStorage.getItem("CFC_last_sync") || 0);
    if (Date.now() - last < 60000) return;
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

    console.log(
      `🧩 CFC_SYNC → +${(elapsed / 60).toFixed(1)} min | Total ${(totalSeconds / 60).toFixed(1)} min`
    );
  };
  const syncInterval = setInterval(sync, 10000);

  /* =====================================================
     BLOQUE 2 — Guardar al cerrar pestaña
     ===================================================== */
  window.addEventListener("beforeunload", () => {
    if (!isResetting) sync();
  });

  /* =====================================================
     BLOQUE 3 — Duración de examen (solo suma)
     ===================================================== */
  window.addEventListener("examCompleted", (e) => {
    const data = e.detail;
    if (!data || !data.duracionSegundos) return;
    totalSeconds += data.duracionSegundos;
    localStorage.setItem("CFC_time_total", totalSeconds);
    console.log(
      `📘 CFC_SYNC exam → +${(data.duracionSegundos / 60).toFixed(1)} min`
    );
  });

  /* =====================================================
     BLOQUE 4 — Reinicio global (manual o QA)
     ===================================================== */
  const performReset = (origin = "auto") => {
    if (origin === "exam") return; // 🚫 no reiniciar tras examen
    console.warn(`🧹 CFC_ACTIVITY → Reinicio total detectado (${origin})`);
    isResetting = true;
    clearInterval(syncInterval);

    // Mantener métricas globales
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
      console.log("✅ CFC_ACTIVITY reinicio confirmado y tracking reanudado limpio.");
    }, 2000);
  };

  // Trigger desde otras pestañas (solo manual)
  window.addEventListener("storage", (e) => {
    if (e.key === "CFC_triggerReset") {
      performReset("storage");
    }
  });

  // Trigger local interno (desde botón QA o debug)
  window.addEventListener("CFC_forceReset", () => performReset("manual"));

  console.log(
    `✅ CFC_ACTIVITY_V11.2_REAL_FIX_ANTI_DUPLICATE — Día:${todayStr} | Consecutivos:${consecutiveDays} | Totales:${totalDays}`
  );
})();

/* ==========================================================
🔒 CFC_LOCK: V11.2-REAL_FIX_ANTI_DUPLICATE-activity_tracker-20251108
========================================================== */
