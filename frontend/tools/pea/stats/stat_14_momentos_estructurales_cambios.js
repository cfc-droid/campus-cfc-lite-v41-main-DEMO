/* =========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (PAE + RESULTADO)
   Campus CFC LITE V41

   Nivel 4 — Salud, estructura y cambios
   Estadística 14/17

   Objetivo (formato "detalle del detalle" como IMA2):
   Por cada MOMENTO ESTRUCTURAL (como tramo consecutivo / etapa):
   - Capa 1: Contexto (nombre, período, días)
   - Capa 2: Resultado operativo (DESPUÉS) + intensidad
   - Capa 3: Cadena PAE por resultado (GANADAS / PERDIDAS)
       * Top 3 Pensamientos (ANTES)
       * Top 3 Acciones (DURANTE)
       * Top 3 Estados/Emociones (DESPUÉS)

   UX:
   - Rail horizontal (tarjetas lado a lado) + selector 2/3/4 por pantalla
   - A la derecha: espacio reservado para gráfico (sin implementar)

   Reglas:
   - Usa SOLO registros filtrados (PEA_FILTERS.apply)
   - Excluye ANULADO (usa VALIDO y CORREGIDO)
   - Resultado se toma del registro DESPUÉS (campo resultado / resultado_operativo)
     y se "hereda por fecha" para asociar ANTES/DURANTE.
   - No interpreta, no aconseja
   ========================================================= */

