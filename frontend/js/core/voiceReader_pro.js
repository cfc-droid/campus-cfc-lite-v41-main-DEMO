/* ==========================================================
   🎧 CFC-VOICE READER PRO — V9.0 (LITE REAL)
   - Lee como lector normal (texto completo, no palabra x palabra)
   - Velocidad REAL (usa rate seleccionado)
   - Pause / Resume / Stop nativos
   - NO modifica el HTML del capítulo (nada que restaurar)
   - Soporta botón viejo .tts-btn-fixed o crea uno dorado fijo
   ========================================================== */

let voicesList = [];
let currentVoice = null;
let rate = 1;
let utter = null;

/* ==========================================================
   INIT
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Si ya existe el botón viejo, lo usamos
  const oldBtn = document.querySelector(".tts-btn-fixed");
  if (oldBtn) {
    oldBtn.addEventListener("click", openTTSPanel);
  } else {
    // Si no existe, inyectamos botón dorado premium
    injectFloatingButton();
  }
});

/* ==========================================================
   BOTÓN DORADO PREMIUM (fallback)
   ========================================================== */
function injectFloatingButton() {
  if (document.querySelector("#tts-btn-cfc")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <button id="tts-btn-cfc"
      style="
        position:fixed; bottom:25px; left:25px;
        width:58px; height:58px; border-radius:50%;
        background:linear-gradient(90deg,#FFD700,#C5A200);
        color:#000; font-size:26px; font-weight:900;
        border:none; cursor:pointer; z-index:99999999;
        box-shadow:0 0 15px rgba(255,215,0,0.5);
      ">🎧</button>
    `
  );

  const btn = document.querySelector("#tts-btn-cfc");
  if (btn) btn.addEventListener("click", openTTSPanel);
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

  unlockAndroid();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="cfc-tts-panel"
      style="
        position:fixed; bottom:95px; left:25px;
        width:260px; background:#000;
        border:2px solid #FFD700; border-radius:14px;
        padding:15px; color:white; z-index:99999999;
        box-shadow:0 0 18px rgba(255,215,0,0.45);
        font-family:'Inter',sans-serif;">
      
      <h4 style="margin:0 0 10px 0; color:#FFD700;">🎧 Lectura IA CFC</h4>

      <label>Voz:</label><br>
      <select id="tts-voice"
        style="width:100%; padding:6px; margin-top:5px;
        background:#111; color:white; border:1px solid #444;
        border-radius:8px;"></select>

      <label style="margin-top:8px; display:block;">Velocidad:</label>
      <div style="margin:6px 0;">
        ${[0.75,1,1.25,1.5,1.75,2].map(
          v => `
          <button class="tts-rate" data-v="${v}"
            style="padding:5px 8px; margin:2px;
            background:#111; border:1px solid #FFD700;
            color:#FFD700; border-radius:6px;">x${v}</button>
        `
        ).join("")}
      </div>

      <button id="tts-read"
        style="width:100%; background:#FFD700; color:#000;
        padding:8px; border-radius:8px; border:none; font-weight:700;
        margin-top:5px;">Leer</button>

      <div style="margin-top:6px;">
        <button id="tts-pause"
          style="width:48%; background:#222; color:white;
          padding:6px; border:1px solid #444; border-radius:6px;">⏸️</button>

        <button id="tts-resume"
          style="width:48%; background:#222; color:white;
          padding:6px; border:1px solid #444; border-radius:6px;">▶️</button>
      </div>

      <button id="tts-stop"
        style="width:100%; background:#c0392b; color:white;
        padding:7px; border-radius:8px; border:none; margin-top:6px;">⏹️</button>

      <button id="tts-close"
        style="width:100%; background:#444; color:white;
        padding:6px; border-radius:8px; margin-top:6px;">❌ Cerrar</button>

    </div>
    `
  );

  loadVoices();
  setEvents();
}

/* ==========================================================
   ANDROID UNLOCK
   ========================================================== */
function unlockAndroid() {
  try {
    const u = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(u);
    speechSynthesis.cancel();
  } catch (_) {}
}

/* ==========================================================
   EVENTOS (velocidad, controles)
   ========================================================== */
function setEvents() {
  // Velocidad
  document.querySelectorAll(".tts-rate").forEach(btn => {
    btn.onclick = () => {
      rate = parseFloat(btn.dataset.v);
      // opcional: marcar botón activo
      document.querySelectorAll(".tts-rate").forEach(b => {
        b.style.background = "#111";
        b.style.color = "#FFD700";
      });
      btn.style.background = "#FFD700";
      btn.style.color = "#000";
      console.log("🔊 CFC-TTS rate =", rate);
    };
  });

  // Voz
  const sel = document.querySelector("#tts-voice");
  if (sel) {
    sel.onchange = e => {
      currentVoice = e.target.value;
      console.log("🔊 CFC-TTS voice =", currentVoice);
    };
  }

  // Controles
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
   CARGA DE VOCES
   ========================================================== */
async function loadVoices() {
  let tries = 0;
  while (speechSynthesis.getVoices().length === 0 && tries < 30) {
    await new Promise(r => setTimeout(r, 120));
    tries++;
  }

  voicesList = speechSynthesis.getVoices();

  // Preferir voces en español; si no hay, usar todas
  const spanish = voicesList.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));
  const final = spanish.length ? spanish : voicesList;

  const sel = document.querySelector("#tts-voice");
  if (!sel) return;

  sel.innerHTML = "";
  final.forEach(v => {
    const o = document.createElement("option");
    o.value = v.name;
    o.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(o);
  });

  currentVoice = final[0] ? final[0].name : null;
}

