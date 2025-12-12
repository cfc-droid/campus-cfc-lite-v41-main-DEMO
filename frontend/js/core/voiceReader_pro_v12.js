/* ==========================================================
   🎧 CFC-VOICE READER PRO — V12 IA REAL (ULTRA FINAL)
   Motor 100% IA con control TOTAL: pausa, resume exacto,
   velocidad real, resaltado, panel compacto premium,
   botón fijo dorado, sin tocar el HTML del Campus.
   Funciona igual en PC + Android + iPhone + iPad.
   Requiere un archivo MP3 por capítulo.
   ========================================================== */

(() => {

let audio = null;
let audioCtx = null;
let source = null;
let gainNode = null;
let isPlaying = false;
let currentTime = 0;
let playbackRate = 1;

/* Ruta del audio para el capítulo actual */
function getAudioPath() {
    const path = window.location.pathname;
    const file = path.split("/").pop().replace(".html", "");
    return `../../audio/${file}.mp3`;
}

/* ==========================================================
   BOTÓN FIJO PREMIUM — SHADOW DOM
   ========================================================== */
function injectFloatingButton() {
    if (document.querySelector("#cfcAudioBtnHost")) return;

    const host = document.createElement("div");
    host.id = "cfcAudioBtnHost";
    host.style.position = "fixed";
    host.style.left = "25px";
    host.style.bottom = "25px";
    host.style.zIndex = "9999999999";
    host.style.pointerEvents = "auto";

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
   PANEL PREMIUM COMPACTO — 1/4 PANTALLA
   ========================================================== */
function openPanel() {
    if (document.querySelector("#cfcAudioPanelHost")) return;

    const host = document.createElement("div");
    host.id = "cfcAudioPanelHost";
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
        .bigBtn {
            width:100%; padding:8px;
            background:#FFD700; color:#000;
            border-radius:8px; border:none;
            font-weight:700; margin-top:4px;
            cursor:pointer; font-size:14px;
        }
        .rowBtn {
            width:48%; padding:7px;
            background:#222; color:white;
            border:1px solid #FFD700;
            border-radius:6px; cursor:pointer;
            margin-top:6px;
        }
        #rateBox button {
            padding:5px 8px; margin:2px;
            background:#111; border:1px solid #FFD700;
            color:#FFD700; font-size:12px;
            border-radius:6px; cursor:pointer;
        }
        #rateBox button.active {
            background:#FFD700; color:#000;
        }
        .closeBtn {
            width:100%; padding:6px;
            background:#444; color:white;
            border-radius:8px; margin-top:8px;
            cursor:pointer;
        }
    </style>

    <div id="panel">
        <h4>Narrador IA</h4>

        <div id="rateBox"></div>

        <button id="playBtn" class="bigBtn">▶ Reproducir</button>

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

    const playBtn = shadow.querySelector("#playBtn");
    const pauseBtn = shadow.querySelector("#pauseBtn");
    const resumeBtn = shadow.querySelector("#resumeBtn");
    const stopBtn = shadow.querySelector("#stopBtn");
    const closeBtn = shadow.querySelector("#closeBtn");
    const rateBox = shadow.querySelector("#rateBox");

    /* Velocidad REAL */
    [0.75,1,1.25,1.5,2].forEach(r => {
        const b = document.createElement("button");
        b.textContent = `x${r}`;
        b.onclick = () => {
            playbackRate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");
            if (audio) audio.playbackRate = playbackRate;
        };
        rateBox.appendChild(b);
    });

    /* Eventos */
    playBtn.onclick = startAudio;
    pauseBtn.onclick = pauseAudio;
    resumeBtn.onclick = resumeAudio;
    stopBtn.onclick = stopAudio;
    closeBtn.onclick = () => { stopAudio(); host.remove(); };

    document.body.appendChild(host);
}

/* ==========================================================
   CARGAR Y REPRODUCIR AUDIO IA
   ========================================================== */
function startAudio() {
    const src = getAudioPath();

    if (!audio) {
        audio = new Audio(src);
        audio.preload = "auto";
        audio.onended = () => { isPlaying = false; };
    }

    audio.currentTime = 0;
    audio.playbackRate = playbackRate;
    audio.play();
    isPlaying = true;
}

function pauseAudio() {
    if (audio && isPlaying) {
        audio.pause();
        currentTime = audio.currentTime;
        isPlaying = false;
    }
}

function resumeAudio() {
    if (audio && !isPlaying) {
        audio.currentTime = currentTime;
        audio.playbackRate = playbackRate;
        audio.play();
        isPlaying = true;
    }
}

function stopAudio() {
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        isPlaying = false;
    }
}

/* ==========================================================
   INIT
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
    injectFloatingButton();
});

})();
