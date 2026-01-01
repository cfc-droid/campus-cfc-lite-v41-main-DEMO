/* =========================================================
   STAT 15 — ACCIONES CRÍTICAS POR RESULTADO (BANDERAS)
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 4/4 (operativo directo)
   Estadística 15/17

   OBJETIVO (simple y entendible):
   - En las fechas del filtro (scope), mirar por cada DÍA:
       1) Cómo terminó el día (DESPUÉS canónico): GANADA o PERDIDA
       2) Si en ese día apareció una “acción bandera” en ALGÚN registro DURANTE
   - Cuenta presencia/ausencia por día (NO frecuencia):
       "¿Apareció al menos una vez ese día?" -> 1 / 0

   ¿Qué se muestra?
   - Para cada bandera:
       - GANADA: Días con bandera / Días base (y %)
       - PERDIDA: Días con bandera / Días base (y %)
   - "Días base" = 100% (siempre). Por eso lo mostramos explícito.

   FIX CLAVE (para que funcione con filtros):
   - Los filtros definen el SCOPE de FECHAS
   - El DESPUÉS canónico se busca en ALL (sin filtros) pero SOLO para esas fechas

   FIX CLAVE (para NO confundir con ceros “raros”):
   - Antes: se tomaba solo 1 DURANTE canónico (muy estricto) => muchos 0%
   - Ahora: se considera "DÍA CON BANDERA" si la acción aparece en
           CUALQUIER registro DURANTE de ese día (más humano y útil)

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
      (Array.isArray(window.PEA_STAT15_BANDERAS) && window.PEA_STAT15_BANDERAS.length)
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
       - Si el filtro deja vacío, caer a ALL
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
      renderEmpty(box, "No hay DESPUÉS con resultado GANADA/PERDIDA dentro del scope de fechas.");
      return;
    }

    /* ===============================
       4) Acciones DURANTE por fecha (TODOS los DURANTE del día)
       - Para cada fecha, armamos un set con TODAS las acciones vistas en DURANTE
       - Si un día no tiene DURANTE, queda vacío (y lo reportamos)
       =============================== */
    const accionesDurantePorFecha = {}; // { "YYYY-MM-DD": Set(normalizedAction) }
    let diasSinDurante = 0;

    fechasConResultado.forEach((fecha) => {
      const durantes = allValid.filter(
        (r) =>
          safeText(r?.fecha).trim() === fecha &&
          normalizeMomento(r?.momento) === "DURANTE"
      );

      if (!durantes.length) {
        diasSinDurante++;
        accionesDurantePorFecha[fecha] = new Set();
        return;
      }

      const setAcc = new Set();
      durantes.forEach((rec) => {
        const acciones = extractAcciones(rec);
        acciones.forEach((a) => {
          const n = normalizeText(a);
          if (n) setAcc.add(n);
        });
      });

      accionesDurantePorFecha[fecha] = setAcc;
    });

    /* ===============================
       5) Base por día (presencia/ausencia)
       - "Día con bandera" = la bandera aparece en CUALQUIER DURANTE del día
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

      const accionesSet = accionesDurantePorFecha[fecha] || new Set();

      // Match robusto por normalización (presencia/ausencia por día)
      BANDERAS_N.forEach((bn) => {
        if (accionesSet.has(bn)) {
          const original = banderaByNorm.get(bn);
          if (original) base[res].hit[original] = (base[res].hit[original] || 0) + 1;
        }
      });
    });

    /* ===============================
       6) Render tabla CLARA (para APB)
       - "Días base" se muestra como 100% explícito
       - Cuando no hay base, mostramos "—" (no 0%)
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

    function fmtBase(t) {
      // Mostramos claramente que base = 100% del universo para ese resultado
      return t ? `${t} (100%)` : "0 (—)";
    }

    const rows = BANDERAS.map((a) => {
      const gHit = base.GANADA.hit[a] || 0;
      const pHit = base.PERDIDA.hit[a] || 0;

      const gPct = pctInt(gHit, gBase);
      const pPct = pctInt(pHit, pBase);

      // Orden por "señal" (más útil): PERDIDA alto y GANADA bajo primero
      const score = (pPct == null ? -1 : pPct) - (gPct == null ? 0 : gPct);

      const presentAny = (gHit + pHit) > 0;

      return { a, gHit, pHit, gPct, pPct, score, presentAny };
    })
      // Primero las que aparecen al menos una vez en el scope, luego el resto (para menos ruido)
      .sort((x, y) => {
        if (x.presentAny !== y.presentAny) return (y.presentAny ? 1 : 0) - (x.presentAny ? 1 : 0);
        return (y.score - x.score);
      });

    const body = rows.map(r => `
      <tr style="${r.presentAny ? "" : "opacity:.65;"}">
        <td>${escapeHtml(r.a)}</td>

        <td class="pea-n">${r.gHit}</td>
        <td class="pea-n">${fmtBase(gBase)}</td>
        <td class="pea-n">${fmtPctOnly(r.gHit, gBase)}</td>

        <td class="pea-n">${r.pHit}</td>
        <td class="pea-n">${fmtBase(pBase)}</td>
        <td class="pea-n">${fmtPctOnly(r.pHit, pBase)}</td>
      </tr>
    `).join("");

    const totalDias = fechasConResultado.length;

    // Mensajes ultra claros
    const msgDurante = (diasSinDurante > 0)
      ? `⚠️ ${diasSinDurante} día(s) no tienen registros DURANTE en el scope. En esos días, ninguna bandera puede “aparecer”.`
      : `✅ Todos los días del scope tienen al menos un registro DURANTE.`;

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        <strong>Cómo leerlo (en 1 línea):</strong> “De los días que terminaron GANADA/PERDIDA, ¿en cuántos apareció cada bandera en algún DURANTE?”<br>
        <strong>Base del scope:</strong> GANADA = ${gBase} día(s) | PERDIDA = ${pBase} día(s) | Total días con resultado = ${totalDias} día(s)<br>
        ${escapeHtml(msgDurante)}
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

      <div class="pea-metricas-secundarias" style="margin-top:10px;">
        <strong>Importante:</strong> esto mide <em>presencia/ausencia por día</em> (no cuántas veces pasó).<br>
        No interpreta. No establece causalidad.<br>
        “—” significa que no hay base para ese resultado en el scope actual (por filtros).
      </div>
    `;

    /* ===============================
       7) Semáforo (simple y honesto)
       =============================== */
    let semaforo = "🟡 Datos parciales";
    // suficiente si hay al menos 3 días en cada lado
    if (gBase >= 3 && pBase >= 3) semaforo = "🟢 Datos suficientes";
    // insuficiente si falta un lado
    if (gBase === 0 || pBase === 0) semaforo = "🔴 Datos insuficientes";

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 15,
      titulo: "Acciones críticas por resultado (banderas)",
      totalRegistros: totalDias,
      universo: "Scope por filtros (fechas). Resultado = DESPUÉS (último). Banderas = aparece en cualquier DURANTE del día.",
      criterios: [
        `Banderas: ${BANDERAS.length} (lista fija)`,
        "Presencia/ausencia por día (no frecuencia)",
        "Resultado del día = último DESPUÉS (GANADA/PERDIDA)",
        "Bandera del día = aparece en cualquier DURANTE",
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
      r?.accion_str,
      // extra defensivo
      r?.accion_display,
      r?.accion_label,
      r?.acciones_resumen
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
