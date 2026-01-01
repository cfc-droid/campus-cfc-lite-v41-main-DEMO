/* =========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (PAE + RESULTADO)
   Campus CFC LITE V41
   Estadística 14/17 — Nivel 4

   OBJETIVO (IDÉNTICO a IMA2):
   A) Por cada MOMENTO ESTRUCTURAL (tramo consecutivo / etapa):
      - Capa 1: Contexto (nombre, período, días)
      - Capa 2: Resultado operativo (DESPUÉS) + intensidad
      - Capa 3: Cadena PAE por resultado (GANADAS / PERDIDAS)
          * Top 3 Pensamientos (ANTES)
          * Top 3 Acciones (DURANTE)
          * Top 3 Estados/Emociones (DESPUÉS)

   REGLAS CLAVE:
   1) Debe mostrar datos haya o no filtros activos (si filtros dejan vacío, cae a TODO)
   2) Excluye ANULADO (usa VALIDO / CORREGIDO / resto)
   3) El ÚNICO resultado válido sale de DESPUÉS y se hereda por fecha para ANTES/DURANTE
   4) NO gráfico: solo espacio reservado a la derecha

   UX:
   - Rail horizontal + selector 2/3/4 por pantalla
   - Columnas juntas (compacto y claro)
   ========================================================= */

