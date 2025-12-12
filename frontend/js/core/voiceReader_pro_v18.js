/* ============================================================================
   🎧 CFC-VOICE READER PRO — V18 ULTRA REAL (FINAL)
   Motor WordBoundary Engine + Highlight + Resume exacto + Velocidad dinámica
   Funciona perfecto en Chrome PC / Chrome Android.
   No modifica HTML, no afecta scripts del Campus, no rompe nada.
   ============================================================================ */

(() => {

/* =======================
   VARIABLES GLOBALES
======================= */
let text = "";
let words = [];
let index = 0;
let isReading = false;
let utter = null;
let playbackRate = 1;
let highlightBox = null;

let voices = [];
let currentVoice = null;

/* ============================================================================
   1) BOTÓN PREMIUM FLOTANTE
============================================================================ */
function injectFloatingButton() {
    if (document.querySelector("#cfcTTSButtonHost")) return;

    const host = document.createElement("div");
    host.id = "cfcTTSButtonHost";
    host.style.position = "fixed";
    host.style.left = "25px";
    host.style.bottom = "25px";
    host.style.zIndex = "9999999999";

    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
        <style>
            #btn {
                width:60px;height:60px;border-radius:50%;
                background:linear-gradient(90deg,#FFD700,#C5A200);
                border:none;font-size:28px;font-weight:900;color:#000;
                cursor:pointer;
                box-shadow:0 0 18px rgba(255,215,0,0.6);
            }
        </style>
        <button id="btn">🎧</button>
    `;

    shadow.querySelector("#btn").onclick = openPanel;
    document.body.appendChild(host);
}

/* ============================================================================
   2) PANEL PREMIUM (1/4 DE PANTALLA)
============================================================================ */
function openPanel() {
    if (document.querySelector("#cfcTTSPanelHost")) return;

    loadVoices();

    const host = document.createElement("div");
    host.id = "cfcTTSPanelHost";
    host.style.position = "fixed";
    host.style.left = "25px";
    host.style.bottom = "95px";
    host.style.zIndex = "9999999998";

    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
        <style>
            #panel {
                width:240px;padding:14px;
                background:#000;border:2px solid #FFD700;
                border-radius:12px;color:white;
                font-family:'Inter',sans-serif;
                box-shadow:0 0 18px rgba(255,215,0,0.4);
            }
            h4 { margin:0 0 8px 0;color:#FFD700;font-size:16px; }

            select,button {
                font-family:'Inter';
            }

            .rateBtn {
                padding:5px 8px;margin:2px;
                background:#111;border:1px solid #FFD700;
                color:#FFD700;border-radius:6px;font-size:12px;
                cursor:pointer;
            }
            .rateBtn.active { background:#FFD700;color:#000; }

            .bigBtn {
                width:100%;padding:8px;margin-top:6px;
                background:#FFD700;color:#000;
                border:none;border-radius:8px;font-weight:700;
                cursor:pointer;
            }
            .rowBtn {
                width:48%;padding:7px;background:#222;
                border:1px solid #FFD700;color:#fff;
                border-radius:6px;cursor:pointer;margin-top:6px;
            }
            .stopBtn { background:#b82828;color:white; }
            .closeBtn { background:#444;color:white;margin-top:8px; }
        </style>

        <div id="panel">
            <h4>Narrador IA</h4>

            <label>Voz:</label>
            <select id="voiceList"></select>

            <label style="margin-top:8px;display:block;">Velocidad:</label>
            <div id="rateBox"></div>

            <button id="readBtn" class="bigBtn">▶ Leer</button>

            <div style="display:flex;justify-content:space-between;">
                <button id="pauseBtn" class="rowBtn">⏸ Pausa</button>
                <button id="resumeBtn" class="rowBtn">▶ Seguir</button>
            </div>

            <button id="stopBtn" class="bigBtn stopBtn">⏹ Detener</button>
            <button id="closeBtn" class="bigBtn closeBtn">❌ Cerrar</button>
        </div>
    `;

    setupPanel(shadow);
    document.body.appendChild(host);
}

/* ============================================================================
   3) CARGAR VOCES (INCLUYE VOZ MASCULINA PARA ANDROID)
============================================================================ */
function loadVoices() {
    const load = () => {
        let vs = speechSynthesis.getVoices();

        // Voces españolas primero
        voices = vs.filter(v => v.lang.toLowerCase().startsWith("es"));

        // Forzar inclusión de voces masculinas de Android Chrome:
        const maleAndroid = vs.find(v =>
            /standard-b|standard-d|male|hombre/i.test(v.name)
        );
        if (maleAndroid && !voices.includes(maleAndroid)) voices.push(maleAndroid);

        if (voices.length === 0) voices = vs;
        currentVoice = voices[0]?.name || null;
    };

    load();
    speechSynthesis.onvoiceschanged = load;
}

/* ============================================================================
   4) EXTRAER TEXTO + DIVIDIR EN PALABRAS
============================================================================ */
function extractWords() {
    const container = document.querySelector("main") || document.body;
    text = container.innerText.trim().replace(/\s+/g, " ");
    words = text.split(" ");
}

/* ============================================================================
   5) HIGHLIGHT SIN MODIFICAR HTML
============================================================================ */
function showHighlight(word) {
    removeHighlight();

    highlightBox = document.createElement("div");
    highlightBox.style.position = "fixed";
    highlightBox.style.bottom = "0";
    highlightBox.style.left = "0";
    highlightBox.style.width = "100%";
    highlightBox.style.padding = "14px";
    highlightBox.style.background = "rgba(255,215,0,0.15)";
    highlightBox.style.color = "#000";
    highlightBox.style.fontSize = "16px";
    highlightBox.style.fontWeight = "700";
    highlightBox.style.zIndex = "999999998";

    highlightBox.innerText = word;
    document.body.appendChild(highlightBox);
}

function removeHighlight() {
    if (highlightBox) highlightBox.remove();
}

/* ============================================================================
   6) MOTOR WORD-BOUNDARY (PLAY / PAUSE / RESUME PERFECTO)
============================================================================ */
function speakWordFrom(indexStart) {
    if (indexStart >= words.length) {
        stopReading();
        return;
    }

    index = indexStart;
    const textToRead = words.slice(index).join(" ");

    utter = new SpeechSynthesisUtterance(textToRead);

    const v = voices.find(v => v.name === currentVoice) || voices[0];
    if (v) {
        utter.voice = v;
        utter.lang = v.lang;
    }

    utter.rate = playbackRate;

    // Cuando avanza palabra por palabra
    utter.onboundary = ev => {
        if (ev.name === "word") {
            index++;
            showHighlight(words[index - 1]);
        }
    };

    utter.onend = () => {
        if (isReading) stopReading();
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   7) CONTROLES
============================================================================ */
function startReading() {
    stopReading();
    extractWords();
    if (words.length === 0) return;

    isReading = true;
    speakWordFrom(index);
}

function pauseReading() {
    if (speechSynthesis.speaking) speechSynthesis.pause();
}

function resumeReading() {
    if (speechSynthesis.paused) speechSynthesis.resume();
}

function stopReading() {
    isReading = false;
    index = 0;
    speechSynthesis.cancel();
    removeHighlight();
}

/* ============================================================================
   8) CONFIGURAR PANEL
============================================================================ */
function setupPanel(shadow) {
    const voiceList = shadow.querySelector("#voiceList");
    const rateBox = shadow.querySelector("#rateBox");

    setTimeout(() => {
        voices.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang})`;
            voiceList.appendChild(opt);
        });
        currentVoice = voices[0]?.name;
    }, 350);

    voiceList.onchange = e => {
        currentVoice = e.target.value;
    };

    [0.75,1,1.25,1.5,1.75,2].forEach(r => {
        const b = document.createElement("button");
        b.textContent = "x" + r;
        b.className = "rateBtn";
        b.onclick = () => {
            playbackRate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");

            // Cambiar velocidad MIENTRAS LEE:
            if (speechSynthesis.speaking && utter) {
                speechSynthesis.pause();
                utter.rate = playbackRate;
                speechSynthesis.resume();
            }
        };
        rateBox.appendChild(b);
    });

    shadow.querySelector("#readBtn").onclick = startReading;
    shadow.querySelector("#pauseBtn").onclick = pauseReading;
    shadow.querySelector("#resumeBtn").onclick = resumeReading;
    shadow.querySelector("#stopBtn").onclick = stopReading;

    shadow.querySelector("#closeBtn").onclick = () => {
        stopReading();
        shadow.host.remove();
    };
}

/* ============================================================================
   INIT
============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
    injectFloatingButton();
    loadVoices();
});

})();
