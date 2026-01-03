/* ========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (PAE + RESULTADO)
   Campus CFC LITE V41
   Estadística 14/17 — Nivel 4

   SOLUCIÓN (DIFERENTE / CORRECTA):
   - CAPA 2: se calcula SOLO con DESPUÉS dentro del tramo (segmento) (se mantiene).
   - CAPA 3: se alinea con CAPA 2 para evitar inconsistencias:
       * El resultado por fecha se define SOLO con DESPUÉS del tramo (puente LOCAL).
       * ANTES/DURANTE se asocian únicamente a fechas que tienen DESPUÉS en el mismo tramo.
       * Estados/Emociones se toman SOLO desde los DESPUÉS del tramo.

   UX:
   - Rail horizontal (sin grafico)
   - Estilo oscuro tipo IMA2 (forzado para que no lo rompa el tema claro)
   - Columnas compactas (Resultado/Cantidad/Porcentaje + ranking Top3)
   - NO gráfico (decisión de producto: visual estructural)
   ======================================================== */

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

// 2) Excluir ANULADO
const valid = (Array.isArray(universe) ? universe : []).filter(
  (r) => normalizeEstadoRegistro(getRecordState(r)) !== "ANULADO"
);

    if (!valid.length) {
      renderEmpty(box, "No hay registros válidos (excluye ANULADO).");
      return;
    }

    // Orden cronológico estable
    const ordered = [...valid].sort((a, b) => getTimeKey(a).localeCompare(getTimeKey(b)));

   // 3) Agrupar por MOMENTO ESTRUCTURAL (NO consecutivo) — une AJUSTE_ESTRATEGIA aunque haya cortes
const segments = [];
const idxByValue = new Map();

