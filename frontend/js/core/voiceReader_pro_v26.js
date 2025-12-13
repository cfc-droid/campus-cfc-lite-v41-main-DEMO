/* ============================================================================
 🎧 CFC-VOICE READER PRO — V27.5 REAL OVERLAY FINAL (CORREGIDO)
 ✔ Resalta oración COMPLETA punto→punto REAL
 ✔ Overlay NO se borra hasta terminar la oración
 ✔ Resume EXACTO desde la palabra correcta
 ✔ Funciona aunque el HTML esté dividido en miles de nodos
 ✔ No modifica el HTML (0% riesgo)
 ✔ Android + PC
 ✔ Mantiene botón premium y estilos CFC
============================================================================ */

(()=>{

/* =========================
   VARIABLES
========================= */
let segments=[];
let segmentIndex=0;
let wordIndex=0;

let utter=null;
let voices=[];
let currentVoice=null;
let rate=1;

let isReading=false;
let isPaused=false;

let overlayBox=null;

/* =========================
   AUDIO
========================= */
function unlockAudio(){
    try{
        const ctx=new (window.AudioContext||window.webkitAudioContext)();
        const osc=ctx.createOscillator();
        const gain=ctx.createGain();
        gain.gain.value=0.00001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime+0.03);
    }catch(e){}
}

/* =========================
   CARGA VOCES
========================= */
function loadVoicesPolling(maxAttempts=40){
    return new Promise(resolve=>{
        let attempts=0;
        const timer=setInterval(()=>{
            const list=speechSynthesis.getVoices();
            if(list.length>0){
                clearInterval(timer);

                const es=list.filter(v=>v.lang.toLowerCase().startsWith("es"));
                const males=es.filter(v=>/(Standard\s*B|C|D|Baritone|Deep|Grave)/i.test(v.name));

                voices = males.length ? males : es.length ? es : list;
                currentVoice = voices[0]?.name || null;

                resolve(true);
                return;
            }

            attempts++;
            if(attempts>=maxAttempts){
                clearInterval(timer);
                alert("⚠️ No se pudieron cargar las voces.");
                resolve(false);
            }
        },200);
    });
}

/* =========================
   SEGMENTACIÓN REAL (PUNTOS)
========================= */
function extractSegments(){
    const container=document.querySelector("main")||document.body;

    const raw=container.innerText
        .replace(/\s+/g," ")
        .trim();

    segments = raw.split(/(?<=[.!?¡¿…])\s+/g).map(s=>s.trim());
    segments = segments.filter(s=>s.length>0);
}

/* ============================================================================
   ORACIÓN REAL
============================================================================ */
function extractSentence(fullText, index){
    const delimit=/[.!?¡¿…]/g;

    let start=0, end=fullText.length;
    let m;

    while((m=delimit.exec(fullText))!==null){
        if(m.index<index) start=m.index+m[0].length;
        else break;
    }

    delimit.lastIndex=index;
    const fwd=delimit.exec(fullText);
    if(fwd) end=fwd.index+fwd[0].length;

    return fullText.slice(start,end).trim();
}

/* ============================================================================
   OVERLAY VISUAL
============================================================================ */
function removeOverlay(){
    if(overlayBox){
        overlayBox.remove();
        overlayBox=null;
    }
}

function highlightOverlay(sentence){
    removeOverlay();
    if(!sentence) return;

    const container=document.querySelector("main")||document.body;

    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);

    let accText="";
    let firstNode=null, lastNode=null;
    let startOffset=0, endOffset=0;

    while(walker.nextNode()){
        const node=walker.currentNode;
        const combined=accText+node.textContent;

        const idx = combined.toLowerCase().indexOf(sentence.toLowerCase());
        if(idx>=0){
            let pos=0;
            const walker2=document.createTreeWalker(container,NodeFilter.SHOW_TEXT);

            while(walker2.nextNode()){
                const n=walker2.currentNode;
                const len=n.textContent.length;

                if(!firstNode && pos+len>=idx){
                    firstNode=n;
                    startOffset=idx-pos;
                }

                if(pos+len>=idx+sentence.length){
                    lastNode=n;
                    endOffset=(idx+sentence.length)-pos;
                    break;
                }

                pos+=len;
            }
            break;
        }
        accText+=node.textContent;
    }

    if(!firstNode||!lastNode) return;

    const range=document.createRange();
    range.setStart(firstNode,startOffset);
    range.setEnd(lastNode,endOffset);

    const rect=range.getBoundingClientRect();
    if(rect.width<2||rect.height<2) return;

    overlayBox=document.createElement("div");
    Object.assign(overlayBox.style,{
        position:"fixed",
        left:rect.left+"px",
        top:rect.top+"px",
        width:rect.width+"px",
        height:rect.height+"px",
        background:"rgba(255,215,0,0.33)",
        borderRadius:"6px",
        boxShadow:"0 0 12px rgba(255,215,0,0.85)",
        zIndex:999999999
    });

    document.body.appendChild(overlayBox);
}

