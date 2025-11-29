/* ============================================================
   🔵 CFC-SYNC REMOTE V1 — SUBPASO 5/5-C
   Gestión remota completa: EXPORT / IMPORT / MERGE / RESTORE
   Ubicación remota obligatoria: users/<email>/sync/v1
   29-11-2025 — CFC-SYNC ENGINE
   ============================================================ */

console.log("🟦 CFC_SYNC_REMOTE_READY — Archivo remoto cargado", new Date().toLocaleString());

/* ============================================================
   5/5-C.1 — Declaración base
   ============================================================ */

async function CFC_syncRemote_export(email) { /* se implementa abajo */ }
async function CFC_syncRemote_import(email) { /* se implementa abajo */ }
function CFC_syncRemote_merge(localData, remoteData) { /* se implementa abajo */ }
async function CFC_syncRemote_restore(email) { /* se implementa abajo */ }


/* ============================================================
   5/5-C.2 — EXPORT
   Guarda TODO el JSON local en Firestore bajo:
   users/<email>/sync/v1
   ============================================================ */
async function CFC_syncRemote_export(email) {
  try {
    console.log("⬆️ [REMOTE-EXPORT] Iniciando exportación…", email);

    // Obtener datos locales con el READER
    const localData = CFC_syncReader_collect();

    const payload = {
      data: localData,
      updated_at: Date.now(),
      version: "v1"
    };

    await firebase.firestore()
      .collection("users")
      .doc(email)
      .collection("sync")
      .doc("v1")
      .set(payload, { merge: true });

    console.log("✅ [REMOTE-EXPORT] Exportación completada", payload);
    return payload;

  } catch (err) {
    console.error("❌ [REMOTE-EXPORT] Error:", err);
    return null;
  }
}


/* ============================================================
   5/5-C.3 — IMPORT
   Lee el documento remoto users/<email>/sync/v1
   NO escribe nada en localStorage todavía.
   ============================================================ */
async function CFC_syncRemote_import(email) {
  try {
    console.log("⬇️ [REMOTE-IMPORT] Leyendo remoto…", email);

    const snap = await firebase.firestore()
      .collection("users")
      .doc(email)
      .collection("sync")
      .doc("v1")
      .get();

    if (!snap.exists) {
      console.warn("⚠️ [REMOTE-IMPORT] No existe remoto — devolviendo {}");
      return {};
    }

    const remote = snap.data().data || {};

    console.log("✅ [REMOTE-IMPORT] Remoto leído correctamente:", remote);
    return remote;

  } catch (err) {
    console.error("❌ [REMOTE-IMPORT] Error:", err);
    return {};
  }
}


/* ============================================================
   5/5-C.4 — MERGE
   Arma el JSON final sin escribir local aún.
   Prioridad: LOCAL > REMOTO
   ============================================================ */
function CFC_syncRemote_merge(localData = {}, remoteData = {}) {

  console.log("🟦 [REMOTE-MERGE] Iniciando merge…");

  const finalData = { ...remoteData, ...localData };

  console.log("🟩 [REMOTE-MERGE] Merge completado", {
    remoteKeys: Object.keys(remoteData).length,
    localKeys: Object.keys(localData).length,
    finalKeys: Object.keys(finalData).length
  });

  return finalData;
}


/* ============================================================
   5/5-C.5 — RESTORE
   IMPORT remoto → READER local → MERGE → WRITER
   ============================================================ */
async function CFC_syncRemote_restore(email) {
  try {
    console.log("🔄 [REMOTE-RESTORE] Restauración iniciada…", email);

    const remoteData = await CFC_syncRemote_import(email);
    const localData = CFC_syncReader_collect();

    const finalData = CFC_syncRemote_merge(localData, remoteData);

    const result = CFC_syncWriter_run(finalData);

    console.log("🟢 [REMOTE-RESTORE] Restauración finalizada:", result);
    return result;

  } catch (err) {
    console.error("❌ [REMOTE-RESTORE] Error:", err);
    return null;
  }
}