ordered.forEach((r) => {
  const v = normalizeMomentoEstructural(r?.momento_estructural);

  if (!idxByValue.has(v)) {
    idxByValue.set(v, segments.length);
    segments.push({ value: v, records: [] });
  }

  segments[idxByValue.get(v)].records.push(r);
});
     
    // Nota: NO hay cantidad fija de cuadros. Se generan dinámicamente según segmentos.
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
          "CAPA 2: Resultado tomado SOLO de DESPUÉS (del tramo)",
          "CAPA 3: ANTES/DURANTE se asocian SOLO a fechas con DESPUÉS dentro del mismo tramo (consistente con CAPA 2)",
          "Top 3 fijo (aunque vacío)",
          "Rail horizontal (sin gráfico)"
        ],
        contenidoHTML
      })
    );

    wireStat14UI();
  };

  /* =========================================================
     UI
     ========================================================= */

  function renderRailUI(cardsData) {
    const cardsHtml = cardsData.map((cd) => renderMomentCard(cd)).join("");

    // Un solo bloque de estilos (clave para que no “desaparezcan títulos”
    // por conflictos con el tema claro del sitio).
    const style = `
      <style>
        .s14-root { font-size: 13px; line-height: 1.25; color: #EAEAEA; }
        .s14-note { color: #D8D8D8; opacity: .9; }
        .s14-rail { border:1px solid rgba(0,0,0,.15); border-radius:12px; background:#0F0F10; }
        .s14-card {
          border:1px solid rgba(255,255,255,.10);
          background:#151517;
          border-radius:12px;
          padding:12px;
          color:#EAEAEA;
        }
        .s14-hr { margin: 10px 0; border-top: 1px solid rgba(255,255,255,.10); }
        .s14-title { font-weight: 800; letter-spacing: .2px; }
        .s14-sub { color:#D8D8D8; opacity:.95; }
        .s14-chip-blue { color:#5AA0FF; }
        .s14-chip-green { color:#46DC5A; }
        .s14-chip-diamond { color:#50C878; }
        .s14-table { width:100%; border-collapse: collapse; table-layout: fixed; }
        .s14-table th, .s14-table td { padding: 4px 4px; vertical-align: top; }
        .s14-table thead th { color:#DCDCDC; font-weight:800; border-bottom:1px solid rgba(255,255,255,.10); }
        .s14-table tbody tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.06); }
        .s14-n { text-align: right; }
        .s14-cap2 td:nth-child(2), .s14-cap2 th:nth-child(2){ width: 80px; }
        .s14-cap2 td:nth-child(3), .s14-cap2 th:nth-child(3){ width: 90px; }
        .s14-rank td:nth-child(1), .s14-rank th:nth-child(1){ width: 62px; }
        .s14-rank td:nth-child(3), .s14-rank th:nth-child(3){ width: 80px; }
        .s14-rank td:nth-child(4), .s14-rank th:nth-child(4){ width: 70px; }
        .s14-box {
          border:1px solid rgba(255,255,255,.10);
          background:#111112;
          border-radius:12px;
          padding:10px;
        }
      </style>
    `;

return `
  ${style}
  <div class="s14-root">
    <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
      <strong>Vista:</strong> análisis por <strong>momento estructural</strong> (tramos consecutivos) con PAE (ANTES/DURANTE/DESPUÉS)
      y resultado operativo (DESPUÉS).
    </div>

    <div id="pea-stat14-root" style="display:flex; gap:12px; align-items:flex-start;">
      <div style="flex: 1 1 auto; min-width: 0;">
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
          <label style="display:flex; gap:8px; align-items:center;">
            <span class="s14-note">Mostrar:</span>
            <select id="pea-stat14-visible" style="padding:4px 6px;">
              <option value="2" selected>2</option>
              <option value="3">3</option>
            </select>
            <span class="s14-note">momentos por pantalla</span>
          </label>

          <span style="opacity:.5;">|</span>

          <span class="s14-note">
            Tip: desplazate horizontalmente para ver más momentos sin “estirar” la página.
          </span>
        </div>

        <div
          id="pea-stat14-rail"
          class="s14-rail"
          style="overflow-x:auto; overflow-y:hidden; padding-bottom:8px; scroll-behavior:smooth;"
        >
          <div
            id="pea-stat14-rail-inner"
            style="display:flex; gap:12px; padding:12px; align-items:flex-start;"
          >
            ${cardsHtml}
          </div>
        </div>
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
      const n = clampInt(nRaw, 1, 3);
      const railWidth = rail.clientWidth || 900;
      const gap = 12;
      const padding = 24;
      const cardW = Math.max(420, Math.floor((railWidth - padding - (gap * (n - 1))) / n));
      railInner.querySelectorAll("[data-stat14-card='1']").forEach((card) => {
        card.style.flex = `0 0 ${cardW}px`;
        card.style.maxWidth = `${cardW}px`;
      });
    }
  }

  /* =========================================================
     DATA
     ========================================================= */

  function buildMomentCardData(momentoValue, records, idx) {
    const list = Array.isArray(records) ? records : [];

    const fechas = list.map((r) => safeText(r?.fecha)).filter(Boolean);
    const start = minDateISO(fechas) || "—";
    const end = maxDateISO(fechas) || "—";
    const dias = new Set(fechas).size;

    // CAPA 2 (se mantiene: SOLO DESPUÉS del tramo)
    const despues = list.filter((r) => normalizeMomento(r?.momento) === "DESPUES");
    const dist = countBy(despues, (r) => normalizeResultadoOperativo(getResultadoAny(r)));
    const totalDespues = despues.length;

    const out = {
      GANADA: dist.GANADA || 0,
      PERDIDA: dist.PERDIDA || 0,
      BE: dist.BE || 0,
      NA: dist.NA || 0,
      TOTAL: totalDespues
    };

    // Intensidad (DESPUÉS del tramo)
    const intensidadVals = despues
      .map((r) => toNumberOrNull(r?.intensidad))
      .filter((v) => typeof v === "number" && !Number.isNaN(v));

    const intensidadProm = intensidadVals.length ? avg(intensidadVals) : null;
    const picos = intensidadVals.length
      ? Math.round((intensidadVals.filter((v) => v >= 4).length / intensidadVals.length) * 100)
      : null;

    // CAPA 3 (ALINEADA con CAPA 2: puente LOCAL solo con DESPUÉS del tramo)
    const localResultByFecha = buildLocalResultByFecha(despues);

    const capa3 = {
      GANADAS: buildPAEForResult("GANADA", list, despues, localResultByFecha),
      PERDIDAS: buildPAEForResult("PERDIDA", list, despues, localResultByFecha)
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

function buildLocalResultByFecha(despuesList) {
  // { opKey: { res, key, record } }
  const map = {};

  (Array.isArray(despuesList) ? despuesList : []).forEach((r) => {
    const opKey = getOpKey(r);
    if (!opKey) return;

    const res = normalizeResultadoOperativo(getResultadoAny(r));
    const tkey = getTimeKey(r);

    // Me quedo con el DESPUÉS "más reciente" de esa OPERACIÓN (canónico)
    if (!map[opKey] || tkey > map[opKey].key) {
      map[opKey] = { res, key: tkey, record: r };
    }
  });

  return map; // { "fecha||momento_estructural||direccion||estado": {res,key,record}, ... }
}

  function buildPAEForResult(targetRes, list, despues, localResultByFecha) {
    const normTarget = normalizeResultadoOperativo(targetRes);

    const despuesList = Array.isArray(despues) ? despues : [];

// Operaciones cuyo RESULTADO CANÓNICO (último DESPUÉS de la operación) == target
const fechasTarget = new Set(
  Object.keys(localResultByFecha || {}).filter(
    (k) => localResultByFecha[k]?.res === normTarget
  )
);

// Conteo por OPERACIÓN (no por cantidad de registros)
const totalDias = fechasTarget.size;

// Base también por OPERACIÓN (todas las ops que tuvieron algún DESPUÉS)
const baseTotalDias = Math.max(1, Object.keys(localResultByFecha || {}).length);

    // Pensamientos (ANTES) del tramo, solo de fechasTarget
    const pensamientos = [];
    (Array.isArray(list) ? list : []).forEach((r) => {
      if (normalizeMomento(r?.momento) !== "ANTES") return;
      const opKey = getOpKey(r);
      if (!opKey || !fechasTarget.has(opKey)) return;

      const p =
        r?.pensamiento_key ??
        r?.pensamiento ??
        r?.pensamiento_text ??
        r?.pensamiento_label ??
        null;

      if (p) pensamientos.push(safeText(p));
    });

    // Acciones (DURANTE) del tramo, solo de fechasTarget
    const acciones = [];
    (Array.isArray(list) ? list : []).forEach((r) => {
      if (normalizeMomento(r?.momento) !== "DURANTE") return;
      const opKey = getOpKey(r);
      if (!opKey || !fechasTarget.has(opKey)) return;

      if (Array.isArray(r?.acciones_keys)) {
        r.acciones_keys.forEach((a) => {
          if (a) acciones.push(safeText(a));
        });
      } else if (Array.isArray(r?.acciones)) {
        r.acciones.forEach((a) => {
          if (a) acciones.push(safeText(a));
        });
      } else {
        const a1 = r?.accion_key ?? r?.accion ?? null;
        if (a1) acciones.push(safeText(a1));
      }
    });

    // Estados/Emociones (DESPUÉS): SOLO desde los DESPUÉS del tramo que matchean target
const estados = [];
fechasTarget.forEach((k) => {
  const r = localResultByFecha?.[k]?.record;
  if (!r) return;

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
      baseTotalDias,
      topPensamientos: topNWithPercent(pensamientos, 3),
      topAcciones: topNWithPercent(acciones, 3),
      topEstados: topNWithPercent(estados, 3)
    };
  }

  /* =========================================================
     RENDER (oscuro tipo IMA2)
     ========================================================= */

  function renderMomentCard(cd) {
    const period = `${cd.start} → ${cd.end}`;
    const out = cd.capa2.out;

    const pct = (count, total) => (total ? `${Math.round((count / total) * 100)}%` : "0%");

    const cap2Rows = `
      <tr><td>GANADA</td><td class="s14-n">${out.GANADA}</td><td class="s14-n">${pct(out.GANADA, out.TOTAL)}</td></tr>
      <tr><td>PERDIDA</td><td class="s14-n">${out.PERDIDA}</td><td class="s14-n">${pct(out.PERDIDA, out.TOTAL)}</td></tr>
      <tr><td>BE</td><td class="s14-n">${out.BE}</td><td class="s14-n">${pct(out.BE, out.TOTAL)}</td></tr>
      <tr><td>NA</td><td class="s14-n">${out.NA}</td><td class="s14-n">${pct(out.NA, out.TOTAL)}</td></tr>
      <tr><td><strong>TOTAL</strong></td><td class="s14-n"><strong>${out.TOTAL}</strong></td><td class="s14-n"><strong>${out.TOTAL ? "100%" : "0%"}</strong></td></tr>
    `;

    const intensidadProm = cd.capa2.intensidadProm == null ? "—" : cd.capa2.intensidadProm.toFixed(1);
    const picos = cd.capa2.picos == null ? "—" : `${cd.capa2.picos}%`;

    return `
      <div class="s14-card" data-stat14-card="1">
        <!-- CAPA 1 -->
        <div style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="s14-chip-diamond">◆</span>
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
            <span class="s14-chip-blue">■</span>
            <strong class="s14-title">CAPA 2 — RESULTADO OPERATIVO (DESPUÉS)</strong>
          </div>

          <table class="s14-table s14-cap2">
            <thead>
              <tr>
                <th style="text-align:left;">Resultado</th>
                <th class="s14-n">Cantidad</th>
                <th class="s14-n">Porcentaje</th>
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
            <span class="s14-chip-green">■</span>
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
    const base = data.baseTotalDias || 1;
    const pct = totalDias ? `${Math.round((totalDias / base) * 100)}%` : "0%";

    return `
      <div class="s14-box">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
          <strong class="s14-title">${icon} RESULTADOS: ${label}</strong>
        </div>

        <div class="s14-sub" style="margin-bottom:10px;">
          <strong>Cantidad:</strong> ${totalDias} — <strong>${pct}</strong>
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
    const rows = (items && items.length ? items : []).slice(0, 3);
    while (rows.length < 3) rows.push({ key: "—", count: 0, percent: 0 });

    const body = rows
      .map(
        (r, i) => `
        <tr>
          <td>#${i + 1}</td>
          <td>${safeText(r.key)}</td>
          <td class="s14-n">${r.count}</td>
          <td class="s14-n">${r.percent}%</td>
        </tr>
      `
      )
      .join("");

    return `
      <table class="s14-table s14-rank">
        <thead>
          <tr>
            <th style="text-align:left;">Ranking</th>
            <th style="text-align:left;">${colName}</th>
            <th class="s14-n">Cantidad</th>
            <th class="s14-n">%</th>
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

  // Tratar CORREGIDO como VALIDO (mismo criterio que Stat 04 / 07)
  if (s === "CORREGIDO") return "VALIDO";

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

  function normalizeDireccion(v) {
    const s = normalizeText(v);
    if (s === "COMPRA" || s === "BUY") return "COMPRA";
    if (s === "VENTA" || s === "SELL") return "VENTA";
    return s || "NA";
  }

  function getOpKey(r) {
    const f = safeText(r?.fecha).trim();
    const me = normalizeMomentoEstructural(r?.momento_estructural);
    const dir = normalizeDireccion(r?.direccion);
    const st = normalizeEstadoRegistro(getRecordState(r));
    if (!f || !me) return "";
    return `${f}||${me}||${dir}||${st}`;
  }

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
    if (s === "GANADAS") return "GANADA";
    if (s === "PERDIDAS") return "PERDIDA";
    return "NA";
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

  function getTimeKey(r) {
    const iso = safeText(r?.meta?.created_at_iso).trim();
    if (iso) return iso;

    const f = safeText(r?.fecha).trim();
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
    (Array.isArray(arr) ? arr : []).forEach((x) => {
      const k = safeText(keyFn(x));
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }

  function topNWithPercent(values, n) {
    const arr = Array.isArray(values) ? values.map((v) => safeText(v).trim()).filter(Boolean) : [];
    const total = arr.length;
    if (!total) return [];

    const map = {};
    arr.forEach((v) => (map[v] = (map[v] || 0) + 1));

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
        criterios: [
          "Excluye ANULADO",
          "Resultado SOLO DESPUÉS (puente GLOBAL por fecha para ANTES/DURANTE)"
        ],
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
