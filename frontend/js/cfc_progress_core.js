/* ============================================================================
   CFC_PROGRESS_CORE.JS — SISTEMA NUEVO DE PROGRESO V3
   ---------------------------------------------------------------------------
   FASE 2/5 — SUBPASO 1.4 + SUBPASO 2.4 + SUBPASO 3.4 + SUBPASO 4.4
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
        "",
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
    // OBJETO CENTRAL DEL SISTEMA
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

        percent: 0,

        // Versiones con texto
        timeTotalText: "0 h 00 min",
        timeTodayText: "0 h 00 min",
        avgPerModuleText: "0 h 00 min",
        estimatedText: "0 h 00 min"
    };

    // =========================================================================
    // FUNCIÓN GLOBAL: CFC_getProgressV3()
    // =========================================================================
    window.CFC_getProgressV3 = function () {

        /* =============================================================
           SUBPASO 2.4 — CÁLCULO DE MÓDULOS
           - AHORA USANDO progressData.completed (igual que la barra 5%)
           ============================================================= */

        const progressData = safeParseJSON(localStorage.getItem("progressData") || "{}", {});
        const completedRaw = Array.isArray(progressData.completed) ? progressData.completed : [];

        // Normalizar a números 1..20 (acepta ["mod1", "mod2"] o [1,2])
        const completedModules = completedRaw
            .map(item => {
                if (typeof item === "number") return item;
                if (typeof item === "string") {
                    const match = item.match(/(\d+)/);
                    return match ? parseInt(match[1], 10) : null;
                }
                return null;
            })
            .filter(n => typeof n === "number" && n >= 1 && n <= 20);

        const modulesCompleted = completedModules.length;
        CFC_PROGRESS_V3.modulesCompleted = modulesCompleted;

        let highestPassed = 0;
        if (modulesCompleted > 0) {
            highestPassed = Math.max.apply(null, completedModules);
        }

        // Último módulo completado
        if (highestPassed > 0) {
            CFC_PROGRESS_V3.lastCompletedModule = MODULES_FULL[highestPassed] || "—";
        } else {
            CFC_PROGRESS_V3.lastCompletedModule = "—";
        }

        // Módulo actual sugerido (el siguiente al último aprobado, mínimo 1, máximo 20)
        let nextModuleIndex = highestPassed + 1;
        if (nextModuleIndex < 1) nextModuleIndex = 1;
        if (nextModuleIndex > 20) nextModuleIndex = 20;
        CFC_PROGRESS_V3.currentModule = MODULES_FULL[nextModuleIndex] || "—";

        // Porcentaje global
        CFC_PROGRESS_V3.percent = Math.floor((modulesCompleted / 20) * 100);

        /* =============================================================
           SUBPASO 3.4 — CÁLCULO DE TIEMPOS
           ============================================================= */

        const rawTotal = localStorage.getItem("CFC_time_total");
        const rawToday = localStorage.getItem("CFC_time_today");

        const totalSeconds = rawTotal ? parseInt(rawTotal, 10) : 0;
        const todaySeconds = rawToday ? parseInt(rawToday, 10) : 0;

        const activeTotalMinutes = Math.floor(totalSeconds / 60);
        const activeTodayMinutes = Math.floor(todaySeconds / 60);

        CFC_PROGRESS_V3.activeTotalMinutes = activeTotalMinutes;
        CFC_PROGRESS_V3.activeTodayMinutes = activeTodayMinutes;

        let avg = 0;
        if (modulesCompleted > 0 && activeTotalMinutes > 0) {
            avg = Math.round(activeTotalMinutes / modulesCompleted);
        }
        CFC_PROGRESS_V3.averageTimePerModule = avg;

        const remaining = 20 - modulesCompleted;
        const estimated = remaining * avg;
        CFC_PROGRESS_V3.estimatedTimeToFinish = estimated;

        CFC_PROGRESS_V3.timeTotalText = fmtMinutesToText(activeTotalMinutes);
        CFC_PROGRESS_V3.timeTodayText = fmtMinutesToText(activeTodayMinutes);
        CFC_PROGRESS_V3.avgPerModuleText = fmtMinutesToText(avg);
        CFC_PROGRESS_V3.estimatedText = fmtMinutesToText(estimated);

        /* =============================================================
           SUBPASO 4.4 — FECHAS Y DÍAS DE ESTUDIO
           - Compatibilidad con CFC_stats y claves antiguas
           ============================================================= */

        const rawStats = localStorage.getItem("CFC_stats");
        const stats = rawStats ? safeParseJSON(rawStats, {}) : {};

        // Fecha actual formateada dd/mm/yyyy
        const today = new Date();
        const dd = String(today.getDate()).padStart(2, "0");
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const yyyy = today.getFullYear();
        const todayStr = `${dd}/${mm}/${yyyy}`;

        // Legacy: última fecha usada antes (por si CFC_stats aún no está completo)
        const legacyLastDate = localStorage.getItem("CFC_lastDate") || null;
        const legacyTotalDaysRaw = localStorage.getItem("CFC_totalDays");

        // Primera sesión
        if (stats.firstSessionDate) {
            CFC_PROGRESS_V3.firstSessionDate = stats.firstSessionDate;
        } else if (legacyLastDate) {
            // Si no tenemos firstSessionDate, al menos usamos alguna fecha conocida
            CFC_PROGRESS_V3.firstSessionDate = legacyLastDate;
        } else {
            CFC_PROGRESS_V3.firstSessionDate = todayStr;
        }

        // Última sesión
        if (stats.lastSessionDate) {
            CFC_PROGRESS_V3.lastSessionDate = stats.lastSessionDate;
        } else if (legacyLastDate) {
            CFC_PROGRESS_V3.lastSessionDate = legacyLastDate;
        } else {
            CFC_PROGRESS_V3.lastSessionDate = CFC_PROGRESS_V3.firstSessionDate;
        }

        // Días de estudio (prioridad: stats.daysStudiedTotal > CFC_totalDays > estimación mínima)
        if (typeof stats.daysStudiedTotal === "number") {
            CFC_PROGRESS_V3.daysStudiedTotal = stats.daysStudiedTotal;
        } else if (legacyTotalDaysRaw !== null && !isNaN(parseInt(legacyTotalDaysRaw, 10))) {
            CFC_PROGRESS_V3.daysStudiedTotal = parseInt(legacyTotalDaysRaw, 10);
        } else {
            CFC_PROGRESS_V3.daysStudiedTotal = activeTotalMinutes > 0 ? 1 : 0;
        }

        return CFC_PROGRESS_V3;
    };

})();
