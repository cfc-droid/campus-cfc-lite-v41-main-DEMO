/* ============================================================================
   🎧 CFC-VOICE READER PRO — V17 (FINAL REAL PARA CHROME)
   HTSR Engine + Selector de Párrafos + Scrubber + Velocidad Dinámica + Resume
   Botón Premium Fijo + Highlight Real + Modo Oscuro Integrado + Super Stable
   ============================================================================
*/

(() => {

/* ==========================
   VARIABLES GLOBALES
========================== */
let segments = [];
let currentIndex = 0;
let isReading = false;
let playbackRate = 1;
let utter = null;
let voices = [];
let currentVoice = null;
let highlightBox = null;

/* ============================================================================
   1) BOTÓN PREMIUM FLOTANTE (NO SE MUEVE, NO LO TAPA NADA)
============================================================================ */
function injectReaderButton() {
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
                width:60px;height:60px;border-radius:50%;
                background:linear-gradient(90deg,#FFD700,#C5A200);
                box-shadow:0 0 20px rgba(255,215,0,0.7);
                border:none;font-size:28px;font-weight:900;
                cursor:pointer;color:#000;
            }
        </style>
        <button id="btn">🎧</button>
    `;
    shadow.querySelector("#btn").onclick = openReaderPanel;

    document.body.appendChild(host);
}

/* ============================================================================
   2) PANEL PREMIUM + MODO OSCURO + SCRUBBER + SELECTOR DE PÁRRAFOS
============================================================================ */
function openReaderPanel() {
    if (document.querySelector("#cfcReaderPanelHost")) return;

    const host = document.createElement("div");
    host.id = "cfcReaderPanelHost";
    host.style.position = "fixed";
    host.style.left = "25px";
    host.style.bottom = "95px";
    host.style.zIndex = "9999999998";

    const isDark = document.body.classList.contains("dark-mode");

    const bg = isDark ? "#111" : "#000";
    const border = "#FFD700";
    const txt = "#fff";

    const shadow = host.attachShadow({ mode: "open" });

    shadow.innerHTML = `
    <style>
        #panel {
            width:260px;padding:16px;
            background:${bg};
            border:2px solid ${border};
            border-radius:12px;
            font-family:'Inter',sans-serif;color:${txt};
        }
        h4 { margin:0 0 10px 0;color:${border};font-size:16px; }
        select,button,input { font-family:'Inter'; }
        .rateBtn {
            padding:5px;margin:2px;background:#111;
            border:1px solid ${border};color:${border};
            border-radius:6px;font-size:12px;cursor:pointer;
        }
        .rateBtn.active { background:${border};color:#000; }

        .bigBtn {
            width:100%;padding:8px;
            background:${border};color:#000;
            margin-top:6px;border:none;border-radius:8px;
            font-weight:700;cursor:pointer;
        }
        .rowBtn{
            width:48%;padding:7px;background:#222;
            border:1px solid ${border};color:#fff;
            border-radius:6px;cursor:pointer;
            margin-top:6px;
        }
        #scrubber {
            width:100%;margin:8px 0;
        }
        .closeBtn{
            width:100%;padding:6px;background:#444;
            color:white;border-radius:8px;margin-top:8px;
            cursor:pointer;
        }
        #segmentSelector {
            width:100%;margin-top:6px;padding:6px;
            background:#111;color:white;border-radius:8px;
            border:1px solid ${border};
        }
    </style>

    <div id="panel">
        <h4>Narrador IA</h4>

        <label>Voz:</label>
        <select id="voiceList"></select>

        <label style="margin-top:8px;display:block;">Velocidad:</label>
        <div id="rateBox"></div>

        <label style="margin-top:8px;">Ir a párrafo:</label>
        <select id="segmentSelector"></select>

        <input type="range" id="scrubber" min="0" max="100" value="0"/>

        <button id="readBtn" class="bigBtn">▶ Leer</button>

        <div style="display:flex;justify-content:space-between;">
            <button id="pauseBtn" class="rowBtn">⏸ Pausa</button>
            <button id="resumeBtn" class="rowBtn">▶ Seguir</button>
        </div>

        <button id="stopBtn" class="bigBtn" style="background:#b82828;color:#fff;">
            ⏹ Detener
        </button>

        <button id="closeBtn" class="closeBtn">❌ Cerrar</button>
    </div>
    `;

    setupPanelLogic(shadow);
    document.body.appendChild(host);
}

/* ============================================================================
   3) CARGA DE VOCES PARA CHROME (MASC/FEM GARANTIZADO)
============================================================================ */
function loadVoices() {
    const load = () => {
        voices = speechSynthesis.getVoices().filter(v => v.lang.startsWith("es"));
        if (voices.length === 0) voices = speechSynthesis.getVoices();
        currentVoice = voices[0]?.name || null;
    };
    load();
    speechSynthesis.onvoiceschanged = load;
}

/* ============================================================================
   4) SEGMENTACIÓN — HTSR PERFECTA
============================================================================ */
function getSegments() {
    const container = document.querySelector("main") || document.body;
    const text = container.innerText.trim();
    const paragraphs = text.split("\n").filter(p => p.trim().length);

    const output = [];
    paragraphs.forEach(p => {
        if (p.length < 200) {
            output.push(p.trim());
        } else {
            const words = p.split(" ");
            let chunk = "";
            words.forEach(w => {
                if ((chunk + " " + w).length > 180) {
                    output.push(chunk.trim());
                    chunk = w;
                } else {
                    chunk += " " + w;
                }
            });
            if (chunk.trim()) output.push(chunk.trim());
        }
    });

    return output;
}

/* ============================================================================
   5) HIGHLIGHT REAL (NO MODIFICA HTML)
============================================================================ */
function highlight(text) {
    removeHighlight();
    highlightBox = document.createElement("div");
    highlightBox.style.position = "fixed";
    highlightBox.style.bottom = "0";
    highlightBox.style.left = "0";
    highlightBox.style.width = "100%";
    highlightBox.style.padding = "14px";
    highlightBox.style.background = "rgba(255,215,0,0.12)";
    highlightBox.style.fontWeight = "700";
    highlightBox.style.color = "#000";
    highlightBox.style.fontSize = "15px";
    highlightBox.style.zIndex = "999999998";
    highlightBox.innerText = text;
    document.body.appendChild(highlightBox);
}
function removeHighlight() {
    if (highlightBox) highlightBox.remove();
}

/* ============================================================================
   6) MOTOR HTSR — SEGMENTO POR SEGMENTO
============================================================================ */
function speak(index, shadow) {
    if (!isReading || index >= segments.length) {
        stopReading();
        return;
    }

    currentIndex = index;
    const text = segments[index];
    highlight(text);

    updateScrubber(shadow);

    utter = new SpeechSynthesisUtterance(text);

    const v = voices.find(v => v.name === currentVoice) || voices[0];
    if (v) {
        utter.voice = v;
        utter.lang = v.lang;
    }
    utter.rate = playbackRate;

    utter.onend = () => {
        if (isReading) speak(index + 1, shadow);
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   7) CONTROLES
============================================================================ */
function startReading(shadow) {
    stopReading();
    segments = getSegments();
    if (segments.length === 0) return;

    fillSegmentSelector(shadow);
    fillScrubber();

    isReading = true;
    speak(currentIndex, shadow);
}

function pauseReading() {
    if (speechSynthesis.speaking) speechSynthesis.pause();
}
function resumeReading() {
    if (speechSynthesis.paused) speechSynthesis.resume();
}
function stopReading() {
    isReading = false;
    currentIndex = 0;
    speechSynthesis.cancel();
    removeHighlight();
}

/* ============================================================================
   8) SCRUBBER + SELECTOR
============================================================================ */
function fillSegmentSelector(shadow) {
    const sel = shadow.querySelector("#segmentSelector");
    sel.innerHTML = "";
    segments.forEach((s, i) => {
        const o = document.createElement("option");
        o.value = i;
        o.textContent = `Párrafo ${i + 1}`;
        sel.appendChild(o);
    });

    sel.onchange = e => {
        currentIndex = parseInt(e.target.value);
        if (isReading) {
            speechSynthesis.cancel();
            speak(currentIndex, shadow);
        }
    };
}

function fillScrubber() {
    const scrub = document.querySelector("#cfcReaderPanelHost")
        ?.shadowRoot?.querySelector("#scrubber");
    if (!scrub) return;

    scrub.max = segments.length - 1;
    scrub.value = 0;

    scrub.oninput = () => {
        currentIndex = parseInt(scrub.value);
        if (isReading) {
            speechSynthesis.cancel();
            speak(currentIndex, scrub.getRootNode());
        }
    };
}

function updateScrubber(shadow) {
    const scrub = shadow.querySelector("#scrubber");
    scrub.value = currentIndex;
}

/* ============================================================================
   9) PANEL LOGIC
============================================================================ */
function setupPanelLogic(shadow) {
    loadVoices();

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
    }, 300);

    [0.75,1,1.25,1.5,1.75,2].forEach(r => {
        const b = document.createElement("button");
        b.textContent = "x" + r;
        b.className = "rateBtn";
        b.onclick = () => {
            playbackRate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");
        };
        rateBox.appendChild(b);
    });

    shadow.querySelector("#readBtn").onclick = () => startReading(shadow);
    shadow.querySelector("#pauseBtn").onclick = pauseReading;
    shadow.querySelector("#resumeBtn").onclick = resumeReading;
    shadow.querySelector("#stopBtn").onclick = stopReading;

    shadow.querySelector("#closeBtn").onclick = () => {
        stopReading();
        removeHighlight();
        shadow.host.remove();
    };
}

/* ============================================================================
   INIT
============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
    injectReaderButton();
    loadVoices();
});

})();
