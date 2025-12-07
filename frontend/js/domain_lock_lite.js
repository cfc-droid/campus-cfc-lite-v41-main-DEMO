/* ============================================================
   CFC TRADING LITE — DOMAIN LOCK LITE (Versión Seguridad 4/5-E)
   ------------------------------------------------------------
   Objetivo:
   - Bloquear acceso por file://
   - Bloquear localhost
   - Bloquear dominios no autorizados
   - Bloquear ejecución en iframe
   - Bloquear WebViews de apps (FB, IG, Android WebView)
   - NO tocar login, progreso, Firebase, guard, licencias
   - NO generar loops
   ============================================================ */

(function () {
    // -----------------------------------------
    // 1) LISTA DE DOMINIOS PERMITIDOS
    // (El usuario luego ajusta estos valores)
    // -----------------------------------------
const ALLOWED_HOSTS = [
    "campus-cfc-lite-v41-main-demo.pages.dev"
];

    // -----------------------------------------
    // 2) DETECCIÓN DE IFRAMES
    // -----------------------------------------
    try {
        if (window.self !== window.top) {
            window.location.href = "/frontend/blocked.html";
            return;
        }
    } catch (err) {
        window.location.href = "/frontend/blocked.html";
        return;
    }

    // -----------------------------------------
    // 3) DETECCIÓN DE WEBVIEW
    // -----------------------------------------
    const ua = navigator.userAgent.toLowerCase();
    const isWebView =
        ua.includes("wv") ||               // Android WebView
        ua.includes("fbav") ||             // Facebook App
        ua.includes("fb_iab") ||           // Facebook WebView interno
        ua.includes("instagram") ||        // Instagram WebView
        ua.includes("line/") ||            // LINE
        ua.includes("okhttp") ||           // Android embebido
        /\bVersion\/[\d.]+.*Safari\b/.test(ua) && !/chrome|crios|fxios/.test(ua); // iOS WebView

    if (isWebView) {
        window.location.href = "/frontend/blocked.html";
        return;
    }

    // -----------------------------------------
    // 4) BLOQUEAR file://
    // -----------------------------------------
    if (window.location.protocol === "file:") {
        window.location.href = "/frontend/blocked.html";
        return;
    }

    // -----------------------------------------
    // 5) BLOQUEAR localhost
    // -----------------------------------------
    const host = window.location.hostname.toLowerCase();

    if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host === "::1"
    ) {
        window.location.href = "/frontend/blocked.html";
        return;
    }

    // -----------------------------------------
    // 6) VALIDAR DOMINIO PERMITIDO
    // -----------------------------------------
    const isAllowed = ALLOWED_HOSTS.some((allowed) => host === allowed);

    if (!isAllowed) {
        window.location.href = "/frontend/blocked.html";
        return;
    }

    // -----------------------------------------
    // 7) SI TODO ESTÁ OK → PERMITIR CONTINUAR
    // -----------------------------------------
    // No hace nada más. Campus continúa normalmente.
})();