(function () {
  window.renderStat_14_momentos_estructurales_cambios = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];

    // 1) Universo: si hay filtros y devuelven algo, usarlo; si no, caer a ALL
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

    // Orden cronológico estable (fecha + orden de momento + created_at_iso si existe)
    const ordered = [...valid].sort((a, b) => getTimeKey(a).localeCompare(getTimeKey(b)));

    // Segmentar por MOMENTO ESTRUCTURAL consecutivo (tramos / etapas)
    const segments = []; // [{ value, records: [] }]
    ordered.forEach(r => {
      const v = normalizeMomentoEstructural(r?.momento_estructural);
      const last = segments[segments.length - 1];
      if (!last || last.value !== v) segments.push({ value: v, records: [r] });
      else last.records.push(r);
    });

    const cardsData = segments.map((seg, idx) => buildMomentCardData(seg.value, seg.records, idx + 1));

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
          "ANTES y DURANTE heredan resultado por fecha (puente)",
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

      <div id="pea-stat14-root" style="display:flex; gap:12px; align-items:flex-start;">
        <!-- IZQUIERDA: rail -->
        <div style="flex: 1 1 auto; min-width: 0;">
          <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
            <label style="display:flex; gap:8px; align-items:center;">
              <span style="opacity:.9;">Mostrar:</span>
              <select id="pea-stat14-visible" style="padding:4px 6px;">
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

          <div
            id="pea-stat14-rail"
            style="
              overflow-x:auto;
              overflow-y:hidden;
              padding-bottom:8px;
              scroll-behavior:smooth;
              border:1px solid rgba(255,255,255,.06);
              border-radius:10px;
            "
          >
            <div
              id="pea-stat14-rail-inner"
              style="display:flex; gap:12px; padding:10px; align-items:flex-start;"
            >
              ${cardsHtml}
            </div>
          </div>
        </div>

        <!-- DERECHA: espacio reservado para gráfico (NO UI, NO gráfico) -->
        <div
          id="pea-stat14-chart-space"
          style="
            flex: 0 0 360px;
            max-width:360px;
            border:1px solid rgba(255,255,255,.06);
            border-radius:10px;
            padding:10px;
            position:sticky;
            top:10px;
            min-height:420px;
          "
        >
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

      // Compacto (como IMA2): tarjetas claras, columnas juntas
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

  function buildMomentCardData(momentoValue, records, idx) {
    const list = Array.isArray(records) ? records : [];

    const fechas = list.map(r => safeText(r?.fecha)).filter(Boolean);
    const start = minDateISO(fechas) || "—";
    const end = maxDateISO(fechas) || "—";
    const dias = new Set(fechas).size;

    // Puente fecha -> resultado (SOLO DESPUÉS)
    const resultByFecha = {};
    list.forEach(r => {
      if (normalizeMomento(r?.momento) === "DESPUES") {
        const f = safeText(r?.fecha);
        const res = normalizeResultadoOperativo(getResultadoAny(r));
        if (f && !resultByFecha[f]) resultByFecha[f] = res;
      }
    });

    // CAPA 2: distribución SOLO con DESPUÉS
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

    // CAPA 3: PAE por resultado (GANADAS / PERDIDAS) usando puente por fecha
    const capa3 = {
      GANADAS: buildPAEForResult("GANADA", list, resultByFecha),
      PERDIDAS: buildPAEForResult("PERDIDA", list, resultByFecha)
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

  function buildPAEForResult(targetRes, list, resultByFecha) {
    const normTarget = normalizeResultadoOperativo(targetRes);

    // Días (DESPUÉS) con ese resultado (base para Cantidad en IMA2)
    const despuesMatch = list.filter(r =>
      normalizeMomento(r?.momento) === "DESPUES" &&
      normalizeResultadoOperativo(getResultadoAny(r)) === normTarget
    );
    const totalDias = despuesMatch.length;

    // Pensamientos (ANTES) asociados por fecha -> resultado heredado
    const pensamientos = [];
    list.forEach(r => {
      if (normalizeMomento(r?.momento) !== "ANTES") return;
      const f = safeText(r?.fecha);
      const res = f ? (resultByFecha[f] || "NA") : "NA";
      if (res !== normTarget) return;

      const p = r?.pensamiento_key ?? r?.pensamiento ?? r?.pensamiento_text ?? r?.pensamiento_label;
      if (p) pensamientos.push(safeText(p));
    });

    // Acciones (DURANTE) asociadas por fecha -> resultado heredado
    const acciones = [];
    list.forEach(r => {
      if (normalizeMomento(r?.momento) !== "DURANTE") return;
      const f = safeText(r?.fecha);
      const res = f ? (resultByFecha[f] || "NA") : "NA";
      if (res !== normTarget) return;

      if (Array.isArray(r?.acciones_keys)) {
        r.acciones_keys.forEach(a => { if (a) acciones.push(safeText(a)); });
      } else if (Array.isArray(r?.acciones)) {
        r.acciones.forEach(a => { if (a) acciones.push(safeText(a)); });
      } else {
        const a1 = r?.accion_key ?? r?.accion ?? null;
        if (a1) acciones.push(safeText(a1));
      }
    });

    // Estados/Emociones (DESPUÉS) asociados directo
    const estados = [];
    despuesMatch.forEach(r => {
      const est =
        r?.estado_key ??
        r?.estado ??
        r?.emocion_key ??
        r?.emocion ??
        r?.estado_emocion ??
        null;
      if (est) estados.push(safeText(est));
    });

    return {
      totalDias,
      topPensamientos: topNWithPercent(pensamientos, 3),
      topAcciones: topNWithPercent(acciones, 3),
      topEstados: topNWithPercent(estados, 3)
    };
  }

  /* =========================================================
     RENDER (idéntico a IMA2: títulos + columnas juntas)
     ========================================================= */

  function renderMomentCard(cd) {
    const period = `${cd.start} → ${cd.end}`;
    const out = cd.capa2.out;

    const pct = (count, total) => total ? `${Math.round((count / total) * 100)}%` : "0%";

    // Tabla CAPA 2 con 3 columnas (Resultado / Cantidad / Porcentaje)
    const cap2Rows = `
      <tr><td>GANADA</td><td class="n">${out.GANADA}</td><td class="n">${pct(out.GANADA, out.TOTAL)}</td></tr>
      <tr><td>PERDIDA</td><td class="n">${out.PERDIDA}</td><td class="n">${pct(out.PERDIDA, out.TOTAL)}</td></tr>
      <tr><td>BE</td><td class="n">${out.BE}</td><td class="n">${pct(out.BE, out.TOTAL)}</td></tr>
      <tr><td>NA</td><td class="n">${out.NA}</td><td class="n">${pct(out.NA, out.TOTAL)}</td></tr>
      <tr><td><strong>TOTAL</strong></td><td class="n"><strong>${out.TOTAL}</strong></td><td class="n"><strong>${out.TOTAL ? "100%" : "0%"}</strong></td></tr>
    `;

    const intensidadProm = (cd.capa2.intensidadProm == null) ? "—" : cd.capa2.intensidadProm.toFixed(1);
    const picos = (cd.capa2.picos == null) ? "—" : `${cd.capa2.picos}%`;

    return `
      <style>
        /* Compacto y claro (columnas juntas) */
        .s14-wrap { font-size: 13px; line-height: 1.25; }
        .s14-hr { margin: 10px 0; border-top: 1px solid rgba(255,255,255,.06); }
        .s14-title { font-size: 13px; font-weight: 700; letter-spacing: .2px; }
        .s14-sub { opacity: .9; }
        .s14-table { width:100%; border-collapse: collapse; table-layout: fixed; }
        .s14-table th, .s14-table td { padding: 4px 4px; vertical-align: top; }
        .s14-table thead th { opacity: .9; font-weight: 700; }
        .s14-table .n { text-align: right; }
        .s14-rank td:nth-child(1), .s14-rank th:nth-child(1){ width: 52px; }
        .s14-rank td:nth-child(3), .s14-rank th:nth-child(3){ width: 76px; }
        .s14-rank td:nth-child(4), .s14-rank th:nth-child(4){ width: 60px; }
        .s14-cap2 td:nth-child(2), .s14-cap2 th:nth-child(2){ width: 76px; }
        .s14-cap2 td:nth-child(3), .s14-cap2 th:nth-child(3){ width: 76px; }
      </style>

      <div
        class="pea-cuadro-interno s14-wrap"
        data-stat14-card="1"
        style="
          padding:10px;
          border-radius:10px;
          border:1px solid rgba(255,255,255,.06);
          background:rgba(0,0,0,.10);
        "
      >
        <!-- CAPA 1 -->
        <div style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:rgba(80,200,120,.9);">◆</span>
            <strong class="s14-title">MOMENTO ESTRUCTURAL #${cd.idx}</strong>
          </div>

          <div style="margin-top:6px; font-size:14px;">
            <strong>${safeText(cd.momento)}</strong>
          </div>

          <div style="margin-top:8px;" class="s14-sub">
            <div>📅 <strong>Período:</strong> ${period}</div>
            <div>🗓️ <strong>Días registrados:</strong> ${cd.dias}</div>
          </div>
        </div>

        <div class="s14-hr"></div>

        <!-- CAPA 2 -->
        <div style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="color:rgba(90,160,255,.95);">■</span>
            <strong class="s14-title">CAPA 2 — RESULTADO OPERATIVO (DESPUÉS)</strong>
          </div>

          <table class="pea-table s14-table s14-cap2">
            <thead>
              <tr>
                <th style="text-align:left;">Resultado</th>
                <th class="n">Cantidad</th>
                <th class="n">Porcentaje</th>
              </tr>
            </thead>
            <tbody>${cap2Rows}</tbody>
          </table>

          <div style="margin-top:8px;" class="s14-sub">
            <div><strong>Intensidad promedio (DESPUÉS):</strong> ${intensidadProm}</div>
            <div><strong>Picos intensidad (4–5):</strong> ${picos}</div>
          </div>
        </div>

        <div class="s14-hr"></div>

        <!-- CAPA 3 -->
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <span style="color:rgba(70,220,90,.9);">■</span>
            <strong class="s14-title">CAPA 3 — CADENA PAE POR RESULTADO</strong>
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

    return `
      <div style="border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:10px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <strong class="s14-title">${icon} RESULTADOS: ${label}</strong>
        </div>

        <div class="s14-sub" style="margin-bottom:10px;">
          <strong>Cantidad:</strong> ${totalDias}${totalDias ? ` — <strong>${Math.round((totalDias / (data._baseTotalDias || totalDias)) * 100)}%</strong>` : ""}
        </div>

        <div style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span>🧠</span><strong>Pensamientos (ANTES)</strong>
          </div>
          ${renderRankTable(data.topPensamientos, "Pensamiento")}
        </div>

        <div style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span>🎯</span><strong>Acciones (DURANTE)</strong>
          </div>
          ${renderRankTable(data.topAcciones, "Acción")}
        </div>

        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span>❤️</span><strong>Estados / Emociones (DESPUÉS)</strong>
          </div>
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
        <td class="n">${r.count}</td>
        <td class="n">${r.percent}%</td>
      </tr>
    `).join("");

    return `
      <table class="pea-table s14-table s14-rank">
        <thead>
          <tr>
            <th style="text-align:left;">Ranking</th>
            <th style="text-align:left;">${colName}</th>
            <th class="n">Cantidad</th>
            <th class="n">%</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  /* =========================================================
     HELPERS
     ========================================================= */

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

  // "DESPUÉS" puede venir como "DESPUES" o con acento o minúsculas
  function normalizeMomento(v) {
    const s = normalizeText(v);
    // soportar variantes
    if (s === "DESPUES" || s === "DESP" || s === "DESPUÉS") return "DESPUES";
    if (s === "ANTES" || s === "ANT") return "ANTES";
    if (s === "DURANTE" || s === "DUR") return "DURANTE";
    return s || "";
  }

  // Soporta múltiples nombres posibles de campo de resultado
  function getResultadoAny(r) {
    return (
      r?.resultado_operativo ??
      r?.resultado ??
      r?.resultadoOp ??
      r?.resultado_key ??
      r?.resultado_oper ??
      null
    );
  }

  function normalizeResultadoOperativo(v) {
    const s = normalizeText(v);
    if (s === "GANADA" || s === "PERDIDA" || s === "BE" || s === "NA") return s;
    // A veces llega plural / variantes
    if (s === "GANADAS") return "GANADA";
    if (s === "PERDIDAS") return "PERDIDA";
    return "NA";
  }

  function normalizeText(v) {
    if (v == null) return "";
    // quitar acentos para que "DESPUÉS" = "DESPUES"
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

  function getTimeKey(r) {
    const iso = safeText(r?.meta?.created_at_iso).trim();
    if (iso) return iso;

    const f = safeText(r?.fecha).trim();
    const m = normalizeMomento(r?.momento);
    const mo = momentOrder(m);
    const id = safeText(r?.id).trim();
    // fecha primero, luego orden de momento, luego id (estable)
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

  // Fechas tipo YYYY-MM-DD
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
