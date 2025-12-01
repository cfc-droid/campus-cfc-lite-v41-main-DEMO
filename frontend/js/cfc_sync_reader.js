/* ============================================================
   🧩 CFC-SYNC READER — SUBPASO 5/5-A (FIX OFICIAL V1.2)
   Archivo: /frontend/js/cfc_sync_reader.js
   Versión: CFC_SYNC_READER_v1.2 (QA-SYNC V42)
   Autor: CFC-Droid (Arquitecto QA-SYNC)
   Objetivo: Leer TODO el progreso del Campus desde localStorage,
   incluyendo todas las claves oficiales de progress_v2.js.
   ============================================================ */

(function() {

    console.log("🟦 [CFC-SYNC] Inicializando CFC_SYNC_READER_v1.2 ...", new Date().toISOString());

    // Namespace raíz
    window.CFC_SYNC_READER = {
        version: "1.2",
        lastCollect: null,

        // Allow-list EXTENDIDA oficial QA-SYNC V42
        allowedPrefixes: [
            "CFC_",              // Claves del Campus
            "progress",          // Compatibilidad mínima
            "exam",              // Resultados de exámenes
            "bitacora",          // Bitácora mental
            "activity",          // Tracker de actividad

            // 🔥 FIX CRÍTICO — progress_v2.js
            "progressData",
            "progressPercent",
            "studyStats",
            "CFC_time",
            "CFC_time_temp",
            "CFC_time_total",
            "CFC_days",
            "CFC_totalDays",
            "CFC_lastDate",
            "examResult",
            "examResults",
            "examResults_backup",
            "CFC_bitacora_"
        ]
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

            // Verificar si coincide con algún prefijo permitido
            const isValid = prefixes.some(pref => key.startsWith(pref));
            if (!isValid) continue;

            try {
                const raw = localStorage.getItem(key);
                let parsed = null;

                // Intentar parsear JSON
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

        console.log("🟢 [CFC-SYNC-READER] FIN IMPRESIÓN — v1.2");
        return data;
    };

    console.log("✅ CFC_SYNC_READER_READY v1.2", new Date().toISOString());

})();
