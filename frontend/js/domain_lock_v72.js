// ===============================================================
// CFC-LOCK ONLINE V72-FINAL — DOMAIN / CONTEXT VALIDATION
// Archivo: /frontend/js/domain_lock_v72.js
// Sistema: Cloudflare Pages (SIN WORKERS) + JS plano
// Auditor: CFC-SYNC V72-FINAL
// ===============================================================

// INICIO CFC_BLOQUE_DOMAIN_LOCK_V72
(function CFC_DOMAIN_LOCK_V72() {
  try {
    console.log("CFC_FUNC_47_10_DOMAIN_LOCK_V72: inicializando…");

    // ---------------------------------------------------------------
    // 1. LISTA BLANCA DE DOMINIOS (AGREGÁ SOLO LOS OFICIALES)
    // ---------------------------------------------------------------
    const allowedHosts = [
      "campuscfc.pages.dev",
      "campuscfc.com"
    ];

    const host = (location.hostname || "").toLowerCase();

    // Dominio permitido → match exacto o subdominio
    const isAllowed = allowedHosts.some(h => host === h || host.endsWith("." + h));

    // ---------------------------------------------------------------
    // 2. CONTEXTOS PROHIBIDOS
    // ---------------------------------------------------------------
    const isFile = location.protocol === "file:";
    const isLocal = host === "localhost" || host === "127.0.0.1";

    // ---------------------------------------------------------------
    // 3. BLOQUEAR IFRAMES
    // ---------------------------------------------------------------
    const inIframe = window.top !== window.self;

    // ---------------------------------------------------------------
    // 4. WebView / Apps internas (FB, IG, Line, etc.)
    // ---------------------------------------------------------------
    const ua = navigator.userAgent || "";
    const isWebView =
      ua.includes("FBAN") ||
      ua.includes("FBAV") ||
      ua.includes("Instagram") ||
      ua.includes("Line/") ||
      ua.includes("wv)");

    // ---------------------------------------------------------------
    // 5. DOMINIO / CONTEXTO INVÁLIDO → BLOQUEAR
    // ---------------------------------------------------------------
    if (!isAllowed || isFile || isLocal || inIframe || isWebView) {
      console.warn("CFC_DOMAIN_LOCK_V72: entorno no autorizado → bloqueado.");
      window.location.href = "/frontend/blocked.html";
      return;
    }

    // ---------------------------------------------------------------
    // 6. SI TODO ES VÁLIDO → DOMINIO OK
    // ---------------------------------------------------------------
    window.CFC_DOMAIN_OK = true;

  } catch (e) {
    console.error("CFC_DOMAIN_LOCK_V72: ERROR CRÍTICO", e);
    window.location.href = "/frontend/blocked.html";
  }
})();
// FIN CFC_BLOQUE_DOMAIN_LOCK_V72
