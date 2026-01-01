/* =========================================================
   STAT 15 — ACCIONES CRÍTICAS POR RESULTADO (BANDERAS)
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 4/4 (operativo directo)
   Estadística 15/17

   Qué hace:
   - Toma 3–6 acciones “bandera” (lista fija)
   - Calcula % de aparición en días GANADA vs PERDIDA
   - Presencia/ausencia por día (no frecuencia)
   - Co-ocurrencia, sin causalidad

   FIX CLAVE (para que funcione con filtros):
   - Los filtros definen el "scope" de FECHAS
   - El DURANTE/DESPUÉS canónico se busca en ALL (sin filtros) pero solo para esas fechas
   ========================================================= */

(function () {
  window.renderStat_15_acciones_criticas_por_resultado = function () {
    // ✅ NIVEL 4 (no altera orden del Nivel 3)
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    // ✅ Validación de estado: VALIDO + CORREGIDO cuentan como VALIDO
    const allValid = (Array.isArray(all) ? all : []).filter(
      (r) => normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    const filteredValid = (Array.isArray(filtered) ? filtered : []).filter(
      (r) => normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    /* ===============================
       1) Lista fija de BANDERAS
       =============================== */
    const DEFAULT_BANDERAS = [
      "Entré sin señal",
      "Moví stop",
      "Re-entré sin señal",
      "Aumenté tamaño",
      "No respeté tamaño",
      "Dejé correr pérdida"
    ];

    let BANDERAS =
      Array.isArray(window.PEA_STAT15_BANDERAS) && window.PEA_STAT15_BANDERAS.length
        ? window.PEA_STAT15_BANDERAS.slice(0, 6)
        : DEFAULT_BANDERAS;

    // Si existe catálogo global, filtrar banderas inválidas
    if (Array.isArray(window.PEA_ACCIONES) && window.PEA_ACCIONES.length) {
      const setCat = new Set(window.PEA_ACCIONES);
      BANDERAS = BANDERAS.filter((a) => setCat.has(a));
    }

    if (!BANDERAS.length) {
      renderEmpty(box, "No hay acciones bandera definidas o no existen en el catálogo.");
      return;
    }

    /* ===============================
       2) SCOPE de FECHAS (lo definen los filtros)
       - Si el usuario filtra por PERDIDA, etc., acá quedan esas fechas.
       - Si el filtro deja vacío, caer a todas las fechas visibles (allValid).
       =============================== */
    const scopeFechas = new Set(
      (filteredValid.length ? filteredValid : allValid)
        .map((r) => safeText(r?.fecha).trim())
        .filter(Boolean)
    );

    if (!scopeFechas.size) {
      renderEmpty(box, "No hay fechas en el universo actual.");
      return;
    }

    /* ===============================
       3) Resultado CANÓNICO por fecha (DESPUÉS más reciente)
       - se busca en ALL (sin filtros), pero SOLO para scopeFechas
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
      renderEmpty(box, "No hay DESPUÉS (canónico) con resultado GANADA/PERDIDA en las fechas del scope.");
      return;
    }

    /* ===============================
       4) DURANTE CANÓNICO por fecha
       - se busca en ALL (sin filtros), pero SOLO para fechasConResultado
       - canónico = más temprano (por created_at_iso si existe)
       =============================== */
    const duranteCanonPorFecha = {}; // { "YYYY-MM-DD": record }

    fechasConResultado.forEach((fecha) => {
      const durantes = allValid.filter(
        (r) =>
          safeText(r?.fecha).trim() === fecha &&
          normalizeMomento(r?.momento) === "DURANTE"
      );

      if (!durantes.length) return;

      const canon = durantes
        .map((r) => ({ r, key: getTimeKey(r) }))
        .sort((a, b) => a.key.localeCompare(b.key))[0]?.r;

      if (canon) duranteCanonPorFecha[fecha] = canon;
    });

    /* ===============================
       5) Base por día (presencia/ausencia)
       =============================== */
    const base = {
      GANADA: { total: 0, hit: {} },
      PERDIDA: { total: 0, hit: {} }
    };

    BANDERAS.forEach((a) => {
      base.GANADA.hit[a] = 0;
      base.PERDIDA.hit[a] = 0;
    });

    fechasConResultado.forEach((fecha) => {
      const res = resultadoPorFecha[fecha]?.res;
      if (res !== "GANADA" && res !== "PERDIDA") return;

      base[res].total++;

      const duranteCanon = duranteCanonPorFecha[fecha];
      if (!duranteCanon) return;

      const accionesSet = new Set(extractAcciones(duranteCanon));

      BANDERAS.forEach((a) => {
        if (accionesSet.has(a)) base[res].hit[a]++;
      });
    });

    /* ===============================
       6) Tabla + UX (— cuando no hay base)
       =============================== */
    const gT = base.GANADA.total || 0;
    const pT = base.PERDIDA.total || 0;

    function pct(h, t) {
      return t ? Math.round((h / t) * 100) : null; // null => no base
    }

    function fmtPct(h, t) {
      const p = pct(h, t);
      if (p == null) return "—";
      return `${p}% <span style="opacity:.6;">(${h}/${t})</span>`;
    }

    function fmtDelta(gPct, pPct) {
      if (gPct == null || pPct == null) return "—";
      const d = pPct - gPct;
      return `${d >= 0 ? "+" : ""}${d} pp`;
    }

    const rows = BANDERAS.map((a) => {
      const gH = base.GANADA.hit[a] || 0;
      const pH = base.PERDIDA.hit[a] || 0;

      const gPct = pct(gH, gT);
      const pPct = pct(pH, pT);
      const delta = fmtDelta(gPct, pPct);

      // Para ordenar: si delta es "—", va al final
      const deltaNum = (gPct == null || pPct == null) ? -9999 : (pPct - gPct);

      return { a, gH, pH, gPct, pPct, delta, deltaNum };
    });

    rows.sort((x, y) => (y.deltaNum - x.deltaNum));

    const body = rows
      .map(
        (r) => `
        <tr>
          <td>${escapeHtml(r.a)}</td>
          <td class="pea-n">${fmtPct(r.gH, gT)}</td>
          <td class="pea-n">${fmtPct(r.pH, pT)}</td>
          <td class="pea-n">${r.delta}</td>
        </tr>
      `
      )
      .join("");

    const noteDelta = `
      <div class="pea-metricas-secundarias" style="margin-top:8px;">
        <strong>Nota:</strong> <em>pp</em> = puntos porcentuales. Ej: 50% − 0% = +50 pp.<br>
        Si una columna muestra “—”, significa <strong>no hay base</strong> para ese resultado en el scope actual (por filtros).
      </div>
    `;

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Acción bandera</th>
            <th>GANADA</th>
            <th>PERDIDA</th>
            <th>Diferencia (PERDIDA − GANADA)</th>
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>

      <div class="pea-metricas-secundarias">
        Presencia/ausencia por día (no frecuencia). Co-ocurrencia pura con el resultado final del día.<br>
        No mide gravedad. No interpreta. No establece causalidad.
      </div>

      ${noteDelta}
    `;

    /* ===============================
       7) Semáforo (simple)
       =============================== */
    const totalDias = fechasConResultado.length;

    let semaforo = "🟡 Datos parciales";
    if (gT >= 3 && pT >= 3) semaforo = "🟢 Datos suficientes";
    if (gT === 0 || pT === 0) semaforo = "🔴 Datos insuficientes";

    box.insertAdjacentHTML(
      "beforeend",
      window.renderCuadroBasePEA({
        nivel: 4,
        indice: 15,
        titulo: "Acciones críticas por resultado (banderas)",
        totalRegistros: totalDias,
        universo: "Scope por filtros (fechas). DURANTE/DESPUÉS canónicos buscados en ALL para esas fechas.",
        criterios: [
          `Banderas: ${BANDERAS.length} (lista fija)`,
          "Presencia/ausencia por día (no ranking, no frecuencia)",
          "Resultado canónico = último DESPUÉS del día",
          "DURANTE canónico = primer DURANTE del día",
          "Solo registros VALIDO y CORREGIDO",
          semaforo
        ],
        contenidoHTML
      })
    );
  };

  function renderEmpty(box, reason) {
    box.insertAdjacentHTML(
      "beforeend",
      window.renderCuadroBasePEA({
        nivel: 4,
        indice: 15,
        titulo: "Acciones críticas por resultado (banderas)",
        totalRegistros: 0,
        universo: "—",
        criterios: null,
        contenidoHTML: `
          <div class="pea-empty">
            Evidencia insuficiente para esta estadística.<br>
            <span style="opacity:.85;">${escapeHtml(reason || "")}</span>
          </div>
        `
      })
    );
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
    if (s === "GANADA" || s === "PERDIDA" || s === "BE" || s === "NA") return s;
    if (s === "GANANCIA") return "GANADA";
    if (s === "PÉRDIDA" || s === "PERDIDA") return "PERDIDA";
    return "NA";
  }

  function extractAcciones(r) {
    const out = [];

    if (Array.isArray(r?.acciones_keys)) {
      r.acciones_keys.forEach((a) => a && out.push(String(a)));
      return out;
    }

    if (Array.isArray(r?.acciones)) {
      r.acciones.forEach((a) => a && out.push(String(a)));
      return out;
    }

    const a1 = r?.accion_key ?? r?.accion ?? null;
    if (a1) out.push(String(a1));

    return out;
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
