/* ============================================================================
   CFC_PROGRESS_CORE.JS — SISTEMA NUEVO DE PROGRESO V3
   ---------------------------------------------------------------------------
   FASE 2/5 — SUBPASO 1.4
   Crear archivo base + helpers + estructura interna.
   NO calcular nada todavía.
   NO leer LocalStorage aún.
   ============================================================================
*/

(function() {

    // =========================================================================
    // HELPER: Lectura segura de JSON almacenado en LocalStorage
    // =========================================================================
    function safeParseJSON(value, fallback = {}) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return fallback;
        }
    }

    // =========================================================================
    // HELPER: Convertir minutos a texto "H h M min"
    // =========================================================================
    function fmtMinutesToText(min) {
        if (!min || isNaN(min) || min < 0) return "0 h 00 min";
        const h = Math.floor(min / 60);
        const m = Math.floor(min % 60);
        return `${h} h ${m.toString().padStart(2, "0")} min`;
    }

    // =========================================================================
    // OBJETO CENTRAL DEL SISTEMA (vacío por ahora)
    // =========================================================================
    const CFC_PROGRESS_V3 = {
        modulesCompleted: 0,
        lastCompletedModule: "—",
        currentModule: "—",
        firstSessionDate: "—",
        lastSessionDate: "—",
        daysStudiedTotal: 0,

        activeTotalMinutes: 0,     // número puro
        activeTodayMinutes: 0,     // número puro
        averageTimePerModule: 0,   // número puro
        estimatedTimeToFinish: 0,  // número puro

        percent: 0                 // barra de progreso
    };

    // =========================================================================
    // FUNCIÓN GLOBAL: Punto de entrada del Sistema V3
    // (Aún no calcula nada; solo devuelve el objeto base)
    // =========================================================================
    window.CFC_getProgressV3 = function () {
        // 1) Leer fuentes (próximos subpasos)
        // 2) Calcular campos (próximos subpasos)
        // 3) Devolver objeto completo
        return CFC_PROGRESS_V3;
    };

})();
