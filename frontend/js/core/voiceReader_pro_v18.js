/* ============================================================================
   🎧 CFC-VOICE READER PRO — V18 ULTRA REAL (FIX FINAL)
   Motor WordBoundary + Highlight + Resume + Velocidad dinámica
   Especial para CHROME (PC / Android).
   Con detección de errores y logs claros en consola.
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
let ttsReady = false;

/* Pequeño helper */
function log(...args) {
    console.log("🎧 CFC-TTS V18:", ...args);
}

/* ============================================================================
   1) BOTÓN PREMIUM FLOTANTE
============================================================================ */
function injectFloatingButton() {
    if (document.querySelector("#cfcTTSButtonHost")) {
        log("Botón ya existe, no se duplica");
        return;
    }

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

    shadow.querySelector("#btn").onclick = () => {
        log("Click en botón flotante");
        openPanel();
    };

    document.body.appendChild(host);
}

/* ============================================================================
   2) PANEL PREMIUM (1/4 DE PANTALLA)
============================================================================ */
function openPanel() {
    if (document.querySelector("#cfcTTSPanelHost")) {
        log("Panel ya abierto");
        return;
    }

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

            select,button { font-family:'Inter'; }

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
   3) CARGAR VOCES (INCLUYE MÁXIMO POSIBLE DE MASCULINAS)
============================================================================ */
function loadVoices() {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
        log("TTS NO soportado por este navegador");
        ttsReady = false;
        return;
    }

    const doLoad = () => {
        let vs = window.speechSynthesis.getVoices() || [];
        log("Voices detectadas brutales:", vs.length);

        // Voces en español primero
        let es = vs.filter(v => v.lang && v.lang.toLowerCase().startsWith("es"));

        // Intentar detectar masculinas por nombre (Android suele poner Standard-B/D como “masculino”)
        const posiblesMasculinas = vs.filter(v =>
            /standard-b|standard-d|male|hombre|masculino/i.test(v.name)
        );

        // Mezclamos: primero esp, luego posibles masculinas únicas, luego resto
        voices = [
            ...es,
            ...posiblesMasculinas.filter(v => !es.includes(v)),
            ...vs.filter(v => !es.includes(v) && !posiblesMasculinas.includes(v))
        ];

        // Limpiar duplicados por nombre
        const byName = {};
        voices.forEach(v => { byName[v.name] = v; });
        voices = Object.values(byName);

        log("Voces filtradas finales:", voices.map(v => `${v.name} (${v.lang})`));

        if (voices.length === 0) {
            ttsReady = false;
            return;
        }

        currentVoice = voices[0].name;
        ttsReady = true;
    };

    doLoad();
    window.speechSynthesis.onvoiceschanged = () => {
        log("onvoiceschanged fired");
        doLoad();
    };
}

/* ============================================================================
   4) EXTRAER TEXTO + DIVIDIR EN PALABRAS
============================================================================ */
function extractWords() {
    const container = document.querySelector("main") || document.body;
    if (!container) {
        log("No se encontró contenedor principal");
        return;
    }
    text = container.innerText.trim().replace(/\s+/g, " ");
    words = text.length ? text.split(" ") : [];
    log("Palabras a leer:", words.length);
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
    if (highlightBox) {
        highlightBox.remove();
        highlightBox = null;
    }
}

/* ============================================================================
   6) MOTOR WORD-BOUNDARY
============================================================================ */
function speakWordFrom(indexStart) {
    if (!ttsReady) {
        alert("Tu navegador no tiene activo el motor de voz (TTS). Revisa ajustes de Chrome / sistema.");
        log("Abortando speakWordFrom: ttsReady = false");
        return;
    }

    if (indexStart >= words.length) {
        log("Texto terminado");
        stopReading();
        return;
    }

    index = indexStart;
    const textToRead = words.slice(index).join(" ");
    if (!textToRead.trim()) {
        log("Texto vacío, se detiene");
        stopReading();
        return;
    }

    utter = new SpeechSynthesisUtterance(textToRead);

    const voiceObj = voices.find(v => v.name === currentVoice) || voices[0];
    if (voiceObj) {
        utter.voice = voiceObj;
        utter.lang = voiceObj.lang;
    }
    utter.rate = playbackRate;

    log("Iniciando lectura desde índice", index, "voz:", voiceObj ? voiceObj.name : "DEFAULT", "rate:", playbackRate);

    utter.onstart = () => {
        log("onstart disparado");
    };

    utter.onboundary = ev => {
        // No todos los navegadores etiquetan 'word', pero al menos avanzamos
        index++;
        if (index - 1 >= 0 && index - 1 < words.length) {
            showHighlight(words[index - 1]);
        }
    };

    utter.onerror = (e) => {
        log("❌ Error en utter:", e.error || e.message);
    };

    utter.onend = () => {
        log("onend disparado, isReading:", isReading);
        if (isReading) stopReading();
    };

    window.speechSynthesis.speak(utter);
}

