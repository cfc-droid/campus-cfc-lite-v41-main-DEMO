/* ============================================================================
   CFC_PROGRESS_CORE.JS — SISTEMA NUEVO DE PROGRESO V3 (Versión B2)
   ---------------------------------------------------------------------------
   FASE 2/5 — SUBPASO 1.4 + SUBPASO 2.4 + SUBPASO 3.4 + SUBPASO 4.4
   + REPARACIÓN PRUEBA 2 (Tiempo hoy + Días totales real)
   + FIX PRUEBA 4 — RESET DURO DE PROGRESO CUANDO NO EXISTE DATA
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
    // OBJETO CENTRAL DEL SISTEMA (SINGLETON EN MEMORIA)
    // =========================================================================
    const CFC_PROGRESS_V3 = {};

    // =========================================================================
    // RESET DURO — FIX PRUEBA 4 (CRÍTICO)
    // =========================================================================
    function resetProgressObject() {
        CFC_PROGRESS_V3.modulesCompleted = 0;
        CFC_PROGRESS_V3.lastCompletedModule = "—";
        CFC_PROGRESS_V3.currentModule = MODULES_FULL[1];

        CFC_PROGRESS_V3.firstSessionDate = "—";
        CFC_PROGRESS_V3.lastSessionDate = "—";
        CFC_PROGRESS_V3.daysStudiedTotal = 0;

        CFC_PROGRESS_V3.activeTotalMinutes = 0;
        CFC_PROGRESS_V3.activeTodayMinutes = 0;
        CFC_PROGRESS_V3.averageTimePerModule = 0;
        CFC_PROGRESS_V3.estimatedTimeToFinish = 0;

        CFC_PROGRESS_V3.percent = 0;

        CFC_PROGRESS_V3.timeTotalText = "0 h 00 min";
        CFC_PROGRESS_V3.timeTodayText = "0 h 00 min";
        CFC_PROGRESS_V3.avgPerModuleText = "0 h 00 min";
        CFC_PROGRESS_V3.estimatedText = "0 h 00 min";
    }

    // =========================================================================
    // FUNCIÓN GLOBAL: CFC_getProgressV3()
    // =========================================================================
    window.CFC_getProgressV3 = function () {

        /* =============================================================
           FIX PRUEBA 4 — DETECCIÓN DE USUARIO SIN PROGRESO
           ============================================================= */

        const rawProgress = localStorage.getItem("progressData");

        if (!rawProgress) {
            console.warn("⚠️ CFC_PROGRESS_CORE: progreso inexistente → RESET DURO aplicado");
            resetProgressObject();
            return CFC_PROGRESS_V3;
        }

        /* =============================================================
           SUBPASO 2.4 — CÁLCULO DE MÓDULOS
           ============================================================= */

        const progressData = safeParseJSON(rawProgress, {});
        const completedRaw = Array.isArray(progressData.completed) ? progressData.completed : [];

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

        const highestPassed = modulesCompleted > 0
            ? Math.max.apply(null, completedModules)
            : 0;

        CFC_PROGRESS_V3.lastCompletedModule =
            highestPassed > 0 ? MODULES_FULL[highestPassed] : "—";

        const nextModuleIndex = Math.min(Math.max(highestPassed + 1, 1), 20);
        CFC_PROGRESS_V3.currentModule = MODULES_FULL[nextModuleIndex];

        CFC_PROGRESS_V3.percent = Math.floor((modulesCompleted / 20) * 100);

        /* =============================================================
           SUBPASO 3.4 — TIEMPOS
           ============================================================= */

        const rawTotal = parseInt(localStorage.getItem("CFC_time_total") || "0", 10);
        const rawToday = parseInt(localStorage.getItem("CFC_time_today") || "0", 10);
        const savedDate = localStorage.getItem("CFC_today_date");

        const now = new Date();
        const dd = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const yyyy = now.getFullYear();
        const todayStr = `${dd}/${mm}/${yyyy}`;

        if (savedDate !== todayStr) {
            localStorage.setItem("CFC_today_date", todayStr);
            localStorage.setItem("CFC_time_today", "0");
        }

        const todaySeconds = parseInt(localStorage.getItem("CFC_time_today") || "0", 10);

        const activeTotalMinutes = Math.floor(rawTotal / 60);
        const activeTodayMinutes = Math.floor(todaySeconds / 60);

        CFC_PROGRESS_V3.activeTotalMinutes = activeTotalMinutes;
        CFC_PROGRESS_V3.activeTodayMinutes = activeTodayMinutes;

        const avg = (modulesCompleted > 0 && activeTotalMinutes > 0)
            ? Math.round(activeTotalMinutes / modulesCompleted)
            : 0;

        CFC_PROGRESS_V3.averageTimePerModule = avg;
        CFC_PROGRESS_V3.estimatedTimeToFinish = (20 - modulesCompleted) * avg;

        CFC_PROGRESS_V3.timeTotalText = fmtMinutesToText(activeTotalMinutes);
        CFC_PROGRESS_V3.timeTodayText = fmtMinutesToText(activeTodayMinutes);
        CFC_PROGRESS_V3.avgPerModuleText = fmtMinutesToText(avg);
        CFC_PROGRESS_V3.estimatedText = fmtMinutesToText(CFC_PROGRESS_V3.estimatedTimeToFinish);

        /* =============================================================
           SUBPASO 4.4 — FECHAS
           ============================================================= */

        const stats = safeParseJSON(localStorage.getItem("CFC_stats") || "{}", {});
        let firstSession = localStorage.getItem("CFC_firstSessionDate");

        if (!firstSession && stats.firstSessionDate) {
            firstSession = stats.firstSessionDate;
            localStorage.setItem("CFC_firstSessionDate", firstSession);
        }

        if (!firstSession) {
            firstSession = todayStr;
            localStorage.setItem("CFC_firstSessionDate", firstSession);
        }

        CFC_PROGRESS_V3.firstSessionDate = firstSession;
        CFC_PROGRESS_V3.lastSessionDate = stats.lastSessionDate || todayStr;

        let totalDays = parseInt(localStorage.getItem("CFC_totalDays") || "0", 10);
        const lastDay = localStorage.getItem("CFC_lastDate");

        if (lastDay !== todayStr) {
            totalDays += 1;
            localStorage.setItem("CFC_totalDays", totalDays.toString());
            localStorage.setItem("CFC_lastDate", todayStr);
        }

        CFC_PROGRESS_V3.daysStudiedTotal = totalDays;

        return CFC_PROGRESS_V3;
    };

})();
