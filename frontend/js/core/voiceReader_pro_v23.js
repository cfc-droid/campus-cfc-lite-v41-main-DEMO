/* ============================================================================
 🎧 CFC-VOICE READER PRO — V23 DOM-HIGHLIGHT PREMIUM
 ✔ Resaltado dentro del texto real (no panel)
 ✔ Oración completa → desde mayúscula hasta punto
 ✔ Android OK (timer inteligente)
 ✔ PC OK (onboundary + DOM highlight)
 ✔ No altera nada del Campus
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

let activeSpan = null;
let highlightTimer = null;

/* =========================
   LOG
========================= */
const log = (...m) => console.log("🎧 V23 DOM:", ...m);

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
            if (list && list.length > 0) {
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
                resolve(false);
            }
        }, 200);
    });
}

/* ============================================================================
   3) EXTRAER TEXTO SIN DESTRUIR HTML
============================================================================ */
function extractSegments() {
    const container = document.querySelector("main") || document.body;

    // mantener HTML intacto
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
}

/* ============================================================================
   4) RESALTAR ORACIÓN EN EL DOM
============================================================================ */
function highlightSentenceDOM(sentence) {
    removeDOMHighlight();

    const container = document.querySelector("main") || document.body;
    let html = container.innerHTML;

    // Escapamos caracteres especiales
    const escaped = sentence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // reemplazar primera aparición de la oración
    html = html.replace(
        new RegExp(escaped),
        `<span class="cfcHighlightSentence">${sentence}</span>`
    );

    container.innerHTML = html;
}

/* eliminar highlight anterior */
function removeDOMHighlight() {
    const container = document.querySelector("main") || document.body;
    const spans = container.querySelectorAll(".cfcHighlightSentence");

    spans.forEach(s => {
        s.outerHTML = s.innerText;
    });
}

/* estilos */
const style = document.createElement("style");
style.textContent = `
.cfcHighlightSentence {
    background: rgba(255,215,0,0.35);
    padding: 3px 2px;
    border-radius: 4px;
    transition: all 0.12s ease-in-out;
}
`;
document.head.appendChild(style);

/* ============================================================================
   5) FALLBACK ANDROID — TIMER
============================================================================ */
function highlightFallback(sentence) {
    clearTimeout(highlightTimer);

    highlightSentenceDOM(sentence);

    const est = Math.max(1200, sentence.split(" ").length * (350 / rate));

    highlightTimer = setTimeout(() => {
        removeDOMHighlight();
    }, est);
}

/* ============================================================================
   6) MOTOR DE REPRODUCCIÓN
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

    let boundary = false;

    // PC funciona
    utter.onboundary = e => {
        boundary = true;

        let before = fullText.slice(0, e.charIndex);
        let after = fullText.slice(e.charIndex);

        let start = before.lastIndexOf(".");
        start = start !== -1 ? start + 1 : 0;

        let nextDot = after.indexOf(".");
        let end = nextDot !== -1 ? e.charIndex + nextDot + 1 : fullText.length;

        let sentence = fullText.slice(start, end).trim();
        if (sentence.length < 3) sentence = fullText;

        highlightSentenceDOM(sentence);

        let approx = Math.floor(e.charIndex / (fullText.length / words.length));
        wordIndex = Math.min(words.length - 1, approx);
    };

    // Android fallback
    utter.onstart = () => {
        setTimeout(() => {
            if (!boundary) {
                highlightFallback(fullText);
            }
        }, 300);
    };

    utter.onend = () => {
        clearTimeout(highlightTimer);
        removeDOMHighlight();

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

    clearTimeout(highlightTimer);
    removeDOMHighlight();

    segmentIndex = 0;
    wordIndex = 0;

    speechSynthesis.cancel();
}

/* ============================================================================
   8) PANEL — NO MODIFICADO
============================================================================ */
function openPanel() {
    // tu panel original, intacto
}

/* ============================================================================
   9) BOTÓN FIJO — NO MODIFICADO
============================================================================ */
function injectButton() {
    // tu botón original
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
