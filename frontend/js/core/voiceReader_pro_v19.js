/* ============================================================================
   🎧 CFC-VOICE READER PRO — V19 REAL (ULTRA FINAL)
   Chrome/Safari Full Unlock + Resume + Speed + Highlight + Male/Female Voices
   Sin Shadow DOM — sin bloqueos — sin duplicación — sin tocar capítulos.
   ============================================================================ */

(() => {

/* =======================
   VARIABLES PRINCIPALES
======================= */
let words = [];
let index = 0;
let isReading = false;
let utter = null;
let voices = [];
let currentVoice = null;
let rate = 1;
let highlightBox = null;

/* Log */
const log = (...m) => console.log("🎧 V19:", ...m);

/* ============================================================================
   1) DESBLOQUEO DE AUDIO (Chrome/Safari exige audio previo para liberar TTS)
============================================================================ */
function unlockAudio() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    gain.gain.value = 0.00001; // inaudible
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);

    log("Audio desbloqueado.");
}

/* ============================================================================
   2) CARGA DE VOCES (incluye masculinas cuando existen)
============================================================================ */
function loadVoices() {
    let list = speechSynthesis.getVoices() || [];

    log("Voces encontradas:", list.length);

    if (!list.length) {
        speechSynthesis.onvoiceschanged = () => loadVoices();
        return;
    }

    let es = list.filter(v => v.lang.toLowerCase().startsWith("es"));
    let male = list.filter(
        v =>
            /male|hombre|masculino|standard-b|standard-d/i.test(v.name)
    );

    voices = [...es, ...male, ...list.filter(v => !es.includes(v) && !male.includes(v))];

    // Eliminar duplicados
    const unique = {};
    voices.forEach(v => (unique[v.name] = v));
    voices = Object.values(unique);

    log("Voces finales:", voices.map(v => v.name));

    currentVoice = voices[0]?.name || null;
}

/* ============================================================================
   3) EXTRAER TEXTO DEL CAPÍTULO
============================================================================ */
function extractWords() {
    const container = document.querySelector("main") || document.body;

    if (!container) {
        alert("No se encontró el contenido del capítulo.");
        return;
    }

    const text = container.innerText.replace(/\s+/g, " ").trim();
    words = text.split(" ");

    log("Palabras obtenidas:", words.length);
}

/* ============================================================================
   4) HIGHLIGHT (sin modificar HTML)
============================================================================ */
function highlight(word) {
    removeHighlight();

    highlightBox = document.createElement("div");
    highlightBox.style.position = "fixed";
    highlightBox.style.left = "0";
    highlightBox.style.bottom = "0";
    highlightBox.style.width = "100%";
    highlightBox.style.padding = "14px";
    highlightBox.style.background = "rgba(255,215,0,0.18)";
    highlightBox.style.color = "#000";
    highlightBox.style.fontSize = "17px";
    highlightBox.style.fontWeight = "700";
    highlightBox.style.zIndex = "999999998";

    highlightBox.innerText = word || "";
    document.body.appendChild(highlightBox);
}

function removeHighlight() {
    if (highlightBox) {
        highlightBox.remove();
        highlightBox = null;
    }
}

/* ============================================================================
   5) MOTOR PRINCIPAL WORD-BOUNDARY (Resume exacto + velocidad real)
============================================================================ */
function speakFrom(i) {
    if (i >= words.length) {
        stopReading();
        return;
    }

    index = i;

    const textToRead = words.slice(index).join(" ");

    utter = new SpeechSynthesisUtterance(textToRead);

    const v = voices.find(v => v.name === currentVoice) || voices[0];
    if (v) {
        utter.voice = v;
        utter.lang = v.lang;
    }

    utter.rate = rate;

    utter.onboundary = ev => {
        index++;
        highlight(words[index - 1]);
    };

    utter.onend = () => {
        if (isReading) stopReading();
    };

    utter.onerror = e => {
        log("ERROR:", e);
    };

    log("🔊 Leyendo desde índice", index, "voz:", currentVoice, "rate:", rate);

    speechSynthesis.speak(utter);
}

/* ============================================================================
   6) CONTROLES PRINCIPALES
============================================================================ */
function startReading() {
    log("START");

    unlockAudio(); // Necesario para Chrome/Safari
    loadVoices();

    stopReading();
    extractWords();

    if (!words.length) {
        alert("No hay texto para leer.");
        return;
    }

    isReading = true;
    speakFrom(index);
}

function pauseReading() {
    if (speechSynthesis.speaking) {
        speechSynthesis.pause();
        log("PAUSA");
    }
}

function resumeReading() {
    if (speechSynthesis.paused) {
        speechSynthesis.resume();
        log("RESUME");
    }
}

