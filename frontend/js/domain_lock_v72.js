// =============================================================
// CFC-LOCK ONLINE — DOMAIN LOCK V72-FINAL
// Archivo: /frontend/js/domain_lock_v72.js
// Auditor: CFC-SYNC V72-FINAL
// No modificar ni reordenar bloques sin autorización explícita
// =============================================================

// INICIO CFC_BLOQUE_1 — Encapsulamiento seguro IIFE
(function CFC_DOMAIN_LOCK_V72() {
  // INICIO CFC_BLOQUE_2 — Protección try/catch
  try {
    // INICIO CFC_BLOQUE_3 — Lista blanca de dominios
    const allowedHosts = [
      "campuscfc.pages.dev",
      "campuscfc.com"
    ];
    // FIN CFC_BLOQUE_3

    // INICIO CFC_BLOQUE_4 — Datos del entorno
    const host = (location.hostname || "").toLowerCase();
    const protocol = location.protocol || "";
    const ref = document.referrer || "";
    // FIN CFC_BLOQUE_4

    // INICIO CFC_BLOQUE_5 — Validaciones básicas
    const isAllowed = allowedHosts.some(h => host.endsWith(h));
    const isFile = protocol === "file:";
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const inIframe = window.top !== window.self;
    // FIN CFC_BLOQUE_5

    // INICIO CFC_BLOQUE_6 — WebView detection
    const ua = navigator.userAgent || "";
    const isWebView =
      ua.includes("FBAN") ||
      ua.includes("FBAV") ||
      ua.includes("Instagram") ||
      ua.includes("Line/") ||
      ua.includes("wv)");
    // FIN CFC_BLOQUE_6

    // INICIO CFC_BLOQUE_7 — Validación de referer
    const refLow = ref.toLowerCase();
    const refValid =
      refLow.includes("campuscfc.pages.dev") ||
      refLow.includes("campuscfc.com") ||
      refLow === ""; // Permitimos vacío en navegación directa
    // FIN CFC_BLOQUE_7

    // INICIO CFC_BLOQUE_8 — Condición final de bloqueo
    if (!isAllowed || isFile || isLocal || inIframe || isWebView || !refValid) {
      window.location.href = "/frontend/blocked.html";
      return;
    }
    // FIN CFC_BLOQUE_8

    // INICIO CFC_BLOQUE_9 — Log de auditoría
    console.log("CFC_FUNC_47_10_DOMAIN_LOCK_V72 — Dominio validado OK:", host);
    // FIN CFC_BLOQUE_9

    // INICIO CFC_BLOQUE_10 — Flag global obligatoria
    // Esta variable es requerida por progress_v2.js
    window.CFC_DOMAIN_OK = true;
    // FIN CFC_BLOQUE_10

  } catch (err) {
    // INICIO CFC_BLOQUE_11 — Fallback absoluto
    console.warn("CFC_LOCK DOMAIN ERROR V72:", err);
    window.location.href = "/frontend/blocked.html";
    // FIN CFC_BLOQUE_11
  }
  // FIN CFC_BLOQUE_2
})(); 
// FIN CFC_BLOQUE_1

// =============================================================
// CFC-LOCK ONLINE — FIN DEL ARCHIVO V72-FINAL
// HASH_PREVIO → HASH_NUEVO (se completa al empaquetar)
// =============================================================
