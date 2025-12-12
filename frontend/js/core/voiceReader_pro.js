/* ==========================================================
   🎧 CFC-VOICE READER PRO — V8.0 (FINAL REAL)
   PREMIUM FIX • Resume REAL • Velocidad REAL • Restauración REAL
   Botón fijo dorado • UI fija dorada • Voces mejoradas
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  injectFloatingButton();
});

/* ==========================================================
   1) BOTÓN FIJO PREMIUM (SOLUCIONA PUNTOS 2 Y 3)
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

  document.querySelector("#tts-btn-cfc").onclick = openPanel;
}

/* ==========================================================
   VARIABLES DEL SISTEMA
   ========================================================== */
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
   2) PANEL PREMIUM ORIGINAL FIJO (SOLUCIONA 6)
   ========================================================== */
function openPanel() {
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
   3) ANDROID UNLOCK
   ========================================================== */
function unlockAndroid() {
  try {
    const u = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(u);
    speechSynthesis.cancel();
  } catch (_) {}
}

/* ==========================================================
   4) EVENTOS + VELOCIDAD (SOLUCIONA 4)
   ========================================================== */
function setEvents() {
  document.querySelectorAll(".tts-rate").forEach(btn => {
    btn.onclick = () => (rate = parseFloat(btn.dataset.v));
  });

  document.querySelector("#tts-voice").onchange = e => {
    currentVoice = e.target.value;
  };

  document.querySelector("#tts-read").onclick = startReading;
  document.querySelector("#tts-pause").onclick = () => paused = true;

  document.querySelector("#tts-resume").onclick = () => {
    paused = false;
    readNextWord(); // resume EXACTAMENTE
  };

  document.querySelector("#tts-stop").onclick = stopReading;

  document.querySelector("#tts-close").onclick = () => {
    stopReading();
    closePanel();
  };
}

/* ==========================================================
   5) CARGA REAL DE VOCES (SOLUCIONA 5)
   ========================================================== */
async function loadVoices() {
  let tries = 0;
  while (speechSynthesis.getVoices().length === 0 && tries < 30) {
    await new Promise(r => setTimeout(r, 120));
    tries++;
  }

  voicesList = speechSynthesis.getVoices();

  // fuerza voz masculina si existe
  const masc = voicesList.filter(v =>
    /Pablo|Carlos|Jorge|Male|Hombre|Google Español Estados/.test(v.name)
  );

  const fem = voicesList.filter(v =>
    /Helena|Laura|Female|Mujer|Google español/.test(v.name)
  );

  let final = masc.length || fem.length ? [...masc, ...fem] : voicesList;

  const sel = document.querySelector("#tts-voice");
  sel.innerHTML = "";

  final.forEach(v => {
    const o = document.createElement("option");
    o.value = v.name;
    o.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(o);
  });

  currentVoice = final[0]?.name || null;
}

/* ==========================================================
   6) INICIAR LECTURA
   ========================================================== */
function startReading() {
  stopReading();

  container = document.querySelector("main") || document.body;
  originalHTML = container.innerHTML;

  let text = container.innerText;

  // NUEVO: cortar por PALABRA → resume EXACTO (solución punto 7)
  blocks = text.split(/\s+/);

  index = 0;
  paused = false;
  stopped = false;

  container.innerHTML = blocks
    .map((w, i) => `<span class="tts-word" data-i="${i}" 
                      style="transition:background 0.12s;">${w} </span>`)
    .join("");

  readNextWord();
}

/* ==========================================================
   7) LECTURA PALABRA POR PALABRA (Resume REAL)
   ========================================================== */
function readNextWord() {
  if (paused || stopped || index >= blocks.length) return;

  highlight(index);

  const voices = speechSynthesis.getVoices();
  const chosen =
    voices.find(v => v.name === currentVoice) ||
    voices.find(v => v.lang.startsWith("es")) ||
    voices[0];

  utter = new SpeechSynthesisUtterance(blocks[index]);
  utter.voice = chosen;
  utter.rate = rate;
  utter.lang = "es-ES";

  utter.onend = () => {
    if (!paused && !stopped) {
      index++;
      readNextWord();
    }
  };

  speechSynthesis.speak(utter);
}

/* ==========================================================
   8) HIGHLIGHT PREMIUM
   ========================================================== */
function highlight(i) {
  document.querySelectorAll(".tts-word").forEach(el => {
    el.style.background = "";
  });

  const el = document.querySelector(`.tts-word[data-i="${i}"]`);
  if (el) el.style.background = "rgba(255,215,0,0.30)";
}

/* ==========================================================
   9) STOP REAL
   ========================================================== */
function stopReading() {
  stopped = true;
  paused = false;
  index = 0;
  speechSynthesis.cancel();
}

/* ==========================================================
   10) CERRAR + RESTAURACIÓN PERFECTA (soluciona punto 8)
   ========================================================== */
function closePanel() {
  if (container && originalHTML) container.innerHTML = originalHTML;

  let p = document.querySelector("#cfc-tts-panel");
  if (p) p.remove();

  showToast("Texto restaurado con éxito");
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
