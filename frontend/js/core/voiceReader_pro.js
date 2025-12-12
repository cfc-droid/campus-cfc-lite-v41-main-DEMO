/* ==========================================================
   🎧 NARRADOR IA PRO — Versión Universal V6.0
   Compatible: Windows + Android + iPhone + iPad + Mac
   UI fija, voices adaptativas, pausa/resume/stop estable,
   sin romper NADA del Campus V41.
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".tts-btn-fixed");
  if (btn) btn.addEventListener("click", openNarratorPanel);
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
   PANEL UI — Estilo AMBER PRO (idéntico al que querés)
   ========================================================== */
function openNarratorPanel() {
  if (document.querySelector("#tts-panel")) return;

  unlockAndroidTTS();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="tts-panel" 
         style="
           position:fixed; bottom:20px; left:20px; 
           background:#111; border:2px solid #f1c40f; 
           padding:15px; border-radius:12px; z-index:999999;
           color:white; width:260px; font-family:'Inter',sans-serif;
           box-shadow:0 0 18px rgba(255,215,0,0.4);
         ">
      <h4 style="margin:0 0 10px 0; font-size:17px; color:#f1c40f;">
        🎧 Lectura IA CFC
      </h4>

      <label style="font-size:13px;">Voz:</label><br>
      <select id="tts-voice" 
              style="width:100%; margin:6px 0; padding:5px; border-radius:6px;">
      </select>

      <label style="font-size:13px;">Velocidad:</label><br>
      <div style="margin:6px 0;">
        ${[0.75,1,1.25,1.5,1.75,2].map(v =>
          `<button class="tts-rate" data-v="${v}"
           style="padding:4px 6px; margin:1px; background:#333; 
                  border:1px solid #555; border-radius:4px; color:white;">
            x${v}
           </button>`
        ).join("")}
      </div>

      <div style="margin-top:10px;">
        <button id="tts-read" 
          style="width:100%; margin-bottom:5px; padding:8px;
                 background:#f1c40f; border:none; border-radius:6px;">
          Leer
        </button>

        <button id="tts-pause" 
          style="width:48%; padding:6px; background:#444; border:none;
                 border-radius:6px; color:white;">
          ⏸️
        </button>

        <button id="tts-resume" 
          style="width:48%; padding:6px; background:#444; border:none;
                 border-radius:6px; color:white;">
          ▶️
        </button>

        <button id="tts-stop" 
          style="width:100%; margin-top:5px; padding:8px;
                 background:#c0392b; border:none; border-radius:6px; color:white;">
          ⏹️
        </button>

        <button id="tts-close" 
          style="width:100%; margin-top:5px; padding:6px;
                 background:#555; border:none; border-radius:6px; color:white;">
          ❌ Cerrar
        </button>
      </div>
    </div>
    `
  );

  loadVoices();
  setEvents();
}

/* ==========================================================
   Forzar inicialización en Android
   ========================================================== */
function unlockAndroidTTS() {
  try {
    const unlock = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(unlock);
    speechSynthesis.cancel();
  } catch (_) {}
}

/* ==========================================================
   Eventos UI
   ========================================================== */
function setEvents() {
  document.querySelectorAll(".tts-rate").forEach(btn => {
    btn.addEventListener("click", () => {
      rate = parseFloat(btn.dataset.v);
    });
  });

  document.querySelector("#tts-voice").addEventListener("change", e => {
    currentVoice = e.target.value;
  });

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
   Cargar voces realmente disponibles (PC / iPhone / Android)
   ========================================================== */
async function loadVoices() {
  let tries = 0;
  while (speechSynthesis.getVoices().length === 0 && tries < 20) {
    await new Promise(r => setTimeout(r, 100));
    tries++;
  }

  voicesList = speechSynthesis.getVoices();

  const preferredNames = [
    "Microsoft Helena", "Microsoft Laura", "Microsoft Pablo",
    "Google español", "Google español de Estados Unidos"
  ];

  const available = voicesList.filter(v =>
    preferredNames.some(p => v.name.includes(p))
  );

  const finalVoices = available.length ? available : voicesList;

  const sel = document.querySelector("#tts-voice");
  sel.innerHTML = "";

  finalVoices.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(opt);
  });

  currentVoice = finalVoices[0]?.name || null;
}

/* ==========================================================
   Iniciar lectura
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
    <span class="tts-block" data-i="${i}">${s}</span>
  `).join(" ");

  readNext();
}

/* ==========================================================
   Leer siguiente bloque
   ========================================================== */
function readNext() {
  if (paused || stopped || index >= blocks.length) return;

  highlight(index);

  const voices = speechSynthesis.getVoices();
  const usedVoice =
    voices.find(v => v.name === currentVoice) ||
    voices.find(v => v.lang.startsWith("es")) ||
    voices[0] ||
    null;

  utter = new SpeechSynthesisUtterance(blocks[index].trim());
  utter.voice = usedVoice;
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
   Resaltar línea actual
   ========================================================== */
function highlight(i) {
  document.querySelectorAll(".tts-block").forEach(el =>
    el.style.background = ""
  );
  const el = document.querySelector(`.tts-block[data-i="${i}"]`);
  if (el) el.style.background = "rgba(255,215,0,0.25)";
}

/* ==========================================================
   Stop real
   ========================================================== */
function stopReading() {
  stopped = true;
  paused = false;
  index = 0;
  speechSynthesis.cancel();
  clearHighlight();
}

function clearHighlight() {
  document.querySelectorAll(".tts-block").forEach(el =>
    el.style.background = ""
  );
}

/* ==========================================================
   Cerrar panel y restaurar texto
   ========================================================== */
function closePanel() {
  if (container && originalHTML) {
    container.innerHTML = originalHTML;
  }
  const p = document.querySelector("#tts-panel");
  if (p) p.remove();

  showToast("Texto restaurado con éxito");
}

/* ==========================================================
   Toast dorado premium
   ========================================================== */
function showToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style = `
    position:fixed; bottom:20px; right:20px; 
    background:linear-gradient(90deg,#FFD700,#C5A200);
    padding:10px 16px; border-radius:10px; font-weight:700;
    color:#111; z-index:999999; box-shadow:0 0 12px rgba(255,215,0,0.5)
  `;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}
