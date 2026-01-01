/* =========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (PAE + RESULTADO)
   Campus CFC LITE V41

   Estadística 14/17 — Nivel 4
   ========================================================= */

(function () {

  window.renderStat_14_momentos_estructurales_cambios = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r => {
      const st = r?.meta?.estado || r?.estado_registro || "VALIDO";
      return st === "VALIDO" || st === "CORREGIDO";
    });

    if (!valid.length) {
      renderEmpty(box, "No hay registros válidos.");
      return;
    }

    // Orden cronológico estable
    const ordered = [...valid].sort((a, b) =>
      getTimeKey(a).localeCompare(getTimeKey(b))
    );

    // Segmentación por MOMENTO ESTRUCTURAL consecutivo
    const segments = [];
    ordered.forEach(r => {
      const v = normalizeMomento(r?.momento_estructural);
      const last = segments.at(-1);
      if (!last || last.value !== v) segments.push({ value: v, records: [r] });
      else last.records.push(r);
    });

    const cards = segments.map((s, i) =>
      buildMomentCardData(s.value, s.records, i + 1)
    );

    box.insertAdjacentHTML("beforeend",
      window.renderCuadroBasePEA({
        nivel: 4,
        indice: 14,
        titulo: "Momentos estructurales (PAE + resultado)",
        totalRegistros: cards.length,
        universo: "Registros válidos segmentados por tramos consecutivos",
        criterios: [
          "Resultado operativo tomado SOLO de DESPUÉS",
          "ANTES y DURANTE heredan resultado por fecha",
          "Ranking Top 3 fijo",
          "Rail horizontal + espacio para gráfico"
        ],
        contenidoHTML: renderRail(cards)
      })
    );

    wireUI();
  };

  /* ===================== UI ===================== */

  function renderRail(cards) {
    return `
      <div id="pea-stat14-root" style="display:flex; gap:12px;">
        <div style="flex:1; min-width:0;">
          <div style="margin-bottom:8px;">
            Mostrar
            <select id="stat14-visible">
              <option value="2" selected>2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
            momentos
          </div>

          <div id="stat14-rail" style="overflow-x:auto;">
            <div id="stat14-inner" style="display:flex; gap:12px;">
              ${cards.map(renderCard).join("")}
            </div>
          </div>
        </div>

        <div style="width:360px; border:1px solid rgba(255,255,255,.1); padding:10px;">
          <em>Espacio reservado para gráfico</em>
        </div>
      </div>
    `;
  }

  function wireUI() {
    const sel = document.getElementById("stat14-visible");
    const rail = document.getElementById("stat14-rail");
    const inner = document.getElementById("stat14-inner");

    function apply(n) {
      const w = Math.max(520, Math.floor((rail.clientWidth - 20) / n));
      inner.querySelectorAll("[data-card]").forEach(c => {
        c.style.flex = `0 0 ${w}px`;
      });
    }

    apply(2);
    sel.onchange = () => apply(+sel.value);
  }

  /* ===================== DATA ===================== */

  function buildMomentCardData(label, records, idx) {
    const fechas = records.map(r => r.fecha).filter(Boolean);
    const start = fechas.sort()[0] || "—";
    const end = fechas.sort().at(-1) || "—";
    const dias = new Set(fechas).size;

    // Resultado por fecha (DESPUÉS manda)
    const resultByFecha = {};
    records.forEach(r => {
      if (r.momento === "DESPUES") {
        resultByFecha[r.fecha] = normalizeResultado(r.resultado_operativo || r.resultado);
      }
    });

    // Capa 2
    const despues = records.filter(r => r.momento === "DESPUES");
    const dist = countBy(despues, r => normalizeResultado(r.resultado_operativo || r.resultado));

    // Intensidad
    const intens = despues.map(r => Number(r.intensidad)).filter(n => !isNaN(n));
    const prom = intens.length ? (intens.reduce((a,b)=>a+b,0)/intens.length).toFixed(1) : "—";
    const picos = intens.length ? Math.round(intens.filter(v=>v>=4).length/intens.length*100)+"%" : "—";

    return {
      idx, label, start, end, dias,
      capa2: {
        GANADA: dist.GANADA||0,
        PERDIDA: dist.PERDIDA||0,
        BE: dist.BE||0,
        NA: dist.NA||0,
        TOTAL: despues.length,
        prom, picos
      },
      capa3: {
        GANADAS: buildPAE("GANADA", records, resultByFecha),
        PERDIDAS: buildPAE("PERDIDA", records, resultByFecha)
      }
    };
  }

  function buildPAE(target, records, map) {
    const dias = Object.entries(map).filter(([,v])=>v===target).map(([f])=>f);

    const pensamientos=[], acciones=[], estados=[];

    records.forEach(r=>{
      if (!dias.includes(r.fecha)) return;
      if (r.momento==="ANTES" && r.pensamiento) pensamientos.push(r.pensamiento);
      if (r.momento==="DURANTE" && Array.isArray(r.acciones)) acciones.push(...r.acciones);
      if (r.momento==="DESPUES" && r.estado) estados.push(r.estado);
    });

    return {
      total:dias.length,
      pensamientos: top3(pensamientos),
      acciones: top3(acciones),
      estados: top3(estados)
    };
  }

  /* ===================== RENDER ===================== */

  function renderCard(d){
    return `
      <div data-card style="border:1px solid rgba(255,255,255,.08); padding:10px;">
        <strong>MOMENTO #${d.idx}</strong><br>
        <strong>${d.label}</strong>
        <div>📅 ${d.start} → ${d.end}</div>
        <div>🗓️ ${d.dias} días</div>

        <hr>

        ${renderCapa2(d.capa2)}

        <hr>

        ${renderCapa3("GANADAS", d.capa3.GANADAS)}
        ${renderCapa3("PERDIDAS", d.capa3.PERDIDAS)}
      </div>
    `;
  }

  function renderCapa2(c){
    const row=(l,v)=>`<tr><td>${l}</td><td>${v}</td></tr>`;
    return `
      <strong>CAPA 2 — RESULTADO</strong>
      <table style="width:100%; table-layout:fixed;">
        ${row("GANADA",c.GANADA)}
        ${row("PERDIDA",c.PERDIDA)}
        ${row("BE",c.BE)}
        ${row("NA",c.NA)}
        ${row("TOTAL",c.TOTAL)}
      </table>
      <div>Intensidad prom: ${c.prom}</div>
      <div>Picos 4–5: ${c.picos}</div>
    `;
  }

  function renderCapa3(label,d){
    return `
      <div>
        <strong>${label}</strong> (${d.total})
        ${rank("Pensamientos",d.pensamientos)}
        ${rank("Acciones",d.acciones)}
        ${rank("Estados",d.estados)}
      </div>
    `;
  }

  function rank(t,arr){
    while(arr.length<3) arr.push({k:"—",c:0,p:0});
    return `
      <div>${t}</div>
      <table style="width:100%; table-layout:fixed;">
        ${arr.map((r,i)=>`<tr><td>#${i+1}</td><td>${r.k}</td><td>${r.c}</td><td>${r.p}%</td></tr>`).join("")}
      </table>
    `;
  }

  /* ===================== HELPERS ===================== */

  function normalizeMomento(v){return v||"SIN_MARCAR";}
  function normalizeResultado(v){return ["GANADA","PERDIDA","BE"].includes(v)?v:"NA";}
  function getTimeKey(r){return (r.fecha||"")+"_"+(r.momento||"");}
  function countBy(a,f){return a.reduce((m,x)=>(m[f(x)] = (m[f(x)]||0)+1,m),{});}
  function top3(a){
    const m={}; a.forEach(v=>m[v]=(m[v]||0)+1);
    const t=a.length||1;
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,3)
      .map(([k,c])=>({k,c,p:Math.round(c/t*100)}));
  }

  function renderEmpty(box,msg){
    box.innerHTML=`<div>${msg}</div>`;
  }

})();
