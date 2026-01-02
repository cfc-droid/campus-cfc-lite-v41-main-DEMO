/* =========================================================
   STAT 16 — PENSAMIENTOS CRÍTICOS POR RESULTADO (APB)
   (GANADA vs PERDIDA) — cuadro simple, directo

   Campus CFC LITE V41
   Nivel 4/4 (operativo directo)
   Estadística 16/17

   OBJETIVO (idéntico a Stat 15, pero en ANTES):
   - Unidad = PENSAMIENTO (no día)
   - Para cada pensamiento (top 5):
       GANADAS: cantidad + %
       PERDIDAS: cantidad + %
       TOTAL: cantidad (siempre 100% por fila)
   - + Fila 6: TOTALES (sumas + % globales)

   PUENTE (clasificación):
   - Resultado del día = ÚLTIMO registro DESPUÉS del día (GANADA/PERDIDA)
   - Se busca en ALL (sin filtros) pero SOLO para fechas dentro del scope

   SCOPE:
   - Pensamientos tomados de registros ANTES que respetan filtros activos
   - Solo se consideran ANTES de fechas que tengan resultado GANADA/PERDIDA (puente válido)

   REGLAS:
   - Si una fecha no tiene DESPUÉS GANADA/PERDIDA => no entra al universo (no se puede clasificar)
   - Los pensamientos se computan por ocurrencias (frecuencia): si aparece 2 veces, cuenta 2

   Robustez de pensamiento:
   - pensamiento / pensamientos / pensamiento_text / pensamiento_str / etc.
   - (lo que ves como “Pensamiento” en la tabla)
   ========================================================= */

