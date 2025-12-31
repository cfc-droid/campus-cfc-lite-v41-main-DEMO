/* =========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (CAMBIOS)
   Campus CFC LITE V41

   Nivel 4 — Salud, estructura y cambios
   Estadística 14/17

   Pregunta:
   “¿Qué cambió cuando marqué un momento estructural?”

   Base:
   - Detecta TRANSICIONES del campo momento_estructural
   - Compara tramo ANTES vs tramo DESPUÉS de cada cambio
   - Muestra:
     * Top 3 pensamientos (ANTES)
     * Top 3 acciones (DURANTE)

   Clave:
   - No interpreta
   - No aconseja
   - Solo muestra evidencia de cambio

   Reglas:
   - Usa SOLO registros filtrados (PEA_FILTERS.apply)
   - Excluye ANULADO (usa VALIDO y CORREGIDO)
   - No guarda estado
   - No toca HTML fuera de su contenedor
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

    // Orden cronológico ascendente para detectar cambios (transiciones)
    const ordered = [...valid].sort((a, b) => {
      const ta = getTimeKey(a);
      const tb = getTimeKey(b);
      return ta.localeCompare(tb);
    });

    // Construir tramos consecutivos por momento_estructural
    const segments = []; // [{ value, records: [...] }]
    ordered.forEach(r => {
      const v = normalizeMomentoEstructural(r?.momento_estructural);
      const last = segments[segments.length - 1];

      if (!last || last.value !== v) {
        segments.push({ value: v, records: [r] });
      } else {
        last.records.push(r);
      }
    });

    // Cambios = frontera entre segmentos consecutivos (A -> B)
    const transitions = [];
    for (let i = 1; i < segments.length; i++) {
      const prev = segments[i - 1];
      const curr = segments[i];

      // Si son iguales (debería no pasar) o ambos vacíos, saltar
      if (prev.value === curr.value) continue;

      // Evento = primer registro del tramo nuevo
      const eventRecord = curr.records[0] || null;
      transitions.push({
        from: prev.value,
        to: curr.value,
        eventFecha: safeText(eventRecord?.fecha) || "—",
        prevRecords: prev.records,
        currRecords: curr.records
      });
    }

    if (!transitions.length) {
      renderEmpty(box, "No se detectaron cambios de momento estructural en el universo filtrado.");
      return;
    }

    // Render por transición (bloques)
    const blocks = transitions.map((t, idx) => {
      const before = computeResumenTramo(t.prevRecords);
      const after = computeResumenTramo(t.currRecords);

      return `
        <div class="pea-cuadro-interno" style="margin-bottom:12px;">
          <div style="margin-bottom:8px;">
            <strong>Cambio #${idx + 1}</strong> — ${safeText(t.from)} → ${safeText(t.to)}
            <br>
            <span style="opacity:.85;">Fecha del cambio (primer registro del tramo nuevo): ${safeText(t.eventFecha)}</span>
          </div>

          <table class="pea-table">
            <thead>
              <tr>
                <th>Tramo</th>
                <th>Registros en tramo</th>
                <th>Top pensamientos (ANTES)</th>
                <th>Top acciones (DURANTE)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ANTES</td>
                <td>${before.total}</td>
                <td>${renderTopList(before.topPensamientos)}</td>
                <td>${renderTopList(before.topAcciones)}</td>
              </tr>
              <tr>
                <td>DESPUÉS</td>
                <td>${after.total}</td>
                <td>${renderTopList(after.topPensamientos)}</td>
                <td>${renderTopList(after.topAcciones)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    });

    const contenidoHTML = `
      <div class="pea-metricas-secundarias" style="margin-bottom:10px;">
        Se detectan cambios cuando <strong>momento_estructural</strong> cambia de valor
        en el flujo cronológico de registros (universo filtrado).<br>
        Para cada cambio se comparan los tramos consecutivos ANTES vs DESPUÉS,
        mostrando co-ocurrencias (Top 3) de Pensamiento (ANTES) y Acción (DURANTE).
      </div>

      ${blocks.join("")}
    `;

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 14,
      titulo: "Momentos estructurales (cambios)",
      totalRegistros: transitions.length,
      universo: "Tramos consecutivos por momento_estructural dentro del universo filtrado",
      criterios: [
        "Cambio = transición de momento_estructural entre registros consecutivos (orden cronológico)",
        "Comparación por tramos consecutivos (ANTES vs DESPUÉS del cambio)",
        "Pensamientos tomados de registros con momento = ANTES",
        "Acciones tomadas de registros con momento = DURANTE (acciones_keys)",
        "Solo registros VALIDO y CORREGIDO"
      ],
      contenidoHTML
    }));
  };

  /* =========================================================
     Cálculos locales (sin helpers globales)
     ========================================================= */

  function getRecordState(r) {
    // defensivo ante dataset heterogéneo
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

  function safeText(v) {
    if (v == null) return "";
    return String(v);
  }

  function getTimeKey(r) {
    // Preferir created_at_iso si existe (es el orden real de creación)
    const iso = safeText(r?.meta?.created_at_iso).trim();
    if (iso) return iso;

    // Fallback: fecha + momento + id (orden estable)
    const f = safeText(r?.fecha).trim();
    const m = safeText(r?.momento).trim();
    const id = safeText(r?.id).trim();
    return `${f}T00:00:00.000Z|${m}|${id}`;
  }

  function computeResumenTramo(records) {
    const list = Array.isArray(records) ? records : [];

    const pensamientos = [];
    const acciones = [];

    list.forEach(r => {
      if (r?.momento === "ANTES" && r?.pensamiento_key) {
        pensamientos.push(r.pensamiento_key);
      }

      if (r?.momento === "DURANTE" && Array.isArray(r?.acciones_keys)) {
        r.acciones_keys.forEach(a => {
          if (a) acciones.push(a);
        });
      }
    });

    return {
      total: list.length,
      topPensamientos: top3WithPercent(pensamientos),
      topAcciones: top3WithPercent(acciones)
    };
  }

  function top3WithPercent(values) {
    const arr = Array.isArray(values) ? values.filter(Boolean) : [];
    const total = arr.length;
    if (!total) return [];

    const map = {};
    arr.forEach(v => (map[v] = (map[v] || 0) + 1));

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key, count]) => ({
        key,
        count,
        percent: Math.round((count / total) * 100)
      }));
  }

  function renderTopList(items) {
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return "—";

    return list
      .map(i => `${safeText(i.key)} (${i.count} · ${i.percent}%)`)
      .join("<br>");
  }

  function renderEmpty(box, reason) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 14,
      titulo: "Momentos estructurales (cambios)",
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
