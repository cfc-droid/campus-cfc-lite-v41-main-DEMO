/* ============================================================================
   CFC_PROGRESS_CORE.JS — SISTEMA NUEVO DE PROGRESO V3
   ---------------------------------------------------------------------------
   FASE 2/5 — SUBPASO 1.4 + SUBPASO 2.4 (solo módulos)
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
    // TABLA COMPLETA DE MÓDULOS (NOMBRES EXACTOS DEL CAMPUS V41)
    // =========================================================================
    const MODULES_FULL = [
        "", // posición 0 vacía para usar índices del 1 al 20
        "Módulo 1 – Introducción a la Psicología del Trader",
        "Módulo 2 – Neurociencia del Trading",
        "Módulo 3 – Fundamentos de Psicología Profunda",
        "Módulo 4 – Modelo Mental del Trader Profesional",
        "Módulo 5 – Herramientas Avanzadas de Regulación Emocional",
        "Módulo 6 – Psicología de la Gestión del Capital",
        "Módulo 7 – Estrategias Psicológicas por Etapas",
        "Módulo 8 – Integración Estrategia–Psicología",
        "Módulo 9 – Casos de Estudio y Simulaciones Reales",
        "Módulo 10 – Optimización Mental y Rendimiento Peak",
        "Módulo 11 – Ecosistema de Apoyo y Herramientas",
        "Módulo 12 – Maestría Continua y Legado",
        "Módulo 13 – Psicología del Error y Reprogramación Mental",
        "Módulo 14 – El Mapa del Autocontrol Extremo",
        "Módulo 15 – Arquitectura del Trading Mental Automático",
        "Módulo 16 – Reversión Psicológica y Superación del Burnout",
        "Módulo 17 – Psicología del Trader de Alto Impacto",
        "Módulo 18 – La Mentalidad del Mentor Trader",
        "Módulo 19 – Integración Total Cuerpo–Mente–Mercado",
        "Módulo 20 – Legado Final del Trader Consciente"
    ];

    // =========================================================================
    // OBJETO CENTRAL DEL SISTEMA (se irá llenando)
    // =========================================================================
    const CFC_PROGRESS_V3 = {
        modulesCompleted: 0,
        lastCompletedModule: "—",
        currentModule: "—",

        firstSessionDate: "—",
        lastSessionDate: "—",
        daysStudiedTotal: 0,

        activeTotalMinutes: 0,
        activeTodayMinutes: 0,
        averageTimePerModule: 0,
        estimatedTimeToFinish: 0,

        percent: 0
    };

    // =========================================================================
    // FUNCIÓN GLOBAL: CFC_getProgressV3()
    // =========================================================================
    window.CFC_getProgressV3 = function () {

        /* =============================================================
           SUBPASO 2.4 — CÁLCULO DE MÓDULOS
           ============================================================= */

        let modulesCompleted = 0;
        let highestPassed = 0;

        // Leer mod1_score a mod20_score
        for (let i = 1; i <= 20; i++) {
            const raw = localStorage.getItem(`mod${i}_score`);
            const score = raw ? parseInt(raw, 10) : 0;

            if (score >= 3) {
                modulesCompleted++;
                highestPassed = i;
            }
        }

        // Guardar cantidad
        CFC_PROGRESS_V3.modulesCompleted = modulesCompleted;

        // Determinar último módulo completado
        if (highestPassed > 0) {
            CFC_PROGRESS_V3.lastCompletedModule = MODULES_FULL[highestPassed];
        } else {
            CFC_PROGRESS_V3.lastCompletedModule = "—";
        }

        // Determinar módulo actual
        let nextModule = highestPassed + 1;
        if (nextModule > 20) nextModule = 20; // límite superior
        CFC_PROGRESS_V3.currentModule = MODULES_FULL[nextModule];

        // Calcular barra de progreso
        CFC_PROGRESS_V3.percent = Math.floor((modulesCompleted / 20) * 100);

        // =============================================================
        // AÚN NO CALCULAMOS TIEMPOS NI FECHAS (OTROS SUBPASOS)
        // =============================================================

        return CFC_PROGRESS_V3;
    };

})();
