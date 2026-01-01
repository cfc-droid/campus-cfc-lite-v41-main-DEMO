/* =========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (PAE + RESULTADO)
   Campus CFC LITE V41
   Estadística 14/17 — Nivel 4

   OBJETIVO (IDÉNTICO a IMA2):
   - Capa 1: Contexto (nombre, período, días)
   - Capa 2: Resultado operativo (DESPUÉS) + intensidad
   - Capa 3: Cadena PAE por resultado (GANADAS / PERDIDAS)
       * Top 3 Pensamientos (ANTES)
       * Top 3 Acciones (DURANTE)
       * Top 3 Estados/Emociones (DESPUÉS)

   REGLAS CLAVE:
   1) Debe mostrar datos haya o no filtros activos (si filtros dejan vacío, cae a TODO)
   2) Excluye ANULADO
   3) El ÚNICO resultado válido sale de DESPUÉS y se hereda por fecha para ANTES/DURANTE (puente)
   4) NO gráfico: solo espacio reservado a la derecha

   UX:
   - Rail horizontal + selector 2/3/4 por pantalla
   - Columnas juntas (compacto y claro)
   - Títulos SIEMPRE visibles (forzar thead)
   ========================================================= */

(function () {
  window.renderStat_14_momentos_estructurales_cambios = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.renderCuadroBasePEA) return;

    ensureStat14Styles();

    const all = window.PEA_STORAGE.loadPEALog() || [];

    // 1) Universo: si filtros devuelven algo, usarlo; si no, caer a TODO
    let universe = all;
    if (window.PEA_FILTERS && typeof window.PEA_FILTERS.apply === "function") {
      const filtered = window.PEA_FILTERS.apply(all) || [];
      if (Array.isArray(filtered) && filtered.length) universe = filtered;
    }

    // 2) Excluir ANULADO (todo lo demás pasa)
    const valid = (Array.isArray(universe) ? universe : []).filter(r => normalizeEstadoRegistro(getRecordState(r)) !== "ANULADO");

    if (!valid.length) {
      renderEmpty(box, "No hay registros válidos (excluye ANULADO).");
      return;
    }

    // Orden cronológico estable
    const ordered = [...valid].sort((a, b) => getTimeKey(a).localeCompare(getTimeKey(b)));

    // PUENTE GLOBAL: fecha -> resultado (SOLO DESPUÉS). Importante: si hay varios, gana el más nuevo.
    const globalResultByFecha = {};
    ordered.forEach(r => {
      if (normalizeMomento(r?.momento) !== "DESPUES") return;
      const f = getFechaAny(r);
      if (!f) return;
      globalResultByFecha[f] = normalizeResultadoOperativo(getResultadoAny(r));
    });

    // Segmentar por MOMENTO ESTRUCTURAL consecutivo (tramos / etapas)
    const segments = [];
    ordered.forEach(r => {
      const v = normalizeMomentoEstructural(r?.momento_estructural);
      const last = segments[segments.length - 1];
      if (!last || last.value !== v) segments.push({ value: v, records: [r] });
      else last.records.push(r);
    });

    const cardsData = segments.map((seg, idx) =>
      buildMomentCardData(seg.value, seg.records, idx + 1, globalResultByFecha)
    );

    const contenidoHTML = renderRailUI(cardsData);

    box.insertAdjacentHTML(
      "beforeend",
      window.renderCuadroBasePEA({
        nivel: 4,
        indice: 14,
        titulo: "Momentos estructurales (PAE + resultado)",
        totalRegistros: cardsData.length,
        universo: "Registros válidos (excluye ANULADO). Si filtros dejan vacío, se usa el universo completo.",
        criterios: [
          "Excluye ANULADO",
          "Resultado tomado SOLO de DESPUÉS",
          "ANTES y DURANTE heredan resultado por fecha (puente global)",
          "Cadena PAE por resultado (GANADAS / PERDIDAS) con Top 3 fijo",
          "Rail horizontal + espacio reservado a la derecha (sin gráfico)"
        ],
        contenidoHTML
      })
    );

    wireStat14UI();
  };

  /* =========================================================
     UI (Rail + selector + espacio reservado)
     ========================================================= */

  function renderRailUI(cardsData) {
    const cardsHtml = cardsData.map(cd => renderMomentCard(cd)).join("");

    return `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Vista:</strong> análisis por <strong>momento estructural</strong> (tramos consecutivos) con PAE (ANTES/DURANTE/DESPUÉS)
        y resultado operativo (DESPUÉS).
      </div>

      <div id="pea-stat14-root" class="stat14-root">
        <!-- IZQUIERDA: rail -->
        <div class="stat14-left">
          <div class="stat14-toolbar">
            <label class="stat14-toolbar-label">
              <span style="opacity:.9;">Mostrar:</span>
              <select id="pea-stat14-visible" class="stat14-select">
                <option value="2" selected>2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <span style="opacity:.85;">momentos por pantalla</span>
            </label>

            <span style="opacity:.5;">|</span>

            <span style="opacity:.85;">
              Tip: desplazate horizontalmente para ver más momentos sin “estirar” la página.
            </span>
          </div>

          <div id="pea-stat14-rail" class="stat14-rail">
            <div id="pea-stat14-rail-inner" class="stat14-rail-inner">
              ${cardsHtml}
            </div>
          </div>
        </div>

        <!-- DERECHA: espacio reservado para gráfico (NO UI, NO gráfico) -->
        <div id="pea-stat14-chart-space" class="stat14-right">
          <div style="opacity:.75; font-size:13px;">
            <em>Espacio reservado para gráfico</em><br>
            (Se implementa cuando terminen las 17 estadísticas)
          </div>
        </div>
      </div>
    `;
  }

  function wireStat14UI() {
    const selectVisible = document.getElementById("pea-stat14-visible");
    const rail = document.getElementById("pea-stat14-rail");
    const railInner = document.getElementById("pea-stat14-rail-inner");
    if (!selectVisible || !rail || !railInner) return;

    applyVisibleCount(selectVisible.value);

    selectVisible.addEventListener("change", () => {
      applyVisibleCount(selectVisible.value);
      rail.scrollLeft = 0;
    });

    function applyVisibleCount(nRaw) {
      const n = clampInt(nRaw, 1, 4);
      const railWidth = rail.clientWidth || 900;

      // Compacto (columnas juntas) + tarjetas más cercanas (pero sin romper legibilidad)
      const gap = 12;
      const padding = 20;
      const cardW = Math.max(420, Math.floor((railWidth - padding - (gap * (n - 1))) / n));

      railInner.querySelectorAll("[data-stat14-card='1']").forEach(card => {
        card.style.flex = `0 0 ${cardW}px`;
        card.style.maxWidth = `${cardW}px`;
      });
    }
  }

  /* =========================================================
     DATA (por tramo / etapa)
     ========================================================= */

  function buildMomentCardData(momentoValue, records, idx, globalResultByFecha) {
    const list = Array.isArray(records) ? records : [];

    const fechas = list.map(r => getFechaAny(r)).filter(Boolean);
    const start = minDateISO(fechas) || "—";
    const end = maxDateISO(fechas) || "—";
    const dias = new Set(fechas).size;

    // CAPA 2: distribución SOLO con DESPUÉS (NO tocar lógica: funciona)
    const despues = list.filter(r => normalizeMomento(r?.momento) === "DESPUES");
    const dist = countBy(despues, r => normalizeResultadoOperativo(getResultadoAny(r)));

    const totalDespues = despues.length;
    const out = {
      GANADA: dist.GANADA || 0,
      PERDIDA: dist.PERDIDA || 0,
      BE: dist.BE || 0,
      NA: dist.NA || 0,
      TOTAL: totalDespues
    };

    // Intensidad (DESPUÉS)
    const intensidadVals = despues
      .map(r => toNumberOrNull(r?.intensidad))
      .filter(v => typeof v === "number" && !Number.isNaN(v));

    const intensidadProm = intensidadVals.length ? avg(intensidadVals) : null;
    const picos = intensidadVals.length
      ? Math.round((intensidadVals.filter(v => v >= 4).length / intensidadVals.length) * 100)
      : null;

    // CAPA 3: PAE por resultado usando puente GLOBAL por fecha
    const capa3 = {
      GANADAS: buildPAEForResult("GANADA", list, globalResultByFecha, out),
      PERDIDAS: buildPAEForResult("PERDIDA", list, globalResultByFecha, out)
    };

    return {
      idx,
      momento: momentoValue,
      start,
      end,
      dias,
      capa2: { out, intensidadProm, picos },
      capa3
    };
  }

  function buildPAEForResult(targetRes, list, globalResultByFecha, capa2Out) {
    const normTarget = normalizeResultadoOperativo(targetRes);

    // Cantidad / % deben “enganchar” con CAPA 2 (para que nunca quede 0 si capa2 > 0)
    const totalDias = normTarget === "GANADA" ? (capa2Out.GANADA || 0) : (capa2Out.PERDIDA || 0);
    const pctDias = capa2Out.TOTAL ? Math.round((totalDias / capa2Out.TOTAL) * 100) : 0;

    // Fecha -> resultado (heredado). Solo consideramos registros del tramo (list),
    // pero la decisión del resultado viene de DESPUÉS global por fecha.
    const pensamientos = [];
    const acciones = [];
    const estados = [];

    list.forEach(r => {
      const m = normalizeMomento(r?.momento);
      const f = getFechaAny(r);
      if (!f) return;

      const res = globalResultByFecha[f] || "NA";
      if (res !== normTarget) return;

      if (m === "ANTES") {
        const p = getPensamientoAny(r);
        if (p) pensamientos.push(p);
      }

      if (m === "DURANTE") {
        const arrA = getAccionesAny(r);
        if (arrA.length) acciones.push(...arrA);
      }

      // Estados/Emociones se toman de DESPUÉS (del tramo) pero “filtrados” por el resultado heredado
      if (m === "DESPUES") {
        const e = getEstadoAny(r);
        if (e) estados.push(e);
      }
    });

    return {
      totalDias,
      pctDias,
      topPensamientos: topNWithPercent(pensamientos, 3),
      topAcciones: topNWithPercent(acciones, 3),
      topEstados: topNWithPercent(estados, 3)
    };
  }

  /* =========================================================
     RENDER (títulos + columnas juntas)
     ========================================================= */

  function renderMomentCard(cd) {
    const period = `${cd.start} → ${cd.end}`;
    const out = cd.capa2.out;

    const pct = (count, total) => total ? `${Math.round((count / total) * 100)}%` : "0%";

    const cap2Rows = `
      <tr><td>GANADA</td><td class="stat14-n">${out.GANADA}</td><td class="stat14-n">${pct(out.GANADA, out.TOTAL)}</td></tr>
      <tr><td>PERDIDA</td><td class="stat14-n">${out.PERDIDA}</td><td class="stat14-n">${pct(out.PERDIDA, out.TOTAL)}</td></tr>
      <tr><td>BE</td><td class="stat14-n">${out.BE}</td><td class="stat14-n">${pct(out.BE, out.TOTAL)}</td></tr>
      <tr><td>NA</td><td class="stat14-n">${out.NA}</td><td class="stat14-n">${pct(out.NA, out.TOTAL)}</td></tr>
      <tr><td><strong>TOTAL</strong></td><td class="stat14-n"><strong>${out.TOTAL}</strong></td><td class="stat14-n"><strong>${out.TOTAL ? "100%" : "0%"}</strong></td></tr>
    `;

    const intensidadProm = (cd.capa2.intensidadProm == null) ? "—" : cd.capa2.intensidadProm.toFixed(1);
    const picos = (cd.capa2.picos == null) ? "—" : `${cd.capa2.picos}%`;

    return `
      <div class="pea-cuadro-interno stat14-card" data-stat14-card="1">
        <!-- CAPA 1 -->
        <div class="stat14-block">
          <div class="stat14-hline">
            <span class="stat14-diamond">◆</span>
            <strong class="stat14-title">MOMENTO ESTRUCTURAL #${cd.idx}</strong>
          </div>

          <div class="stat14-momento">
            <strong>${safeText(cd.momento)}</strong>
          </div>

          <div class="stat14-sub">
            <div>📅 <strong>Período:</strong> ${period}</div>
            <div>🗓️ <strong>Días registrados:</strong> ${cd.dias}</div>
          </div>
        </div>

        <div class="stat14-hr"></div>

        <!-- CAPA 2 -->
        <div class="stat14-block">
          <div class="stat14-hline">
            <span class="stat14-square-blue">■</span>
            <strong class="stat14-title">CAPA 2 — RESULTADO OPERATIVO (DESPUÉS)</strong>
          </div>

          <table class="pea-table stat14-table stat14-cap2">
            <thead>
              <tr>
                <th style="text-align:left;">Resultado</th>
                <th class="stat14-n">Cantidad</th>
                <th class="stat14-n">Porcentaje</th>
              </tr>
            </thead>
            <tbody>${cap2Rows}</tbody>
          </table>

          <div class="stat14-sub" style="margin-top:8px;">
            <div><strong>Intensidad promedio (DESPUÉS):</strong> ${intensidadProm}</div>
            <div><strong>Picos intensidad (4–5):</strong> ${picos}</div>
          </div>
        </div>

        <div class="stat14-hr"></div>

        <!-- CAPA 3 -->
        <div class="stat14-block">
          <div class="stat14-hline" style="margin-bottom:10px;">
            <span class="stat14-square-green">■</span>
            <strong class="stat14-title">CAPA 3 — CADENA PAE POR RESULTADO</strong>
          </div>

          ${renderResultBlock("GANADAS", "🟢", cd.capa3.GANADAS)}
          <div style="height:10px;"></div>
          ${renderResultBlock("PERDIDAS", "🔴", cd.capa3.PERDIDAS)}
        </div>
      </div>
    `;
  }

  function renderResultBlock(label, icon, data) {
    const totalDias = data.totalDias || 0;
    const pctDias = (typeof data.pctDias === "number") ? data.pctDias : 0;

    return `
      <div class="stat14-resultbox">
        <div class="stat14-hline" style="margin-bottom:6px;">
          <strong class="stat14-title">${icon} RESULTADOS: ${label}</strong>
        </div>

        <div class="stat14-sub" style="margin-bottom:10px;">
          <strong>Cantidad:</strong> ${totalDias}${totalDias ? ` — <strong>${pctDias}%</strong>` : ""}
        </div>

        <div style="margin-bottom:10px;">
          <div class="stat14-minihead"><span>🧠</span><strong>Pensamientos (ANTES)</strong></div>
          ${renderRankTable(data.topPensamientos, "Pensamiento")}
        </div>

        <div style="margin-bottom:10px;">
          <div class="stat14-minihead"><span>🎯</span><strong>Acciones (DURANTE)</strong></div>
          ${renderRankTable(data.topAcciones, "Acción")}
        </div>

        <div>
          <div class="stat14-minihead"><span>❤️</span><strong>Estados / Emociones (DESPUÉS)</strong></div>
          ${renderRankTable(data.topEstados, "Estado")}
        </div>
      </div>
    `;
  }

  function renderRankTable(items, colName) {
    // SIEMPRE 3 filas (#1..#3)
    const rows = (items && items.length ? items : []).slice(0, 3);
    while (rows.length < 3) rows.push({ key: "—", count: 0, percent: 0 });

    const body = rows.map((r, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${safeText(r.key)}</td>
        <td class="stat14-n">${r.count}</td>
        <td class="stat14-n">${r.percent}%</td>
      </tr>
    `).join("");

    return `
      <table class="pea-table stat14-table stat14-rank">
        <thead>
          <tr>
            <th style="text-align:left;">Ranking</th>
            <th style="text-align:left;">${colName}</th>
            <th class="stat14-n">Cantidad</th>
            <th class="stat14-n">%</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  /* =========================================================
     HELPERS
     ========================================================= */

  function ensureStat14Styles() {
    if (document.getElementById("stat14-style")) return;
    const style = document.createElement("style");
    style.id = "stat14-style";
    style.textContent = `
      /* Layout general */
      .stat14-root{display:flex; gap:12px; align-items:flex-start;}
      .stat14-left{flex:1 1 auto; min-width:0;}
      .stat14-right{
        flex:0 0 360px; max-width:360px;
        border:1px solid rgba(0,0,0,.10);
        border-radius:10px; padding:10px;
        position:sticky; top:10px; min-height:420px;
      }
      .stat14-toolbar{display:flex; gap:10px; align-items:center; margin-bottom:10px;}
      .stat14-toolbar-label{display:flex; gap:8px; align-items:center;}
      .stat14-select{padding:4px 6px;}
      .stat14-rail{
        overflow-x:auto; overflow-y:hidden;
        padding-bottom:8px; scroll-behavior:smooth;
        border:1px solid rgba(0,0,0,.10);
        border-radius:10px;
      }
      .stat14-rail-inner{display:flex; gap:12px; padding:10px; align-items:flex-start;}

      /* Tarjeta */
      .stat14-card{
        display:block;
        padding:10px;
        border-radius:10px;
        border:1px solid rgba(0,0,0,.10);
      }
      .stat14-block{font-size:13px; line-height:1.25;}
      .stat14-hr{margin:10px 0; border-top:1px solid rgba(0,0,0,.12);}
      .stat14-hline{display:flex; align-items:center; gap:8px;}
      .stat14-title{font-size:13px; font-weight:700; letter-spacing:.2px;}
      .stat14-momento{margin-top:6px; font-size:14px;}
      .stat14-sub{margin-top:8px; opacity:.9;}
      .stat14-minihead{display:flex; align-items:center; gap:8px; margin-bottom:6px;}

      /* Icons */
      .stat14-diamond{color:rgba(30,140,70,.95);}
      .stat14-square-blue{color:rgba(30,90,200,.95);}
      .stat14-square-green{color:rgba(20,140,60,.95);}

      /* Tablas compactas + títulos visibles SIEMPRE */
      .stat14-table{width:100%; border-collapse:collapse; table-layout:fixed;}
      .stat14-table thead{display:table-header-group !important;}
      .stat14-table th,.stat14-table td{padding:4px 4px; vertical-align:top;}
      .stat14-table thead th{font-weight:700; opacity:.95;}
      .stat14-n{text-align:right; white-space:nowrap;}

      /* Anchos compactos para “columnas juntas” */
      .stat14-cap2 td:nth-child(2), .stat14-cap2 th:nth-child(2){width:76px;}
      .stat14-cap2 td:nth-child(3), .stat14-cap2 th:nth-child(3){width:76px;}
      .stat14-rank td:nth-child(1), .stat14-rank th:nth-child(1){width:52px;}
      .stat14-rank td:nth-child(3), .stat14-rank th:nth-child(3){width:76px;}
      .stat14-rank td:nth-child(4), .stat14-rank th:nth-child(4){width:60px;}

      /* Caja resultados (GANADAS / PERDIDAS) */
      .stat14-resultbox{
        border:1px solid rgba(0,0,0,.10);
        border-radius:10px;
        padding:10px;
      }
    `;
    document.head.appendChild(style);
  }

  function getRecordState(r) {
    return r?.meta?.estado || r?.estado_registro || r?.meta_estado || "VALIDO";
  }

  function normalizeEstadoRegistro(v) {
    const s = normalizeText(v);
    return s || "VALIDO";
  }

  function normalizeMomentoEstructural(v) {
    const s = safeText(v).trim();
    return s ? s : "SIN_MARCAR";
  }

  function normalizeMomento(v) {
    const s = normalizeText(v);
    if (s === "DESPUES" || s === "DESP" || s === "DESPUÉS") return "DESPUES";
    if (s === "ANTES" || s === "ANT") return "ANTES";
    if (s === "DURANTE" || s === "DUR") return "DURANTE";
    return s || "";
  }

  // Fecha: soportar variantes si existieran
  function getFechaAny(r) {
    return (
      safeText(r?.fecha).trim() ||
      safeText(r?.fecha_iso).trim() ||
      safeText(r?.fecha_operativa).trim() ||
      safeText(r?.fechaOperacion).trim() ||
      ""
    );
  }

  // Resultado: soportar variantes
  function getResultadoAny(r) {
    return (
      r?.resultado_operativo ??
      r?.resultado ??
      r?.resultadoOp ??
      r?.resultado_key ??
      r?.resultado_oper ??
      r?.resultado_operativo_key ??
      null
    );
  }

  function normalizeResultadoOperativo(v) {
    const s = normalizeText(v);
    if (s === "GANADA" || s === "PERDIDA" || s === "BE" || s === "NA") return s;
    if (s === "GANADAS") return "GANADA";
    if (s === "PERDIDAS") return "PERDIDA";
    return "NA";
  }

  function getPensamientoAny(r) {
    return safeCleanText(
      r?.pensamiento_key ??
      r?.pensamiento ??
      r?.pensamiento_text ??
      r?.pensamiento_label ??
      r?.pensamientoTitulo ??
      r?.pensamiento_titulo ??
      null
    );
  }

  function getAccionesAny(r) {
    const out = [];

    const pushAny = (v) => {
      const s = safeCleanText(v);
      if (!s) return;
      out.push(s);
    };

    // arrays típicos
    if (Array.isArray(r?.acciones_keys)) r.acciones_keys.forEach(pushAny);
    if (Array.isArray(r?.acciones)) r.acciones.forEach(pushAny);

    // campos sueltos (por si el modelo guarda 1 acción)
    pushAny(r?.accion_key ?? r?.accion ?? r?.accion_text ?? null);

    // si viniera como string "a|b|c"
    const maybeStr = safeCleanText(r?.acciones_text ?? r?.acciones_str ?? null);
    if (maybeStr && maybeStr.includes("|")) {
      maybeStr.split("|").map(x => x.trim()).filter(Boolean).forEach(pushAny);
    }

    return out;
  }

  function getEstadoAny(r) {
    return safeCleanText(
      r?.estado_key ??
      r?.estado ??
      r?.emocion_key ??
      r?.emocion ??
      r?.estado_emocion ??
      r?.estadoEmocion ??
      null
    );
  }

  function normalizeText(v) {
    if (v == null) return "";
    return String(v)
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function safeText(v) {
    if (v == null) return "";
    return String(v);
  }

  function safeCleanText(v) {
    if (v == null) return "";
    const s = String(v).trim();
    return s ? s : "";
  }

  function getTimeKey(r) {
    const iso = safeText(r?.meta?.created_at_iso).trim();
    if (iso) return iso;

    const f = getFechaAny(r);
    const m = normalizeMomento(r?.momento);
    const mo = momentOrder(m);
    const id = safeText(r?.id).trim();
    return `${f}T00:00:00.000Z|${String(mo).padStart(2, "0")}|${m}|${id}`;
  }

  function momentOrder(m) {
    if (m === "ANTES") return 1;
    if (m === "DURANTE") return 2;
    if (m === "DESPUES") return 3;
    return 9;
  }

  function countBy(arr, keyFn) {
    const m = {};
    (Array.isArray(arr) ? arr : []).forEach(x => {
      const k = safeText(keyFn(x));
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }

  function topNWithPercent(values, n) {
    const arr = Array.isArray(values) ? values.filter(Boolean) : [];
    const total = arr.length;
    if (!total) return [];

    const map = {};
    arr.forEach(v => (map[v] = (map[v] || 0) + 1));

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([key, count]) => ({
        key,
        count,
        percent: Math.round((count / total) * 100)
      }));
  }

  function toNumberOrNull(v) {
    if (v == null || v === "") return null;
    const num = Number(v);
    return Number.isFinite(num) ? num : null;
  }

  function avg(nums) {
    const s = nums.reduce((a, b) => a + b, 0);
    return s / nums.length;
  }

  function clampInt(v, min, max) {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function minDateISO(list) {
    const arr = (Array.isArray(list) ? list : []).filter(Boolean).sort();
    return arr.length ? arr[0] : null;
  }

  function maxDateISO(list) {
    const arr = (Array.isArray(list) ? list : []).filter(Boolean).sort();
    return arr.length ? arr[arr.length - 1] : null;
  }

  function renderEmpty(box, reason) {
    box.insertAdjacentHTML(
      "beforeend",
      window.renderCuadroBasePEA({
        nivel: 4,
        indice: 14,
        titulo: "Momentos estructurales (PAE + resultado)",
        totalRegistros: 0,
        universo: "—",
        criterios: ["Excluye ANULADO", "Resultado SOLO DESPUÉS (puente por fecha para ANTES/DURANTE)"],
        contenidoHTML: `
          <div class="pea-empty">
            Evidencia insuficiente para esta estadística.<br>
            <span style="opacity:.85;">${safeText(reason)}</span>
          </div>
        `
      })
    );
  }
})();
