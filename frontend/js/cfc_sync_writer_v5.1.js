/************************************************************
 *  CFC SYNC WRITER V5.1 — ESCRITURA LOCAL SEGURA
 *  ---------------------------------------------------------
 *  Actualiza únicamente las claves relacionadas al progreso.
 *  NO toca nada crítico:
 *    - CFC_EMAIL
 *    - CFC_LICENSE
 *    - CFC_DEVICE_ID
 *    - CFC_SESSION_ID
 *    - Heartcore / DomainLock / MSCU
 ************************************************************/

function CFC_syncWriterV51(merged) {
  console.log("📝 Ejecutando Writer V5.1…");
  console.log("➡️ Merged recibido:", merged);

  if (!merged || typeof merged !== "object") {
    console.error("❌ Writer recibió un merged inválido");
    return;
  }

  /************************************************************
   * 1) progressData (estructura interna del Campus)
   ************************************************************/
  const progressData = {
    completed: merged.progress.completed || [],
    lastModule: merged.progress.lastModule || "",
    unlocked: merged.progress.unlocked || 1
  };
  localStorage.setItem("progressData", JSON.stringify(progressData));

  /************************************************************
   * 2) examResults
   ************************************************************/
  const exams = merged.exams || [];
  localStorage.setItem("examResults", JSON.stringify(exams));

  /************************************************************
   * 3) studyStats
   ************************************************************/
  const stats = {
    minutesActive: merged.stats.minutesActive || 0,
    lastSession: merged.stats.lastSession || "",
    totalSeconds: merged.stats.totalSeconds || 0
  };
  localStorage.setItem("studyStats", JSON.stringify(stats));

  /************************************************************
   * 4) bitacora
   ************************************************************/
  const bitacora = merged.bitacora || [];
  localStorage.setItem("bitacora", JSON.stringify(bitacora));

  /************************************************************
   * 5) achievement
   * Guardamos cada logro como antes hacía el Campus.
   ************************************************************/
  if (merged.achievements && typeof merged.achievements === "object") {
    Object.keys(merged.achievements).forEach(key => {
      const value = merged.achievements[key];
      if (value === true) {
        localStorage.setItem(`achievement_${key}`, "1");
      } else {
        localStorage.removeItem(`achievement_${key}`);
      }
    });
  }

  /************************************************************
   * 6) progressPercent + lastSync
   ************************************************************/
  localStorage.setItem(
    "progressPercent",
    String(merged.system.progressPercent || 0)
  );

  localStorage.setItem(
    "CFC_lastSync",
    merged.system.lastSync || new Date().toISOString()
  );

  /************************************************************
   * 7) Confirmación final
   ************************************************************/
  console.log("✅ Writer V5.1 completado — localStorage actualizado.");
}
