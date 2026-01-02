/* =========================================================
   STAT 17 — ESTADOS (EMOCIÓN/ESTADO E) POR RESULTADO (APB)
   (GANADA vs PERDIDA) — cuadro simple, directo

   Campus CFC LITE V41
   Nivel 4/4 (operativo directo)
   Estadística 17/17

   OBJETIVO (similar a Stat 15/16):
   - Unidad = ESTADO (E) (no día)
   - Para cada estado (top 5):
       GANADAS: cantidad + %
       PERDIDAS: cantidad + %
       TOTAL: cantidad (siempre 100% por fila)
   - + Fila 6: TOTALES (sumas + % globales)

   CLASIFICACIÓN (sin puente):
   - Se toma el resultado_operativo del MISMO registro DESPUÉS:
       GANADA / PERDIDA
   - No hace falta puente por fecha+dirección porque en DESPUÉS ya es “cierre”.

   SCOPE (IMPORTANTE):
   - Estados tomados de registros DESPUÉS que respetan filtros activos
   - Si filtros dejan vacío => se muestra “Evidencia insuficiente”
     (NO se cae a ALL, para no “inventar” resultados fuera del filtro)

   REGLAS:
   - Si un DESPUÉS no tiene GANADA/PERDIDA => no entra al universo
   - Los estados se computan por ocurrencias (frecuencia): si aparece 2 veces, cuenta 2

   Robustez de estado (Estado “E”):
   - estado / emocion / emoción / estado_emocional / estado_key / estados_keys / etc.
   - meta.emocion / meta.estado_emocional (PERO NO meta.estado, porque suele ser estado_registro)
   ========================================================= */

