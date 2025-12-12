/* ==========================================================
   🎧 CFC-VOICE READER PRO — V10 FINAL
   - Lectura natural, no palabra por palabra
   - Velocidad REAL en tiempo real
   - Pause / Resume / Stop perfectos
   - NO modifica HTML del capítulo
   - Selección real de voces (PC / Android / iPhone / iPad)
   - Botón premium flotante negro+dorado
   - 100% universal para los 20 módulos y 80 capítulos
   ========================================================== */

let voicesList = [];
let currentVoice = null;
let rate = 1;
let utter = null;
let isPaused = false;

/* ==========================================================
   INIT
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const oldBtn = document.querySelector(".tts-btn-fixed");
  if (oldBtn) {
    oldBtn.addEventListener("click", openTTSPanel);
  } else {
    injectFloatingButton();
  }
});

/* ==========================================================
   BOTÓN PREMIUM FLOTANTE
   ========================================================== */
function injectFloatingButton() {
  if (document.querySelector("#tts-btn-cfc")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <button id="tts-btn-cfc"
        style="
          position:fixed; bottom:25px; left:25px;
          width:60px; height:60px; border-radius:50%;
          background:linear-gradient(90deg,#FFD700,#C5A200);
          color:#000; font-size:28px; font-weight:900;
          border:none; cursor:pointer; z-index:99999999;
          box-shadow:0 0 18px rgba(255,215,0,0.6);
        ">🎧</button>
    `
  );

  document.querySelector("#tts-btn-cfc").onclick = openTTSPanel;
}

/* ==========================================================
   PANEL PREMIUM
   ========================================================== */
function openTTSPanel() {
  if (!("speechSynthesis" in window)) {
    alert("Tu navegador no soporta lectura en voz alta.");
    return;
  }

  if (document.querySelector("#cfc-tts-panel")) return;

  unlockiOS();
  unlockAndroid();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="cfc-tts-panel"
      style="
        position:fixed; bottom:95px; left:25px;
        width:270px; background:#000;
        border:2px solid #FFD700; border-radius:14px;
        padding:16px; color:white; z-index:99999999;
        box-shadow:0 0 20px rgba(255,215,0,0.45);
        font-family:'Inter',sans-serif;">
      
      <h4 style="margin:0 0 10px 0; color:#FFD700; font-size:17px;">
        🎧 Lectura IA CFC
      </h4>

      <label style="display:block; margin-top:4px;">Voz:</label>
      <select id="tts-voice"
        style="width:100%; padding:7px; margin-top:6px;
        background:#111; color:white; border:1px solid #FFD700;
        border-radius:8px;"></select>

      <label style="margin-top:10px; display:block;">Velocidad:</label>
      <div style="margin:6px 0; display:flex; flex-wrap:wrap;">
        ${[0.75,1,1.25,1.5,1.75,2].map(
          v => `
          <button class="tts-rate" data-v="${v}"
            style="
              padding:6px 10px; margin:2px;
              background:#111; border:1px solid #FFD700;
              color:#FFD700; border-radius:6px;
              font-size:13px;
            ">x${v}</button>
        `
        ).join("")}
      </div>

      <button id="tts-read"
        style="width:100%; background:#FFD700; color:#000;
        padding:9px; border-radius:8px; border:none; font-weight:700;
        margin-top:5px; font-size:15px;">Leer</button>

      <div style="margin-top:8px; display:flex; justify-content:space-between;">
        <button id="tts-pause"
          style="width:48%; background:#222; color:white;
          padding:7px; border:1px solid #FFD700; border-radius:6px;">⏸️ Pausa</button>

        <button id="tts-resume"
          style="width:48%; background:#222; color:white;
          padding:7px; border:1px solid #FFD700; border-radius:6px;">▶️ Seguir</button>
      </div>

      <button id="tts-stop"
        style="width:100%; background:#b82828; color:white;
        padding:8px; border-radius:8px; border:none; margin-top:8px;">
        ⏹️ Detener
      </button>

      <button id="tts-close"
        style="width:100%; background:#444; color:white;
        padding:7px; border-radius:8px; margin-top:8px;">❌ Cerrar</button>

    </div>
    `
  );

  loadVoices();
  setEvents();
}

/* ==========================================================
   UNLOCK ANDROID / iOS
   ========================================================== */
function unlockAndroid() {
  try {
    const u = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(u);
    speechSynthesis.cancel();
  } catch (_) {}
}

function unlockiOS() {
  try {
    const a = new SpeechSynthesisUtterance(" ");
    a.rate = 1;
    speechSynthesis.speak(a);
    speechSynthesis.cancel();
  } catch (_) {}
}

/* ==========================================================
   EVENTOS
   ========================================================== */
function setEvents() {
  document.querySelectorAll(".tts-rate").forEach(btn => {
    btn.onclick = () => {
      rate = parseFloat(btn.dataset.v);

      document.querySelectorAll(".tts-rate").forEach(b => {
        b.style.background = "#111";
        b.style.color = "#FFD700";
      });
      btn.style.background = "#FFD700";
      btn.style.color = "#000";
    };
  });

  const sel = document.querySelector("#tts-voice");
  sel.onchange = e => currentVoice = e.target.value;

  document.querySelector("#tts-read").onclick = startReading;
  document.querySelector("#tts-pause").onclick = pauseReading;
  document.querySelector("#tts-resume").onclick = resumeReading;
  document.querySelector("#tts-stop").onclick = stopReading;

  document.querySelector("#tts-close").onclick = () => {
    stopReading();
    closePanel();
  };
}

/* ==========================================================
   CARGA DE VOCES REALES
   ========================================================== */
async function loadVoices() {
  let t = 0;
  while (speechSynthesis.getVoices().length === 0 && t < 40) {
    await new Promise(r => setTimeout(r, 150));
    t++;
  }

  voicesList = speechSynthesis.getVoices();

  const spanish = voicesList.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
  const final = spanish.length ? spanish : voicesList;

  const males = final.filter(v => /male|hombre|mascul/i.test(v.name));
  const females = final.filter(v => /female|mujer|fem/i.test(v.name));

  let ordered = [];
  if (females.length) ordered = ordered.concat(females);
  if (males.length) ordered = ordered.concat(males);

  if (ordered.length === 0) ordered = final;

  const sel = document.querySelector("#tts-voice");
  sel.innerHTML = "";

  ordered.forEach(v => {
    const o = document.createElement("option");
    o.value = v.name;
    o.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(o);
  });

  currentVoice = ordered[0] ? ordered[0].name : null;
}

/* ==========================================================
   LECTURA NATURAL COMPLETA
   ========================================================== */
function startReading() {
  stopReading();

  const container = document.querySelector("main") || document.body;
  const text = container.innerText || "";
  if (!text.trim()) return;

  utter = new SpeechSynthesisUtterance(text);

  const voices = speechSynthesis.getVoices();
  const chosen =
    voices.find(v => v.name === currentVoice) ||
    voices.find(v => v.lang && v.lang.toLowerCase().startsWith("es")) ||
    voices[0];

  utter.voice = chosen;
  utter.rate = rate;
  utter.lang = (chosen && chosen.lang) || "es-ES";

  utter.onend = () => utter = null;

  speechSynthesis.speak(utter);
}

/* ==========================================================
   PAUSE / RESUME / STOP NATIVOS
   ========================================================== */
function pauseReading() {
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
  }
}

function resumeReading() {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}

function stopReading() {
  if (speechSynthesis.speaking || speechSynthesis.paused) {
    speechSynthesis.cancel();
  }
  utter = null;
}

/* ==========================================================
   CERRAR PANEL
   ========================================================== */
function closePanel() {
  const p = document.querySelector("#cfc-tts-panel");
  if (p) p.remove();
  showToast("Narrador cerrado");
}

/* ==========================================================
   TOAST PREMIUM
   ========================================================== */
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style = `
    position:fixed; bottom:22px; left:25px;
    background:linear-gradient(90deg,#FFD700,#C5A200);
    padding:10px 16px; border-radius:10px;
    color:#000; font-weight:700; z-index:99999999;
    box-shadow:0 0 15px rgba(255,215,0,0.55);
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}
