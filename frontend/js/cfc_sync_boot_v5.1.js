/************************************************************
 *  CFC SYNC BOOT V5.1 — ORQUESTADOR DEL SISTEMA COMPLETO
 *  ---------------------------------------------------------
 *  Flujo:
 *   1. Import remoto
 *   2. Lectura local (Reader)
 *   3. Merge
 *   4. Escritura local (Writer)
 *   5. Export remoto
 *
 *  Requisitos:
 *   - window.CFC_DB ya cargado
 *   - Los 4 archivos previos del SYNC cargados:
 *       • cfc_sync_reader_v5.1.js
 *       • cfc_sync_merge_v5.1.js
 *       • cfc_sync_writer_v5.1.js
 *       • cfc_sync_remote_v5.1.js
 ************************************************************/

async function CFC_syncBootV51(email) {
  console.log("🚀 SYNC BOOT V5.1 iniciado para:", email);

  try {
    if (!email) {
      console.warn("⚠️ CFC_syncBootV51: email vacío, cancelado");
      return;
    }

    if (!window.CFC_DB) {
      console.error("❌ Firestore no está inicializado (CFC_DB no existe)");
      return;
    }

    // 1. REMOTE IMPORT
    const remote = await CFC_syncRemoteV51_import(email);
    console.log("⬇️ Remote import:", remote);

    // 2. LOCAL READER
    const local = CFC_syncReaderV51();
    console.log("📥 Local reader:", local);

    // 3. MERGE
    const merged = CFC_syncMergeV51(local, remote);
    console.log("🔀 Merge result:", merged);

    // 4. WRITE LOCAL
    CFC_syncWriterV51(merged);
    console.log("💾 Writer local completado");

    // 5. REMOTE EXPORT
    await CFC_syncRemoteV51_export(email, merged);
    console.log("⬆️ Remote export completado");

    console.log("✅ SYNC BOOT V5.1 FINALIZADO — Estado unificado OK");

  } catch (err) {
    console.error("❌ Error grave en CFC_syncBootV51:", err);
  }
}
