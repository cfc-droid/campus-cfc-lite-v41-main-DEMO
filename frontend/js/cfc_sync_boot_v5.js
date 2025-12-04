// ============================================================
// 🧩 CFC SYNC — BOOT V5 (REAL)
// Restauración automática al iniciar sesión
// Combina progreso LOCAL + REMOTO y lo escribe seguro
// ============================================================

window.CFC_syncBootV5_start = async (email) => {
    console.log("🔵 BOOT V5 — iniciado para:", email);

    try {
        // ------------------------------------------
        // 1) Leer Reader V5 (local + remoto)
        // ------------------------------------------
        const merged = await window.CFC_syncReaderV5(email);

        console.log("🟣 BOOT V5 — progreso combinado (merged):", merged);

        // ------------------------------------------
        // 2) Restaurar (escribir progreso local ANTES de entrar)
        // ------------------------------------------
        window.CFC_syncWriterV5(merged);

        console.log("🟢 CFC_SYNC_BOOT_V5_OK — Progreso restaurado");

    } catch (err) {
        console.error("❌ BOOT V5 ERROR:", err);
    }
};
