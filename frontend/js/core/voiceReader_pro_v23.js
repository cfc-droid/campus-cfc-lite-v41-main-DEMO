/* ============================================================================
 🎧 CFC-VOICE READER PRO — V24 ORACIÓN COMPLETA (PUNTO → PUNTO)
 ✔ Resalta oración completa REAL dentro del texto original
 ✔ Funciona en Android y PC
 ✔ Fallback por tiempo si onboundary falla
 ✔ Resume exacto
 ✔ Sin alterar nada relevante del Campus
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

let inlineMarks = [];  
let highlightTimer = null;

/* =========================
   LOG
========================= */
const log = (...m) => console.log("🎧 V24:", ...m);

/* ============================================================================
   1) AUDIO UNLOCK
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
            if (list.length > 0) {
                clearInterval(timer);

                let es = list.filter(v => v.lang.toLowerCase().startsWith("es"));
                let males = es.filter(v =>
                    /(Standard\s*B|Standard\s*C|Standard\s*D|Baritone|Deep|Grave)/i.test(v.name)
                );

                voices = males.length ? males : es.length ? es : list;
                currentVoice = voices[0]?.name || null;

                resolve(true);
                return;
            }

            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(timer);
                alert("⚠️ No se pudieron cargar las voces.");
                resolve(false);
            }
        }, 200);
    });
}

/* ============================================================================
   3) SEGMENTOS
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

    if (temp.length) segments.push(temp.join(" "));
}

/* ============================================================================
   4) LIMPIAR INLINE
============================================================================ */
function clearInlineMarks() {
    inlineMarks.forEach(m => {
        const parent = m.parentNode;
        if (parent) parent.replaceChild(document.createTextNode(m.textContent), m);
    });
    inlineMarks = [];
}

/* ============================================================================
   5) HIGHLIGHT INLINE EN EL TEXTO REAL
============================================================================ */
function highlightInline(sentence) {
    clearInlineMarks();
    if (!sentence) return;

    const container = document.querySelector("main") || document.body;
    const html = container.innerHTML;

    const escaped = sentence.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, "i");

    const newHTML = html.replace(regex, match => {
        return `<mark class="cfcInlineHL">${match}</mark>`;
    });

    container.innerHTML = newHTML;

    inlineMarks = Array.from(document.querySelectorAll(".cfcInlineHL"));
}

/* CSS highlight */
const style = document.createElement("style");
style.innerHTML = `
.cfcInlineHL {
    background: rgba(255,215,0,0.35);
    padding: 2px 4px;
    border-radius: 6px;
    box-shadow: 0 0 10px rgba(255,215,0,0.75);
}
`;
document.head.appendChild(style);

/* ============================================================================
   6) EXTRAER ORACIÓN COMPLETA (PUNTO → PUNTO)
============================================================================ */
function extractSentence(fullText, index) {
    const delimiters = /[.!?¿¡…—–]/g;

    let start = 0;
    let end = fullText.length;

    // inicio de oración
    let match;
    while ((match = delimiters.exec(fullText)) !== null) {
        if (match.index < index) start = match.index + match[0].length;
        else break;
    }

    // fin de oración
    delimiters.lastIndex = index;
    const forward = delimiters.exec(fullText);
    if (forward) end = forward.index + forward[0].length;

    return fullText.slice(start, end).trim();
}

/* ============================================================================
   7) FALLBACK ANDROID POR TIEMPO
============================================================================ */
function highlightFallback(sentence) {
    clearInterval(highlightTimer);
    highlightInline(sentence);

    const ms = Math.max(1500, sentence.split(" ").length * (350 / rate));

    highlightTimer = setTimeout(() => clearInlineMarks(), ms);
}

/* ============================================================================
   8) MOTOR DE LECTURA
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
    if (v) { utter.voice = v; utter.lang = v.lang; }
    utter.rate = rate;

    let boundaryTriggered = false;

    /* PC */
    utter.onboundary = e => {
        boundaryTriggered = true;

        let sentence = extractSentence(fullText, e.charIndex);
        if (!sentence || sentence.length < 3) sentence = fullText;

        highlightInline(sentence);

        let approxWord = Math.floor(e.charIndex / (fullText.length / words.length));
        wordIndex = Math.min(words.length - 1, approxWord);
    };

    /* ANDROID */
    utter.onstart = () => {
        setTimeout(() => {
            if (!boundaryTriggered) highlightFallback(fullText);
        }, 350);
    };

    utter.onend = () => {
        clearInterval(highlightTimer);
        clearInlineMarks();

        if (!isReading) return;

        segmentIndex++;
        wordIndex = 0;
        speakSegment(segmentIndex, 0);
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   9) CONTROLES
============================================================================ */
function startReading() {
    stopReading();
    extractSegments();
    if (!segments.length) return alert("No hay texto para leer.");
    isReading = true;
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

    speechSynthesis.cancel();
    clearInterval(highlightTimer);
    clearInlineMarks();

    segmentIndex = 0;
    wordIndex = 0;
}

/* ============================================================================
   10) PANEL PREMIUM (NO TOCADO)
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
        zIndex: 999999997,
        boxShadow: "0 0 18px rgba(255,215,0,0.4)"
    });

    panel.innerHTML = `
        <h4 style="color:#FFD700;margin:0 0 6px 0;font-size:14px;">Narrador IA</h4>
        <select id="ttsVoice" style="width:100%;padding:4px;background:#111;
        border:1px solid #FFD700;color:white;border-radius:6px;margin-bottom:6px;">
        </select>

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
            .cfcBtn{width:100%;padding:6px;background:#FFD700;color:#000;
                font-weight:700;border:none;border-radius:8px;cursor:pointer;}
            .cfcRow{width:48%;padding:6px;background:#222;border:1px solid #FFD700;
                color:white;border-radius:6px;cursor:pointer;font-size:12px;}
            .cfcStop{width:100%;padding:6px;background:#b82828;color:white;
                font-weight:700;border:none;border-radius:8px;margin-top:6px;}
            .cfcClose{width:100%;padding:6px;background:#444;color:white;
                border-radius:6px;cursor:pointer;margin-top:6px;}
            .rateBtn{padding:4px 6px;margin:2px;background:#111;color:#FFD700;
                border:1px solid #FFD700;border-radius:6px;cursor:pointer;font-size:11px;}
            .rateBtn.active{background:#FFD700;color:#000;}
        </style>
    `;

    document.body.appendChild(panel);

    const sel = panel.querySelector("#ttsVoice");
    voices.forEach(v => {
        const o = document.createElement("option");
        o.value = v.name;
        o.textContent = v.name;
        sel.appendChild(o);
    });

    sel.onchange = e => currentVoice = e.target.value;

    const rateBox = panel.querySelector("#ttsRate");
    [0.75,1,1.25,1.5,1.75,2].forEach(r => {
        const b = document.createElement("button");
        b.className = "rateBtn";
        b.textContent = "x" + r;

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
   11) BOTÓN
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
   INIT
============================================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    injectButton();
    unlockAudio();
    await loadVoicesPolling();
});

})();
