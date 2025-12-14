/* ============================================================================
   CFC_PROGRESS_SESSION_MANAGER.JS
   ---------------------------------------------------------------------------
   PRUEBA Nº 6 — AISLAMIENTO DEFINITIVO DE PROGRESO POR SESIÓN
   Campus CFC LITE V41
   ---------------------------------------------------------------------------
   OBJETIVO:
   - Garantizar que cada login tenga un estado de progreso en MEMORIA totalmente
     independiente, incluso en el mismo navegador y pestaña.
   - No modifica storage.
   - No rompe QA, Sync, Router ni Lock.
   ============================================================================ */

(function () {
  try {
    // ------------------------------------------------------------------------
    // 1) Resolver identidad de sesión actual
    // ------------------------------------------------------------------------
    const email = localStorage.getItem("CFC_EMAIL") || "guest";
    const sessionId = localStorage.getItem("CFC_SESSION_ID") || "no-session";

    const currentSessionSignature = `${email}::${sessionId}`;

    // ------------------------------------------------------------------------
    // 2) Leer última sesión registrada en ESTA pestaña
    // ------------------------------------------------------------------------
    const lastSessionSignature =
      sessionStorage.getItem("CFC_PROGRESS_SESSION_SIGNATURE");

    // ------------------------------------------------------------------------
    // 3) Detectar cambio real de sesión
    // ------------------------------------------------------------------------
    if (lastSessionSignature !== currentSessionSignature) {
      console.warn(
        "🧪 PRUEBA 6 → Cambio de sesión detectado",
        {
          anterior: lastSessionSignature,
          actual: currentSessionSignature
        }
      );

      // ------------------------------------------------------------
      // 4) Invalidar estado de progreso en MEMORIA (clave)
      // ------------------------------------------------------------
      if (window.CFC_getProgressV3) {
        // Eliminar referencia global para forzar reconstrucción limpia
        try {
          delete window.CFC_PROGRESS_V3;
        } catch (_) {
          // fallback silencioso
          window.CFC_PROGRESS_V3 = null;
        }
      }

      // ------------------------------------------------------------
      // 5) Marcar nueva sesión activa
      // ------------------------------------------------------------
      sessionStorage.setItem(
        "CFC_PROGRESS_SESSION_SIGNATURE",
        currentSessionSignature
      );

      console.log(
        "✅ PRUEBA 6 → Progreso reinicializado en memoria para sesión:",
        currentSessionSignature
      );
    } else {
      console.log(
        "🧠 PRUEBA 6 → Sesión intacta, progreso en memoria preservado:",
        currentSessionSignature
      );
    }

  } catch (err) {
    console.error("❌ PRUEBA 6 → Error en Session Manager:", err);
  }
})();
