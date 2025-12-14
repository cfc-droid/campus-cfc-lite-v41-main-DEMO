/* ============================================================================
   CFC_DAILY_INIT.JS — Sistema diario real para V41
   ---------------------------------------------------------------------------
   - Genera CFC_time_today
   - Incrementa CFC_totalDays solo 1 vez por día
   - Actualiza CFC_lastDate
   - NO interfiere con ningún archivo existente
   ============================================================================ */

(function() {

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const todayStr = `${dd}/${mm}/${yyyy}`;

    const lastDate = localStorage.getItem("CFC_lastDate");
    let totalDays = parseInt(localStorage.getItem("CFC_totalDays") || "0", 10);

if (!lastDate) {

    // 🔹 NO TOCAR LA PRIMERA SESIÓN SI YA EXISTE (SISTEMA NUEVO)
    let fixedFirst = localStorage.getItem("CFC_firstSessionDate");
    if (!fixedFirst) {
        // Primera vez real → fijar fecha inicial
        fixedFirst = todayStr;
        localStorage.setItem("CFC_firstSessionDate", fixedFirst);
    }

    // 🔹 Inicializar el sistema diario sin romper la primera sesión
    localStorage.setItem("CFC_lastDate", todayStr);
    localStorage.setItem("CFC_totalDays", "1");
    localStorage.setItem("CFC_time_today", "0");

    return;
}

    // ---- Día nuevo detectado ----
    if (lastDate !== todayStr) {
        totalDays += 1;
        localStorage.setItem("CFC_lastDate", todayStr);
        localStorage.setItem("CFC_totalDays", totalDays.toString());
        localStorage.setItem("CFC_time_today", "0");
        return;
    }

    // ---- Mismo día: asegurar que exista el contador ----
    if (!localStorage.getItem("CFC_time_today")) {
        localStorage.setItem("CFC_time_today", "0");
    }

})();