/* ============================================================================
   7) CONTROLES
============================================================================ */
function startReading() {
    log("startReading() llamado");

    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
        alert("Tu navegador no soporta síntesis de voz (Web Speech API).");
        log("Abortando: Web Speech API no soportada");
        return;
    }

    if (!ttsReady) {
        // Intento extra: recargar voces una vez más
        loadVoices();
        if (!ttsReady) {
            alert("No se encontraron voces disponibles en este dispositivo.");
            log("Abortando: ttsReady sigue en false");
            return;
        }
    }

    stopReading(); // limpia cualquier lectura previa

    extractWords();
    if (!words.length) {
        alert("No se encontró texto para leer en este capítulo.");
        log("Abortando: 0 palabras encontradas");
        return;
    }

    isReading = true;
    speakWordFrom(index);
}

function pauseReading() {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        log("Pausa TTS");
        window.speechSynthesis.pause();
    }
}

function resumeReading() {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
        log("Resume TTS");
        window.speechSynthesis.resume();
    }
}

function stopReading() {
    log("stopReading()");
    isReading = false;
    index = 0;
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    removeHighlight();
}

/* ============================================================================
   8) CONFIGURAR PANEL
============================================================================ */
function setupPanel(shadow) {
    const voiceList = shadow.querySelector("#voiceList");
    const rateBox = shadow.querySelector("#rateBox");

    // Poblar voces un poco después para darle tiempo a Chrome Android
    setTimeout(() => {
        log("Poblando combo de voces. voices.length:", voices.length);

        voiceList.innerHTML = "";
        if (!voices.length) {
            const o = document.createElement("option");
            o.value = "default";
            o.textContent = "Voz por defecto del sistema";
            voiceList.appendChild(o);
            currentVoice = "default";
        } else {
            voices.forEach(v => {
                const opt = document.createElement("option");
                opt.value = v.name;
                opt.textContent = `${v.name} (${v.lang})`;
                voiceList.appendChild(opt);
            });
            currentVoice = voices[0].name;
        }
    }, 400);

    voiceList.onchange = e => {
        currentVoice = e.target.value;
        log("Voz seleccionada:", currentVoice);
    };

    [0.75,1,1.25,1.5,1.75,2].forEach(r => {
        const b = document.createElement("button");
        b.textContent = "x" + r;
        b.className = "rateBtn";
        b.onclick = () => {
            playbackRate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");

            // Cambiar velocidad mientras lee (en la práctica, Chrome lo respeta a medias)
            if (window.speechSynthesis && window.speechSynthesis.speaking && utter) {
                log("Cambio de velocidad en vivo a", playbackRate);
                // No hay API directa para cambiar rate en caliente, pero pausamos y reanudamos
                window.speechSynthesis.pause();
                utter.rate = playbackRate;
                window.speechSynthesis.resume();
            }
        };
        rateBox.appendChild(b);
    });

    shadow.querySelector("#readBtn").onclick = () => {
        log("Click en LEER");
        startReading();
    };
    shadow.querySelector("#pauseBtn").onclick = () => {
        log("Click en PAUSA");
        pauseReading();
    };
    shadow.querySelector("#resumeBtn").onclick = () => {
        log("Click en SEGUIR");
        resumeReading();
    };
    shadow.querySelector("#stopBtn").onclick = () => {
        log("Click en DETENER");
        stopReading();
    };

    shadow.querySelector("#closeBtn").onclick = () => {
        log("Click en CERRAR");
        stopReading();
        shadow.host.remove();
    };
}

/* ============================================================================
   INIT
============================================================================ */
document.addEventListener("DOMContentLoaded", () => {
    log("INIT DOMContentLoaded");
    injectFloatingButton();
    loadVoices();
});

})();
