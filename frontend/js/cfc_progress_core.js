/* ============================================================================
   CFC_PROGRESS_CORE.JS — SISTEMA NUEVO DE PROGRESO V3 (Versión B2 CORREGIDA)
   ---------------------------------------------------------------------------
   FIX CRÍTICO: Aislamiento por usuario (progreso independiente para 200 users)
   ============================================================================ 
*/

(function() {

    // =========================================================================
    // IDENTIFICADOR ÚNICO DE USUARIO (prefix seguro)
    // =========================================================================
    const USER_KEY = (() => {
        const email = localStorage.getItem("CFC_EMAIL") || "guest";
        return email.replace(/[^a-zA-Z0-9]/g, "_");
    })();

    function userKey(key) {
        return `${USER_KEY}_${key}`;
    }

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
           ============================================================= */

        const progressData = safeParseJSON(localStorage.getItem(userKey("progressData")) || "{}", {});
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

        let highestPassed = (modulesCompleted > 0)
            ? Math.max.apply(null, completedModules)
            : 0;

        CFC_PROGRESS_V3.lastCompletedModule =
            highestPassed > 0 ? MODULES_FULL[highestPassed] : "—";

        let nextModuleIndex = highestPassed + 1;
        if (nextModuleIndex < 1) nextModuleIndex = 1;
        if (nextModuleIndex > 20) nextModuleIndex = 20;
        CFC_PROGRESS_V3.currentModule = MODULES_FULL[nextModuleIndex];

        CFC_PROGRESS_V3.percent = Math.floor((modulesCompleted / 20) * 100);

        /* =============================================================
           SUBPASO 3.4 — CÁLCULO DE TIEMPOS
           ============================================================= */

        const rawTotal = parseInt(localStorage.getItem(userKey("CFC_time_total")) || "0", 10);
        const rawToday = parseInt(localStorage.getItem(userKey("CFC_time_today")) || "0", 10);
        const savedDate = localStorage.getItem(userKey("CFC_today_date"));

        const now = new Date();
        const dd = String(now.getDate()).padStart(2, "0");
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const yyyy = now.getFullYear();
        const todayStr = `${dd}/${mm}/${yyyy}`;

        if (savedDate !== todayStr) {
            localStorage.setItem(userKey("CFC_today_date"), todayStr);
            localStorage.setItem(userKey("CFC_time_today"), "0");
        }

        const todaySeconds = parseInt(localStorage.getItem(userKey("CFC_time_today")) || "0", 10);

        const activeTotalMinutes = Math.floor(rawTotal / 60);
        const activeTodayMinutes = Math.floor(todaySeconds / 60);

        CFC_PROGRESS_V3.activeTotalMinutes = activeTotalMinutes;
        CFC_PROGRESS_V3.activeTodayMinutes = activeTodayMinutes;

        let avg = 0;
        if (modulesCompleted > 0 && activeTotalMinutes > 0) {
            avg = Math.round(activeTotalMinutes / modulesCompleted);
        }
        CFC_PROGRESS_V3.averageTimePerModule = avg;

        const remaining = 20 - modulesCompleted;
        CFC_PROGRESS_V3.estimatedTimeToFinish = remaining * avg;

        CFC_PROGRESS_V3.timeTotalText = fmtMinutesToText(activeTotalMinutes);
        CFC_PROGRESS_V3.timeTodayText = fmtMinutesToText(activeTodayMinutes);
        CFC_PROGRESS_V3.avgPerModuleText = fmtMinutesToText(avg);
        CFC_PROGRESS_V3.estimatedText = fmtMinutesToText(CFC_PROGRESS_V3.estimatedTimeToFinish);

        /* =============================================================
           SUBPASO 4.4 — FECHAS Y DÍAS DE ESTUDIO
           ============================================================= */

        const stats = safeParseJSON(localStorage.getItem(userKey("CFC_stats")) || "{}", {});

        const legacyLastDate = localStorage.getItem(userKey("CFC_lastDate"));
        const legacyTotalDaysRaw = localStorage.getItem(userKey("CFC_totalDays"));

        let fixedFirst = localStorage.getItem(userKey("CFC_firstSessionDate"));

        if (!fixedFirst && stats.firstSessionDate) {
            fixedFirst = stats.firstSessionDate;
            localStorage.setItem(userKey("CFC_firstSessionDate"), fixedFirst);
        }

        if (!fixedFirst) {
            fixedFirst = todayStr;
            localStorage.setItem(userKey("CFC_firstSessionDate"), fixedFirst);
        }

        CFC_PROGRESS_V3.firstSessionDate = fixedFirst;

        CFC_PROGRESS_V3.lastSessionDate =
            stats.lastSessionDate || legacyLastDate || todayStr;

        let totalDays = parseInt(legacyTotalDaysRaw || "0", 10);
        const lastDay = legacyLastDate;

        if (!isNaN(totalDays)) {
            if (lastDay !== todayStr) {
                totalDays += 1;
                localStorage.setItem(userKey("CFC_totalDays"), totalDays.toString());
                localStorage.setItem(userKey("CFC_lastDate"), todayStr);
            }
        } else {
            totalDays = activeTotalMinutes > 0 ? 1 : 0;
        }

        CFC_PROGRESS_V3.daysStudiedTotal = totalDays;

        return CFC_PROGRESS_V3;
    };

})();
