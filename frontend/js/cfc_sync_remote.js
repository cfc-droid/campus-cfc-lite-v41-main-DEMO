/* ============================================================
   🔵 CFC-SYNC REMOTE V1.2 — SUBPASO 5/5-C (FINAL)
   Gestión remota segura: EXPORT / IMPORT / MERGE / RESTORE
   Ubicación remota: users/<email>/sync/v1
   29-11-2025 — CFC-SYNC ENGINE (Protección extendida)
   ============================================================ */

console.log("🟦 CFC_SYNC_REMOTE_READY — Archivo remoto cargado", new Date().toLocaleString());

/* ============================================================
   5/5-C.2 — EXPORT
   Guarda TODO el JSON local en Firestore
   ============================================================ */
async function CFC_syncRemote_export(email) {

  // 🛡 VALIDACIÓN DE EMAIL
  if (!email || typeof email !== "string") {
    console.error("❌ [REMOTE-EXPORT] Email inválido:", email);
    return null;
  }

  try {
    console.log("⬆️ [REMOTE-EXPORT] Iniciando exportación…", email);

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
   Lee remoto sin modificar localStorage
   ============================================================ */
async function CFC_syncRemote_import(email) {

  // 🛡 VALIDACIÓN DE EMAIL
  if (!email || typeof email !== "string") {
    console.error("❌ [REMOTE-IMPORT] Email inválido:", email);
    return null;
  }

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
   5/5-C.4 — MERGE (LOCAL > REMOTO)
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
   IMPORT → MERGE → FILTRO SEGURIDAD → WRITER
   ============================================================ */
async function CFC_syncRemote_restore(email) {

  // 🛡 VALIDACIÓN DE EMAIL
  if (!email || typeof email !== "string") {
    console.error("❌ [REMOTE-RESTORE] Email inválido:", email);
    return null;
  }

  try {
    console.log("🔄 [REMOTE-RESTORE] Restauración iniciada…", email);

    const remoteData = await CFC_syncRemote_import(email);
    const localData = CFC_syncReader_collect();

    let finalData = CFC_syncRemote_merge(localData, remoteData);

    // 🛡 FILTRO DE SEGURIDAD (CRÍTICO)
    const blocked = ["CFC_SESSION", "CFC_DEVICE", "CFC_HEART", "CFC_LOCK"];
    for (let key in finalData) {
      if (blocked.some(prefix => key.startsWith(prefix))) {
        console.warn("⛔ [REMOTE-RESTORE] Clave remota prohibida eliminada:", key);
        delete finalData[key];
      }
    }

    const result = CFC_syncWriter_run(finalData);

    console.log("🟢 [REMOTE-RESTORE] Restauración finalizada:", result);
    return result;

  } catch (err) {
    console.error("❌ [REMOTE-RESTORE] Error:", err);
    return null;
  }
}


/* ============================================================
   FIN DEL ARCHIVO + MENSAJE DE PRUEBAS
   ============================================================ */

console.log("🧪 CFC-SYNC REMOTE listo para pruebas manuales desde consola.");