/* ==========================================================
   LECTURA NORMAL (NO palabra x palabra)
   ========================================================== */
function startReading() {
  // Siempre reinicia desde el inicio del capítulo
  stopReading();

  const container = document.querySelector("main") || document.body;
  if (!container) return;

  const text = container.innerText || "";
  if (!text.trim()) return;

  utter = new SpeechSynthesisUtterance(text);

  const voices = speechSynthesis.getVoices();
  const chosen =
    voices.find(v => v.name === currentVoice) ||
    voices.find(v => v.lang && v.lang.toLowerCase().startsWith("es")) ||
    voices[0];

  utter.voice = chosen || null;
  utter.rate = rate || 1;
  utter.lang = (chosen && chosen.lang) || "es-ES";

  utter.onend = () => {
    utter = null;
  };

  console.log("🔊 CFC-TTS start — rate:", utter.rate, "voice:", utter.voice && utter.voice.name);
  speechSynthesis.speak(utter);
}

/* ==========================================================
   PAUSE / RESUME / STOP NATIVOS
   ========================================================== */
function pauseReading() {
  if (!utter) return;
  if (speechSynthesis.speaking && !speechSynthesis.paused) {
    speechSynthesis.pause();
  }
}

function resumeReading() {
  if (!utter) return;
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
  }
}

function stopReading() {
  if (!utter && !speechSynthesis.speaking) return;
  speechSynthesis.cancel();
  utter = null;
}

/* ==========================================================
   CERRAR PANEL
   (el texto del capítulo NUNCA se modifica, por eso no hay
   nada que restaurar; sólo se cierra la UI)
   ========================================================== */
function closePanel() {
  const p = document.querySelector("#cfc-tts-panel");
  if (p) p.remove();
  showToast("Narrador cerrado");
}

/* ==========================================================
   Toast Premium
   ========================================================== */
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style = `
    position:fixed; bottom:20px; left:25px;
    background:linear-gradient(90deg,#FFD700,#C5A200);
    padding:10px 16px; border-radius:10px;
    color:#111; font-weight:700; z-index:99999999;
    box-shadow:0 0 15px rgba(255,215,0,0.5)
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}
