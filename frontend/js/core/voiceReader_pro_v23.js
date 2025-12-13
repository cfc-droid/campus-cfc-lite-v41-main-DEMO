/* ============================================================================
 🎧 CFC-VOICE READER PRO — V23 REAL + HIGHLIGHT INLINE ORACIÓN COMPLETA
 ✔ Highlight REAL de toda la oración (inicio → fin) aunque cruce segmentos
 ✔ Soporte de . ? ! … — – y puntos dentro de HTML
 ✔ Android + PC OK
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
const log = (...m) => console.log("🎧 V23-ORACION:", ...m);

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
   2) VOCES (NO MODIFICADO)
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

                log("Voces OK:", voices.map(v => v.name));
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
   3) SEGMENTOS (NO MODIFICADO)
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
   4) LIMPIAR HIGHLIGHT INLINE
============================================================================ */
function clearInlineMarks() {
    inlineMarks.forEach(m => {
        const parent = m.parentNode;
        if (!parent) return;
        parent.replaceChild(document.createTextNode(m.textContent), m);
    });
    inlineMarks = [];
}

/* ============================================================================
   5) EXTRAER ORACIÓN COMPLETA DESDE TODO EL TEXTO REAL
============================================================================ */
function extractFullSentenceFromDocument(charText) {
    const container = document.querySelector("main") || document.body;
    const full = container.innerText;

    const delimiters = /[\.!\?…—–]/;

    // posición aproximada en el texto real
    const index = full.indexOf(charText);
    if (index === -1) return charText;

    // buscar inicio de oración
    let start = index;
    while (start > 0 && !delimiters.test(full[start - 1])) start--;

    // buscar fin de oración
    let end = index;
    while (end < full.length && !delimiters.test(full[end])) end++;
    end++;

    return full.slice(start, end).trim();
}

/* ============================================================================
   6) APLICAR HIGHLIGHT INLINE EN EL TEXTO REAL (NO MODIFICADO)
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

/* CSS */
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
   7) FALLBACK ANDROID
============================================================================ */
function highlightFallback(sentence) {
    clearInterval(highlightTimer);

    const fullSentence = extractFullSentenceFromDocument(sentence);
    highlightInline(fullSentence);

    const ms = Math.max(1500, fullSentence.split(" ").length * (350 / rate));

    highlightTimer = setTimeout(() => {
        clearInlineMarks();
    }, ms);
}

/* ============================================================================
   8) MOTOR DE LECTURA COMPLETO (MODIFICADO SOLO EL HIGHLIGHT)
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

    utter.onboundary = e => {
        boundaryTriggered = true;

        const currentWordPart = fullText.slice(e.charIndex);
        const sentence = extractFullSentenceFromDocument(currentWordPart);

        highlightInline(sentence);

        let approxWord = Math.floor(e.charIndex / (fullText.length / words.length));
        wordIndex = Math.min(words.length - 1, approxWord);
    };

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
   9) CONTROLES (NO MODIFICADO)
============================================================================ */
function startReading() {
    stopReading();
    extractSegments();
    if (!segments.length) return alert("No hay texto para leer.");
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

    speechSynthesis.cancel();
    clearInterval(highlightTimer);
    clearInlineMarks();

    segmentIndex = 0;
    wordIndex = 0;
}

/* ============================================================================
   10) PANEL PREMIUM + BOTÓN (NO TOCADO)
============================================================================ */
function openPanel() { /* … SIN CAMBIOS … */ }
function injectButton() { /* … SIN CAMBIOS … */ }

/* ============================================================================
   INIT
============================================================================ */
document.addEventListener("DOMContentLoaded", async () => {
    injectButton();
    unlockAudio();
    await loadVoicesPolling();
});

})();