(function () {

  window.renderStat_17_estados_por_resultado = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    // ✅ Estado del registro: VALIDO + CORREGIDO cuentan como VALIDO
    const allValid = (Array.isArray(all) ? all : []).filter(
      (r) => normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    const filteredValid = (Array.isArray(filtered) ? filtered : []).filter(
      (r) => normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    /* ===============================
       1) SCOPE (respeta filtros SIEMPRE)
       =============================== */
    const scopeRecords = filteredValid; // ✅ sin fallback a ALL

    if (!scopeRecords.length) {
      return renderEmpty(box, "No hay registros válidos que cumplan los filtros actuales.");
    }

    // Tomamos SOLO DESPUÉS dentro del scope
    const despuesScope = scopeRecords.filter((r) => normalizeMomento(r?.momento) === "DESPUES");

    if (!despuesScope.length) {
      return renderEmpty(box, "No hay registros DESPUÉS (válidos) dentro de los filtros actuales.");
    }

    /* ===============================
       2) Filtrar DESPUÉS con resultado GANADA/PERDIDA
          - clasificación = resultado del mismo registro
       =============================== */
    const despuesClasificables = despuesScope.filter((r) => {
      const res = normalizeResultadoOperativo(getResultadoAny(r));
      return res === "GANADA" || res === "PERDIDA";
    });

    // Conteo por estado: key estado normalized => { label, g, p, t }
    const counts = new Map();
    let totalOcurrencias = 0;
    let huboDespuesSinEstado = false;

    despuesClasificables.forEach((rec) => {
      const res = normalizeResultadoOperativo(getResultadoAny(rec)); // GANADA/PERDIDA
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const estados = extractEstados(rec);
      if (!estados.length) {
        huboDespuesSinEstado = true;
        return;
      }

      estados.forEach((txt) => {
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
       3) TOP 5 + cuadro FIJO
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
       4) Render
       =============================== */
    function pct(n, t) {
      return t ? Math.round((n / t) * 100) : 0;
    }

    const sumG = top.reduce((acc, r) => acc + (r?.g || 0), 0);
    const sumP = top.reduce((acc, r) => acc + (r?.p || 0), 0);
    const sumT = top.reduce((acc, r) => acc + (r?.t || 0), 0);

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

    let semaforo = "🟡 Datos parciales";
    if (totalOcurrencias >= 30) semaforo = "🟢 Datos suficientes";
    if (totalOcurrencias < 10) semaforo = "🔴 Datos insuficientes";

    const cierres = despuesClasificables.length;

    const diag =
      !despuesClasificables.length
        ? "⚠️ Hay DESPUÉS en el scope, pero ninguno tiene resultado GANADA/PERDIDA."
        : (!itemsAll.length
          ? "⚠️ Hay DESPUÉS con GANADA/PERDIDA, pero no se pudo extraer Estado (E)."
          : (huboDespuesSinEstado
            ? "⚠️ Algunos DESPUÉS no tenían Estado (E) legible (se omitieron)."
            : "✅ Se extrajeron Estados (E) desde DESPUÉS correctamente."));

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Cómo leerlo:</strong> “Cuando aparece este <strong>Estado (E)</strong> en <strong>DESPUÉS</strong>, ¿cómo cerró la operación?”<br>
        <strong>Clasificación:</strong> se toma el <strong>resultado del mismo DESPUÉS</strong> (GANADA/PERDIDA).<br>
        <strong>Scope:</strong> cierres DESPUÉS clasificables = ${cierres}. Ocurrencias de Estado analizadas = ${totalOcurrencias}.<br>
        <strong>Nota:</strong> cuenta <em>ocurrencias</em> (si el estado aparece 2 veces, cuenta 2).<br>
        <span style="opacity:.85;">${escapeHtml(diag)}</span>
      </div>

      <table class="pea-table">
        <thead>
          <tr>
            <th>CANTIDAD</th>
            <th>ESTADOS (E) (NOMBRE/S)</th>
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
        No interpreta. No establece causalidad. Solo muestra co-ocurrencia estado (DESPUÉS) → resultado de cierre.<br>
        Si un DESPUÉS no tiene GANADA/PERDIDA, no entra al universo.
      </div>
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 17,
      titulo: "Estados (E) por resultado",
      totalRegistros: totalOcurrencias,
      universo: "Estados (E) (DESPUÉS, según filtros) clasificados por el resultado del mismo DESPUÉS (GANADA/PERDIDA).",
      criterios: [
        "Unidad = ESTADO (E) (no día)",
        "Estados desde DESPUÉS (respeta filtros)",
        "Clasificación = resultado del mismo DESPUÉS (GANADA/PERDIDA)",
        "Salida: GANADAS vs PERDIDAS por estado (cantidad + %)",
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
      titulo: "Estados (E) por resultado",
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
    // OJO: esto es estado_registro (VALIDO/CORREGIDO/ANULADO), NO Estado (E)
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

  // ✅ Extractor robusto de Estados (E) (NO usar meta.estado)
  function extractEstados(r) {
    const out = [];

    // keys arrays
    if (Array.isArray(r?.estado_keys)) r.estado_keys.forEach((x) => x && out.push(String(x)));
    if (Array.isArray(r?.estados_keys)) r.estados_keys.forEach((x) => x && out.push(String(x)));
    if (Array.isArray(r?.emociones_keys)) r.emociones_keys.forEach((x) => x && out.push(String(x)));

    // keys strings
    if (typeof r?.estado_key === "string" && r.estado_key.trim()) out.push(r.estado_key.trim());
    if (typeof r?.emocion_key === "string" && r.emocion_key.trim()) out.push(r.emocion_key.trim());

    // campos típicos (lo que ves como “Estado (E)”)
    const candidates = [
      r?.estado,
      r?.estado_e,
      r?.estado_emocional,
      r?.estado_emocion,
      r?.emocion,
      r?.emoción,
      r?.emociones,
      r?.estado_text,
      r?.estado_str,
      r?.emocion_text,
      r?.emocion_str,

      // meta (pero NO meta.estado)
      r?.meta?.emocion,
      r?.meta?.estado_emocional,
      r?.meta?.estado_emocion,
      r?.meta?.estado_e
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

  function normalizeText(v) {
    if (v == null) return "";
    return String(v)
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
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