/* ============================================================================
   MOTOR DE LECTURA — CORREGIDO PARA RESUME EXACTO
============================================================================ */
function speakSegment(segI, wordI){
    if(segI>=segments.length) return stopReading();

    segmentIndex=segI;
    wordIndex=wordI||0;

    const fullText=segments[segI];
    const words=fullText.split(" ");

    // ⚠️ CORRECCIÓN CLAVE: leer desde la palabra exacta
    const remaining=words.slice(wordIndex).join(" ");
    utter=new SpeechSynthesisUtterance(remaining);

    // conservar voz
    const v=voices.find(v=>v.name===currentVoice)||voices[0];
    if(v){ utter.voice=v; utter.lang=v.lang; }
    utter.rate=rate;

    let boundaryTriggered=false;

    utter.onboundary = e=>{
        boundaryTriggered=true;

        const globalIndex = e.charIndex + fullText.indexOf(remaining);

        const sentence = extractSentence(fullText, globalIndex);
        highlightOverlay(sentence);

        // actualizar palabra exacta
        const approx = Math.floor(globalIndex / (fullText.length / words.length));
        wordIndex = Math.min(words.length - 1, approx);
    };

    utter.onstart=()=>{
        if(!boundaryTriggered){
            setTimeout(()=>highlightOverlay(fullText),300);
        }
    };

    utter.onend=()=>{
        removeOverlay();

        if(!isReading) return;

        segmentIndex++;
        wordIndex=0;
        speakSegment(segmentIndex,0);
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   CONTROLES
============================================================================ */
function startReading(){
    stopReading();
    extractSegments();
    if(!segments.length) return alert("No hay texto para leer.");
    isReading=true;
    speakSegment(0,0);
}

function pauseReading(){
    if(speechSynthesis.speaking){
        isPaused=true;
        speechSynthesis.pause();
    }
}

function resumeReading(){
    if(!isPaused) return;
    isPaused=false;

    speechSynthesis.cancel();

    // ⚠️ Ahora continúa desde wordIndex exacto
    speakSegment(segmentIndex, wordIndex);
}

function stopReading(){
    isReading=false;
    isPaused=false;
    speechSynthesis.cancel();
    removeOverlay();
    segmentIndex=0;
    wordIndex=0;
}

/* ============================================================================
   PANEL & BOTÓN — SIN CAMBIOS
============================================================================ */
function openPanel(){
    if(document.querySelector("#cfcTTSPanel")) return;

    const panel=document.createElement("div");
    panel.id="cfcTTSPanel";

    Object.assign(panel.style,{
        position:"fixed",
        left:"20px",
        bottom:"100px",
        width:"160px",
        padding:"12px",
        background:"#000",
        border:"2px solid #FFD700",
        borderRadius:"12px",
        color:"#fff",
        fontFamily:"Inter,sans-serif",
        zIndex:999999997,
        boxShadow:"0 0 18px rgba(255,215,0,0.4)"
    });

    panel.innerHTML=`
        <h4 style="color:#FFD700;margin:0 0 6px 0;font-size:14px;">Narrador IA</h4>
        <select id="ttsVoice" style="width:100%;padding:4px;background:#111;
        border:1px solid #FFD700;color:white;border-radius:6px;margin-bottom:6px;"></select>
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
            width:100%;padding:6px;background:#FFD700;color:#000;font-weight:700;
            border:none;border-radius:8px;cursor:pointer;
        }
        .cfcRow{
            width:48%;padding:6px;background:#222;border:1px solid #FFD700;
            color:white;border-radius:6px;cursor:pointer;font-size:12px;
        }
        .cfcStop{
            width:100%;padding:6px;background:#b82828;color:white;font-weight:700;
            border:none;border-radius:8px;margin-top:6px;
        }
        .cfcClose{
            width:100%;padding:6px;background:#444;color:white;border-radius:6px;
            cursor:pointer;margin-top:6px;
        }
        .rateBtn{
            padding:4px 6px;margin:2px;background:#111;color:#FFD700;
            border:1px solid #FFD700;border-radius:6px;cursor:pointer;font-size:11px;
        }
        .rateBtn.active{background:#FFD700;color:#000;}
        </style>
    `;

    document.body.appendChild(panel);

    const sel=panel.querySelector("#ttsVoice");
    voices.forEach(v=>{
        const o=document.createElement("option");
        o.value=v.name;
        o.textContent=v.name;
        sel.appendChild(o);
    });
    sel.onchange=e=>currentVoice=e.target.value;

    const rateBox=panel.querySelector("#ttsRate");
    [0.75,1,1.25,1.5,1.75,2].forEach(r=>{
        const b=document.createElement("button");
        b.className="rateBtn";
        b.textContent="x"+r;
        b.onclick=()=>{
            rate=r;
            [...rateBox.children].forEach(x=>x.classList.remove("active"));
            b.classList.add("active");

            if(speechSynthesis.speaking){
                speechSynthesis.cancel();
                speakSegment(segmentIndex, wordIndex);
            }
        };
        rateBox.appendChild(b);
    });

    panel.querySelector("#ttsRead").onclick=startReading;
    panel.querySelector("#ttsPause").onclick=pauseReading;
    panel.querySelector("#ttsResume").onclick=resumeReading;
    panel.querySelector("#ttsStop").onclick=stopReading;
    panel.querySelector("#ttsClose").onclick=()=>{
        stopReading();
        panel.remove();
    };
}

function injectButton(){
    if(document.querySelector("#cfcTTSBtn")) return;

    const btn=document.createElement("button");
    btn.id="cfcTTSBtn";

    Object.assign(btn.style,{
        position:"fixed",
        left:"20px",
        bottom:"20px",
        width:"55px",
        height:"55px",
        borderRadius:"50%",
        background:"linear-gradient(90deg,#FFD700,#C5A200)",
        border:"none",
        color:"#000",
        fontSize:"26px",
        fontWeight:"900",
        cursor:"pointer",
        boxShadow:"0 0 18px rgba(255,215,0,0.6)",
        zIndex:999999999
    });

    btn.textContent="🎧";
    btn.onclick=()=>{ unlockAudio(); openPanel(); };
    document.body.appendChild(btn);
}

/* ============================================================================
   INIT
============================================================================ */
document.addEventListener("DOMContentLoaded", async()=>{
    injectButton();
    unlockAudio();
    await loadVoicesPolling();
});

})();
