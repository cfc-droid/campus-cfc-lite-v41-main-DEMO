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

   Por qué no duplica 03/06:
   - 03/06: Top ranking dentro de cada resultado
   - 15: misma acción comparada lado a lado GANADA vs PERDIDA
   ========================================================= */

(function () {

  window.renderStat_15_acciones_criticas_por_resultado = function () {

    // ✅ NIVEL 4 (para no romper el orden visual del Nivel 3)
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    // Solo VALIDO + CORREGIDO (igual que 8–11)
    const valid = (Array.isArray(filtered) ? filtered : []).filter(r =>
      normalizeEstadoRegistro(getRecordState(r)) === "VALIDO"
    );

    /* ===============================
       1) Lista fija de BANDERAS
       - default: 6 acciones
       - opcional: window.PEA_STAT15_BANDERAS = [...]
       =============================== */

    const DEFAULT_BANDERAS = [
      "Entré sin señal",
      "Moví stop",
      "Re-entré sin señal",
      "Aumenté tamaño",
      "No respeté tamaño",
      "Dejé correr pérdida"
    ];

    let BANDERAS = (Array.isArray(window.PEA_STAT15_BANDERAS) && window.PEA_STAT15_BANDERAS.length)
      ? window.PEA_STAT15_BANDERAS.slice(0, 6)
      : DEFAULT_BANDERAS;

    // Si existe catálogo global (a veces no se carga en History), filtrar banderas inválidas
    if (Array.isArray(window.PEA_ACCIONES) && window.PEA_ACCIONES.length) {
      const setCat = new Set(window.PEA_ACCIONES);
      BANDERAS = BANDERAS.filter(a => setCat.has(a));
    }

    if (!BANDERAS.length) {
      renderEmpty(box, "No hay acciones bandera definidas o no existen en el catálogo.");
      return;
    }

    /* ===============================
       2) Resultado canónico por fecha:
       - Tomar el DESPUÉS más reciente del día (si hay varios)
       =============================== */

    const resultadoPorFecha = {}; // { "2025-01-01": { res: "GANADA", key: "..." } }

    valid.forEach(r => {
      const fecha = safeText(r?.fecha).trim();
      if (!fecha) return;

      if (normalizeMomento(r?.momento) !== "DESPUES") return;

      const res = normalizeResultadoOperativo(getResultadoAny(r));
      if (res !== "GANADA" && res !== "PERDIDA") return;

      const tkey = getTimeKey(r);
      if (!resultadoPorFecha[fecha] || tkey > resultadoPorFecha[fecha].key) {
        resultadoPorFecha[fecha] = { res, key: tkey };
      }
    });

    const fechas = Object.keys(resultadoPorFecha);
    if (!fechas.length) {
      renderEmpty(box, "No hay DESPUÉS con resultado GANADA/PERDIDA.");
      return;
    }

    /* ===============================
       3) Base por día + DURANTE canónico
       - presencia/ausencia por bandera
       =============================== */

    const base = {
      GANADA: { total: 0, hit: {} },
      PERDIDA: { total: 0, hit: {} }
    };

    BANDERAS.forEach(a => {
      base.GANADA.hit[a] = 0;
      base.PERDIDA.hit[a] = 0;
    });

    fechas.forEach(fecha => {
      const res = resultadoPorFecha[fecha]?.res;
      if (res !== "GANADA" && res !== "PERDIDA") return;

      base[res].total++;

      // DURANTE canónico: el más temprano (por created_at_iso si existe)
      const durantes = valid.filter(r =>
        safeText(r?.fecha).trim() === fecha &&
        normalizeMomento(r?.momento) === "DURANTE"
      );

      if (!durantes.length) return;

      const duranteCanon = durantes
        .map(r => ({ r, key: getTimeKey(r) }))
        .sort((a, b) => a.key.localeCompare(b.key))[0]?.r;

      if (!duranteCanon) return;

      const accionesSet = new Set(extractAcciones(duranteCanon));

      BANDERAS.forEach(a => {
        if (accionesSet.has(a)) base[res].hit[a]++;
      });
    });

    /* ===============================
       4) Tabla
       =============================== */

    function pct(h, t) {
      return t ? Math.round((h / t) * 100) : 0;
    }

    // delta en puntos porcentuales: PERDIDA - GANADA
    function deltaPP(gPct, pPct) {
      return (pPct - gPct);
    }

    const rows = BANDERAS.map(a => {
      const gH = base.GANADA.hit[a] || 0;
      const pH = base.PERDIDA.hit[a] || 0;
      const gT = base.GANADA.total || 0;
      const pT = base.PERDIDA.total || 0;

      const gPct = pct(gH, gT);
      const pPct = pct(pH, pT);
      const delta = deltaPP(gPct, pPct);

      return { a, gH, gT, gPct, pH, pT, pPct, delta };
    });

    // Orden: mayor diferencia a favor de PERDIDA (más “alerta”)
    rows.sort((x, y) => (y.delta - x.delta));

    const body = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.a)}</td>
        <td class="pea-n">${r.gPct}% <span style="opacity:.6;">(${r.gH}/${r.gT})</span></td>
        <td class="pea-n">${r.pPct}% <span style="opacity:.6;">(${r.pH}/${r.pT})</span></td>
        <td class="pea-n">${r.delta >= 0 ? "+" : ""}${r.delta} pp</td>
      </tr>
    `).join("");

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Acción bandera</th>
            <th>GANADA</th>
            <th>PERDIDA</th>
            <th>Δ (PERDIDA − GANADA)</th>
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
    `;

    // Semáforo (simple)
    const totalDias = fechas.length;
    const gDias = base.GANADA.total;
    const pDias = base.PERDIDA.total;

    let semaforo = "🟡 Datos parciales";
    if (gDias >= 3 && pDias >= 3) semaforo = "🟢 Datos suficientes";
    if (gDias === 0 || pDias === 0) semaforo = "🔴 Datos insuficientes";

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 15,
      titulo: "Acciones críticas por resultado (banderas)",
      totalRegistros: totalDias,
      universo: "DURANTE canónico por fecha en días con DESPUÉS = GANADA o PERDIDA",
      criterios: [
        `Banderas: ${BANDERAS.length} (lista fija)`,
        "Presencia/ausencia por día (no ranking, no frecuencia)",
        "Resultado canónico = último DESPUÉS del día",
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
    }));
  }

  /* ===============================
     Helpers (robustos)
     =============================== */

  function getRecordState(r) {
    return r?.meta?.estado || r?.estado_registro || r?.meta_estado || "VALIDO";
  }

  function normalizeEstadoRegistro(v) {
    const s = normalizeText(v);
    // CORREGIDO cuenta como VALIDO
    if (s === "CORREGIDO" || s === "CORRECCION") return "VALIDO";
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
      r.acciones_keys.forEach(a => a && out.push(String(a)));
      return out;
    }

    if (Array.isArray(r?.acciones)) {
      r.acciones.forEach(a => a && out.push(String(a)));
      return out;
    }

    const a1 = r?.accion_key ?? r?.accion ?? null;
    if (a1) out.push(String(a1));

    return out;
  }

  function getTimeKey(r) {
    // Si existe timestamp real, usarlo
    const iso = safeText(r?.meta?.created_at_iso).trim();
    if (iso) return iso;

    // Fallback estable
    const f = safeText(r?.fecha).trim();
    const m = normalizeMomento(r?.momento);
    const mo = (m === "ANTES" ? 1 : m === "DURANTE" ? 2 : m === "DESPUES" ? 3 : 9);
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
