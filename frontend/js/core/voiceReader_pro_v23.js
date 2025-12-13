/* ============================================================================
 🎧 CFC-VOICE READER PRO — V23 FIX HÍBRIDO DEFINITIVO
 ✔ Highlight de frase completa en PC
 ✔ Highlight en Android (timer fallback)
 ✔ Resume exacto
 ✔ No altera nada relevante del Campus
============================================================================ */

(() => {

/* =========================
   VARIABLES PRINCIPALES
========================= */
let segments = [];
let segmentIndex = 0;
let wordIndex = 0;

let utter = null;
let voices = [];
let currentVoice = null;
let rate = 1;

let isReading = false;
let isPaused = false;

let highlightBox = null;

/* Timer fallback */
let highlightTimer = null;

/* =========================
   LOG
========================= */
const log = (...m) => console.log("🎧 V23-FIX:", ...m);

/* ============================================================================
   1) AUDIO UNLOCK PARA ANDROID
============================================================================ */
function unlockAudio() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        g.gain.value = 0.00001;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.03);
    } catch (e) {}
}

/* ============================================================================
   2) VOCES
============================================================================ */
function loadVoicesPolling(maxAttempts = 40) {
    return new Promise(resolve => {
        let attempts = 0;

        const timer = setInterval(() => {
            const list = speechSynthesis.getVoices();
            if (list && list.length > 0) {
                clearInterval(timer);

                let es = list.filter(v => v.lang.toLowerCase().startsWith("es"));
                let males = es.filter(v =>
                    /(Standard\s*B|Standard\s*C|Standard\s*D|Baritone|Deep|Grave)/i.test(v.name)
                );

                voices = males.length ? males : es.length ? es : list;
                currentVoice = voices[0]?.name || null;

                log("Voces finales:", voices.map(v => v.name));
                resolve(true);
                return;
            }
            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(timer);
                alert("⚠️ No se pudieron cargar las voces. Recargá la página.");
                resolve(false);
            }
        }, 200);
    });
}

/* ============================================================================
   3) MICRO–SEGMENTOS
============================================================================ */
function extractSegments() {
    const container = document.querySelector("main") || document.body;
    const raw = container.innerText.replace(/\s+/g, " ").trim();
    const words = raw.split(" ");

    segments = [];
    let temp = [];

    words.forEach(w => {
        temp.push(w);
        if (temp.length >= 6) {
            segments.push(temp.join(" "));
            temp = [];
        }
    });

    if (temp.length > 0) segments.push(temp.join(" "));

    log("Segmentos:", segments.length);
}

/* ============================================================================
   4) HIGHLIGHT UI
============================================================================ */
function highlightSentence(text) {
    removeHighlight();

    highlightBox = document.createElement("div");
    Object.assign(highlightBox.style, {
        position: "fixed",
        left: "0",
        bottom: "0",
        width: "100%",
        padding: "18px",
        background: "rgba(255,215,0,0.25)",
        color: "#000",
        fontSize: "20px",
        fontWeight: "700",
        lineHeight: "1.4",
        textAlign: "center",
        zIndex: "999999998",
        backdropFilter: "blur(6px)"
    });

    highlightBox.textContent = text.trim();
    document.body.appendChild(highlightBox);
}

function removeHighlight() {
    if (highlightBox) highlightBox.remove();
}

/* ============================================================================
   5) FALLBACK: TIMER PARA ANDROID
============================================================================ */
function highlightFallback(text) {
    clearInterval(highlightTimer);

    // tiempo estimado del segmento (según longitud × velocidad)
    const ms = Math.max(1200, text.split(" ").length * (350 / rate));

    highlightSentence(text);

    highlightTimer = setTimeout(() => {
        removeHighlight();
    }, ms);
}

