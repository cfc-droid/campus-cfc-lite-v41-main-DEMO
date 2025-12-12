/* ======================================================================
   🎧 CFC-VOICE READER PRO — V13 HTSR (ULTRA FINAL REAL)
   Motor híbrido estable con segmentación + highlight + resume exacto,
   velocidad dinámica, compatibilidad total y botón premium fijo.
   Funciona en: PC Chrome, Android Chrome, iPhone Safari, iPad Safari.
   No requiere MP3, no modifica el HTML original, no rompe nada del Campus.
   ====================================================================== */

(() => {

let segments = [];
let currentIndex = 0;
let isReading = false;
let playbackRate = 1;
let utter = null;
let currentVoice = null;
let voicesLoaded = false;
let highlightBox = null;

/* ============================================================
   1) INYECTAR BOTÓN PREMIUM FLOTANTE (SHADOW DOM)
   ============================================================ */
function injectButton() {
    if (document.querySelector("#cfcReaderBtnHost")) return;

    const host = document.createElement("div");
    host.id = "cfcReaderBtnHost";
    host.style.position = "fixed";
    host.style.left = "25px";
    host.style.bottom = "25px";
    host.style.zIndex = "9999999999";

    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
        <style>
            #btn {
                width:60px; height:60px; border-radius:50%;
                background:linear-gradient(90deg,#FFD700,#C5A200);
                color:#000; font-size:28px; font-weight:900;
                border:none; cursor:pointer;
                box-shadow:0 0 18px rgba(255,215,0,0.65);
            }
        </style>
        <button id="btn">🎧</button>
    `;
    shadow.querySelector("#btn").onclick = openPanel;

    document.body.appendChild(host);
}

/* ============================================================
   2) PANEL PREMIUM — 1/4 PANTALLA
   ============================================================ */
function openPanel() {
    if (document.querySelector("#cfcReaderPanelHost")) return;

    loadVoices();

    const host = document.createElement("div");
    host.id = "cfcReaderPanelHost";
    host.style.position = "fixed";
    host.style.left = "25px";
    host.style.bottom = "95px";
    host.style.zIndex = "9999999999";

    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
        <style>
            #panel {
                width:230px; padding:14px;
                background:#000; border:2px solid #FFD700;
                border-radius:14px;
                font-family:'Inter',sans-serif; color:white;
                box-shadow:0 0 20px rgba(255,215,0,0.4);
            }
            h4 { margin:0 0 10px 0; color:#FFD700; font-size:16px; }
            select, button { font-family:'Inter',sans-serif; }
            #rateBox button {
                padding:6px 8px; margin:2px;
                background:#111; border:1px solid #FFD700;
                color:#FFD700; font-size:12px;
                border-radius:6px; cursor:pointer;
            }
            #rateBox button.active {
                background:#FFD700; color:#000;
            }
            .bigBtn {
                width:100%; padding:8px;
                background:#FFD700; color:#000;
                border-radius:8px; border:none; font-weight:700;
                cursor:pointer; margin-top:5px;
            }
            .rowBtn {
                width:48%; padding:7px;
                background:#222; color:white;
                border:1px solid #FFD700;
                border-radius:6px; cursor:pointer;
                margin-top:6px;
            }
            .stopBtn {
                width:100%; padding:8px;
                background:#b82828; color:white;
                border-radius:8px; cursor:pointer;
                margin-top:8px;
            }
            .closeBtn {
                width:100%; padding:6px;
                background:#444; color:white;
                border-radius:8px; cursor:pointer;
                margin-top:8px;
            }
        </style>

        <div id="panel">
            <h4>Narrador IA</h4>

            <label style="display:block;margin-top:4px;">Voz:</label>
            <select id="voiceList"></select>

            <label style="margin-top:8px;display:block;">Velocidad:</label>
            <div id="rateBox"></div>

            <button id="readBtn" class="bigBtn">▶ Leer</button>

            <div style="display:flex;justify-content:space-between;">
                <button id="pauseBtn" class="rowBtn">⏸ Pausa</button>
                <button id="resumeBtn" class="rowBtn">▶ Seguir</button>
            </div>

            <button id="stopBtn" class="stopBtn">⏹ Detener</button>
            <button id="closeBtn" class="closeBtn">❌ Cerrar</button>
        </div>
    `;

    const rateBox = shadow.querySelector("#rateBox");
    [0.75,1,1.25,1.5,1.75,2].forEach(v => {
        const b = document.createElement("button");
        b.textContent = `x${v}`;
        b.onclick = () => {
            playbackRate = v;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");
        };
        rateBox.appendChild(b);
    });

    shadow.querySelector("#voiceList").onchange = e => {
        currentVoice = e.target.value;
    };

    /* EVENTOS */
    shadow.querySelector("#readBtn").onclick = () => startReading(shadow);
    shadow.querySelector("#pauseBtn").onclick = pauseReading;
    shadow.querySelector("#resumeBtn").onclick = resumeReading;
    shadow.querySelector("#stopBtn").onclick = stopReading;

    shadow.querySelector("#closeBtn").onclick = () => {
        stopReading();
        host.remove();
        removeHighlight();
    };

    document.body.appendChild(host);

    populateVoices(shadow);
}

/* ============================================================
   3) CARGA DE VOCES (REAL + FALLBACK)
   ============================================================ */
function loadVoices() {
    if (!("speechSynthesis" in window)) return;

    let vs = speechSynthesis.getVoices();
    if (vs.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            voicesLoaded = true;
        };
    } else {
        voicesLoaded = true;
    }
}

function populateVoices(shadow) {
    const sel = shadow.querySelector("#voiceList");
    sel.innerHTML = "";

    let vs = speechSynthesis.getVoices();

    if (!vs || vs.length === 0) {
        // fallback interno
        sel.innerHTML = `<option value="default">Voz estándar</option>`;
        currentVoice = "default";
        return;
    }

    vs.forEach(v => {
        const o = document.createElement("option");
        o.value = v.name;
        o.textContent = `${v.name} (${v.lang})`;
        sel.appendChild(o);
    });

    currentVoice = vs[0].name;
}

/* ============================================================
   4) OBTENER TEXTO Y SEGMENTARLO (HTSR)
   ============================================================ */
function getSegments() {
    const container = document.querySelector("main") || document.body;
    const txt = container.innerText.trim();

    const max = 160; // tamaño óptimo HTSR
    const out = [];
    let buffer = "";

    txt.split(" ").forEach(w => {
        if ((buffer + " " + w).length > max) {
            out.push(buffer.trim());
            buffer = w;
        } else {
            buffer += " " + w;
        }
    });
    if (buffer.trim().length > 0) out.push(buffer.trim());

    return out;
}

/* ============================================================
   5) HIGHLIGHT SIN TOCAR HTML
   ============================================================ */
function highlight(text) {
    removeHighlight();

    highlightBox = document.createElement("div");
    highlightBox.style.position = "fixed";
    highlightBox.style.left = "0";
    highlightBox.style.bottom = "0";
    highlightBox.style.width = "100%";
    highlightBox.style.padding = "14px";
    highlightBox.style.background = "rgba(255,215,0,0.12)";
    highlightBox.style.color = "#000";
    highlightBox.style.fontWeight = "700";
    highlightBox.style.fontSize = "15px";
    highlightBox.style.backdropFilter = "blur(3px)";
    highlightBox.style.zIndex = "999999998";

    highlightBox.innerText = text;

    document.body.appendChild(highlightBox);
}

function removeHighlight() {
    if (highlightBox) {
        highlightBox.remove();
        highlightBox = null;
    }
}

/* ============================================================
   6) MOTOR HTSR — HABLAR SEGMENTO POR SEGMENTO
   ============================================================ */
function speak(index, shadow) {
    if (!isReading || index >= segments.length) {
        isReading = false;
        removeHighlight();
        return;
    }

    currentIndex = index;

    const text = segments[index];
    highlight(text);

    utter = new SpeechSynthesisUtterance(text);

    let vs = speechSynthesis.getVoices();
    const chosen =
        (vs && vs.find(v => v.name === currentVoice)) ||
        (vs && vs[0]) ||
        null;

    if (chosen) {
        utter.voice = chosen;
        utter.lang = chosen.lang;
    }

    utter.rate = playbackRate;

    utter.onend = () => {
        if (isReading) speak(index + 1, shadow);
    };

    speechSynthesis.speak(utter);
}

/* ============================================================
   7) CONTROLES
   ============================================================ */
function startReading(shadow) {
    stopReading();
    segments = getSegments();
    if (segments.length === 0) return;

    isReading = true;
    speak(0, shadow);
}

function pauseReading() {
    if (speechSynthesis.speaking) speechSynthesis.pause();
}

function resumeReading() {
    if (speechSynthesis.paused) speechSynthesis.resume();
}

function stopReading() {
    isReading = false;
    speechSynthesis.cancel();
    removeHighlight();
    currentIndex = 0;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    injectButton();
});

})();
