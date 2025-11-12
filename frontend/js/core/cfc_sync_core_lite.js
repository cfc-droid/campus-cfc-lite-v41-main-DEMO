// ===============================================================
// ✅ CFC-SYNC MINI LITE — V71.3 CLEAN MODE
// ---------------------------------------------------------------
// Versión mínima y silenciosa del sistema de verificación multinube.
// No muestra overlay, no emite sonidos, ni afecta al Campus.
// Guarda un log técnico interno en localStorage (solo QA-SYNC).
// ===============================================================

const CFC_VERSION = "CFC-SYNC-MINI-V71.3";
const CHECK_INTERVAL_MS = 120000; // 2 minutos

const ENDPOINTS = {
  meta: "/meta.json",
  worker: "/api/domain-guard",
  render: "https://cfc-lock-proxy.onrender.com/ping"
};

// ===============================================================
// 🔍 Chequeo de conexión simple
// ===============================================================
async function CFC_check(name, url) {
  const start = performance.now();
  try {
    const res = await fetch(url, { cache: "no-store" });
    const ms = (performance.now() - start).toFixed(0);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log(`🟩 [${name}] OK (${ms} ms)`);
    return { name, ok: true, ms };
  } catch (e) {
    console.warn(`🟥 [${name}] Falló → ${e.message}`);
    return { name, ok: false, ms: null };
  }
}

// ===============================================================
// 🧠 Ejecutor principal silencioso
// ===============================================================
async function CFC_syncRunSilent() {
  const results = await Promise.all([
    CFC_check("Cloudflare meta.json", ENDPOINTS.meta),
    CFC_check("Cloudflare Worker", ENDPOINTS.worker),
    CFC_check("Render Heartcore", ENDPOINTS.render)
  ]);

  const okAll = results.every(r => r.ok);
  const latencyAvg = Math.round(
    results.filter(r => r.ms).reduce((a, b) => a + parseInt(b.ms), 0) /
    results.filter(r => r.ms).length
  );

  const summary = {
    version: CFC_VERSION,
    ok: okAll,
    latencyAvg: isNaN(latencyAvg) ? null : latencyAvg,
    timestamp: new Date().toISOString()
  };

  localStorage.setItem("CFC_SYNC_LAST", JSON.stringify(summary));

  console.log(
    okAll
      ? `✅ [SYNC MINI] OK (${summary.latencyAvg} ms)`
      : `⚠️ [SYNC MINI] Desincronía (ver detalles consola)`
  );
}

// ===============================================================
// 🚀 Inicialización
// ===============================================================
window.addEventListener("load", () => {
  setTimeout(CFC_syncRunSilent, 2000);
  setInterval(CFC_syncRunSilent, CHECK_INTERVAL_MS);
});