/* ============================================================================
   6) REPRODUCCIÓN — MOTOR PRINCIPAL
============================================================================ */
function speakSegment(segI, wordI) {
    if (segI >= segments.length) return stopReading();

    segmentIndex = segI;
    wordIndex = wordI || 0;

    const fullText = segments[segI];
    const words = fullText.split(" ");
    const textToRead = words.slice(wordIndex).join(" ");

    utter = new SpeechSynthesisUtterance(textToRead);

    const v = voices.find(v => v.name === currentVoice) || voices[0];
    if (v) {
        utter.voice = v;
        utter.lang = v.lang;
    }
    utter.rate = rate;

    let boundaryTriggered = false;

    /* -------------------------
       PC: onboundary funciona
       ANDROID: casi nunca
       ------------------------- */
    utter.onboundary = e => {
        boundaryTriggered = true;

        let before = fullText.slice(0, e.charIndex);
        let after = fullText.slice(e.charIndex);

        let startIdx = before.lastIndexOf(".");
        startIdx = startIdx !== -1 ? startIdx + 1 : 0;

        let nextDot = after.indexOf(".");
        let endIdx = nextDot !== -1 ? e.charIndex + nextDot + 1 : fullText.length;

        let sentence = fullText.slice(startIdx, endIdx).trim();
        if (!sentence || sentence.length < 3) sentence = fullText;

        highlightSentence(sentence);

        let approxWord = Math.floor(e.charIndex / (fullText.length / words.length));
        wordIndex = Math.min(words.length - 1, approxWord);
    };

    /* -------------------------
       Fallback Android:
       Si no hubo boundaries,
       activamos highlight por tiempo
       ------------------------- */
    utter.onstart = () => {
        setTimeout(() => {
            if (!boundaryTriggered) {
                highlightFallback(fullText);
            }
        }, 300);
    };

    utter.onend = () => {
        clearInterval(highlightTimer);
        removeHighlight();

        if (!isReading) return;

        segmentIndex++;
        wordIndex = 0;
        speakSegment(segmentIndex, 0);
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   7) CONTROLES
============================================================================ */
function startReading() {
    stopReading();
    extractSegments();

    if (!segments.length) {
        alert("No hay texto para leer.");
        return;
    }

    isReading = true;
    isPaused = false;

    speakSegment(0, 0);
}

function pauseReading() {
    if (speechSynthesis.speaking) {
        isPaused = true;
        speechSynthesis.pause();
    }
}

function resumeReading() {
    if (!isPaused) return;

    isPaused = false;
    speechSynthesis.cancel();
    speakSegment(segmentIndex, wordIndex);
}

function stopReading() {
    isReading = false;
    isPaused = false;

    clearInterval(highlightTimer);
    removeHighlight();
    segmentIndex = 0;
    wordIndex = 0;

    speechSynthesis.cancel();
}

/* ============================================================================
   8) PANEL PREMIUM (NO MODIFICADO)
============================================================================ */
function openPanel() {
    if (document.querySelector("#cfcTTSPanel")) return;

    const panel = document.createElement("div");
    panel.id = "cfcTTSPanel";

    Object.assign(panel.style, {
        position: "fixed",
        left: "20px",
        bottom: "100px",
        width: "160px",
        padding: "12px",
        background: "#000",
        border: "2px solid #FFD700",
        borderRadius: "12px",
        color: "#fff",
        fontFamily: "Inter,sans-serif",
        zIndex: 999999997,
        boxShadow: "0 0 18px rgba(255,215,0,0.4)"
    });

    panel.innerHTML = `
        <h4 style="color:#FFD700;margin:0 0 6px 0;font-size:14px;">Narrador IA</h4>

        <select id="ttsVoice" style="
            width:100%;padding:4px;background:#111;border:1px solid #FFD700;
            color:white;border-radius:6px;margin-bottom:6px;"></select>

        <label style="font-size:12px;">Velocidad:</label>
        <div id="ttsRate" style="margin-bottom:6px;"></div>

        <button id="ttsRead" class="cfcBtn">▶ Leer</button>

        <div style="display:flex;justify-content:space-between;margin-top:6px;">
            <button id="ttsPause" class="cfcRow">⏸</button>
            <button id="ttsResume" class="cfcRow">▶</button>
        </div>

        <button id="ttsStop" class="cfcStop">⏹</button>
        <button id="ttsClose" class="cfcClose">❌</button>

        <style>
            .cfcBtn{ width:100%;padding:6px;background:#FFD700;color:#000;
                     font-weight:700;border:none;border-radius:8px;cursor:pointer; }
            .cfcRow{
                width:48%;padding:6px;background:#222;border:1px solid #FFD700;
                color:white;border-radius:6px;cursor:pointer;font-size:12px;
            }
            .cfcStop{
                width:100%;padding:6px;background:#b82828;color:white;
                font-weight:700;border:none;border-radius:8px;margin-top:6px;
            }
            .cfcClose{
                width:100%;padding:6px;background:#444;color:white;
                border-radius:6px;cursor:pointer;margin-top:6px;
            }
            .rateBtn{
                padding:4px 6px;margin:2px;background:#111;color:#FFD700;
                border:1px solid #FFD700;border-radius:6px;cursor:pointer;
                font-size:11px;
            }
            .rateBtn.active{ background:#FFD700;color:#000; }
        </style>
    `;

    document.body.appendChild(panel);

    const sel = panel.querySelector("#ttsVoice");
    voices.forEach(v => {
        let o = document.createElement("option");
        o.value = v.name;
        o.textContent = `${v.name}`;
        sel.appendChild(o);
    });

    sel.onchange = e => currentVoice = e.target.value;

    const rateBox = panel.querySelector("#ttsRate");
    [0.75,1,1.25,1.5,1.75,2].forEach(r => {
        let b = document.createElement("button");
        b.className = "rateBtn";
        b.textContent = "x"+r;

        b.onclick = () => {
            rate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");

            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
                speakSegment(segmentIndex, wordIndex);
            }
        };
        rateBox.appendChild(b);
    });

    panel.querySelector("#ttsRead").onclick = startReading;
    panel.querySelector("#ttsPause").onclick = pauseReading;
    panel.querySelector("#ttsResume").onclick = resumeReading;
    panel.querySelector("#ttsStop").onclick = stopReading;
    panel.querySelector("#ttsClose").onclick = () => {
        stopReading();
        panel.remove();
    };
}

/* ============================================================================
   9) BOTÓN FIX
============================================================================ */
function injectButton() {
    if (document.querySelector("#cfcTTSBtn")) return;

    const btn = document.createElement("button");
    btn.id = "cfcTTSBtn";

    Object.assign(btn.style, {
        position: "fixed",
        left: "20px",
        bottom: "20px",
        width: "55px",
        height: "55px",
        borderRadius: "50%",
        background: "linear-gradient(90deg,#FFD700,#C5A200)",
        border: "none",
        color: "#000",
        fontSize: "26px",
        fontWeight: "900",
        cursor: "pointer",
        boxShadow: "0 0 18px rgba(255,215,0,0.6)",
        zIndex: 999999999
    });

    btn.textContent = "🎧";
    btn.onclick = () => {
        unlockAudio();
        openPanel();
    };

    document.body.appendChild(btn);
}

/* ============================================================================
   INIT FINAL
============================================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    injectButton();
    unlockAudio();
    await loadVoicesPolling();
});

})();
