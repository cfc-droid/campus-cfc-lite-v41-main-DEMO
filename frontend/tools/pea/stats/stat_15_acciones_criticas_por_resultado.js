/* =========================================================
   STAT 15 — ACCIONES CRÍTICAS POR RESULTADO (APB)
   (GANADA vs PERDIDA) — cuadro simple, directo

   Campus CFC LITE V41
   Nivel 4/4 (operativo directo)
   Estadística 15/17

   OBJETIVO (como tu cuadro):
   - Unidad = ACCIÓN (no día)
   - Para cada acción (top 5):
       GANADAS: cantidad + %
       PERDIDAS: cantidad + %
       TOTAL: cantidad (siempre 100% por fila)
   - + Fila 6: TOTALES (sumas + % globales)

   PUENTE (clasificación) — ✅ CORREGIDO:
   - Resultado del cierre = ÚLTIMO registro DESPUÉS del día (GANADA/PERDIDA)
   - Pero el puente es por (FECHA + DIRECCIÓN) para no mezclar operaciones:
       "mismo día + misma dirección (COMPRA/VENTA)"
   - Se busca en ALL (sin filtros) pero SOLO para fechas dentro del scope

   SCOPE:
   - Acciones tomadas de registros DURANTE que respetan filtros activos
   - Solo se consideran DURANTE de fechas+dirección que tengan resultado GANADA/PERDIDA (puente válido)

   REGLAS:
   - Si una fecha+dirección no tiene DESPUÉS GANADA/PERDIDA => no entra al universo (no se puede clasificar)
   - Las acciones se computan por ocurrencias (frecuencia): si aparece 2 veces, cuenta 2

   Robustez de acciones:
   - acciones_keys: []
   - acciones: [] / "A, B, C"
   - accion / accion_key: "A, B"
   - acciones_text / acciones_str / acciones_display / etc.
   - (lo que ves como “Acción(es)” en la tabla)
   ========================================================= */

