/*******************************************************
 *  CFC SYNC READER V5.1 — LECTURA LOCAL NORMALIZADA
 *  ---------------------------------------------------
 *  Convierte las claves reales del Campus V41 en un
 *  DataModel V5.1 completo y seguro.
 *
 *  ❗ No toca Firestore
 *  ❗ No toca seguridad
 *  ❗ No borra claves
 *  ❗ Nunca devuelve null ni undefined
 *******************************************************/

function CFC_syncReaderV51() {
  console.log("🔍 CFC_syncReaderV51() → leyendo localStorage…");

  /*******************************************************
   * FUNCIÓN SEGURA PARA LEER JSON
   *******************************************************/
  const safeReadJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (e) {
      console.warn("⚠️ Error leyendo JSON:", key, e);
      return fallback;
    }
  };

  /*******************************************************
   * 1) PROGRESS
   *******************************************************/
  const progressData = safeReadJSON("progressData", {
    completed: [],
    lastModule: "",
    unlocked: 1
  });

  const progress = {
    completed: Array.isArray(progressData.completed)
      ? progressData.completed
      : [],
    lastModule:
      typeof progressData.lastModule === "string"
        ? progressData.lastModule
        : "",
    unlocked:
      typeof progressData.unlocked === "number"
        ? progressData.unlocked
        : 1
  };

  /*******************************************************
   * 2) EXAMS
   *******************************************************/
  const examResults = safeReadJSON("examResults", []);

  const exams = Array.isArray(examResults) ? examResults : [];

  /*******************************************************
   * 3) STATS
   *******************************************************/
  const statsRaw = safeReadJSON("studyStats", {
    minutesActive: 0,
    totalSeconds: 0,
    lastSession: ""
  });

  const stats = {
    minutesActive:
      typeof statsRaw.minutesActive === "number"
        ? statsRaw.minutesActive
        : 0,
    totalSeconds:
      typeof statsRaw.totalSeconds === "number"
        ? statsRaw.totalSeconds
        : 0,
    lastSession:
      typeof statsRaw.lastSession === "string"
        ? statsRaw.lastSession
        : ""
  };

  /*******************************************************
   * 4) BITÁCORA
   *******************************************************/
  const bitacoraRaw = safeReadJSON("bitacora", []);

  const bitacora = Array.isArray(bitacoraRaw) ? bitacoraRaw : [];

  /*******************************************************
   * 5) ACHIEVEMENTS
   *******************************************************/
  const achRaw = localStorage.getItem("achievement");

  const achievements = {};

  if (achRaw && typeof achRaw === "string") {
    // ejemplo: "Foco mental" → achievements.focoMental = true
    achievements[achRaw.replace(/\s+/g, "")] = true;
  }

  /*******************************************************
   * 6) SYSTEM
   *******************************************************/
  const progressPercentRaw = localStorage.getItem("progressPercent");
  const lastSyncRaw = localStorage.getItem("CFC_lastSync");

  const system = {
    progressPercent: progressPercentRaw
      ? Number(progressPercentRaw) || 0
      : 0,
    lastSync: lastSyncRaw || "",
    version: "V5.1-READER"
  };

  /*******************************************************
   * OBJETO FINAL
   *******************************************************/
  const finalObj = {
    progress,
    exams,
    stats,
    bitacora,
    achievements,
    system
  };

  console.log("📦 CFC_syncReaderV51() → resultado:", finalObj);
  return finalObj;
}