function stopReading() {
    isReading = false;
    index = 0;
    speechSynthesis.cancel();
    removeHighlight();
    log("STOP");
}

/* ============================================================================
   7) PANEL PREMIUM (NO Shadow DOM — Chrome full compatible)
============================================================================ */
function openPanel() {
    if (document.querySelector("#cfcTTSPanel")) return;

    const panel = document.createElement("div");
    panel.id = "cfcTTSPanel";
    panel.style.position = "fixed";
    panel.style.left = "25px";
    panel.style.bottom = "95px";
    panel.style.width = "250px";
    panel.style.padding = "14px";
    panel.style.background = "#000";
    panel.style.border = "2px solid #FFD700";
    panel.style.borderRadius = "12px";
    panel.style.color = "#fff";
    panel.style.fontFamily = "Inter,sans-serif";
    panel.style.zIndex = "999999997";
    panel.style.boxShadow = "0 0 18px rgba(255,215,0,0.4)";

    panel.innerHTML = `
        <h4 style="color:#FFD700;margin:0 0 8px 0;font-size:16px;">Narrador IA</h4>

        <label>Voz:</label>
        <select id="ttsVoice" style="width:100%;padding:6px;margin-top:4px;
            background:#111;color:white;border:1px solid #FFD700;border-radius:6px;"></select>

        <label style="margin-top:10px;display:block;">Velocidad:</label>
        <div id="ttsRate"></div>

        <button id="ttsRead" class="cfcBtn">▶ Leer</button>

        <div style="display:flex;justify-content:space-between;margin-top:6px;">
            <button id="ttsPause" class="cfcRow">⏸ Pausa</button>
            <button id="ttsResume" class="cfcRow">▶ Seguir</button>
        </div>

        <button id="ttsStop" class="cfcStop">⏹ Detener</button>
        <button id="ttsClose" class="cfcClose">❌ Cerrar</button>

        <style>
            .cfcBtn {
                width:100%;padding:8px;margin-top:6px;
                background:#FFD700;color:#000;font-weight:700;
                border:none;border-radius:8px;cursor:pointer;
            }
            .cfcRow {
                width:48%;padding:7px;background:#222;
                border:1px solid #FFD700;color:white;border-radius:6px;cursor:pointer;
            }
            .cfcStop {
                width:100%;padding:8px;margin-top:6px;
                background:#b82828;color:white;font-weight:700;border:none;border-radius:8px;
                cursor:pointer;
            }
            .cfcClose {
                width:100%;padding:7px;margin-top:6px;
                background:#444;color:white;border-radius:6px;cursor:pointer;
            }
            .rateBtn {
                padding:6px 10px;margin:2px;background:#111;color:#FFD700;
                border:1px solid #FFD700;border-radius:6px;cursor:pointer;font-size:12px;
            }
            .rateBtn.active { background:#FFD700;color:#000; }
        </style>
    `;

    document.body.appendChild(panel);

    // Poblar voces
    setTimeout(() => {
        const voiceSel = document.querySelector("#ttsVoice");
        voiceSel.innerHTML = "";
        voices.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang})`;
            voiceSel.appendChild(opt);
        });
        currentVoice = voices[0]?.name;
    }, 400);

    // Velocidades
    const rates = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const rateBox = document.querySelector("#ttsRate");
    rates.forEach(r => {
        let b = document.createElement("button");
        b.className = "rateBtn";
        b.textContent = "x" + r;
        b.onclick = () => {
            rate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");
        };
        rateBox.appendChild(b);
    });

    // Eventos
    document.querySelector("#ttsVoice").onchange = e => {
        currentVoice = e.target.value;
        log("Voz:", currentVoice);
    };

    document.querySelector("#ttsRead").onclick = startReading;
    document.querySelector("#ttsPause").onclick = pauseReading;
    document.querySelector("#ttsResume").onclick = resumeReading;
    document.querySelector("#ttsStop").onclick = stopReading;
    document.querySelector("#ttsClose").onclick = () => {
        stopReading();
        panel.remove();
    };
}

/* ============================================================================
   8) BOTÓN DEL CAMPUS — ACTIVACIÓN OFICIAL
============================================================================ */
function initFixedButton() {
    const btn = document.querySelector(".tts-btn-fixed");
    if (!btn) {
        log("Botón .tts-btn-fixed NO encontrado");
        return;
    }

    btn.onclick = () => {
        log("Click principal → desbloqueo TTS");
        unlockAudio();
        loadVoices();
        openPanel();
    };
}

/* ============================================================================
   INIT
============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
    log("INIT V19 REAL");
    loadVoices();
    initFixedButton();
});

})();