(function () {

  window.renderStat_15_acciones_criticas_por_resultado = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    // ✅ Estado: VALIDO + CORREGIDO cuentan como VALIDO
    const allValid = (Array.isArray(all) ? all : []).filter(
      (r) => normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    const filteredValid = (Array.isArray(filtered) ? filtered : []).filter(
      (r) => normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    /* ===============================
       1) Scope de FECHAS (lo definen los filtros)
          - Si filtros dejan vacío, caemos a ALL
       =============================== */
    const scopeRecords = filteredValid.length ? filteredValid : allValid;

    const scopeFechas = new Set(
      scopeRecords
        .map((r) => safeText(r?.fecha).trim())
        .filter(Boolean)
    );

    if (!scopeFechas.size) {
      return renderEmpty(box, "No hay fechas en el universo actual (scope).");
    }

    /* ===============================
       2) Resultado del cierre (PUENTE) — ✅ por FECHA + DIRECCIÓN
          - Último DESPUÉS del día con GANADA/PERDIDA
          - Se busca en ALL (sin filtros) pero SOLO para fechas del scope
       =============================== */
    const resultadoPorFechaDir = {}; // { "YYYY-MM-DD|COMPRA": { res, key }, "YYYY-MM-DD|VENTA": {...} }

    allValid.forEach((r) => {
      const fecha = safeText(r?.fecha).trim();
      if (!fecha || !scopeFechas.has(fecha)) return;

      if (normalizeMomento(r?.momento) !== "DESPUES") return;

      const res = normalizeResultadoOperativo(getResultadoAny(r));
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const dir = normalizeDireccion(getDireccionAny(r));
      if (!dir) return; // sin dirección, no podemos armar puente consistente

      const k = `${fecha}|${dir}`;
      const tkey = getTimeKey(r);

      if (!resultadoPorFechaDir[k] || tkey > resultadoPorFechaDir[k].key) {
        resultadoPorFechaDir[k] = { res, key: tkey };
      }
    });

    const paresConResultado = Object.keys(resultadoPorFechaDir);
    if (!paresConResultado.length) {
      return renderEmpty(box, "No hay DESPUÉS con resultado GANADA/PERDIDA dentro del scope de fechas (con dirección).");
    }

    const paresConResultadoSet = new Set(paresConResultado);

    /* ===============================
       3) Tomar acciones desde DURANTE (RESPETA FILTROS)
          - Solo DURANTE dentro del scope y con resultado disponible (fecha+dirección)
          - Cada acción cuenta como ocurrencia (frecuencia)
       =============================== */
    const duranteFiltered = filteredValid.filter((r) => {
      const fecha = safeText(r?.fecha).trim();
      if (!fecha || !scopeFechas.has(fecha)) return false;
      if (normalizeMomento(r?.momento) !== "DURANTE") return false;

      const dir = normalizeDireccion(getDireccionAny(r));
      if (!dir) return false;

      const k = `${fecha}|${dir}`;
      return paresConResultadoSet.has(k);
    });

    if (!duranteFiltered.length) {
      return renderEmpty(
        box,
        "No hay registros DURANTE (válidos) en el scope actual con resultado GANADA/PERDIDA disponible (mismo día + misma dirección)."
      );
    }

    // Conteo por acción: key = normalizedAction, val = { label, g, p, t }
    const counts = new Map();
    let totalOcurrencias = 0;

    duranteFiltered.forEach((rec) => {
      const fecha = safeText(rec?.fecha).trim();
      const dir = normalizeDireccion(getDireccionAny(rec));
      if (!fecha || !dir) return;

      const puenteKey = `${fecha}|${dir}`;
      const res = resultadoPorFechaDir[puenteKey]?.res; // GANADA/PERDIDA por (día+dirección)
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const acciones = extractAcciones(rec);
      acciones.forEach((a) => {
        const label = String(a || "").trim();
        const key = normalizeText(label);
        if (!key) return;

        if (!counts.has(key)) counts.set(key, { label, g: 0, p: 0, t: 0 });

        const row = counts.get(key);
        row.t += 1;
        if (res === "GANADA") row.g += 1;
        if (res === "PERDIDA") row.p += 1;

        totalOcurrencias += 1;
      });
    });

    const accionesAll = Array.from(counts.values()).filter((x) => x.t > 0);
    if (!accionesAll.length) {
      return renderEmpty(
        box,
        "Hay DURANTE en el scope, pero no se pudieron extraer acciones (campos vacíos o formato inesperado)."
      );
    }

    /* ===============================
       4) Selección TOP 5 (dinámica)
       =============================== */
    const FIXED_ROWS = 5;

    // Orden: más frecuencia primero; si empata, más % pérdida primero
    accionesAll.sort((a, b) => {
      if (b.t !== a.t) return b.t - a.t;
      const ap = a.t ? (a.p / a.t) : 0;
      const bp = b.t ? (b.p / b.t) : 0;
      return bp - ap;
    });

    const top = accionesAll.slice(0, FIXED_ROWS);

    /* ===============================
       5) Render (APB)
       =============================== */
    function pct(n, t) {
      return t ? Math.round((n / t) * 100) : 0;
    }

    const sumG = top.reduce((acc, r) => acc + (r.g || 0), 0);
    const sumP = top.reduce((acc, r) => acc + (r.p || 0), 0);
    const sumT = top.reduce((acc, r) => acc + (r.t || 0), 0);

    // Estilo defensivo para que NADA salga en negrita por CSS heredado
    const tdPlain = 'style="font-weight:400 !important;"';
    const tdNum = 'class="pea-n" style="font-weight:400 !important;"';

    function renderRow(idx, r) {
      if (!r) {
        return `
          <tr>
            <td ${tdNum}>${idx}</td>
            <td ${tdPlain}>—</td>
            <td ${tdNum}>0 (0%)</td>
            <td ${tdNum}>0 (0%)</td>
            <td ${tdNum}>0 (—)</td>
          </tr>
        `;
      }

      const gp = pct(r.g, r.t);
      const pp = pct(r.p, r.t);

      return `
        <tr>
          <td ${tdNum}>${idx}</td>
          <td ${tdPlain}>${escapeHtml(r.label)}</td>
          <td ${tdNum}>${r.g} (${gp}%)</td>
          <td ${tdNum}>${r.p} (${pp}%)</td>
          <td ${tdNum}>${r.t} (100%)</td>
        </tr>
      `;
    }

    const rowsHtml = [];
    for (let i = 1; i <= FIXED_ROWS; i++) {
      rowsHtml.push(renderRow(i, top[i - 1]));
    }

    // Fila 6 — TOTALES (sobre lo mostrado en el top)
    const totGp = pct(sumG, sumT);
    const totPp = pct(sumP, sumT);

    rowsHtml.push(`
      <tr>
        <td ${tdNum}>6</td>
        <td ${tdPlain}>TOTALES</td>
        <td ${tdNum}>${sumG} (${totGp}%)</td>
        <td ${tdNum}>${sumP} (${totPp}%)</td>
        <td ${tdNum}>${sumT} (100%)</td>
      </tr>
    `);

    const totalPares = paresConResultado.length;

    // Semáforo simple (por volumen de ocurrencias)
    let semaforo = "🟡 Datos parciales";
    if (totalOcurrencias >= 30) semaforo = "🟢 Datos suficientes";
    if (totalOcurrencias < 10) semaforo = "🔴 Datos insuficientes";

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Cómo leerlo:</strong> “Cuando aparece esta acción en <strong>DURANTE</strong>, ¿cómo suele cerrar la operación?”<br>
        <strong>Puente:</strong> el resultado se toma del <strong>último DESPUÉS</strong> del <strong>mismo día + misma dirección</strong> (GANADA/PERDIDA).<br>
        <strong>Scope:</strong> ${totalPares} par(es) día+dirección con cierre válido. Ocurrencias DURANTE analizadas = ${totalOcurrencias}.<br>
        <strong>Nota:</strong> cuenta <em>ocurrencias</em> de acción (si una acción aparece 2 veces, cuenta 2).
      </div>

      <table class="pea-table">
        <thead>
          <tr>
            <th>CANTIDAD</th>
            <th>ACCIONES (NOMBRE/S)</th>
            <th>GANADAS (CANTIDAD + %)</th>
            <th>PERDIDAS (CANTIDAD + %)</th>
            <th>TOTAL (+%)</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml.join("")}
        </tbody>
      </table>

      <div class="pea-metricas-secundarias" style="margin-top:10px;">
        No interpreta. No establece causalidad. Solo muestra co-ocurrencia acción → resultado de cierre.<br>
        Si faltan DESPUÉS con GANADA/PERDIDA para ese (día+dirección), esos DURANTE no entran al universo.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 15,
      titulo: "Acciones críticas por resultado",
      totalRegistros: totalOcurrencias,
      universo: "Acciones (DURANTE, según filtros) clasificadas por resultado de cierre (último DESPUÉS del mismo día + dirección).",
      criterios: [
        "Unidad = ACCIÓN (no día)",
        "Acciones desde DURANTE (respeta filtros)",
        "Puente = último DESPUÉS del mismo día + dirección (GANADA/PERDIDA)",
        "Salida: GANADAS vs PERDIDAS por acción (cantidad + %)",
        "Top 5 fijo + fila 6 totales",
        "Solo registros VALIDO y CORREGIDO",
        semaforo
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box, reason) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 15,
      titulo: "Acciones críticas por resultado",
      totalRegistros: 0,
      universo: "—",
      criterios: null,
      contenidoHTML: `
        <div class="pea-empty">
          Evidencia insuficiente para esta estadística.<br>
          <span style="opacity:.85;">${escapeHtml(reason || "")}</span>
        </div>
      `
    }));
  }

  /* ===============================
     Helpers
     =============================== */

  function getRecordState(r) {
    return r?.meta?.estado || r?.estado_registro || r?.meta_estado || "VALIDO";
  }

  function normalizeEstadoRegistro(v) {
    const s = normalizeText(v);
    if (s === "CORREGIDO" || s === "CORRECCION") return "VALIDO";
    if (s === "ANULADO") return "ANULADO";
    return s || "VALIDO";
  }

  function normalizeMomento(v) {
    const s = normalizeText(v);
    if (s === "DESPUES" || s === "DESP" || s === "DESPUÉS") return "DESPUES";
    if (s === "ANTES" || s === "ANT") return "ANTES";
    if (s === "DURANTE" || s === "DUR") return "DURANTE";
    return s || "";
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
    if (s === "GANADA" || s === "PERDIDA") return s;
    if (s === "GANANCIA") return "GANADA";
    if (s === "PÉRDIDA" || s === "PERDIDA") return "PERDIDA";
    return "NA";
  }

  // ✅ Dirección robusta (COMPRA/VENTA)
  function getDireccionAny(r) {
    return (
      r?.direccion ??
      r?.direction ??
      r?.dir ??
      r?.meta?.direccion ??
      r?.meta?.direction ??
      null
    );
  }

  function normalizeDireccion(v) {
    const s = normalizeText(v);
    if (!s) return "";
    if (s === "COMPRA" || s === "BUY") return "COMPRA";
    if (s === "VENTA" || s === "SELL") return "VENTA";
    // tolerancia a valores raros (pero si no es compra/venta, lo descartamos)
    return (s === "COMPRA" || s === "VENTA") ? s : "";
  }

  // ✅ Extractor robusto: arrays + strings + campos “textuales”
  function extractAcciones(r) {
    const out = [];

    if (Array.isArray(r?.acciones_keys)) {
      r.acciones_keys.forEach((a) => a && out.push(String(a)));
      return uniqClean(out);
    }

    if (Array.isArray(r?.acciones)) {
      r.acciones.forEach((a) => a && out.push(String(a)));
      return uniqClean(out);
    }

    if (typeof r?.acciones === "string" && r.acciones.trim()) {
      return uniqClean(splitAccionesString(r.acciones));
    }

    const candidates = [
      r?.acciones_text,
      r?.acciones_txt,
      r?.acciones_str,
      r?.acciones_display,
      r?.acciones_label,
      r?.acciones_raw,
      r?.acciones_human,
      r?.acciones_ui,
      r?.accion_text,
      r?.accion_str,
      r?.accion_display,
      r?.accion_label,
      r?.acciones_resumen
    ].filter((x) => typeof x === "string" && x.trim());

    if (candidates.length) {
      candidates.forEach((s) => splitAccionesString(s).forEach((a) => out.push(a)));
      return uniqClean(out);
    }

    const a1 = r?.accion_key ?? r?.accion ?? null;
    if (typeof a1 === "string" && a1.trim()) {
      return uniqClean(splitAccionesString(a1));
    }
    if (a1) out.push(String(a1));

    return uniqClean(out);
  }

  function splitAccionesString(s) {
    return String(s)
      .split(/[,;|\n]+/g)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  function uniqClean(arr) {
    const set = new Set();
    (arr || []).forEach((x) => {
      const t = String(x || "").trim();
      if (t) set.add(t);
    });
    return Array.from(set);
  }

  function getTimeKey(r) {
    const iso = safeText(r?.meta?.created_at_iso).trim();
    if (iso) return iso;

    // fallback determinista
    const f = safeText(r?.fecha).trim();
    const m = normalizeMomento(r?.momento);
    const mo = m === "ANTES" ? 1 : m === "DURANTE" ? 2 : m === "DESPUES" ? 3 : 9;
    const id = safeText(r?.id).trim();
    return `${f}T00:00:00.000Z|${String(mo).padStart(2, "0")}|${m}|${id}`;
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

  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

})();
