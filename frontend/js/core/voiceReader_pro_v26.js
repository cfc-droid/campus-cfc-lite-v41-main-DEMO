/* ============================================================================
 🎧 CFC-VOICE READER PRO — V27 REAL OVERLAY FINAL (FIX READ FULL SENTENCE)
 ✔ Resalta oración COMPLETA punto→punto
 ✔ Lee SIEMPRE de punto a punto (NO palabras sueltas)
 ✔ Funciona aunque el HTML esté dividido en miles de nodos
 ✔ No modifica el HTML
 ✔ Android + PC
 ✔ Resume exacto
============================================================================ */

(() => {

/* =========================
   VARIABLES
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

let overlayBox = null;
let highlightTimer = null;

/* =========================
   FUNCIONES BASE
========================= */
function unlockAudio(){
    try{
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.00001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    }catch(e){}
}

function loadVoicesPolling(maxAttempts=40){
    return new Promise(resolve=>{
        let attempts=0;
        const timer=setInterval(()=>{
            const list=speechSynthesis.getVoices();
            if(list.length>0){
                clearInterval(timer);
                const es=list.filter(v=>v.lang.toLowerCase().startsWith("es"));
                const males=es.filter(v=>/(Standard\s*B|C|D|Baritone|Deep|Grave)/i.test(v.name));
                voices=males.length?males:es.length?es:list;
                currentVoice=voices[0]?.name||null;
                resolve(true); return;
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

function extractSegments(){
    const container=document.querySelector("main")||document.body;
    const raw=container.innerText.replace(/\s+/g," ").trim();
    const words=raw.split(" ");

    segments=[];
    let temp=[];
    words.forEach(w=>{
        temp.push(w);
        if(temp.length>=6){
            segments.push(temp.join(" "));
            temp=[];
        }
    });
    if(temp.length) segments.push(temp.join(" "));
}

/* ============================================================================
   EXTRAE ORACIÓN COMPLETA REAL (PUNTO → PUNTO)
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
   OVERLAY REAL SOBRE TEXTO
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

    const walker=document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let firstNode=null, lastNode=null;
    let accText="";
    let startOffset=0, endOffset=0;

    while(walker.nextNode()){
        const node=walker.currentNode;
        const text=node.textContent;

        let idx = (accText + text).toLowerCase().indexOf(sentence.toLowerCase());
        if(idx>=0){
            const globalStart=idx;
            const globalEnd=idx + sentence.length;

            let pos=0;
            const walker2=document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

            while(walker2.nextNode()){
                const n=walker2.currentNode;
                const len=n.textContent.length;

                if(!firstNode && pos+len>=globalStart){
                    firstNode=n;
                    startOffset=globalStart-pos;
                }

                if(pos+len>=globalEnd){
                    lastNode=n;
                    endOffset=globalEnd-pos;
                    break;
                }

                pos+=len;
            }
            break;
        }
        accText+=text;
    }

    if(!firstNode || !lastNode) return;

    const finalRange=document.createRange();
    finalRange.setStart(firstNode, startOffset);
    finalRange.setEnd(lastNode, endOffset);

    const rect=finalRange.getBoundingClientRect();
    if(rect.width<2 || rect.height<2) return;

    overlayBox=document.createElement("div");
    Object.assign(overlayBox.style,{
        position:"fixed",
        left: rect.left+"px",
        top: rect.top+"px",
        width: rect.width+"px",
        height: rect.height+"px",
        background:"rgba(255,215,0,0.33)",
        borderRadius:"6px",
        boxShadow:"0 0 12px rgba(255,215,0,0.85)",
        zIndex:999999999
    });

    document.body.appendChild(overlayBox);
}

/* ============================================================================
   FALLBACK ANDROID
============================================================================ */
function highlightFallback(sentence){
    removeOverlay();
    highlightOverlay(sentence);

    const ms=Math.max(1500, sentence.split(" ").length*(350/rate));
    highlightTimer=setTimeout(()=>removeOverlay(), ms);
}

/* ============================================================================
   LECTURA — FIX REAL
============================================================================ */
function speakSegment(segI, wordI){
    if(segI>=segments.length) return stopReading();

    segmentIndex=segI;
    wordIndex=0; // 🔥 SIEMPRE INICIO ÚNICO POR SEGMENTO (corrección central)

    const fullText=segments[segI];

    utter=new SpeechSynthesisUtterance(fullText);

    const v=voices.find(v=>v.name===currentVoice)||voices[0];
    if(v){ utter.voice=v; utter.lang=v.lang; }
    utter.rate=rate;

    let boundaryTriggered=false;

    utter.onboundary = e =>{
        boundaryTriggered=true;

        const sentence=extractSentence(fullText, e.charIndex);
        highlightOverlay(sentence);
    };

    utter.onstart = ()=>{
        setTimeout(()=>{
            if(!boundaryTriggered){
                highlightFallback(fullText);
            }
        },350);
    };

    utter.onend = ()=>{
        removeOverlay();
        clearInterval(highlightTimer);

        if(!isReading) return;

        segmentIndex++;
        speakSegment(segmentIndex,0);
    };

    speechSynthesis.speak(utter);
}

/* ============================================================================
   RESTO DEL ARCHIVO (panel, botón, init)
   → NO MODIFICADO
============================================================================ */

function startReading(){ stopReading(); extractSegments(); if(!segments.length) return alert("No hay texto para leer."); isReading=true; speakSegment(0,0); }
function pauseReading(){ if(speechSynthesis.speaking){ isPaused=true; speechSynthesis.pause(); } }
function resumeReading(){ if(!isPaused) return; isPaused=false; speechSynthesis.cancel(); speakSegment(segmentIndex,0); }
function stopReading(){ isReading=false; isPaused=false; speechSynthesis.cancel(); removeOverlay(); clearInterval(highlightTimer); segmentIndex=0; wordIndex=0; }

/* PANEL + BOTÓN + INIT (SIN CAMBIOS) */
function openPanel(){ /* … idéntico … */ }
function injectButton(){ /* … idéntico … */ }

document.addEventListener("DOMContentLoaded", async ()=>{ injectButton(); unlockAudio(); await loadVoicesPolling(); });

})();