(function () {
  window.renderStat_14_momentos_estructurales_cambios = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = (Array.isArray(filtered) ? filtered : []).filter(r => {
      const st = getRecordState(r);
      return st === "VALIDO" || st === "CORREGIDO";
    });

    if (!valid.length) {
      renderEmpty(box, "No hay registros válidos en el universo filtrado.");
      return;
    }

    // Orden cronológico para detectar TRAMOS consecutivos (etapas)
    const ordered = [...valid].sort((a, b) => getTimeKey(a).localeCompare(getTimeKey(b)));

    // Segmentar por MOMENTO ESTRUCTURAL consecutivo (esto produce #1, #2, #3...)
    const segments = []; // [{ value, records: [...] }]
    ordered.forEach(r => {
      const v = normalizeMomentoEstructural(r?.momento_estructural);
      const last = segments[segments.length - 1];
      if (!last || last.value !== v) segments.push({ value: v, records: [r] });
      else last.records.push(r);
    });

    if (!segments.length) {
      renderEmpty(box, "No se encontraron momentos estructurales en el universo filtrado.");
      return;
    }

    // Construir tarjetas (una por tramo/etapa)
    const cardsData = segments.map((seg, idx) => buildMomentCardData(seg.value, seg.records, idx + 1));

    const contenidoHTML = renderRailUI(cardsData);

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 14,
      titulo: "Momentos estructurales (PAE + resultado)",
      totalRegistros: cardsData.length,
      universo: "Registros del universo filtrado segmentados por tramos consecutivos de momento_estructural",
      criterios: [
        "Universo filtrado actual (PEA_FILTERS.apply)",
        "Solo registros VALIDO y CORREGIDO",
        "Momento estructural tratado como etapa (tramos consecutivos, no agrupación global)",
        "Resultado operativo tomado del registro DESPUÉS (resultado / resultado_operativo) y heredado por fecha",
        "Capa 3 separa GANADAS vs PERDIDAS y muestra Top 3 PAE",
        "Rail horizontal evita que el layout se estire con muchos momentos"
      ],
      contenidoHTML
    }));

    wireStat14UI();
  };

  /* =========================================================
     UI (Rail + selector + espacio reservado a la derecha)
     ========================================================= */

  function renderRailUI(cardsData) {
    const cardsHtml = cardsData.map(cd => renderMomentCard(cd)).join("");

    return `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Vista:</strong> análisis por <strong>momento estructural</strong> con PAE (ANTES/DURANTE/DESPUÉS)
        y resultado operativo (DESPUÉS).
      </div>

      <div id="pea-stat14-root" style="display:flex; gap:12px; align-items:flex-start;">
        <!-- IZQUIERDA: rail + tarjetas -->
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
              white-space:nowrap;
              padding-bottom:8px;
              scroll-behavior:smooth;
              border:1px solid rgba(255,255,255,.06);
              border-radius:10px;
            "
          >
            <div id="pea-stat14-rail-inner" style="display:flex; gap:12px; padding:10px; align-items:flex-start;">
              ${cardsHtml}
            </div>
          </div>
        </div>

        <!-- DERECHA: espacio reservado para gráfico (SIN UI / SIN gráfico) -->
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
            (Espacio reservado para gráfico — se implementa cuando terminen las 17 estadísticas)
          </div>
        </div>
      </div>
    `;
  }

  function wireStat14UI() {
    const root = document.getElementById("pea-stat14-root");
    if (!root) return;

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
      const railWidth = rail.clientWidth || 800;
      const gap = 12;
      const padding = 20;
      const cardW = Math.max(520, Math.floor((railWidth - padding - (gap * (n - 1))) / n));

      railInner.querySelectorAll("[data-stat14-card='1']").forEach(card => {
        card.style.flex = `0 0 ${cardW}px`;
        card.style.maxWidth = `${cardW}px`;
      });
    }
  }

  /* =========================================================
     Construcción de datos por tarjeta (segmento / etapa)
     ========================================================= */

  function buildMomentCardData(momentoValue, records, idx) {
    const list = Array.isArray(records) ? records : [];

    const fechas = list.map(r => safeText(r?.fecha)).filter(Boolean);
    const start = minDateISO(fechas) || "—";
    const end = maxDateISO(fechas) || "—";
    const dias = new Set(fechas).size;

    // Map fecha -> resultado (desde DESPUÉS)
    const resultByFecha = {};
    list.forEach(r => {
      if (safeText(r?.momento).toUpperCase() === "DESPUES") {
        const f = safeText(r?.fecha);
        const res = normalizeResultadoOperativo(getResultadoAny(r));
        if (f && !resultByFecha[f]) resultByFecha[f] = res;
      }
    });

    // Capa 2: distribución de resultados usando DESPUÉS
    const despues = list.filter(r => safeText(r?.momento).toUpperCase() === "DESPUES");
    const dist = countBy(despues, r => normalizeResultadoOperativo(getResultadoAny(r)));

    const totalDespues = despues.length;
    const out = {
      GANADA: dist.GANADA || 0,
      PERDIDA: dist.PERDIDA || 0,
      BE: dist.BE || 0,
      NA: dist.NA || 0,
      TOTAL: totalDespues
    };

    const intensidadVals = despues
      .map(r => toNumberOrNull(r?.intensidad))
      .filter(v => typeof v === "number" && !Number.isNaN(v));

    const intensidadProm = intensidadVals.length ? avg(intensidadVals) : null;
    const picos = intensidadVals.length
      ? Math.round((intensidadVals.filter(v => v >= 4).length / intensidadVals.length) * 100)
      : null;

    // Capa 3: PAE por resultado (GANADAS / PERDIDAS)
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

    const despuesMatch = list.filter(r =>
      safeText(r?.momento).toUpperCase() === "DESPUES" &&
      normalizeResultadoOperativo(getResultadoAny(r)) === normTarget
    );

    const totalDias = despuesMatch.length;

    // Pensamientos ANTES asociados a esos días
    const pensamientos = [];
    list.forEach(r => {
      if (safeText(r?.momento).toUpperCase() !== "ANTES") return;
      const f = safeText(r?.fecha);
      const res = f ? (resultByFecha[f] || "NA") : "NA";
      if (res !== normTarget) return;

      const p = r?.pensamiento_key || r?.pensamiento;
      if (p) pensamientos.push(safeText(p));
    });

    // Acciones DURANTE asociadas a esos días
    const acciones = [];
    list.forEach(r => {
      if (safeText(r?.momento).toUpperCase() !== "DURANTE") return;
      const f = safeText(r?.fecha);
      const res = f ? (resultByFecha[f] || "NA") : "NA";
      if (res !== normTarget) return;

      if (Array.isArray(r?.acciones_keys)) {
        r.acciones_keys.forEach(a => { if (a) acciones.push(safeText(a)); });
      } else if (Array.isArray(r?.acciones)) {
        r.acciones.forEach(a => { if (a) acciones.push(safeText(a)); });
      }
    });

    // Estados/Emociones DESPUÉS (Estado (E)) asociados a ese resultado
    const estados = [];
    despuesMatch.forEach(r => {
      const est = r?.estado_key || r?.estado || r?.emocion_key || r?.emocion;
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
     Render tarjeta (formato IMA2)
     ========================================================= */

  function renderMomentCard(cd) {
    const period = `${cd.start} → ${cd.end}`;
    const out = cd.capa2.out;

    const pct = (count, total) => total ? `${Math.round((count / total) * 100)}%` : "0%";

    const cap2Rows = `
      <tr><td>GANADA</td><td>${out.GANADA}</td><td>${pct(out.GANADA, out.TOTAL)}</td></tr>
      <tr><td>PERDIDA</td><td>${out.PERDIDA}</td><td>${pct(out.PERDIDA, out.TOTAL)}</td></tr>
      <tr><td>BE</td><td>${out.BE}</td><td>${pct(out.BE, out.TOTAL)}</td></tr>
      <tr><td>NA</td><td>${out.NA}</td><td>${pct(out.NA, out.TOTAL)}</td></tr>
      <tr><td><strong>TOTAL</strong></td><td><strong>${out.TOTAL}</strong></td><td><strong>${out.TOTAL ? "100%" : "0%"}</strong></td></tr>
    `;

    const intensidadProm = (cd.capa2.intensidadProm == null) ? "—" : cd.capa2.intensidadProm.toFixed(1);
    const picos = (cd.capa2.picos == null) ? "—" : `${cd.capa2.picos}%`;

    return `
      <div
        class="pea-cuadro-interno"
        data-stat14-card="1"
        style="
          display:block;
          padding:10px;
          border-radius:10px;
          border:1px solid rgba(255,255,255,.06);
          background:rgba(0,0,0,.10);
        "
      >
        <div style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:rgba(80,200,120,.9);">◆</span>
            <strong>MOMENTO ESTRUCTURAL #${cd.idx}</strong>
          </div>

          <div style="margin-top:6px; font-size:14px;">
            <strong>${safeText(cd.momento)}</strong>
          </div>

          <div style="margin-top:8px; font-size:13px; opacity:.9;">
            <div>📅 <strong>Período:</strong> ${period}</div>
            <div>🗓️ <strong>Días registrados:</strong> ${cd.dias}</div>
          </div>
        </div>

        <div style="margin:10px 0; border-top:1px solid rgba(255,255,255,.06);"></div>

        <!-- CAPA 2 -->
        <div style="margin-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="color:rgba(90,160,255,.95);">■</span>
            <strong>CAPA 2 — RESULTADO OPERATIVO (DESPUÉS)</strong>
          </div>

          <table class="pea-table" style="width:100%;">
            <thead>
              <tr><th>Resultado</th><th>Cantidad</th><th>Porcentaje</th></tr>
            </thead>
            <tbody>${cap2Rows}</tbody>
          </table>

          <div style="margin-top:8px; font-size:13px; opacity:.9;">
            <div><strong>Intensidad promedio (DESPUÉS):</strong> ${intensidadProm}</div>
            <div><strong>Picos intensidad (4–5):</strong> ${picos}</div>
          </div>
        </div>

        <div style="margin:10px 0; border-top:1px solid rgba(255,255,255,.06);"></div>

        <!-- CAPA 3 -->
        <div>
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
            <span style="color:rgba(70,220,90,.9);">■</span>
            <strong>CAPA 3 — CADENA PAE POR RESULTADO</strong>
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
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <strong>${icon} RESULTADOS: ${label}</strong>
        </div>
        <div style="opacity:.9; font-size:13px; margin-bottom:10px;">
          <strong>Cantidad:</strong> ${totalDias}
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
    // SIEMPRE 3 filas (#1..#3) aunque no haya datos
    const rows = (items && items.length ? items : []).slice(0, 3);
    while (rows.length < 3) rows.push({ key: "—", count: 0, percent: 0 });

    const body = rows.map((r, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${safeText(r.key)}</td>
        <td>${r.count}</td>
        <td>${r.percent}%</td>
      </tr>
    `).join("");

    return `
      <table class="pea-table" style="width:100%;">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>${colName}</th>
            <th>Cantidad</th>
            <th>%</th>
          </tr>
        </thead>
        <tbody>${body}</tbody>
      </table>
    `;
  }

  /* =========================================================
     Helpers / utilidades
     ========================================================= */

  function getRecordState(r) {
    return (
      r?.meta?.estado ||
      r?.estado_registro ||
      r?.meta_estado ||
      "VALIDO"
    );
  }

  function normalizeMomentoEstructural(v) {
    const s = safeText(v).trim();
    return s ? s : "SIN_MARCAR";
  }

  // IMPORTANTE: soporta ambos nombres de campo
  function getResultadoAny(r) {
    return r?.resultado_operativo ?? r?.resultado ?? r?.resultadoOp ?? r?.resultado_key ?? null;
  }

  function normalizeResultadoOperativo(v) {
    const s = safeText(v).trim().toUpperCase();
    if (s === "GANADA" || s === "PERDIDA" || s === "BE" || s === "NA") return s;
    return "NA";
  }

  function safeText(v) {
    if (v == null) return "";
    return String(v);
  }

  function getTimeKey(r) {
    // Preferir created_at_iso si existe
    const iso = safeText(r?.meta?.created_at_iso).trim();
    if (iso) return iso;

    // Fallback estable
    const f = safeText(r?.fecha).trim();
    const m = safeText(r?.momento).trim();
    const id = safeText(r?.id).trim();
    return `${f}T00:00:00.000Z|${m}|${id}`;
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
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 14,
      titulo: "Momentos estructurales (PAE + resultado)",
      totalRegistros: 0,
      universo: "—",
      criterios: [
        "Universo filtrado actual (PEA_FILTERS.apply)",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML: `
        <div class="pea-empty">
          Evidencia insuficiente para esta estadística.<br>
          <span style="opacity:.85;">${safeText(reason)}</span>
        </div>
      `
    }));
  }
})();
