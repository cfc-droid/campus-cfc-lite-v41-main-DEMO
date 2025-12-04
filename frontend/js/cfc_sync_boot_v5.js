// ============================================================
// 🧩 CFC SYNC — BOOT V5
// Restauración automática al iniciar sesión
// ============================================================

window.CFC_syncBootV5_start = async (email) => {
    console.log("🔵 BOOT V5 — iniciado", email);

    // Traer progreso remoto
    const remote = await CFC_syncRemoteV5_import(email);

    // Leer progreso local
    const local = CFC_syncReaderV5();

    // Fusionar (prioridad al remoto si existe)
    const merged = { ...local, ...remote };

    console.log("🟣 BOOT V5 — merged:", merged);

    // Restaurar progreso
    CFC_syncWriterV5(merged);

    console.log("🟢 CFC_SYNC_BOOT_V5_OK");
};
