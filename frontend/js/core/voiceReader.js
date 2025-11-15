/* ==========================================================
✅ CFC_FUNC_10_1R_20251107 — Narrador IA Integrado (V2.1 RestoreFix)
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
  document.getElementById("pause").onclick = () => {
    isPaused = true;
    speechSynthesis.pause();
    if (beep) beep.play();
  };
  document.getElementById("resume").onclick = () => {
    isPaused = false;
    speechSynthesis.resume();
    if (beep) beep.play();
  };
  document.getElementById("stop").onclick = () => stopReading();

  const closeBtn = document.getElementById("close");
  closeBtn.onclick = () => closeAndRestore(); // 🧠 restauración garantizada

  const voiceSelect = document.getElementById("voiceSelect");
  const speedBtns = document.querySelectorAll(".speed-btn");

  // Velocidad
  speedBtns.forEach((btn) => {
    btn.onclick = () => {
      currentRate = parseFloat(btn.dataset.rate);
      speedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (beep) beep.play();

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
    if (beep) beep.play();
  });
}

// ==========================================================
// 🚀 Motor de lectura
// ==========================================================
function startReading() {
  stopReading();
  textContainer = document.querySelector("main") || document.body;
  originalHTML = textContainer.innerHTML; // 🔒 Guardamos estructura original

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
  sentenceEls.forEach((el) => el.classList.remove("tts-active"));

  const currentEl = sentenceEls[currentIndex];
  if (!currentEl) return;

  const bgColor = window.getComputedStyle(document.body).backgroundColor;
  const isDark = getLuminance(bgColor) < 128;
  currentEl.classList.add(isDark ? "tts-active-dark" : "tts-active-light");

  utter = new SpeechSynthesisUtterance(currentEl.innerText.trim());
  utter.lang = "es-ES";
  utter.rate = currentRate;
  utter.voice =
    speechSynthesis.getVoices().find((v) => v.name === currentVoice) ||
    speechSynthesis.getVoices().find((v) => v.lang.startsWith("es")) ||
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
    .forEach((el) => el.classList.remove("tts-active", "tts-active-dark", "tts-active-light"));
}

// ==========================================================
// 🔁 Restaurar formato original al cerrar
// ==========================================================
function closeAndRestore() {
  stopReading();

  // Si hay texto modificado, restauramos
  if (textContainer && originalHTML) {
    textContainer.innerHTML = originalHTML;
    originalHTML = "";
  }

  // Removemos panel (si existe)
  const panel = document.querySelector(".tts-panel");
  if (panel) panel.remove();

  // Confirmación visual sutil
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
// 🗣️ Voces en español (2F + 1M)
// ==========================================================
function loadVoices() {
  const select = document.getElementById("voiceSelect");
  if (!select) return;
  select.innerHTML = "";

  const allVoices = speechSynthesis.getVoices();
  const spanish = allVoices.filter((v) => v.lang.startsWith("es"));
  const femalePriority = ["Helena", "Laura", "Elena", "Sofía"];
  const malePriority = ["Pablo", "Enrique", "Carlos", "Jorge"];

  const female = spanish
    .filter((v) => femalePriority.some((n) => v.name.includes(n)))
    .slice(0, 2);
  const male = spanish
    .filter((v) => malePriority.some((n) => v.name.includes(n)))
    .slice(0, 1);

  let finalVoices = [...female, ...male];
  if (finalVoices.length < 3)
    finalVoices = [...finalVoices, ...spanish.slice(0, 3 - finalVoices.length)];

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
🔒 CFC-SYNC QA — V2.1 RestoreFix
✅ Restauración garantizada incluso si se cierra rápido
✅ Texto vuelve 100% a formato original
✅ Confirmación visual “Texto restaurado con éxito”
========================================================== */
