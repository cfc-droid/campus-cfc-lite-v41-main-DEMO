// ===============================================================
// CFC-LOCK ONLINE V72-FINAL — DOMAIN / CONTEXT VALIDATION
// Archivo: /frontend/js/domain_lock_v72.js
// Sistema: Cloudflare Pages (SIN WORKERS) + JS plano
// Auditor: CFC-SYNC V72-FINAL
// ===============================================================

(function CFC_DOMAIN_LOCK_V72() {
  try {
    console.log("CFC_FUNC_47_10_DOMAIN_LOCK_V72: inicializando…");

    // ---------------------------------------------------------------
    // 1. LISTA BLANCA DE DOMINIOS
    // ---------------------------------------------------------------
    const allowedHosts = [
      "campuscfc.pages.dev",
      "campuscfc.com",
      "www.campuscfc.com"
    ];

    const host = (location.hostname || "").toLowerCase();
    const isAllowed = allowedHosts.some(h => host === h || host.endsWith("." + h));

    // ---------------------------------------------------------------
    // 2. CONTEXTOS PROHIBIDOS
    // ---------------------------------------------------------------
    const isFile = location.protocol === "file:";
    const isLocal = host === "localhost" || host === "127.0.0.1";

    // ---------------------------------------------------------------
    // 3. Bloqueo iframe
    // ---------------------------------------------------------------
    const inIframe = window.top !== window.self;

    // ---------------------------------------------------------------
    // 4. WebViews (FB, IG, Line, etc)
    // ---------------------------------------------------------------
    const ua = navigator.userAgent || "";
    const isWebView =
      ua.includes("FBAN") ||
      ua.includes("FBAV") ||
      ua.includes("Instagram") ||
      ua.includes("Line/") ||
      ua.includes("wv)");

    // ---------------------------------------------------------------
    // 5. ENTORNO INVÁLIDO → BLOQUEAR
    // ---------------------------------------------------------------
    if (!isAllowed || isFile || isLocal || inIframe || isWebView) {
      console.warn("CFC_DOMAIN_LOCK_V72: entorno no autorizado → bloqueado.");
      window.location.href = "/frontend/blocked.html";
      return;
    }

    // ---------------------------------------------------------------
    // 6. DOMINIO OK
    // ---------------------------------------------------------------
    window.CFC_DOMAIN_OK = true;

    // ---------------------------------------------------------------
    // 7. LOG FINAL
    // ---------------------------------------------------------------
    console.log(
      "🛡️ CFC_DOMAIN_LOCK_V72 — Dominio VALIDADO:",
      host,
      "Timestamp:",
      new Date().toLocaleString()
    );

  } catch (e) {
    console.error("CFC_DOMAIN_LOCK_V72: ERROR CRÍTICO", e);
    window.location.href = "/frontend/blocked.html";
  }
})();

// ============================================================
// B) HEARTBEAT — VERIFICACIÓN PERIÓDICA (10 s)
// ============================================================
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/*
============================================================
NOTA CFC-SYNC:
Este archivo solo incluye BLOQUES A y B del PASO 2/5.
No agregar C, D, E, F ni G en este archivo.
============================================================
*/
