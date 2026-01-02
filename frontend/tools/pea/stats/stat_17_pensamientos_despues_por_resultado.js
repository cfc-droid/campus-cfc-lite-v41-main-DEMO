/* =========================================================
   STAT 17 — PENSAMIENTOS (DESPUÉS) POR RESULTADO (APB)
   (GANADA vs PERDIDA) — cuadro simple, directo

   Campus CFC LITE V41
   Nivel 4/4 (operativo directo)
   Estadística 17/17

   OBJETIVO (misma familia que 15 y 16, pero en DESPUÉS):
   - Unidad = PENSAMIENTO (no día)
   - Para cada pensamiento (top 5):
       GANADAS: cantidad + %
       PERDIDAS: cantidad + %
       TOTAL: cantidad (siempre 100% por fila)
   - + Fila 6: TOTALES (sumas + % globales)

   CLASIFICACIÓN (SIN PUENTE):
   - En DESPUÉS ya es “cierre”, así que el resultado se toma del MISMO registro:
     resultado_operativo ∈ {GANADA, PERDIDA}

   SCOPE:
   - Pensamientos tomados de registros DESPUÉS que respetan filtros activos
   - Solo se consideran registros DESPUÉS con resultado GANADA/PERDIDA (válidos)

   REGLAS:
   - Si un registro DESPUÉS no tiene GANADA/PERDIDA => se excluye
   - Los pensamientos se computan por ocurrencias (frecuencia): si aparece 2 veces, cuenta 2

   Robustez de pensamiento:
   - pensamiento / pensamientos / pensamiento_text / pensamiento_str / etc.
   - pensamiento_key / pensamiento_keys / pensamientos_keys
   - meta.pensamiento / meta.pensamiento_text
   - (lo que ves como “Pensamiento” en la tabla)
   ========================================================= */

