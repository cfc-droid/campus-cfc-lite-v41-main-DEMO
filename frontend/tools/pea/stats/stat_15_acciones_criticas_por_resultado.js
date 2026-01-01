/* =========================================================
   STAT 15 — ACCIONES CRÍTICAS POR RESULTADO (BANDERAS)
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 4/4 (operativo directo)
   Estadística 15/17

   Qué hace:
   - Lista fija de 3–6 acciones “bandera”
   - Por cada día, mira si la bandera estuvo presente en el DURANTE canónico
   - Compara por resultado final del día (DESPUÉS canónico): GANADA vs PERDIDA
   - Presencia/ausencia por día (NO frecuencia)

   FIX CLAVE (para que funcione con filtros):
   - Los filtros definen el SCOPE de FECHAS
   - DURANTE/DESPUÉS canónicos se buscan en ALL (sin filtros) pero SOLO para esas fechas

   FIX CLAVE #2 (para que NO quede todo 0):
   - Las acciones pueden venir como:
       acciones_keys: []
       acciones: [] / "A, B, C"
       accion / accion_key: "A, B"
       acciones_text / acciones_str / acciones_display: "A, B, C"
       (lo que ves en la tabla como "Acción(es)")
     => se parsea robusto y se normaliza.
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
      const setCat = new Set(window.PEA_ACCIONES.map((x) => String(x)));
      BANDERAS = BANDERAS.filter((a) => setCat.has(a));
    }

    if (!BANDERAS.length) {
      renderEmpty(box, "No hay acciones bandera definidas o no existen en el catálogo.");
      return;
    }

    // Normalizar banderas para match robusto
    const BANDERAS_N = BANDERAS.map((a) => normalizeText(a));
    const banderaByNorm = new Map();
    BANDERAS.forEach((a) => banderaByNorm.set(normalizeText(a), a));

    /* ===============================
       2) SCOPE de FECHAS (lo definen los filtros)
       =============================== */
    const scopeFechas = new Set(
      (filteredValid.length ? filteredValid : allValid)
        .map((r) => safeText(r?.fecha).trim())
        .filter(Boolean)
    );

    if (!scopeFechas.size) {
      renderEmpty(box, "No hay fechas en el universo actual (scope).");
      return;
    }

    /* ===============================
       3) Resultado CANÓNICO por fecha:
          DESPUÉS más reciente del día
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
      renderEmpty(box, "No hay DESPUÉS canónico con GANADA/PERDIDA dentro del scope de fechas.");
      return;
    }

    /* ===============================
       4) DURANTE CANÓNICO por fecha:
          el más temprano del día
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

      const acciones = extractAcciones(duranteCanon);
      const accionesNormSet = new Set(acciones.map((x) => normalizeText(x)));

      // Match robusto (por normalización)
      BANDERAS_N.forEach((bn) => {
        if (accionesNormSet.has(bn)) {
          const original = banderaByNorm.get(bn);
          if (original) base[res].hit[original] = (base[res].hit[original] || 0) + 1;
        }
      });
    });

    /* ===============================
       6) Render tabla CLARA (más columnas)
       =============================== */
    const gBase = base.GANADA.total || 0;
    const pBase = base.PERDIDA.total || 0;

    function pctInt(h, t) {
      return t ? Math.round((h / t) * 100) : null;
    }

    function fmtPctOnly(h, t) {
      const p = pctInt(h, t);
      return (p == null) ? "—" : `${p}%`;
    }

    const rows = BANDERAS.map((a) => {
      const gHit = base.GANADA.hit[a] || 0;
      const pHit = base.PERDIDA.hit[a] || 0;

      const gPct = pctInt(gHit, gBase);
      const pPct = pctInt(pHit, pBase);

      // “señal” para ordenar: PERDIDA más alto y GANADA más bajo primero
      const score = (pPct == null ? -1 : pPct) - (gPct == null ? 0 : gPct);

      return { a, gHit, pHit, gPct, pPct, score };
    }).sort((x, y) => y.score - x.score);

    const body = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.a)}</td>

        <td class="pea-n">${r.gHit}</td>
        <td class="pea-n">${gBase}</td>
        <td class="pea-n">${fmtPctOnly(r.gHit, gBase)}</td>

        <td class="pea-n">${r.pHit}</td>
        <td class="pea-n">${pBase}</td>
        <td class="pea-n">${fmtPctOnly(r.pHit, pBase)}</td>
      </tr>
    `).join("");

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:8px;">
        <strong>Base del scope:</strong> GANADA = ${gBase} día(s) | PERDIDA = ${pBase} día(s)<br>
        Cada “Día con bandera” cuenta 1 si la acción estuvo presente en el <strong>DURANTE canónico</strong> de ese día.
      </div>

      <table class="pea-table">
        <thead>
          <tr>
            <th>Acción bandera</th>

            <th>GANADA<br>Días con bandera</th>
            <th>GANADA<br>Días base</th>
            <th>GANADA<br>%</th>

            <th>PERDIDA<br>Días con bandera</th>
            <th>PERDIDA<br>Días base</th>
            <th>PERDIDA<br>%</th>
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>

      <div class="pea-metricas-secundarias" style="margin-top:8px;">
        Presencia/ausencia por día (no frecuencia). Co-ocurrencia con el resultado final del día.<br>
        No mide gravedad. No interpreta. No establece causalidad.<br>
        “—” significa que no hay base para ese resultado (por filtros / scope).
      </div>
    `;

    /* ===============================
       7) Semáforo (simple)
       =============================== */
    const totalDias = fechasConResultado.length;

    let semaforo = "🟡 Datos parciales";
    if (gBase >= 3 && pBase >= 3) semaforo = "🟢 Datos suficientes";
    if (gBase === 0 || pBase === 0) semaforo = "🔴 Datos insuficientes";

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
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

  // ✅ Extractor robusto: arrays + strings + campos “textuales”
  function extractAcciones(r) {
    const out = [];

    // 1) acciones_keys: []
    if (Array.isArray(r?.acciones_keys)) {
      r.acciones_keys.forEach((a) => a && out.push(String(a)));
      return uniqClean(out);
    }

    // 2) acciones: [] (array)
    if (Array.isArray(r?.acciones)) {
      r.acciones.forEach((a) => a && out.push(String(a)));
      return uniqClean(out);
    }

    // 3) acciones: "A, B, C" (string)
    if (typeof r?.acciones === "string" && r.acciones.trim()) {
      return uniqClean(splitAccionesString(r.acciones));
    }

    // 4) Campos textuales típicos (lo que suele verse como “Acción(es)”)
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
      r?.accion_str
    ].filter((x) => typeof x === "string" && x.trim());

    if (candidates.length) {
      candidates.forEach((s) => splitAccionesString(s).forEach((a) => out.push(a)));
      return uniqClean(out);
    }

    // 5) accion_key / accion (puede venir "A, B")
    const a1 = r?.accion_key ?? r?.accion ?? null;
    if (typeof a1 === "string" && a1.trim()) {
      return uniqClean(splitAccionesString(a1));
    }
    if (a1) out.push(String(a1));

    return uniqClean(out);
  }

  function splitAccionesString(s) {
    return String(s)
      // separadores comunes
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
