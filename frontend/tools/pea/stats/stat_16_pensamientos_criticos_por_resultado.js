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

   PUENTE (clasificación) — ✅ CORREGIDO:
   - Resultado = ÚLTIMO registro DESPUÉS con GANADA/PERDIDA
   - PERO ahora se calcula por (FECHA + DIRECCIÓN)
     => evita mezclar operaciones COMPRA y VENTA del mismo día.

   SCOPE:
   - Pensamientos desde ANTES (respeta filtros activos)
   - Solo se consideran ANTES que tengan puente válido (fecha+dirección con DESPUÉS GANADA/PERDIDA)

   REGLAS:
   - Si no hay DESPUÉS GANADA/PERDIDA para ese (día+dirección), NO entra al universo.
   - Pensamientos por ocurrencias (si aparece 2 veces, cuenta 2)

   Robustez de pensamiento:
   - pensamiento / pensamientos / pensamiento_text / pensamiento_str / etc.
   - pensamiento_key / pensamiento_keys / pensamientos_keys
   - meta.pensamiento / meta.pensamiento_text
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
       2) PUENTE CORREGIDO:
          Resultado por (FECHA + DIRECCIÓN)
          - último DESPUÉS del par (fecha+dir) con GANADA/PERDIDA
          - se busca en ALL (sin filtros) pero SOLO para fechas del scope
       =============================== */
    const resultadoPorFechaDir = {}; // { "YYYY-MM-DD|COMPRA": { res, key } }

    allValid.forEach((r) => {
      const fecha = safeText(r?.fecha).trim();
      if (!fecha || !scopeFechas.has(fecha)) return;

      if (normalizeMomento(r?.momento) !== "DESPUES") return;

      const res = normalizeResultadoOperativo(getResultadoAny(r));
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const dir = normalizeDireccion(r?.direccion);
      if (!dir) return; // si no hay dirección, no puede cerrar “por operación”

      const mapKey = `${fecha}|${dir}`;
      const tkey = getTimeKey(r);

      if (!resultadoPorFechaDir[mapKey] || tkey > resultadoPorFechaDir[mapKey].key) {
        resultadoPorFechaDir[mapKey] = { res, key: tkey };
      }
    });

    const keysPuente = Object.keys(resultadoPorFechaDir);
    if (!keysPuente.length) {
      return renderEmpty(
        box,
        "No hay DESPUÉS con resultado GANADA/PERDIDA (y dirección válida) dentro del scope de fechas."
      );
    }

    const keysPuenteSet = new Set(keysPuente);

    /* ===============================
       3) Tomar pensamientos desde ANTES (RESPETA FILTROS)
          - Solo ANTES dentro del scope
          - Solo si existe puente para (fecha+dirección del ANTES)
       =============================== */
    const antesFiltered = filteredValid.filter((r) => {
      const fecha = safeText(r?.fecha).trim();
      if (!fecha) return false;

      if (!scopeFechas.has(fecha)) return false;
      if (normalizeMomento(r?.momento) !== "ANTES") return false;

      const dir = normalizeDireccion(r?.direccion);
      if (!dir) return false;

      const mapKey = `${fecha}|${dir}`;
      return keysPuenteSet.has(mapKey);
    });

    // Si no hay ANTES con puente válido, igual mostramos cuadro fijo vacío
    let totalOcurrencias = 0;
    const counts = new Map(); // key pensamiento normalized => { label, g, p, t }

    let huboAntesSinPensamientos = false;

    antesFiltered.forEach((rec) => {
      const fecha = safeText(rec?.fecha).trim();
      const dir = normalizeDireccion(rec?.direccion);
      const mapKey = `${fecha}|${dir}`;

      const res = resultadoPorFechaDir[mapKey]?.res; // GANADA/PERDIDA
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const pensamientos = extractPensamientos(rec);
      if (!pensamientos.length) {
        huboAntesSinPensamientos = true;
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
       4) TOP 5 (dinámico) + cuadro FIJO
       =============================== */
    const FIXED_ROWS = 5;

    if (itemsAll.length) {
      itemsAll.sort((a, b) => {
        if (b.t !== a.t) return b.t - a.t;
        const ap = a.t ? (a.p / a.t) : 0;
        const bp = b.t ? (b.p / b.t) : 0;
        return bp - ap;
      });
    }

    const top = itemsAll.slice(0, FIXED_ROWS);

    /* ===============================
       5) Render (APB) — 5 filas + Totales
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

    // Universo: contamos pares fecha+dirección con puente válido dentro del scope
    // (más fiel que “días” cuando hay varias operaciones)
    const universoKeys = new Set(
      keysPuente.filter((k) => scopeFechas.has(k.split("|")[0]))
    );
    const totalParesFechaDir = universoKeys.size;

    // Semáforo simple (por volumen de ocurrencias)
    let semaforo = "🟡 Datos parciales";
    if (totalOcurrencias >= 30) semaforo = "🟢 Datos suficientes";
    if (totalOcurrencias < 10) semaforo = "🔴 Datos insuficientes";

    const diag =
      !itemsAll.length
        ? "⚠️ Hay ANTES en el scope, pero no se pudieron extraer pensamientos legibles."
        : (huboAntesSinPensamientos
          ? "⚠️ Algunos ANTES no tenían pensamiento legible (se omitieron)."
          : "✅ Se extrajeron pensamientos desde ANTES correctamente.");

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Cómo leerlo:</strong> “Cuando aparece este pensamiento en <strong>ANTES</strong>, ¿cómo suele terminar la operación?”<br>
        <strong>Puente:</strong> se toma el <strong>último DESPUÉS</strong> con GANADA/PERDIDA del <strong>mismo día + misma dirección</strong> (COMPRA/VENTA).<br>
        <strong>Scope:</strong> ${totalParesFechaDir} par(es) fecha+dirección con cierre válido. Ocurrencias ANTES analizadas = ${totalOcurrencias}.<br>
        <strong>Nota:</strong> cuenta <em>ocurrencias</em> (si el pensamiento aparece 2 veces, cuenta 2).<br>
        <span style="opacity:.85;">${escapeHtml(diag)}</span>
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
        No interpreta. No establece causalidad. Solo muestra co-ocurrencia pensamiento → resultado (cierre) de la operación.<br>
        Si faltan DESPUÉS con GANADA/PERDIDA para ese (día+dirección), ese ANTES no entra al universo.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 16,
      titulo: "Pensamientos críticos por resultado",
      totalRegistros: totalOcurrencias,
      universo: "Pensamientos (ANTES, según filtros) clasificados por resultado del cierre (último DESPUÉS del mismo día + dirección).",
      criterios: [
        "Unidad = PENSAMIENTO (no día)",
        "Pensamientos desde ANTES (respeta filtros)",
        "Puente = último DESPUÉS del mismo día + dirección (GANADA/PERDIDA)",
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

  function normalizeDireccion(v) {
    const s = normalizeText(v);
    if (!s) return "";
    if (s === "BUY" || s === "LONG" || s === "COMPRA") return "COMPRA";
    if (s === "SELL" || s === "SHORT" || s === "VENTA") return "VENTA";
    return s; // por si en el futuro hay otras etiquetas
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

    // keys arrays
    if (Array.isArray(r?.pensamiento_keys)) r.pensamiento_keys.forEach((x) => x && out.push(String(x)));
    if (Array.isArray(r?.pensamientos_keys)) r.pensamientos_keys.forEach((x) => x && out.push(String(x)));

    // keys strings
    if (typeof r?.pensamiento_key === "string" && r.pensamiento_key.trim()) out.push(r.pensamiento_key.trim());
    if (typeof r?.pensamientos_key === "string" && r.pensamientos_key.trim()) out.push(r.pensamientos_key.trim());

    // campos típicos
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
