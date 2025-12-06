/************************************************************
 *  CFC SYNC REMOTE V5.1 — FIRESTORE IMPORT + EXPORT
 *  ---------------------------------------------------------
 *  Usa window.CFC_DB (instancia global única).
 *  No inicializa Firebase.
 *  No depende de MSCU / Heartcore.
 ************************************************************/

function CFC_syncRemoteV51_path(email) {
  return window.CFC_DB
    .collection("users")
    .doc(email)
    .collection("sync");
}

/************************************************************
 *  EXPORT — Subir estado maestro a Firestore
 ************************************************************/
async function CFC_syncRemoteV51_export(email, merged) {
  console.log("⬆️ EXPORT V5.1 → Firestore…");

  try {
    if (!window.CFC_DB) throw new Error("No existe instancia global Firestore");

    const base = CFC_syncRemoteV51_path(email);

    // Deep clone por seguridad
    const data = JSON.parse(JSON.stringify(merged));

    await Promise.all([
      base.doc("progress").set(data.progress || {}),
      base.doc("exams").set({ exams: data.exams || [] }),
      base.doc("stats").set(data.stats || {}),
      base.doc("bitacora").set({ bitacora: data.bitacora || [] }),
      base.doc("achievements").set(data.achievements || {}),
      base.doc("system").set(data.system || {}),
    ]);

    console.log("✅ EXPORT completado");
  } catch (err) {
    console.error("❌ Error en EXPORT V5.1:", err);
  }
}

/************************************************************
 *  IMPORT — Leer Firestore y devolver V5.1 completo
 ************************************************************/
async function CFC_syncRemoteV51_import(email) {
  console.log("⬇️ IMPORT V5.1 ← Firestore…");

  const empty = {
    progress: { completed: [], lastModule: "", unlocked: 1 },
    exams: [],
    stats: { minutesActive: 0, lastSession: "", totalSeconds: 0 },
    bitacora: [],
    achievements: {},
    system: { progressPercent: 0, lastSync: "", version: "V5.1-EMPTY" }
  };

  try {
    if (!window.CFC_DB) throw new Error("No existe instancia Firestore");

    const base = CFC_syncRemoteV51_path(email);

    const docs = await Promise.all([
      base.doc("progress").get(),
      base.doc("exams").get(),
      base.doc("stats").get(),
      base.doc("bitacora").get(),
      base.doc("achievements").get(),
      base.doc("system").get(),
    ]);

    const [
      dProgress,
      dExams,
      dStats,
      dBitacora,
      dAchievements,
      dSystem
    ] = docs;

    return {
      progress: dProgress.exists
        ? {
            completed: dProgress.data().completed || [],
            lastModule: dProgress.data().lastModule || "",
            unlocked: dProgress.data().unlocked || 1,
          }
        : empty.progress,

      exams: dExams.exists
        ? dExams.data().exams || []
        : empty.exams,

      stats: dStats.exists
        ? {
            minutesActive: dStats.data().minutesActive || 0,
            lastSession: dStats.data().lastSession || "",
            totalSeconds: dStats.data().totalSeconds || 0,
          }
        : empty.stats,

      bitacora: dBitacora.exists
        ? dBitacora.data().bitacora || []
        : empty.bitacora,

      achievements: dAchievements.exists
        ? dAchievements.data() || {}
        : empty.achievements,

      system: dSystem.exists
        ? {
            progressPercent: dSystem.data().progressPercent || 0,
            lastSync: dSystem.data().lastSync || "",
            version: dSystem.data().version || "V5.1-REMOTE"
          }
        : empty.system
    };

  } catch (err) {
    console.error("❌ Error en IMPORT V5.1:", err);
    return empty;
  }
}
