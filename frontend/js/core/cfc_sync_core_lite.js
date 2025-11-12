// ===============================================================
// ✅ CFC-SYNC CORE LITE — V71-PROTOTYPE
// ---------------------------------------------------------------
// Verificador automático de sincronía entre plataformas:
// Cloudflare Pages + Workers + Render + Firebase
// No interfiere con el flujo de sesión ni overlay.
// ===============================================================

const CFC_VERSION = "CFC-LOCK-V71";
const CHECK_INTERVAL_MS = 60000; // 1 min

const ENDPOINTS = {
  meta: "/meta.json",
  worker: "/api/domain-guard",
  render: "https://cfc-lock-proxy.onrender.com/ping",
  firebase:
    "https://firestore.googleapis.com/v1/projects/TU_PROYECTO/databases/(default)/documents/sessions/test"
};

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
    return { name, ok: false, ms: null, error: e.message };
  }
}

async function CFC_syncRun() {
  console.log(
    `\n🔁 [CFC-SYNC CORE LITE] Verificando sincronía global — ${new Date().toLocaleTimeString()}`
  );
  const results = await Promise.all([
    CFC_check("Cloudflare meta.json", ENDPOINTS.meta),
    CFC_check("Cloudflare Worker", ENDPOINTS.worker),
    CFC_check("Render Heartcore", ENDPOINTS.render),
    CFC_check("Firebase sessions", ENDPOINTS.firebase)
  ]);

  const okAll = results.every(r => r.ok);
  const latencyAvg =
    results.filter(r => r.ms).reduce((a, b) => a + parseInt(b.ms), 0) /
    results.filter(r => r.ms).length;

  const summary = {
    version: CFC_VERSION,
    ok: okAll,
    latencyAvg: Math.round(latencyAvg),
    timestamp: new Date().toISOString()
  };

  console.log(
    okAll
      ? `✅ [SYNC OK] Todas las plataformas online (avg ${summary.latencyAvg} ms)`
      : `⚠️ [SYNC WARN] Desincronía detectada — revisar consola detallada`
  );

  localStorage.setItem("CFC_SYNC_LOG", JSON.stringify(summary));
}

setInterval(CFC_syncRun, CHECK_INTERVAL_MS);
window.addEventListener("load", CFC_syncRun);
