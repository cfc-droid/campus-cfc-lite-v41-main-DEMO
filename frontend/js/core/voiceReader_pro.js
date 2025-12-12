/* ==========================================================
   🎧 CFC-VOICE READER PRO — Versión 7.0 (Final)
   UI PREMIUM ORIGINAL — Fijo abajo izquierda
   Resume REAL • Stop REAL • Pause REAL
   Compatible Windows + Android + iPhone/iPad
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".tts-btn-fixed");
  if (btn) btn.addEventListener("click", openTTSPanel);
});

let voicesList = [];
let currentVoice = null;
let rate = 1;
let paused = false;
let stopped = false;
let index = 0;
let blocks = [];
let originalHTML = "";
let container = null;
let utter = null;

/* ==========================================================
   🔓 Android Unlock
   ========================================================== */
function unlockAndroidTTS() {
  try {
    const u = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(u);
    speechSynthesis.cancel();
  } catch (_) {}
}

/* ==========================================================
   🎨 PANEL PREMIUM ORIGINAL (Amber + Black)
   ========================================================== */
function openTTSPanel() {
  if (document.querySelector("#cfc-tts-panel")) return;

  unlockAndroidTTS();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="cfc-tts-panel"
         style="
           position:fixed; bottom:25px; left:25px;
           background:#000; border:2px solid #FFD700;
           border-radius:14px; padding:15px;
           width:260px; color:white; z-index:9999999;
           box-shadow:0 0 18px rgba(255,215,0,0.45);
           font-family:'Inter', sans-serif;
         ">
      
      <h4 style="margin:0 0 10px 0; color:#FFD700; font-size:17px;">
        🎧 Lectura IA CFC
      </h4>

      <label style="font-size:13px;">Voz:</label><br>
      <select id="tts-voice"
              style="width:100%; padding:6px; margin-top:5px;
                     background:#111; color:white; border:1px solid #444;
                     border-radius:8px;">
      </select>

      <label style="font-size:13px; margin-top:8px;">Velocidad:</label><br>
      <div style="margin:6px 0;">
        ${[0.75,1,1.25,1.5,1.75,2].map(v => `
          <button class="tts-rate" data-v="${v}"
            style="padding:5px 8px; margin:2px;
            background:#111; border:1px solid #FFD700;
            color:#FFD700; border-radius:6px;">
            x${v}
          </button>
        `).join("")}
      </div>

      <button id="tts-read"
        style="
          width:100%; background:#FFD700; color:#000;
          padding:8px; border-radius:8px; border:none;
          margin-top:5px; font-weight:700;">
        Leer
      </button>

      <div style="margin-top:6px;">
        <button id="tts-pause"
          style="width:48%; background:#222; color:white;
                 padding:6px; border-radius:6px; border:1px solid #333;">
          ⏸️
        </button>

        <button id="tts-resume"
          style="width:48%; background:#222; color:white;
                 padding:6px; border-radius:6px; border:1px solid #333;">
          ▶️
        </button>
      </div>

      <button id="tts-stop"
        style="width:100%; background:#c0392b; color:white;
               padding:7px; border-radius:8px; border:none; margin-top:6px;">
        ⏹️
      </button>

      <button id="tts-close"
        style="width:100%; background:#333; color:white;
               padding:6px; border-radius:8px; margin-top:6px;">
        ❌ Cerrar
      </button>

    </div>
    `
  );

  loadVoices();
  setEvents();
}

/* ==========================================================
   🧩 EVENTOS
   ========================================================== */
function setEvents() {
  document.querySelectorAll(".tts-rate").forEach(btn => {
    btn.onclick = () => { rate = parseFloat(btn.dataset.v); };
  });

  document.querySelector("#tts-voice").onchange = e => {
    currentVoice = e.target.value;
  };

  document.querySelector("#tts-read").onclick = startReading;
  document.querySelector("#tts-pause").onclick = () => paused = true;
  document.querySelector("#tts-resume").onclick = () => {
    paused = false;
    readNext();
  };

  document.querySelector("#tts-stop").onclick = stopReading;

  document.querySelector("#tts-close").onclick = () => {
    stopReading();
    closePanel();
  };
}

/* ==========================================================
   🗣️ VOCES — Google / Microsoft / Android TTS
   ========================================================== */
async function loadVoices() {
  let attempts = 0;
  while (speechSynthesis.getVoices().length === 0 && attempts < 25) {
    await new Promise(r => setTimeout(r, 120));
    attempts++;
  }

  voicesList = speechSynthesis.getVoices();

  const preferred = [
    "Microsoft Helena", "Microsoft Laura", "Microsoft Pablo",
    "Google español", "Google español de Estados Unidos",
  ];

  const filtered = voicesList.filter(v =>
    preferred.some(p => v.name.includes(p))
  );

  const finalVoices = filtered.length ? filtered : voicesList;

  const select = document.querySelector("#tts-voice");
  select.innerHTML = "";

  finalVoices.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    select.appendChild(opt);
  });

  currentVoice = finalVoices[0]?.name || null;
}

/* ==========================================================
   🚀 INICIAR LECTURA
   ========================================================== */
function startReading() {
  stopReading();

  container = document.querySelector("main") || document.body;
  originalHTML = container.innerHTML;

  const text = container.innerText;
  blocks = text.match(/[^.!?]+[.!?]*/g) || [text];

  index = 0;
  paused = false;
  stopped = false;

  container.innerHTML = blocks.map((s,i)=>`
    <span class="tts-block" data-i="${i}" 
          style="transition:background 0.25s;">
      ${s}
    </span>
  `).join(" ");

  readNext();
}

/* ==========================================================
   ▶️ LEER SIGUIENTE BLOQUE (con Resume REAL)
   ========================================================== */
function readNext() {
  if (paused || stopped || index >= blocks.length) return;

  highlight(index);

  const voices = speechSynthesis.getVoices();
  const chosen =
    voices.find(v => v.name === currentVoice) ||
    voices.find(v => v.lang.startsWith("es")) ||
    voices[0] ||
    null;

  utter = new SpeechSynthesisUtterance(blocks[index].trim());
  utter.voice = chosen;
  utter.rate = rate;
  utter.lang = "es-ES";

  utter.onend = () => {
    if (!paused && !stopped) {
      index++;
      readNext();
    }
  };

  speechSynthesis.speak(utter);
}

/* ==========================================================
   ✨ HIGHLIGHT PREMIUM
   ========================================================== */
function highlight(i) {
  document.querySelectorAll(".tts-block")
    .forEach(el => el.style.background = "");

  const el = document.querySelector(`.tts-block[data-i="${i}"]`);
  if (el) el.style.background = "rgba(255,215,0,0.22)";
}

/* ==========================================================
   ⏹️ STOP REAL
   ========================================================== */
function stopReading() {
  stopped = true;
  paused = false;
  index = 0;
  speechSynthesis.cancel();
  clearHighlight();
}

function clearHighlight() {
  document.querySelectorAll(".tts-block")
    .forEach(el => el.style.background = "");
}

/* ==========================================================
   ❌ CERRAR + RESTAURAR TEXTO PERFECTO
   ========================================================== */
function closePanel() {
  if (container && originalHTML) container.innerHTML = originalHTML;

  const p = document.querySelector("#cfc-tts-panel");
  if (p) p.remove();

  showToast("Texto restaurado con éxito");
}

/* ==========================================================
   🟡 Toast Premium
   ========================================================== */
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style = `
    position:fixed; bottom:20px; left:20px;
    background:linear-gradient(90deg,#FFD700,#C5A200);
    padding:10px 16px; border-radius:10px;
    color:#111; font-weight:700; z-index:9999999;
    box-shadow:0 0 15px rgba(255,215,0,0.5);
  `;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}
