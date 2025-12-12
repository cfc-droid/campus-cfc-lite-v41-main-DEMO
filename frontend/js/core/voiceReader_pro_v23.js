/* ============================================================================
 🎧 CFC-VOICE READER PRO — V23 REAL DEFINITIVO
 ✔ Highlight de frase completa
 ✔ Resume exacto
 ✔ Android Chrome OK
✔ PC Chrome OK
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

/* =========================
   LOG
========================= */
const log = (...m) => console.log("🎧 V23:", ...m);

/* ============================================================================
   1) AUDIO UNLOCK PARA ANDROID (OBLIGATORIO)
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
   2) CARGA DE VOCES — POLLING SEGURO + FILTRO MASCULINAS ES-LA REAL
============================================================================ */
function loadVoicesPolling(maxAttempts = 40) {
    return new Promise(resolve => {
        let attempts = 0;

        const timer = setInterval(() => {
            const list = speechSynthesis.getVoices();
            if (list && list.length > 0) {
                clearInterval(timer);

                /* 🔥 Filtramos español */
                let es = list.filter(v => v.lang.toLowerCase().startsWith("es"));

                /* 🔥 Masculinas reales ES-LA (Android Chrome) */
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
   3) MICRO-SEGMENTACIÓN PROFESIONAL (5–7 PALABRAS)
============================================================================ */
function extractSegments() {
    const container = document.querySelector("main") || document.body;
    const raw = container.innerText.replace(/\s+/g, " ").trim();
    const words = raw.split(" ");

    segments = [];
    let temp = [];

    words.forEach(w => {
        temp.push(w);
        if (temp.length >= 6) {      // ideal para Android
            segments.push(temp.join(" "));
            temp = [];
        }
    });

    if (temp.length > 0) segments.push(temp.join(" "));

    log("Segmentos creados:", segments.length);
}

/* ============================================================================
   4) HIGHLIGHT REAL BASADO EN charIndex (Android compatible)
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
   5) REPRODUCCIÓN DE UN SEGMENTO — MOTOR PRINCIPAL V22
============================================================================ */
function speakSegment(segI, wordI) {
    if (segI >= segments.length) return stopReading();

    segmentIndex = segI;
    wordIndex = wordI || 0;

    const fullText = segments[segI];
    const words = fullText.split(" ");
    const textToRead = words.slice(wordIndex).join(" ");

    utter = new SpeechSynthesisUtterance(textToRead);

    /* ✔ Asignar voz */
    const v = voices.find(v => v.name === currentVoice) || voices[0];
    if (v) {
        utter.voice = v;
        utter.lang = v.lang;
    }

    utter.rate = rate;

    /* 💛 Highlight REAL usando charIndex */
utter.onboundary = e => {
    if (e.charIndex != null) {

        // Texto actual del segmento
        let before = fullText.slice(0, e.charIndex);
        let after = fullText.slice(e.charIndex);

        // Buscar inicio de frase (último punto previo)
        let startIdx = before.lastIndexOf(".") + 1;

        // Buscar final de frase (siguiente punto)
        let endIdx = after.indexOf(".");
        if (endIdx !== -1) {
            endIdx = e.charIndex + endIdx + 1;
        } else {
            endIdx = fullText.length;
        }

        // Extraer frase completa
        const sentence = fullText.slice(startIdx, endIdx).trim();

        if (sentence.length > 0) {
            highlightSentence(sentence);
        }

        // 🔥 NECESARIO PARA RESUME EXACTO
        let approxWord = Math.floor(e.charIndex / (fullText.length / words.length));
        wordIndex = Math.min(words.length - 1, approxWord);
    }
};
 
    /* 👇 Cuando termina el segmento */
    utter.onend = () => {
        if (!isReading) return;
        segmentIndex++;
        wordIndex = 0;
        speakSegment(segmentIndex, 0);
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   6) CONTROLES REALES V22
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

    /* 🔥 Android NO retoma utterance — RECONSTRUIMOS DESDE LA PALABRA EXACTA */
    speechSynthesis.cancel();
    speakSegment(segmentIndex, wordIndex);
}

function stopReading() {
    isReading = false;
    isPaused = false;
    segmentIndex = 0;
    wordIndex = 0;
    speechSynthesis.cancel();
    removeHighlight();
}

/* ============================================================================
   7) PANEL PREMIUM COMPACTO (1/4 PANTALLA)
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
            .cfcBtn{
                width:100%;padding:6px;background:#FFD700;color:#000;
                font-weight:700;border:none;border-radius:8px;cursor:pointer;
            }
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

    /* VOCES */
    const sel = panel.querySelector("#ttsVoice");
    voices.forEach(v => {
        let o = document.createElement("option");
        o.value = v.name;
        o.textContent = `${v.name}`;
        sel.appendChild(o);
    });
    sel.onchange = e => currentVoice = e.target.value;

    /* VELOCIDADES */
    const rateBox = panel.querySelector("#ttsRate");
    [0.75,1,1.25,1.5,1.75,2].forEach(r => {
        let b = document.createElement("button");
        b.className = "rateBtn";
        b.textContent = "x"+r;
        b.onclick = () => {
            rate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");

            /* 🔥 Reconstrucción dinámica */
            if (speechSynthesis.speaking) {
                speechSynthesis.cancel();
                speakSegment(segmentIndex, wordIndex);
            }
        };
        rateBox.appendChild(b);
    });

    /* BOTONES */
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
   8) BOTÓN PREMIUM FIJO
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
