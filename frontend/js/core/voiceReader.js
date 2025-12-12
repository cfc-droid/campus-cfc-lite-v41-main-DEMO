/* ==========================================================
✅ CFC_FUNC_10_1R_20251107 — Narrador IA Integrado (V2.1 RestoreFix + Android Patch V3.1)
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const voiceBtn = document.querySelector(".tts-btn-fixed");
  if (voiceBtn) voiceBtn.addEventListener("click", openVoicePanel);
});

let currentVoice = null;
let currentRate = 1;
let isPaused = false;
let currentIndex = 0;
let sentences = [];
let utter = null;
let beep = null;
let textContainer = null;
let originalHTML = "";

// ==========================================================
// 🎧 Sonido metálico Premium
// ==========================================================
function initBeep() {
  beep = new Audio(
    "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAABErAAACABAAZGF0YRQAAAAAAP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A/wD/AP8A"
  );
}

// ==========================================================
// 🧩 Panel visual IA
// ==========================================================
function openVoicePanel() {
  if (document.querySelector(".tts-panel")) return;

  // ======================================================
  // 📌 FIX ANDROID — desbloqueo obligatorio del TTS
  // ======================================================
  try {
    const unlock = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(unlock);
    speechSynthesis.cancel();
  } catch (e) {
    console.warn("Android TTS unlock failed:", e);
  }

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

  // === Eventos ===
  document.getElementById("readAll").onclick = () => startReading();

  // ======================================================
  // 📌 FIX ANDROID — Pause / Resume / Stop completamente funcional
  // ======================================================
  document.getElementById("pause").onclick = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
    isPaused = true;
    beep?.play();
  };

  document.getElementById("resume").onclick = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
    }
    isPaused = false;
    beep?.play();
  };

  document.getElementById("stop").onclick = () => {
    speechSynthesis.cancel();
    isPaused = false;
    currentIndex = 0;
    beep?.play();
  };

  const closeBtn = document.getElementById("close");
  closeBtn.onclick = () => closeAndRestore();

  const voiceSelect = document.getElementById("voiceSelect");
  const speedBtns = document.querySelectorAll(".speed-btn");

  // Velocidad
  speedBtns.forEach((btn) => {
    btn.onclick = () => {
      currentRate = parseFloat(btn.dataset.rate);
      speedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      beep?.play();

      if (utter && speechSynthesis.speaking) {
        speechSynthesis.pause();
        const resumeIndex = currentIndex;
        speechSynthesis.cancel();
        setTimeout(() => {
          currentIndex = resumeIndex;
          readNextSentence();
        }, 150);
      }
    };
  });

  // Cambio de voz
  voiceSelect.addEventListener("change", () => {
    currentVoice = voiceSelect.value;
    beep?.play();
  });
}

// ==========================================================
// 🚀 Motor de lectura
// ==========================================================
function startReading() {
  stopReading();
  textContainer = document.querySelector("main") || document.body;

  originalHTML = textContainer.innerHTML;

  const text = textContainer.innerText;
  sentences = text.match(/[^.!?]+[.!?]*/g) || [text];
  currentIndex = 0;
  isPaused = false;

  const html = sentences
    .map((s, i) => `<span class="tts-sentence" data-index="${i}">${s}</span>`)
    .join(" ");
  textContainer.innerHTML = html;

  readNextSentence();
}

function readNextSentence() {
  if (isPaused || currentIndex >= sentences.length) return;

  const sentenceEls = document.querySelectorAll(".tts-sentence");
  sentenceEls.forEach((el) =>
    el.classList.remove("tts-active", "tts-active-dark", "tts-active-light")
  );

  const currentEl = sentenceEls[currentIndex];
  if (!currentEl) return;

  const bgColor = window.getComputedStyle(document.body).backgroundColor;
  const isDark = getLuminance(bgColor) < 128;

  currentEl.classList.add(isDark ? "tts-active-dark" : "tts-active-light");

  utter = new SpeechSynthesisUtterance(currentEl.innerText.trim());
  utter.lang = "es-ES";
  utter.rate = currentRate;

  const availableVoices = speechSynthesis.getVoices();

  utter.voice =
    availableVoices.find((v) => v.name === currentVoice) ||
    availableVoices.find((v) => v.lang?.startsWith("es")) ||
    null;

  utter.onend = () => {
    if (!isPaused) {
      currentIndex++;
      readNextSentence();
    }
  };

  speechSynthesis.speak(utter);
}

// ==========================================================
// ⏹️ Stop Reading
// ==========================================================
function stopReading() {
  speechSynthesis.cancel();
  currentIndex = 0;
  isPaused = false;

  document
    .querySelectorAll(".tts-sentence")
    .forEach((el) =>
      el.classList.remove("tts-active", "tts-active-dark", "tts-active-light")
    );
}

// ==========================================================
// 🔁 Restaurar formato original al cerrar
// ==========================================================
function closeAndRestore() {
  stopReading();

  if (textContainer && originalHTML) {
    textContainer.innerHTML = originalHTML;
    originalHTML = "";
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

// ==========================================================
// 🧮 Utilidad luminancia
// ==========================================================
function getLuminance(rgb) {
  const nums = rgb.match(/\d+/g);
  if (!nums) return 255;
  const [r, g, b] = nums.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

// ==========================================================
// 🗣️ Carga de voces — FIX COMPLETO ANDROID
// ==========================================================
async function loadVoices() {
  const select = document.getElementById("voiceSelect");
  if (!select) return;

  let voices = speechSynthesis.getVoices();
  let retries = 0;

  // Android muchas veces devuelve lista vacía → esperar
  while ((!voices || voices.length === 0) && retries < 20) {
    await new Promise((r) => setTimeout(r, 100));
    voices = speechSynthesis.getVoices();
    retries++;
  }

  const spanish = voices.filter((v) => v.lang?.startsWith("es"));

  const finalVoices =
    spanish.length > 0 ? spanish : voices.length > 0 ? voices.slice(0, 1) : [];

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
🔒 CFC-SYNC QA — V2.1 RestoreFix + Android Patch V3.1
========================================================== */
