// 🔒 CFC-LOCK LITE — SAFE MODE TOTAL V41.2
// Fecha: 2025-12-02
// Esta versión NO expulsa en ninguna ruta interna del Campus CFC LITE.
// Solo valida que el dominio real sea correcto.
// NO bloquea iframe, NO bloquea rutas, NO bloquea WebView, NO bloquea localhost.
// 100% compatible con Cloudflare Pages.

(function () {
  console.log("🛡️ CFC-LOCK LITE — SAFE MODE TOTAL V41.2 cargado");

  // Dominio REAL del campus (ajustar solo si lo cambias)
  const ALLOW_DOMAIN = "campus-cfc-lite-v41-main-demo.pages.dev";

  // Validación mínima (única validación)
  if (location.hostname !== ALLOW_DOMAIN) {
    console.warn("⛔ BLOQUEADO: dominio NO autorizado");
    window.location.href = "/frontend/blocked.html";
    return;
  }

  console.log("🟢 Dominio verificado correctamente — funcionando en SAFE MODE");
})();
