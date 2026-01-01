/* =========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (PAE + RESULTADO)
   Campus CFC LITE V41
   Estadística 14/17 — Nivel 4

   OBJETIVO:
   Formato IDÉNTICO a imagen IMA2

   - Capa 1: Contexto (Momento, período, días)
   - Capa 2: Resultado operativo (DESPUÉS) + intensidad
   - Capa 3: Cadena PAE por resultado
       • GANADAS
       • PERDIDAS
       • Top 3 Pensamientos (ANTES)
       • Top 3 Acciones (DURANTE)
       • Top 3 Estados/Emociones (DESPUÉS)

   REGLAS:
   - Se muestran datos haya o no filtros activos
   - Excluye ANULADO
   - Resultado SOLO desde DESPUÉS
   - ANTES y DURANTE heredan resultado por fecha
   - Ranking SIEMPRE Top 3 (aunque sea vacío)
   - NO gráfico (solo espacio reservado)

   UX:
   - Rail horizontal
   - Selector 2 / 3 / 4
   - Columnas juntas, compactas, claras
   ========================================================= */

(function () {

  window.renderStat_14_momentos_estructurales_cambios = function () {

    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];

    // 🔹 SOLO excluir ANULADO
    const valid = all.filter(r => {
      const st = r?.meta?.estado || r?.estado_registro || "VALIDO";
      return st !== "ANULADO";
    });

    if (!valid.length) {
      renderEmpty(box, "No hay registros válidos.");
      return;
    }

    // 🔹 Orden cronológico estable
    const ordered = [...valid].sort((a, b) =>
      getTimeKey(a).localeCompare(getTimeKey(b))
    );

    // 🔹 Segmentación por MOMENTO ESTRUCTURAL CONSECUTIVO
    const segments = [];
    ordered.forEach(r => {
      const val = normText(r.momento_estructural) || "SIN_MARCAR";
      const last = segments[segments.length - 1];
      if (!last || last.value !== val) {
        segments.push({ value: val, records: [r] });
      } else {
        last.records.push(r);
      }
    });

    const cards = segments.map((seg, i) =>
      buildCard(seg.value, seg.records, i + 1)
    );

    box.insertAdjacentHTML("beforeend",
      window.renderCuadroBasePEA({
        nivel: 4,
        indice: 14,
        titulo: "Momentos estructurales (PAE + resultado)",
        totalRegistros: cards.length,
        universo: "Registros válidos (excluye ANULADO)",
        criterios: [
          "Resultado tomado SOLO de DESPUÉS",
          "ANTES y DURANTE heredan resultado por fecha",
          "Cadena PAE por resultado (GANADAS / PERDIDAS)",
          "Formato idéntico a IMA2",
          "Rail horizontal + espacio para gráfico"
        ],
        contenidoHTML: renderRail(cards)
      })
    );

    wireUI();
  };

  /* ======================= UI ======================= */

  function renderRail(cards) {
    return `
      <div style="display:flex; gap:12px;">
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

  /* ======================= DATA ======================= */

  function buildCard(label, records, idx) {

    const fechas = records.map(r => r.fecha).filter(Boolean).sort();
    const start = fechas[0] || "—";
    const end = fechas[fechas.length - 1] || "—";
    const dias = new Set(fechas).size;

    // 🔹 Resultado por fecha (DESPUÉS manda)
    const resultByFecha = {};
    records.forEach(r => {
      if (normText(r.momento) === "DESPUES") {
        resultByFecha[r.fecha] = normResultado(
          r.resultado_operativo || r.resultado
        );
      }
    });

    const despues = records.filter(r => normText(r.momento) === "DESPUES");
    const dist = countBy(despues, r =>
      normResultado(r.resultado_operativo || r.resultado)
    );

    const intens = despues
      .map(r => Number(r.intensidad))
      .filter(v => !isNaN(v));

    return {
      idx,
      label,
      start,
      end,
      dias,
      capa2: {
        GANADA: dist.GANADA || 0,
        PERDIDA: dist.PERDIDA || 0,
        BE: dist.BE || 0,
        NA: dist.NA || 0,
        TOTAL: despues.length,
        prom: intens.length ? avg(intens).toFixed(1) : "—",
        picos: intens.length
          ? Math.round(intens.filter(v => v >= 4).length / intens.length * 100) + "%"
          : "—"
      },
      capa3: {
        GANADAS: buildPAE("GANADA", records, resultByFecha),
        PERDIDAS: buildPAE("PERDIDA", records, resultByFecha)
      }
    };
  }

  function buildPAE(target, records, map) {
    const fechas = Object.keys(map).filter(f => map[f] === target);

    const pensamientos = [];
    const acciones = [];
    const estados = [];

    records.forEach(r => {
      if (!fechas.includes(r.fecha)) return;

      if (normText(r.momento) === "ANTES" && r.pensamiento)
        pensamientos.push(r.pensamiento);

      if (normText(r.momento) === "DURANTE" && Array.isArray(r.acciones))
        acciones.push(...r.acciones);

      if (normText(r.momento) === "DESPUES" && r.estado)
        estados.push(r.estado);
    });

    return {
      total: fechas.length,
      pensamientos: top3(pensamientos),
      acciones: top3(acciones),
      estados: top3(estados)
    };
  }

  /* ======================= RENDER ======================= */

  function renderCard(d) {
    return `
      <div data-card style="border:1px solid rgba(255,255,255,.08); padding:10px;">
        <strong>◆ MOMENTO ESTRUCTURAL #${d.idx}</strong><br>
        <strong>${d.label}</strong>
        <div>📅 ${d.start} → ${d.end}</div>
        <div>🗓️ Días registrados: ${d.dias}</div>

        <hr>

        ${renderCapa2(d.capa2)}

        <hr>

        ${renderCapa3("GANADAS", d.capa3.GANADAS)}
        ${renderCapa3("PERDIDAS", d.capa3.PERDIDAS)}
      </div>
    `;
  }

  function renderCapa2(c) {
    const row = (l, v, t) =>
      `<tr><td>${l}</td><td>${v}</td><td>${t}</td></tr>`;

    return `
      <strong>CAPA 2 — RESULTADO OPERATIVO (DESPUÉS)</strong>
      <table style="width:100%; table-layout:fixed;">
        ${row("GANADA", c.GANADA, pct(c.GANADA, c.TOTAL))}
        ${row("PERDIDA", c.PERDIDA, pct(c.PERDIDA, c.TOTAL))}
        ${row("BE", c.BE, pct(c.BE, c.TOTAL))}
        ${row("NA", c.NA, pct(c.NA, c.TOTAL))}
        ${row("TOTAL", c.TOTAL, c.TOTAL ? "100%" : "0%")}
      </table>
      <div>Intensidad promedio: ${c.prom}</div>
      <div>Picos 4–5: ${c.picos}</div>
    `;
  }

  function renderCapa3(label, d) {
    return `
      <div style="margin-top:8px;">
        <strong>${label}</strong> (${d.total})
        ${rank("Pensamientos (ANTES)", d.pensamientos)}
        ${rank("Acciones (DURANTE)", d.acciones)}
        ${rank("Estados / Emociones (DESPUÉS)", d.estados)}
      </div>
    `;
  }

  function rank(title, arr) {
    while (arr.length < 3) arr.push({ k: "—", c: 0, p: 0 });
    return `
      <div>${title}</div>
      <table style="width:100%; table-layout:fixed;">
        ${arr.map((r, i) =>
          `<tr>
            <td>#${i + 1}</td>
            <td>${r.k}</td>
            <td>${r.c}</td>
            <td>${r.p}%</td>
          </tr>`
        ).join("")}
      </table>
    `;
  }

  /* ======================= HELPERS ======================= */

  function normText(v) { return (v || "").toUpperCase(); }
  function normResultado(v) {
    return ["GANADA", "PERDIDA", "BE", "NA"].includes(v) ? v : "NA";
  }
  function getTimeKey(r) { return `${r.fecha || ""}_${r.momento || ""}`; }
  function countBy(arr, fn) {
    return arr.reduce((m, x) => {
      const k = fn(x);
      m[k] = (m[k] || 0) + 1;
      return m;
    }, {});
  }
  function top3(arr) {
    const map = {};
    arr.forEach(v => map[v] = (map[v] || 0) + 1);
    const total = arr.length || 1;
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, c]) => ({ k, c, p: Math.round(c / total * 100) }));
  }
  function avg(a) { return a.reduce((x, y) => x + y, 0) / a.length; }
  function pct(v, t) { return t ? Math.round(v / t * 100) + "%" : "0%"; }

  function renderEmpty(box, msg) {
    box.innerHTML = `<div>${msg}</div>`;
  }

})();
