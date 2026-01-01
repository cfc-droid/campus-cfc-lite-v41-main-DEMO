/* =========================================================
   STAT 14 — MOMENTOS ESTRUCTURALES (PAE + RESULTADO)
   Campus CFC LITE V41
   ========================================================= */

(function () {
  window.renderStat_14_momentos_estructurales_cambios = function () {
    const box = document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    const valid = filtered.filter(r => {
      const st = getRecordState(r);
      return st === "VALIDO" || st === "CORREGIDO";
    });

    if (!valid.length) {
      renderEmpty(box, "No hay registros válidos en el universo filtrado.");
      return;
    }

    const ordered = [...valid].sort((a, b) => getTimeKey(a).localeCompare(getTimeKey(b)));

    const segments = [];
    ordered.forEach(r => {
      const v = normalizeMomentoEstructural(r?.momento_estructural);
      const last = segments[segments.length - 1];
      if (!last || last.value !== v) segments.push({ value: v, records: [r] });
      else last.records.push(r);
    });

    const cardsData = segments.map((seg, idx) =>
      buildMomentCardData(seg.value, seg.records, idx + 1)
    );

    const contenidoHTML = renderRailUI(cardsData);

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 4,
      indice: 14,
      titulo: "Momentos estructurales (PAE + resultado)",
      totalRegistros: cardsData.length,
      universo: "Registros filtrados segmentados por tramos consecutivos",
      criterios: [
        "Solo VALIDO y CORREGIDO",
        "Resultado heredado desde DESPUÉS",
        "PAE asociado por fecha",
        "Rail horizontal"
      ],
      contenidoHTML
    }));

    wireStat14UI();
  };

  /* ===================== DATA ===================== */

  function buildMomentCardData(momentoValue, records, idx) {
    const fechas = records.map(r => r.fecha).filter(Boolean);
    const start = minDateISO(fechas) || "—";
    const end = maxDateISO(fechas) || "—";
    const dias = new Set(fechas).size;

    const resultByFecha = {};
    records.forEach(r => {
      if (normalizeMomento(r.momento) === "DESPUES") {
        const f = r.fecha;
        const res = normalizeResultadoOperativo(getResultadoAny(r));
        if (f) resultByFecha[f] = res;
      }
    });

    const despues = records.filter(r => normalizeMomento(r.momento) === "DESPUES");
    const dist = countBy(despues, r => normalizeResultadoOperativo(getResultadoAny(r)));

    const intensidadVals = despues
      .map(r => Number(r.intensidad))
      .filter(v => Number.isFinite(v));

    return {
      idx,
      momento: momentoValue,
      start,
      end,
      dias,
      capa2: {
        out: {
          GANADA: dist.GANADA || 0,
          PERDIDA: dist.PERDIDA || 0,
          BE: dist.BE || 0,
          NA: dist.NA || 0,
          TOTAL: despues.length
        },
        intensidadProm: intensidadVals.length ? avg(intensidadVals) : null,
        picos: intensidadVals.length
          ? Math.round((intensidadVals.filter(v => v >= 4).length / intensidadVals.length) * 100)
          : null
      },
      capa3: {
        GANADAS: buildPAEFor("GANADA", records, resultByFecha),
        PERDIDAS: buildPAEFor("PERDIDA", records, resultByFecha)
      }
    };
  }

  function buildPAEFor(target, records, resultByFecha) {
    const dias = Object.keys(resultByFecha).filter(f => resultByFecha[f] === target);

    const pensamientos = [];
    const acciones = [];
    const estados = [];

    records.forEach(r => {
      const f = r.fecha;
      if (!dias.includes(f)) return;

      const m = normalizeMomento(r.momento);

      if (m === "ANTES" && r.pensamiento) pensamientos.push(r.pensamiento);
      if (m === "DURANTE") {
        (r.acciones_keys || r.acciones || []).forEach(a => acciones.push(a));
      }
      if (m === "DESPUES") {
        estados.push(r.estado || r.emocion);
      }
    });

    return {
      totalDias: dias.length,
      topPensamientos: topNWithPercent(pensamientos, 3),
      topAcciones: topNWithPercent(acciones, 3),
      topEstados: topNWithPercent(estados, 3)
    };
  }

  /* ===================== HELPERS ===================== */

  function normalizeMomento(v) {
    return safeText(v)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();
  }

  function normalizeResultadoOperativo(v) {
    const s = safeText(v).toUpperCase();
    return ["GANADA", "PERDIDA", "BE"].includes(s) ? s : "NA";
  }

  function getResultadoAny(r) {
    return r?.resultado_operativo || r?.resultado || r?.resultado_key;
  }

  function safeText(v) {
    return v == null ? "" : String(v);
  }

  function countBy(arr, fn) {
    const m = {};
    arr.forEach(x => {
      const k = fn(x);
      m[k] = (m[k] || 0) + 1;
    });
    return m;
  }

  function topNWithPercent(arr, n) {
    if (!arr.length) return [];
    const total = arr.length;
    const map = {};
    arr.forEach(v => map[v] = (map[v] || 0) + 1);
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([key, count]) => ({
        key,
        count,
        percent: Math.round((count / total) * 100)
      }));
  }

  function avg(a) {
    return a.reduce((s, v) => s + v, 0) / a.length;
  }

  function minDateISO(a) {
    return [...a].sort()[0];
  }

  function maxDateISO(a) {
    return [...a].sort().slice(-1)[0];
  }

})();
