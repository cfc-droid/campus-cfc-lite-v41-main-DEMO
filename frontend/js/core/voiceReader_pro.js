/* ==========================================================
   🎧 CFC-VOICE READER PRO — V11 ULTRA FINAL
   Motor segmentado + ShadowDOM + Velocidad real + Resume real
   Compatible: PC Chrome / Android Chrome / Safari iPhone / Safari iPad
   ========================================================== */

(() => {

let voices = [];
let currentVoice = null;
let rate = 1;
let isReading = false;
let currentIndex = 0;
let segments = [];
let utter = null;

/* ==========================================================
   INYECTAR BOTÓN PREMIUM FLOTANTE (SHADOW DOM)
   ========================================================== */
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

/* ==========================================================
   CREAR PANEL PREMIUM EN SHADOW DOM
   ========================================================== */
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
            width:270px; padding:16px;
            background:#000; border:2px solid #FFD700;
            border-radius:14px;
            font-family:'Inter',sans-serif;
            color:white;
            box-shadow:0 0 20px rgba(255,215,0,0.45);
        }
        #panel h4 { margin:0 0 10px 0; color:#FFD700; }
        select, button { font-family:'Inter',sans-serif; }
        select {
            width:100%; padding:7px;
            background:#111; color:white;
            border:1px solid #FFD700; border-radius:8px;
            margin-top:6px;
        }
        .rateBtn {
            padding:6px 10px; margin:2px;
            background:#111; border:1px solid #FFD700;
            color:#FFD700; border-radius:6px;
            font-size:13px;
            cursor:pointer;
        }
        .rateBtn.active { background:#FFD700; color:#000; }
        .bigBtn {
            width:100%; padding:9px;
            background:#FFD700; color:#000;
            border-radius:8px; border:none;
            font-weight:700; margin-top:5px;
            cursor:pointer; font-size:15px;
        }
        .rowBtn {
            width:48%; padding:7px;
            background:#222; color:white;
            border:1px solid #FFD700;
            border-radius:6px; cursor:pointer;
        }
        .stopBtn {
            width:100%; padding:8px;
            background:#b82828; color:white;
            border-radius:8px; margin-top:8px;
            border:none; cursor:pointer;
        }
        .closeBtn {
            width:100%; padding:7px;
            background:#444; color:white;
            border-radius:8px; margin-top:8px;
            cursor:pointer;
        }
    </style>

    <div id="panel">
        <h4>🎧 Lectura IA CFC</h4>

        <label>Voz:</label>
        <select id="voiceList"></select>

        <label style="display:block;margin-top:10px;">Velocidad:</label>
        <div id="rateBox"></div>

        <button id="readBtn" class="bigBtn">Leer</button>

        <div style="margin-top:8px;display:flex;justify-content:space-between;">
            <button id="pauseBtn" class="rowBtn">⏸ Pausa</button>
            <button id="resumeBtn" class="rowBtn">▶ Seguir</button>
        </div>

        <button id="stopBtn" class="stopBtn">⏹ Detener</button>
        <button id="closeBtn" class="closeBtn">❌ Cerrar</button>
    </div>
    `;

    const voicesEl = shadow.querySelector("#voiceList");
    const rateBox = shadow.querySelector("#rateBox");
    const readBtn = shadow.querySelector("#readBtn");
    const pauseBtn = shadow.querySelector("#pauseBtn");
    const resumeBtn = shadow.querySelector("#resumeBtn");
    const stopBtn = shadow.querySelector("#stopBtn");
    const closeBtn = shadow.querySelector("#closeBtn");

    /* Generar botones de velocidad */
    [0.75,1,1.25,1.5,1.75,2].forEach(v => {
        const b = document.createElement("button");
        b.textContent = "x" + v;
        b.className = "rateBtn";
        b.onclick = () => {
            rate = v;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");
        };
        rateBox.appendChild(b);
    });

    /* Cargar voces en <select> */
    const int = setInterval(() => {
        if (voices.length > 0) {
            clearInterval(int);
            voices.forEach(v => {
                const o = document.createElement("option");
                o.value = v.name;
                o.textContent = `${v.name} (${v.lang})`;
                voicesEl.appendChild(o);
            });
            currentVoice = voices[0].name;
        }
    }, 200);

    voicesEl.onchange = e => currentVoice = e.target.value;

    /* EVENTOS */
    readBtn.onclick = () => startReading(shadow);
    pauseBtn.onclick = pauseReading;
    resumeBtn.onclick = resumeReading;
    stopBtn.onclick = stopReading;
    closeBtn.onclick = () => { stopReading(); host.remove(); };

    document.body.appendChild(host);
}

/* ==========================================================
   SEGMENTAR TEXTO (PÁRRAFOS NO DESTRUCTIVOS)
   ========================================================== */
function getTextSegments() {
    const container = document.querySelector("main") || document.body;
    const raw = container.innerText.replace(/\n+/g, '\n').trim();
    return raw.split("\n").filter(x => x.trim().length > 0);
}

/* ==========================================================
   LECTURA CON PUNTERO (RESUME REAL)
   ========================================================== */
function speakSegment(index, shadow) {
    if (index >= segments.length) {
        isReading = false;
        utter = null;
        return;
    }

    currentIndex = index;
    utter = new SpeechSynthesisUtterance(segments[index]);

    const v = voices.find(v => v.name === currentVoice) || voices[0];
    utter.voice = v;
    utter.lang = v.lang;
    utter.rate = rate;

    utter.onend = () => {
        if (isReading) speakSegment(index + 1, shadow);
    };

    speechSynthesis.speak(utter);
}

/* ==========================================================
   START / PAUSE / RESUME / STOP
   ========================================================== */
function startReading(shadow) {
    stopReading();
    segments = getTextSegments();
    if (segments.length === 0) return;

    isReading = true;
    speakSegment(0, shadow);
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
    utter = null;
    currentIndex = 0;
}

/* ==========================================================
   CARGA DE VOCES REAL (PC / ANDROID / IOS)
   ========================================================== */
function loadVoices() {
    voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            voices = speechSynthesis.getVoices();
            voices = reorderVoices(voices);
        };
    } else voices = reorderVoices(voices);
}

function reorderVoices(list) {
    const es = list.filter(v => v.lang.toLowerCase().startsWith("es"));
    if (es.length === 0) return list;

    const male = es.filter(v => /male|hombre|masc/i.test(v.name));
    const female = es.filter(v => /female|mujer|fem/i.test(v.name));

    return [...female, ...male, ...es];
}

/* ==========================================================
   INIT AUTOMÁTICO
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    injectButton();
});

})();