(function () {

  window.renderStat_16_pensamientos_criticos_por_resultado = function () {
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
       2) Resultado del día (puente)
          - Último DESPUÉS del día con GANADA/PERDIDA
          - Se busca en ALL (sin filtros) pero SOLO para fechas del scope
       =============================== */
    const resultadoPorFecha = {}; // { "YYYY-MM-DD": { res, key } }

    allValid.forEach((r) => {
      const fecha = safeText(r?.fecha).trim();
      if (!fecha || !scopeFechas.has(fecha)) return;

      if (normalizeMomento(r?.momento) !== "DESPUES") return;

      const res = normalizeResultadoOperativo(getResultadoAny(r));
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const tkey = getTimeKey(r);
      if (!resultadoPorFecha[fecha] || tkey > resultadoPorFecha[fecha].key) {
        resultadoPorFecha[fecha] = { res, key: tkey };
      }
    });

    const fechasConResultado = Object.keys(resultadoPorFecha);
    if (!fechasConResultado.length) {
      return renderEmpty(box, "No hay DESPUÉS con resultado GANADA/PERDIDA dentro del scope de fechas.");
    }

    const fechasConResultadoSet = new Set(fechasConResultado);

    /* ===============================
       3) Tomar pensamientos desde ANTES (RESPETA FILTROS)
          - Solo ANTES dentro del scope y con resultado disponible
          - Cada pensamiento cuenta como ocurrencia (frecuencia)
       =============================== */
    const antesFiltered = filteredValid.filter((r) => {
      const fecha = safeText(r?.fecha).trim();
      if (!fecha || !fechasConResultadoSet.has(fecha)) return false;
      return normalizeMomento(r?.momento) === "ANTES";
    });

    if (!antesFiltered.length) {
      return renderEmpty(
        box,
        "No hay registros ANTES (válidos) en el scope actual con resultado GANADA/PERDIDA disponible."
      );
    }

    // Conteo por pensamiento: key = normalizedText, val = { label, g, p, t }
    const counts = new Map();
    let totalOcurrencias = 0;

    antesFiltered.forEach((rec) => {
      const fecha = safeText(rec?.fecha).trim();
      const res = resultadoPorFecha[fecha]?.res; // GANADA/PERDIDA
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const pensamientos = extractPensamientos(rec);
      pensamientos.forEach((txt) => {
        const label = String(txt || "").trim();
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

    const itemsAll = Array.from(counts.values()).filter((x) => x.t > 0);
    if (!itemsAll.length) {
      return renderEmpty(
        box,
        "Hay ANTES en el scope, pero no se pudieron extraer pensamientos (campos vacíos o formato inesperado)."
      );
    }

    /* ===============================
       4) Selección TOP 5 (dinámica, según filtro)
       =============================== */
    const FIXED_ROWS = 5;

    // Orden: más frecuencia primero; si empata, más % pérdida primero
    itemsAll.sort((a, b) => {
      if (b.t !== a.t) return b.t - a.t;
      const ap = a.t ? (a.p / a.t) : 0;
      const bp = b.t ? (b.p / b.t) : 0;
      return bp - ap;
    });

    const top = itemsAll.slice(0, FIXED_ROWS);

    /* ===============================
       5) Render (APB) — 5 filas + Totales
       =============================== */
    function pct(n, t) {
      return t ? Math.round((n / t) * 100) : 0;
    }

    const sumG = top.reduce((acc, r) => acc + (r.g || 0), 0);
    const sumP = top.reduce((acc, r) => acc + (r.p || 0), 0);
    const sumT = top.reduce((acc, r) => acc + (r.t || 0), 0);

    // Evitar negritas heredadas por CSS
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
    for (let i = 1; i <= FIXED_ROWS; i++) rowsHtml.push(renderRow(i, top[i - 1]));

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

    const totalDias = fechasConResultado.length;

    // Semáforo simple (por volumen de ocurrencias)
    let semaforo = "🟡 Datos parciales";
    if (totalOcurrencias >= 30) semaforo = "🟢 Datos suficientes";
    if (totalOcurrencias < 10) semaforo = "🔴 Datos insuficientes";

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Cómo leerlo:</strong> “Cuando aparece este pensamiento en <strong>ANTES</strong>, ¿cómo suele terminar el día?”<br>
        <strong>Puente:</strong> el resultado se toma del <strong>último DESPUÉS</strong> del día (GANADA/PERDIDA).<br>
        <strong>Scope:</strong> ${totalDias} día(s) con resultado válido. Ocurrencias ANTES analizadas = ${totalOcurrencias}.<br>
        <strong>Nota:</strong> cuenta <em>ocurrencias</em> (si el pensamiento aparece 2 veces, cuenta 2).
      </div>

      <table class="pea-table">
        <thead>
          <tr>
            <th>CANTIDAD</th>
            <th>PENSAMIENTOS (NOMBRE/S)</th>
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
        No interpreta. No establece causalidad. Solo muestra co-ocurrencia pensamiento → resultado del día.<br>
        Si faltan DESPUÉS con GANADA/PERDIDA, esos días no entran al universo.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 16,
      titulo: "Pensamientos críticos por resultado",
      totalRegistros: totalOcurrencias,
      universo: "Pensamientos (ANTES, según filtros) clasificados por resultado del día (último DESPUÉS).",
      criterios: [
        "Unidad = PENSAMIENTO (no día)",
        "Pensamientos desde ANTES (respeta filtros)",
        "Resultado = último DESPUÉS del día (GANADA/PERDIDA)",
        "Salida: GANADAS vs PERDIDAS por pensamiento (cantidad + %)",
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
      indice: 16,
      titulo: "Pensamientos críticos por resultado",
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

  // ✅ Extractor robusto de pensamientos
  function extractPensamientos(r) {
    const out = [];

    // Campos típicos (según tu tabla: “Pensamiento”)
    const candidates = [
      r?.pensamiento,
      r?.pensamientos,
      r?.pensamiento_text,
      r?.pensamiento_txt,
      r?.pensamiento_str,
      r?.pensamiento_display,
      r?.pensamiento_label,
      r?.pensamiento_raw,
      r?.pensamiento_human,
      r?.pensamiento_ui
    ];

    candidates.forEach((x) => {
      if (typeof x === "string" && x.trim()) out.push(x.trim());
      else if (Array.isArray(x)) x.forEach((y) => (y && String(y).trim() ? out.push(String(y).trim()) : null));
    });

    // Si alguno viene “A, B, C”
    const expanded = [];
    out.forEach((s) => splitTextList(s).forEach((p) => expanded.push(p)));

    return uniqClean(expanded);
  }

  function splitTextList(s) {
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
