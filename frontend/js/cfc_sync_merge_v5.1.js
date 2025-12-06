/************************************************************
 *  CFC SYNC MERGE V5.1 — FUSIÓN LOCAL ↔ REMOTO
 *  ---------------------------------------------------------
 *  Combina dos estados V5.1 en uno solo, sin perder nada.
 *
 *  Reglas:
 *  - Progreso → unión
 *  - Exámenes → versión más nueva
 *  - Stats → valores máximos
 *  - Bitácora → concatenación
 *  - Achievements → OR lógico
 *  - System → progressPercent máximo, lastSync nuevo
 ************************************************************/

function CFC_syncMergeV51(local, remote) {
  console.log("🔀 Iniciando merge V5.1…");
  console.log("📥 LOCAL:", local);
  console.log("🌐 REMOTO:", remote);

  /************************************************************
   * Seguridad: si remoto viene vacío → usar local entero
   ************************************************************/
  if (!remote || typeof remote !== "object") {
    console.warn("⚠️ Remote vacío → usando estado local completo.");
    return {
      ...local,
      system: {
        ...local.system,
        lastSync: new Date().toISOString(),
        version: "V5.1-MERGED"
      }
    };
  }

  /************************************************************
   * 1) PROGRESS
   ************************************************************/
  const progress = {
    completed: Array.from(
      new Set([...(local.progress.completed || []), ...(remote.progress.completed || [])])
    ),
    lastModule: remote.progress.lastModule || local.progress.lastModule || "",
    unlocked: Math.max(
      local.progress.unlocked || 1,
      remote.progress.unlocked || 1
    )
  };

  /************************************************************
   * 2) EXAMS — el examen con timestamp más nuevo gana
   ************************************************************/
  function mergeExams(localList, remoteList) {
    const map = new Map();

    [...localList, ...remoteList].forEach(ex => {
      const key = ex.module; // clave por módulo
      if (!map.has(key)) {
        map.set(key, ex);
      } else {
        const existing = map.get(key);
        if ((ex.timestamp || 0) > (existing.timestamp || 0)) {
          map.set(key, ex);
        }
      }
    });

    return Array.from(map.values());
  }

  const exams = mergeExams(local.exams || [], remote.exams || []);

  /************************************************************
   * 3) STATS — elegir máximo de valores
   ************************************************************/
  const stats = {
    minutesActive: Math.max(
      local.stats.minutesActive || 0,
      remote.stats.minutesActive || 0
    ),
    totalSeconds: Math.max(
      local.stats.totalSeconds || 0,
      remote.stats.totalSeconds || 0
    ),
    lastSession:
      (remote.stats.lastSession && remote.stats.lastSession.trim() !== "")
        ? remote.stats.lastSession
        : (local.stats.lastSession || "")
  };

  /************************************************************
   * 4) BITÁCORA — concatenar sin duplicar ID
   ************************************************************/
  const bitacora = (() => {
    const map = new Map();
    [...(local.bitacora || []), ...(remote.bitacora || [])].forEach(item => {
      if (item && item.id) map.set(item.id, item);
    });
    return Array.from(map.values());
  })();

  /************************************************************
   * 5) ACHIEVEMENTS — OR lógico
   ************************************************************/
  const achievements = {};
  const allKeys = new Set([
    ...Object.keys(local.achievements || {}),
    ...Object.keys(remote.achievements || {})
  ]);

  allKeys.forEach(k => {
    achievements[k] =
      (local.achievements && local.achievements[k]) ||
      (remote.achievements && remote.achievements[k]) ||
      false;
  });

  /************************************************************
   * 6) SYSTEM
   ************************************************************/
  const system = {
    progressPercent: Math.max(
      local.system.progressPercent || 0,
      remote.system.progressPercent || 0
    ),
    lastSync: new Date().toISOString(),
    version: "V5.1-MERGED"
  };

  /************************************************************
   * 7) OBJETO FINAL
   ************************************************************/
  const merged = {
    progress,
    exams,
    stats,
    bitacora,
    achievements,
    system
  };

  console.log("✅ MERGED RESULT →", merged);
  return merged;
}
