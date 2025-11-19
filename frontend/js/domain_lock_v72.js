(function CFC_DOMAIN_LOCK_V72() {
  try {
    const allowedHosts = [
      "campus-cfc-lite-v41-main-demo.pages.dev",
      "campuscfc.pages.dev",
      "campuscfc.com"
    ];

    const host = (location.hostname || "").toLowerCase();
    const isAllowed = allowedHosts.some(h => host.endsWith(h));

    const isFile = location.protocol === "file:";
    const isLocal = host === "localhost" || host === "127.0.0.1";
    const inIframe = window.top !== window.self;

    const ua = navigator.userAgent || "";
    const isWebView =
      ua.includes("FBAN") || ua.includes("FBAV") ||
      ua.includes("Instagram") || ua.includes("wv)");

    if (!isAllowed || isFile || isLocal || inIframe || isWebView) {
      window.location.href = "/frontend/blocked.html";
      return;
    }

    window.CFC_DOMAIN_OK = true;
  } catch (e) {
    window.location.href = "/frontend/blocked.html";
  }
})();