(function () {

  window.renderStat_17_pensamientos_despues_por_resultado = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    // ✅ Estado: VALIDO + CORREGIDO cuentan como VALIDO
    const filteredValid = (Array.isArray(filtered) ? filtered : []).filter(
      (r) => normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    if (!filteredValid.length) {
      return renderEmpty(box, "No hay registros válidos en el universo actual (filtros).");
    }

    /* ===============================
       1) Tomar DESPUÉS (RESPETA FILTROS)
          - Solo DESPUÉS con resultado GANADA/PERDIDA
       =============================== */
    const despuesFiltered = filteredValid.filter((r) => {
      if (normalizeMomento(r?.momento) !== "DESPUES") return false;
      const res = normalizeResultadoOperativo(getResultadoAny(r));
      return (res === "GANADA" || res === "PERDIDA");
    });

    if (!despuesFiltered.length) {
      return renderEmpty(
        box,
        "No hay registros DESPUÉS (válidos) con resultado GANADA/PERDIDA en el scope actual."
      );
    }

    // Conteo por pensamiento: key = normalizedText, val = { label, g, p, t }
    const counts = new Map();
    let totalOcurrencias = 0;
    let huboDespuesPeroSinPensamientos = false;

    despuesFiltered.forEach((rec) => {
      const res = normalizeResultadoOperativo(getResultadoAny(rec));
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const pensamientos = extractPensamientos(rec);
      if (!pensamientos.length) {
        huboDespuesPeroSinPensamientos = true;
        return;
      }

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

    /* ===============================
       2) TOP 5 (dinámico) + tabla FIJA
       =============================== */
    const FIXED_ROWS = 5;

    if (itemsAll.length) {
      // Orden: más frecuencia primero; si empata, más % pérdida primero
      itemsAll.sort((a, b) => {
        if (b.t !== a.t) return b.t - a.t;
        const ap = a.t ? (a.p / a.t) : 0;
        const bp = b.t ? (b.p / b.t) : 0;
        return bp - ap;
      });
    }

    const top = itemsAll.slice(0, FIXED_ROWS);

    /* ===============================
       3) Render (APB) — 5 filas + Totales
       =============================== */
    function pct(n, t) {
      return t ? Math.round((n / t) * 100) : 0;
    }

    const sumG = top.reduce((acc, r) => acc + (r?.g || 0), 0);
    const sumP = top.reduce((acc, r) => acc + (r?.p || 0), 0);
    const sumT = top.reduce((acc, r) => acc + (r?.t || 0), 0);

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
        <td ${tdNum}>${sumG} (${sumT ? totGp : 0}%)</td>
        <td ${tdNum}>${sumP} (${sumT ? totPp : 0}%)</td>
        <td ${tdNum}>${sumT} (${sumT ? 100 : "—"}%)</td>
      </tr>
    `);

    // Semáforo simple (por volumen de ocurrencias)
    let semaforo = "🟡 Datos parciales";
    if (totalOcurrencias >= 30) semaforo = "🟢 Datos suficientes";
    if (totalOcurrencias < 10) semaforo = "🔴 Datos insuficientes";

    const warnPensamientos = (!itemsAll.length)
      ? `⚠️ Hay DESPUÉS en el scope, pero no se pudieron extraer pensamientos (campos vacíos o formato inesperado).`
      : (huboDespuesPeroSinPensamientos ? `⚠️ Algunos registros DESPUÉS no tienen pensamiento legible (se omitieron).` : `✅ Se extrajeron pensamientos desde DESPUÉS correctamente.`);

    const totalRegistrosDespuesValidos = despuesFiltered.length;

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Cómo leerlo:</strong> “Cuando aparece este pensamiento en <strong>DESPUÉS</strong>, ¿cómo cerró la operación?”<br>
        <strong>Clasificación:</strong> se toma el <strong>resultado del mismo registro DESPUÉS</strong> (GANADA/PERDIDA).<br>
        <strong>Scope:</strong> ${totalRegistrosDespuesValidos} registro(s) DESPUÉS con resultado válido. Ocurrencias de pensamiento analizadas = ${totalOcurrencias}.<br>
        <strong>Nota:</strong> cuenta <em>ocurrencias</em> (si el pensamiento aparece 2 veces, cuenta 2).<br>
        <span style="opacity:.85;">${escapeHtml(warnPensamientos)}</span>
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
        No interpreta. No establece causalidad. Solo muestra co-ocurrencia pensamiento (DESPUÉS) → resultado del cierre.<br>
        Si un DESPUÉS no tiene GANADA/PERDIDA, no entra al universo.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 17,
      titulo: "Pensamientos (DESPUÉS) por resultado",
      totalRegistros: totalOcurrencias,
      universo: "Pensamientos (DESPUÉS, según filtros) clasificados por resultado del mismo registro DESPUÉS.",
      criterios: [
        "Unidad = PENSAMIENTO (no día)",
        "Pensamientos desde DESPUÉS (respeta filtros)",
        "Clasificación = resultado del mismo DESPUÉS (GANADA/PERDIDA)",
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
      indice: 17,
      titulo: "Pensamientos (DESPUÉS) por resultado",
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

    // 1) keys arrays
    if (Array.isArray(r?.pensamiento_keys)) r.pensamiento_keys.forEach((x) => x && out.push(String(x)));
    if (Array.isArray(r?.pensamientos_keys)) r.pensamientos_keys.forEach((x) => x && out.push(String(x)));

    // 2) keys strings
    if (typeof r?.pensamiento_key === "string" && r.pensamiento_key.trim()) out.push(r.pensamiento_key.trim());
    if (typeof r?.pensamientos_key === "string" && r.pensamientos_key.trim()) out.push(r.pensamientos_key.trim());

    // 3) campos típicos visibles en tabla (“Pensamiento”)
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
      r?.pensamiento_ui,

      // variantes defensivas
      r?.thought,
      r?.thoughts,
      r?.texto_pensamiento,

      // meta
      r?.meta?.pensamiento,
      r?.meta?.pensamiento_text,
      r?.meta?.pensamiento_str,
      r?.meta?.pensamiento_display
    ];

    candidates.forEach((x) => {
      if (typeof x === "string" && x.trim()) out.push(x.trim());
      else if (Array.isArray(x)) x.forEach((y) => (y && String(y).trim() ? out.push(String(y).trim()) : null));
    });

    // split si alguno viene “A, B, C”
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
