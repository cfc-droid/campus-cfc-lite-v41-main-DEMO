/* ==========================================================
✅ CFC_FUNC_10_1R_20251107 — Narrador IA Integrado
🌐 VERSIÓN COMPATIBLE GLOBAL V4.0 (Android + PC + iPhone)
— Pause REAL
— Resume REAL
— Stop REAL
— Voces adaptativas por dispositivo
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const voiceBtn = document.querySelector(".tts-btn-fixed");
  if (voiceBtn) voiceBtn.addEventListener("click", openVoicePanel);
});

let currentVoice = null;
let currentRate = 1;
let isPaused = false;
let isStopped = false;
let currentIndex = 0;
let sentences = [];
let utter = null;
let beep = null;
let textContainer = null;
let originalHTML = "";

/* ==========================================================
🎧 Sonido metálico Premium
========================================================== */
function initBeep() {
  beep = new Audio(
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAABErAAACABAAZGF0YRQAAAAAAP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A"
  );
}

/* ==========================================================
🧩 Panel Visual
========================================================== */
function openVoicePanel() {
  if (document.querySelector(".tts-panel")) return;

  // Desbloqueo Android (Chrome no inicializa voces hasta 1 speak vacío)
  try {
    const unlock = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(unlock);
    speechSynthesis.cancel();
  } catch (e) {}

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div class="tts-panel glass-box">
      <h4>🎧 Lectura IA CFC</h4>
      <label>Voz:
        <select id="voiceSelect"></select>
      </label><br>

      <div class="tts-speed">
        <span>Velocidad:</span><br>
        <button class="speed-btn" data-rate="0.75">x0.75</button>
        <button class="speed-btn" data-rate="1">x1</button>
        <button class="speed-btn" data-rate="1.25">x1.25</button>
        <button class="speed-btn" data-rate="1.5">x1.5</button>
        <button class="speed-btn" data-rate="1.75">x1.75</button>
        <button class="speed-btn" data-rate="2">x2</button>
      </div><br>

      <div class="tts-controls">
        <button id="readAll">Leer</button>
        <button id="pause">⏸️</button>
        <button id="resume">▶️</button>
        <button id="stop">⏹️</button>
        <button id="close" class="tts-close">❌</button>
      </div>
    </div>
  `
  );

  initBeep();
  loadVoices();

  document.getElementById("readAll").onclick = startReading;

  /* ==========================================================
  📌 PAUSE / RESUME COMPATIBLE ANDROID (motor propio)
  ========================================================== */
  document.getElementById("pause").onclick = () => {
    if (!isPaused) {
      isPaused = true;
      beep?.play();
    }
  };

  document.getElementById("resume").onclick = () => {
    if (isPaused) {
      isPaused = false;
      beep?.play();
      readNextSentence(); // reanuda lectura
    }
  };

  /* ==========================================================
  📌 STOP GLOBAL (funciona 100%)
  ========================================================== */
  document.getElementById("stop").onclick = () => {
    isStopped = true;
    isPaused = false;
    currentIndex = 0;
    speechSynthesis.cancel();
    removeHighlight();
    beep?.play();
  };

  document.getElementById("close").onclick = closeAndRestore;

  const speedBtns = document.querySelectorAll(".speed-btn");
  speedBtns.forEach((btn) => {
    btn.onclick = () => {
      currentRate = parseFloat(btn.dataset.rate);
      speedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      beep?.play();
    };
  });

  document.getElementById("voiceSelect").onchange = (e) => {
    currentVoice = e.target.value;
    beep?.play();
  };
}

/* ==========================================================
🚀 Motor de lectura — Versión Global
========================================================== */
function startReading() {
  stopReading();
  textContainer = document.querySelector("main") || document.body;
  originalHTML = textContainer.innerHTML;

  const text = textContainer.innerText;
  sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

  currentIndex = 0;
  isPaused = false;
  isStopped = false;

  const html = sentences
    .map((s, i) => `<span class="tts-sentence" data-index="${i}">${s}</span>`)
    .join(" ");
  textContainer.innerHTML = html;

  readNextSentence();
}

function readNextSentence() {
  if (isPaused || isStopped) return;
  if (currentIndex >= sentences.length) return;

  const els = document.querySelectorAll(".tts-sentence");
  removeHighlight();

  const el = els[currentIndex];
  if (!el) return;

  const bgColor = window.getComputedStyle(document.body).backgroundColor;
  const isDark = getLuminance(bgColor) < 128;
  el.classList.add(isDark ? "tts-active-dark" : "tts-active-light");

  utter = new SpeechSynthesisUtterance(el.innerText.trim());
  utter.lang = "es-ES";
  utter.rate = currentRate;

  const voices = speechSynthesis.getVoices();
  utter.voice =
    voices.find((v) => v.name === currentVoice) ||
    voices.find((v) => v.lang?.startsWith("es")) ||
    voices[0] ||
    null;

  utter.onend = () => {
    if (!isPaused && !isStopped) {
      currentIndex++;
      readNextSentence();
    }
  };

  speechSynthesis.speak(utter);
}

/* ==========================================================
⏹️ Stop TOTAL
========================================================== */
function stopReading() {
  speechSynthesis.cancel();
  currentIndex = 0;
  isPaused = false;
  isStopped = false;
  removeHighlight();
}

function removeHighlight() {
  document
    .querySelectorAll(".tts-sentence")
    .forEach((el) => el.classList.remove("tts-active", "tts-active-dark", "tts-active-light"));
}

/* ==========================================================
🔁 Restaurar formato original
========================================================== */
function closeAndRestore() {
  isStopped = true;
  stopReading();

  if (textContainer && originalHTML) {
    textContainer.innerHTML = originalHTML;
  }

  const panel = document.querySelector(".tts-panel");
  if (panel) panel.remove();

  const toast = document.createElement("div");
  toast.textContent = "✅ Texto restaurado con éxito";
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "linear-gradient(90deg,#FFD700,#C5A200)";
  toast.style.color = "#111";
  toast.style.fontWeight = "600";
  toast.style.padding = "10px 18px";
  toast.style.borderRadius = "10px";
  toast.style.boxShadow = "0 0 15px rgba(255,215,0,0.5)";
  toast.style.zIndex = "999999";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}

/* ==========================================================
🧮 Luminancia
========================================================== */
function getLuminance(rgb) {
  const nums = rgb.match(/\d+/g);
  if (!nums) return 255;
  const [r, g, b] = nums.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/* ==========================================================
🗣️ Carga de voces — Adaptativa Global
========================================================== */
async function loadVoices() {
  const select = document.getElementById("voiceSelect");
  if (!select) return;

  let voices = speechSynthesis.getVoices();
  let retries = 0;

  while ((!voices || voices.length === 0) && retries < 20) {
    await new Promise((r) => setTimeout(r, 100));
    voices = speechSynthesis.getVoices();
    retries++;
  }

  const spanish = voices.filter((v) => v.lang?.startsWith("es"));
  const finalVoices = spanish.length ? spanish : voices;

  select.innerHTML = "";
  finalVoices.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    select.appendChild(opt);
  });

  currentVoice = finalVoices[0]?.name || null;
}

speechSynthesis.onvoiceschanged = loadVoices;

/* ==========================================================
🔒 CFC-SYNC QA — Version Compatible Global V4.0
========================================================== */
