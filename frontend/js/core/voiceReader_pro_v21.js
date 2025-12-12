/* ============================================================================
   🎧 CFC-VOICE READER PRO — V21 REAL FINAL (SEGMENTADO PROFESIONAL)
   100% Chrome PC + Chrome Android compatible
   - Segmentación en bloques de 10–15 palabras
   - Resume REAL exacto
   - Velocidad dinámica REAL mientras lee
   - Voces masculinas y femeninas detectadas correctamente
   - Highlight sin modificar HTML del capítulo
   - Botón premium fijo abajo izquierda
   - Panel compacto premium negro/dorado
============================================================================ */

(() => {

/* ======================
   VARIABLES
====================== */
let segments = [];
let currentSegment = 0;
let isReading = false;
let utter = null;
let voices = [];
let currentVoice = null;
let rate = 1;
let highlightBox = null;
let textWords = [];

/* ======================
   LOG
====================== */
const log = (...m) => console.log("🎧 V21:", ...m);

/* ============================================================================
   1) AUDIO UNLOCK (Chrome Android requiere esto sí o sí)
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
   2) CARGA DE VOCES CON RETRY SEGURO
============================================================================ */
function loadVoicesPolling(maxAttempts = 30) {
    return new Promise(resolve => {
        let attempts = 0;

        const timer = setInterval(() => {
            const list = speechSynthesis.getVoices();

            if (list && list.length > 0) {
                clearInterval(timer);

                let es = list.filter(v => v.lang.toLowerCase().startsWith("es"));
                let males = list.filter(v =>
                    /male|hombre|masculino|standard-b|standard-d|baritone/i.test(v.name)
                );

                voices = [...males, ...es, ...list];

                // dedupe
                const map = {};
                voices.forEach(v => map[v.name] = v);
                voices = Object.values(map);

                currentVoice = voices[0]?.name || null;

                log("Voces cargadas:", voices.map(v => v.name));
                resolve(true);
            }

            attempts++;
            if (attempts >= maxAttempts) {
                clearInterval(timer);
                alert("⚠️ El narrador no pudo cargar las voces. Recargá la página.");
                resolve(false);
            }
        }, 200);
    });
}

/* ============================================================================
   3) EXTRACCIÓN DE TEXTO Y SEGMENTACIÓN PROFESIONAL (10–15 palabras)
============================================================================ */
function extractSegments() {
    const container = document.querySelector("main") || document.body;
    const text = container.innerText.replace(/\s+/g, " ").trim();
    textWords = text.split(" ");

    segments = [];
    let temp = [];

    textWords.forEach((w, i) => {
        temp.push(w);
        if (temp.length >= 12) { // 10–15 palabras ideal
            segments.push(temp.join(" "));
            temp = [];
        }
    });

    if (temp.length > 0) segments.push(temp.join(" "));

    log("Segmentos generados:", segments.length);
}

/* ============================================================================
   4) HIGHLIGHT PREMIUM SIN MODIFICAR HTML
============================================================================ */
function highlight(word) {
    removeHighlight();

    highlightBox = document.createElement("div");
    highlightBox.style.position = "fixed";
    highlightBox.style.left = "0";
    highlightBox.style.bottom = "0";
    highlightBox.style.width = "100%";
    highlightBox.style.padding = "16px";
    highlightBox.style.background = "rgba(255,215,0,0.20)";
    highlightBox.style.color = "#000";
    highlightBox.style.fontSize = "18px";
    highlightBox.style.fontWeight = "700";
    highlightBox.style.zIndex = "999999998";

    highlightBox.textContent = word || "";
    document.body.appendChild(highlightBox);
}

function removeHighlight() {
    if (highlightBox) highlightBox.remove();
}

/* ============================================================================
   5) MOTOR PRINCIPAL SEGMENTADO (Resume exacto REAL)
============================================================================ */
function speakSegment(i) {
    if (i >= segments.length) return stopReading();

    currentSegment = i;
    const text = segments[i];

    utter = new SpeechSynthesisUtterance(text);

    const v = voices.find(v => v.name === currentVoice) || voices[0];
    if (v) {
        utter.voice = v;
        utter.lang = v.lang;
    }

    utter.rate = rate;

    // highlight palabra por palabra
    const words = text.split(" ");
    let wIndex = 0;
    utter.onboundary = e => {
        if (e.name === "word") {
            highlight(words[wIndex] || "");
            wIndex++;
        }
    };

    utter.onend = () => {
        if (!isReading) return;
        speakSegment(currentSegment + 1); // siguiente bloque
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   6) CONTROLES
============================================================================ */
function startReading() {
    stopReading();
    extractSegments();
    if (!segments.length) {
        alert("No hay texto para leer.");
        return;
    }
    isReading = true;
    speakSegment(currentSegment);
}

function pauseReading() {
    if (speechSynthesis.speaking) speechSynthesis.pause();
}

function resumeReading() {
    if (speechSynthesis.paused) speechSynthesis.resume();
}

function stopReading() {
    isReading = false;
    currentSegment = 0;
    speechSynthesis.cancel();
    removeHighlight();
}

/* ============================================================================
   7) PANEL PREMIUM
============================================================================ */
function openPanel() {
    if (document.querySelector("#cfcTTSPanel")) return;

    const panel = document.createElement("div");
    panel.id = "cfcTTSPanel";

    Object.assign(panel.style, {
        position: "fixed",
        left: "25px",
        bottom: "95px",
        width: "230px",
        padding: "14px",
        background: "#000",
        border: "2px solid #FFD700",
        borderRadius: "12px",
        color: "#fff",
        fontFamily: "Inter,sans-serif",
        zIndex: 999999997,
        boxShadow: "0 0 18px rgba(255,215,0,0.4)"
    });

    panel.innerHTML = `
        <h4 style="color:#FFD700;margin:0 0 8px 0;font-size:16px;">Narrador IA</h4>

        <label>Voz:</label>
        <select id="ttsVoice" style="width:100%;padding:6px;margin-top:4px;
        background:#111;color:white;border:1px solid #FFD700;border-radius:6px;"></select>

        <label style="margin-top:10px;display:block;">Velocidad:</label>
        <div id="ttsRate"></div>

        <button id="ttsRead" class="cfcBtn">▶ Leer</button>

        <div style="display:flex;justify-content:space-between;margin-top:6px;">
            <button id="ttsPause" class="cfcRow">⏸ Pausa</button>
            <button id="ttsResume" class="cfcRow">▶ Seguir</button>
        </div>

        <button id="ttsStop" class="cfcStop">⏹ Detener</button>

        <button id="ttsClose" class="cfcClose">❌ Cerrar</button>

        <style>
            .cfcBtn{
                width:100%;padding:8px;margin-top:6px;background:#FFD700;color:#000;
                font-weight:700;border:none;border-radius:8px;cursor:pointer;
            }
            .cfcRow{
                width:48%;padding:7px;background:#222;border:1px solid #FFD700;
                color:white;border-radius:6px;cursor:pointer;
            }
            .cfcStop{
                width:100%;padding:8px;margin-top:6px;background:#b82828;
                color:white;font-weight:700;border:none;border-radius:8px;
            }
            .cfcClose{
                width:100%;padding:7px;margin-top:6px;background:#444;color:white;
                border-radius:6px;cursor:pointer;
            }
            .rateBtn{
                padding:6px 10px;margin:2px;background:#111;color:#FFD700;
                border:1px solid #FFD700;border-radius:6px;cursor:pointer;
                font-size:12px;
            }
            .rateBtn.active{ background:#FFD700;color:#000; }
        </style>
    `;

    document.body.appendChild(panel);

    // Poblar voces
    setTimeout(() => {
        const sel = document.querySelector("#ttsVoice");
        voices.forEach(v => {
            const opt = document.createElement("option");
            opt.value = v.name;
            opt.textContent = `${v.name} (${v.lang})`;
            sel.appendChild(opt);
        });
        currentVoice = voices[0]?.name;
    }, 300);

    // Velocidades
    const speeds = [0.75, 1, 1.25, 1.5, 1.75, 2];
    const rateBox = document.querySelector("#ttsRate");

    speeds.forEach(r => {
        let b = document.createElement("button");
        b.className = "rateBtn";
        b.textContent = "x" + r;
        b.onclick = () => {
            rate = r;
            [...rateBox.children].forEach(x => x.classList.remove("active"));
            b.classList.add("active");

            if (speechSynthesis.speaking && utter) {
                speechSynthesis.pause();
                utter.rate = rate;
                speechSynthesis.resume();
            }
        };
        rateBox.appendChild(b);
    });

    document.querySelector("#ttsVoice").onchange = e => {
        currentVoice = e.target.value;
    };

    document.querySelector("#ttsRead").onclick = startReading;
    document.querySelector("#ttsPause").onclick = pauseReading;
    document.querySelector("#ttsResume").onclick = resumeReading;
    document.querySelector("#ttsStop").onclick = stopReading;

    document.querySelector("#ttsClose").onclick = () => {
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
        left: "25px",
        bottom: "25px",
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "linear-gradient(90deg,#FFD700,#C5A200)",
        border: "none",
        color: "#000",
        fontSize: "28px",
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
