/* ============================================================
   🧩 CFC-SYNC READER — SUBPASO 5/5-A
   Archivo: /frontend/js/cfc_sync_reader.js
   Versión: CFC_SYNC_READER_v1.1
   Autor: CFC-Droid (Arquitecto QA-SYNC)
   Objetivo: Leer TODO el progreso del Campus desde localStorage.
   ============================================================ */

(function() {

    console.log("🟦 [CFC-SYNC] Inicializando CFC_SYNC_READER_v1.1 ...", new Date().toISOString());

    // Namespace raíz
    window.CFC_SYNC_READER = {
        version: "1.1",
        lastCollect: null,
        allowedPrefixes: ["CFC_", "exam", "progress", "bitacora", "activity"]
    };

    // ============================================================
    // 🟩 ACCIÓN 5/5-A.2 — FUNCIÓN REAL DE RECOLECCIÓN
    // ============================================================
    window.CFC_syncReader_collect = function() {

        console.log("🔍 [CFC-SYNC-READER] Ejecutando colecta de progreso...", new Date().toISOString());

        const result = {};
        const prefixes = window.CFC_SYNC_READER.allowedPrefixes;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            // Revisar si la clave coincide con algún prefijo válido
            const isValid = prefixes.some(pref => key.startsWith(pref));
            if (!isValid) continue;

            try {
                // Intentar parsear JSON; si falla, guardar como string simple
                const raw = localStorage.getItem(key);
                let parsed = null;

                try {
                    parsed = JSON.parse(raw);
                } catch (e) {
                    parsed = raw;
                }

                result[key] = parsed;

            } catch (err) {
                console.error("❌ [CFC-SYNC-READER] Error leyendo clave:", key, err);
            }
        }

        window.CFC_SYNC_READER.lastCollect = result;

        console.log("✅ [CFC-SYNC-READER] Colecta completada. Total claves:", Object.keys(result).length);
        return result;
    };

    // ============================================================
    // 🟩 ACCIÓN 5/5-A.3 — FUNCIÓN DE IMPRESIÓN
    // ============================================================
    window.CFC_syncReader_print = function() {
        console.log("📘 [CFC-SYNC-READER] Iniciando impresión del progreso local...");

        const data = window.CFC_syncReader_collect();

        console.log("🧩 [CFC-SYNC-READER] PROGRESS JSON ↓↓↓");
        console.log(JSON.stringify(data, null, 2));

        console.log("🟢 [CFC-SYNC-READER] FIN IMPRESIÓN — v1.1");
        return data;
    };

    // ============================================================
    console.log("✅ CFC_SYNC_READER_READY v1.1", new Date().toISOString());

})();
