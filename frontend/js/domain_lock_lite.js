// 🔒 CFC-LOCK LITE — DOMAIN & ENVIRONMENT PROTECTION
// Versión: V1.0 — 2025-11-26
// Este archivo protege el Campus contra:
// - file://
// - localhost
// - iframes
// - WebView (Android/iOS)
// - dominios pirata
// No toca login, progreso, ni sesión única.

(function () {
  console.log("🛡️ CFC-LOCK LITE: domain_lock_lite.js inicializado");

  // ---------------------------------------
  // 1) BLOQUEAR file://
  // ---------------------------------------
  if (location.protocol === "file:") {
    console.warn("⛔ BLOQUEADO: file:// no permitido");
    window.location.href = "/frontend/blocked.html";
    return;
  }

  // ---------------------------------------
  // 2) BLOQUEAR localhost
  // ---------------------------------------
  const host = location.hostname;
  const isLocalhost =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host.startsWith("192.168.");

  if (isLocalhost) {
    console.warn("⛔ BLOQUEADO: localhost no permitido");
    window.location.href = "/frontend/blocked.html";
    return;
  }

  // ---------------------------------------
  // 3) BLOQUEAR IFRAME
  // ---------------------------------------
  try {
    if (window !== window.top) {
      console.warn("⛔ BLOQUEADO: iframe detectado");
      window.top.location.href = "/frontend/blocked.html";
      return;
    }
  } catch (err) {
    console.warn("⛔ BLOQUEADO: iframe sandbox detectado");
    window.location.href = "/frontend/blocked.html";
    return;
  }

  // ---------------------------------------
  // 4) BLOQUEAR WEBVIEW (Android/iOS App)
  // Métodos de detección comunes:
  // - userAgent contiene: wv, iPhone.*Version/.+Safari
  // - ausencia de Safari real
  // ---------------------------------------
  const ua = navigator.userAgent || "";
  const isWebView =
    /\bwv\b/.test(ua) || // Android WebView
    /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua); // iOS WebView

  if (isWebView) {
    console.warn("⛔ BLOQUEADO: WebView detectado");
    window.location.href = "/frontend/blocked.html";
    return;
  }

  // ---------------------------------------
  // 5) BLOQUEAR DOMINIOS NO AUTORIZADOS
  // ---------------------------------------
  const DOMAIN_ALLOWLIST = [
    "campus-cfc-lite-v41-main-demo.pages.dev", // <— PONER AQUÍ TU DOMINIO REAL
    "campuscfc.com",                          // <— si lo usas
    "www.campuscfc.com"                       // <— si lo usas
  ];

  if (!DOMAIN_ALLOWLIST.includes(location.hostname)) {
    console.warn("⛔ BLOQUEADO: dominio no autorizado");
    window.location.href = "/frontend/blocked.html";
    return;
  }

  // ---------------------------------------
  // SI TODO ES CORRECTO → CAMPUS PERMITIDO
  // ---------------------------------------
  console.log("🟢 CFC-LOCK LITE: dominio y entorno verificados");
})();
