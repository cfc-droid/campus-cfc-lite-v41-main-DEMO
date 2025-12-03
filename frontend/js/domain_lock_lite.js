// 🔒 CFC-LOCK LITE — DOMAIN & ENVIRONMENT PROTECTION (SAFE V41)
// Versión: V1.1 — 2025-12-02
// Corrección crítica: rutas absolutas /frontend/... causaban expulsiones falsas
// Se mantienen TODAS las validaciones, pero redirecciones usan rutas relativas
// para evitar 404 en Cloudflare Pages.

(function () {
  console.log("🛡️ CFC-LOCK LITE SAFE V41: inicializado");

  // helper seguro para redirección sin romper Cloudflare Pages
  const goBlocked = () => {
    console.warn("⛔ BLOQUEADO (SAFE): redirigiendo a blocked.html");
    window.location.href = "blocked.html"; // << RELATIVO, 100% compatible
  };

  // ---------------------------------------
  // 1) BLOQUEAR file://
  // ---------------------------------------
  if (location.protocol === "file:") {
    console.warn("⛔ BLOQUEADO: file:// no permitido");
    goBlocked();
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
    goBlocked();
    return;
  }

  // ---------------------------------------
  // 3) BLOQUEAR IFRAME
  // ---------------------------------------
  try {
    if (window !== window.top) {
      console.warn("⛔ BLOQUEADO: iframe detectado");
      goBlocked();
      return;
    }
  } catch (err) {
    console.warn("⛔ BLOQUEADO: iframe sandbox detectado");
    goBlocked();
    return;
  }

  // ---------------------------------------
  // 4) BLOQUEAR WEBVIEW (Android/iOS App)
  // ---------------------------------------
  const ua = navigator.userAgent || "";
  const isWebView =
    /\bwv\b/.test(ua) ||
    /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua);

  if (isWebView) {
    console.warn("⛔ BLOQUEADO: WebView detectado");
    goBlocked();
    return;
  }

  // ---------------------------------------
  // 5) BLOQUEAR DOMINIOS NO AUTORIZADOS
  // ---------------------------------------
  const DOMAIN_ALLOWLIST = [
    "campus-cfc-lite-v41-main-demo.pages.dev",
    "campuscfc.com",
    "www.campuscfc.com"
  ];

  if (!DOMAIN_ALLOWLIST.includes(location.hostname)) {
    console.warn("⛔ BLOQUEADO: dominio no autorizado → SAFE redirection");
    goBlocked();
    return;
  }

  // ---------------------------------------
  // TODO OK
  // ---------------------------------------
  console.log("🟢 CFC-LOCK LITE SAFE V41: dominio y entorno verificados correctamente");
})();
