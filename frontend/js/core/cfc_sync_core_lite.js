// ===============================================================
// ✅ CFC-SYNC CORE LITE — V71.2 VISUAL + AUDIO
// ---------------------------------------------------------------
// Verificador visual y auditivo de sincronía multinube
// Plataformas: Cloudflare Pages + Workers + Render + Firebase
// Registro QA-SYNC + overlay dorado + ping/alert sonidos
// ===============================================================

const CFC_VERSION = "CFC-LOCK-V71.2";
const CHECK_INTERVAL_MS = 60000; // 1 min
const MAX_LOGS = 10;

const ENDPOINTS = {
  meta: "/meta.json",
  worker: "/api/domain-guard",
  render: "https://cfc-lock-proxy.onrender.com/ping",
  firebase:
    "https://firestore.googleapis.com/v1/projects/TU_PROYECTO/databases/(default)/documents/sessions/test"
};

// 🟡 Sonidos en Base64 (sin archivos externos)
const soundOK = new Audio(
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA..."
);
const soundERR = new Audio(
  "data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA..."
);

// ===============================================================
// 🧩 Crear overlay visual (una sola vez)
// ===============================================================
function CFC_createOverlay() {
  if (document.getElementById("cfcSyncOverlay")) return;

  const div = document.createElement("div");
  div.id = "cfcSyncOverlay";
  div.innerHTML = `
    <div id="cfcOverlayBody">
      <div id="cfcStatus" class="ok">🟢 Todo sincronizado</div>
      <div id="cfcLatency">-- ms</div>
      <div id="cfcTimeline"></div>
      <button id="cfcMuteBtn">🔊</button>
    </div>
  `;
  document.body.appendChild(div);

  // Estilos
  const style = document.createElement("style");
  style.textContent = `
    #cfcSyncOverlay {
      position: fixed;
      bottom: 12px; right: 14px;
      background: rgba(0,0,0,0.75);
      border: 2px solid #d4af37;
      color: #ffd700;
      font-family: 'Poppins', sans-serif;
      border-radius: 10px;
      padding: 8px 12px;
      z-index: 99999;
      box-shadow: 0 0 12px rgba(255,215,0,0.5);
      width: 240px;
      font-size: 0.85rem;
      transition: all 0.4s ease;
    }
    #cfcOverlayBody { display: flex; flex-direction: column; gap: 4px; align-items: center; }
    #cfcStatus.ok { color: #00ff7f; }
    #cfcStatus.warn { color: #ff4500; }
    #cfcLatency { font-size: 0.8rem; opacity: 0.8; }
    #cfcTimeline { width: 100%; max-height: 70px; overflow-y: auto; font-size: 0.7rem; text-align: left; }
    #cfcMuteBtn {
      background: none;
      border: none;
      color: #ffd700;
      cursor: pointer;
      margin-top: 2px;
      font-size: 1.1rem;
      transition: transform 0.2s ease;
    }
    #cfcMuteBtn:hover { transform: scale(1.1); }
  `;
  document.head.appendChild(style);

  // Botón de mute
  const muteBtn = div.querySelector("#cfcMuteBtn");
  const isMuted = localStorage.getItem("CFC_SYNC_MUTED") === "1";
  muteBtn.textContent = isMuted ? "🔇" : "🔊";
  muteBtn.addEventListener("click", () => {
    const newVal = localStorage.getItem("CFC_SYNC_MUTED") === "1" ? "0" : "1";
    localStorage.setItem("CFC_SYNC_MUTED", newVal);
    muteBtn.textContent = newVal === "1" ? "🔇" : "🔊";
  });
}

// ===============================================================
// 🧠 Funciones principales
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
    return { name, ok: false, ms: null, error: e.message };
  }
}

async function CFC_syncRun() {
  console.log(`\n🔁 [CFC-SYNC CORE] Verificando sincronía — ${new Date().toLocaleTimeString()}`);
  const results = await Promise.all([
    CFC_check("Cloudflare meta.json", ENDPOINTS.meta),
    CFC_check("Cloudflare Worker", ENDPOINTS.worker),
    CFC_check("Render Heartcore", ENDPOINTS.render),
    CFC_check("Firebase sessions", ENDPOINTS.firebase)
  ]);

  const okAll = results.every(r => r.ok);
  const latencyAvg = Math.round(
    results.filter(r => r.ms).reduce((a, b) => a + parseInt(b.ms), 0) /
    results.filter(r => r.ms).length
  );

  const summary = {
    version: CFC_VERSION,
    ok: okAll,
    latencyAvg,
    timestamp: new Date().toLocaleTimeString()
  };

  // QA Log
  const logs = JSON.parse(localStorage.getItem("CFC_SYNC_LOGS") || "[]");
  logs.unshift(summary);
  if (logs.length > MAX_LOGS) logs.pop();
  localStorage.setItem("CFC_SYNC_LOGS", JSON.stringify(logs));

  // Overlay update
  const overlay = document.getElementById("cfcSyncOverlay");
  if (overlay) {
    const statusEl = overlay.querySelector("#cfcStatus");
    const latencyEl = overlay.querySelector("#cfcLatency");
    const timelineEl = overlay.querySelector("#cfcTimeline");

    statusEl.textContent = okAll ? "🟢 Todo sincronizado" : "⚠️ Desincronía detectada";
    statusEl.className = okAll ? "ok" : "warn";
    latencyEl.textContent = `Promedio: ${latencyAvg} ms`;

    timelineEl.innerHTML = logs
      .map(l => `<div>${l.timestamp} — ${l.ok ? "✅ OK" : "❌ FAIL"} (${l.latencyAvg} ms)</div>`)
      .join("");

    const muted = localStorage.getItem("CFC_SYNC_MUTED") === "1";
    if (!muted) (okAll ? soundOK : soundERR).play();
  }

  console.log(
    okAll
      ? `✅ [SYNC OK] Todas las plataformas online (avg ${latencyAvg} ms)`
      : `⚠️ [SYNC WARN] Desincronía detectada`
  );
}

// ===============================================================
// 🚀 Inicialización
// ===============================================================
window.addEventListener("load", () => {
  CFC_createOverlay();
  setTimeout(CFC_syncRun, 1500);
  setInterval(CFC_syncRun, CHECK_INTERVAL_MS);
});
