/* ======================================================================
   🔒 CFC-LOCK ONLINE V72-FINAL — domain_lock_v72.js
   Protección de dominio / contexto / entorno (Cloudflare Pages)
   ----------------------------------------------------------------------
   Valida:
   ✔ Dominio permitido
   ✔ No file://
   ✔ No localhost
   ✔ No iframe
   ✔ No WebView sospechoso
   ✔ Referrer válido
   Resultado:
   → Si algo falla: redirige a /frontend/blocked.html
   → Si todo está OK: window.CFC_DOMAIN_OK = true
   ====================================================================== */

(function CFC_DOMAIN_LOCK_V72() {
  try {
    console.log("🔒 CFC-LOCK V72 → Domain Lock inicializado");

    /* -------------------------
       1) Lista de dominios permitidos
       ------------------------- */
    const allowedHosts = [
      "campus-cfc-lite-v41-main-demo.pages.dev",
      "campuscfc.com",
      "campuscfc.pages.dev"
    ];

    const host = (location.hostname || "").toLowerCase();
    const isAllowed = allowedHosts.some(h => host.endsWith(h));

    /* -------------------------
       2) Contextos prohibidos
       ------------------------- */
    const isFile = location.protocol === "file:";
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const inIframe = window.top !== window.self;

    /* -------------------------
       3) WebViews sospechosas
       ------------------------- */
    const ua = navigator.userAgent || "";
    const isWebView =
      ua.includes("FBAN") || ua.includes("FBAV") ||
      ua.includes("Instagram") || ua.includes("Line/") ||
      ua.includes("wv)");

    /* -------------------------
       4) Referrer inválido
       ------------------------- */
    const ref = document.referrer || "";
    const badRef =
      ref.length > 0 &&
      !allowedHosts.some(h => ref.includes(h));

    /* -------------------------
       5) Condición general
       ------------------------- */
    if (!isAllowed || isFile || isLocal || inIframe || isWebView || badRef) {
      console.warn("🚫 CFC-LOCK V72 → Acceso bloqueado:", {
        isAllowed,
        isFile,
        isLocal,
        inIframe,
        isWebView,
        badRef,
        host,
        ref
      });

      window.location.href = "/frontend/js/blocked.html";
      return;
    }

    /* -------------------------
       6) Si todo OK → habilitar campus
       ------------------------- */
    window.CFC_DOMAIN_OK = true;
    console.log("🔓 CFC-LOCK V72 → Dominio autorizado");

  } catch (err) {
    console.error("❌ CFC-LOCK V72 → Error inesperado:", err);
    window.location.href = "/frontend/blocked.html";
  }
})();
