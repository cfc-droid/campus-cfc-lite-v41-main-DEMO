/* ============================================================
   PEA PRIMARY READING — BLOQUE 8.5 / 14
   Rol: Cálculo de repetición conductual (NO interpretativo)
   ============================================================ */

function groupBy(array, keyFn) {
  const map = {};
  array.forEach(item => {
    const k = keyFn(item);
    if (!k) return;
    map[k] = (map[k] || 0) + 1;
  });
  return map;
}

function topN(map, n = 3) {
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

function percentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function splitByResult(records) {
  return {
    GANANCIA: records.filter(r => r?.resultado === "Ganancia"),
    PERDIDA: records.filter(r => r?.resultado === "Pérdida")
  };
}

function primaryReading(records) {
  const valid = records.filter(
    r => (r?.meta?.estado || "VALIDO") !== "ANULADO"
  );

  if (!valid.length) return null;

  const byResult = splitByResult(valid);

  function calcFor(records, momento, field) {
    const subset = records.filter(r => r?.momento === momento);
    const total = subset.length;
    const map = groupBy(subset, r => r[field]);
    const top = topN(map, 3);

    return {
      total,
      top: top.map(t => ({
        key: t.key,
        count: t.count,
        pct: percentage(t.count, total)
      }))
    };
  }

  return {
    GANADORAS: {
      ANTES: calcFor(byResult.GANANCIA, "ANTES", "pensamiento_key"),
      DURANTE: calcFor(byResult.GANANCIA, "DURANTE", "acciones_keys"),
      DESPUES: calcFor(byResult.GANANCIA, "DESPUÉS", "estado_key")
    },
    PERDEDORAS: {
      ANTES: calcFor(byResult.PERDIDA, "ANTES", "pensamiento_key"),
      DURANTE: calcFor(byResult.PERDIDA, "DURANTE", "acciones_keys"),
      DESPUES: calcFor(byResult.PERDIDA, "DESPUÉS", "estado_key")
    }
  };
}

/* =========================
   API PÚBLICA
   ========================= */

window.PEA_PRIMARY_READING = {
  calculate(records) {
    return primaryReading(records);
  }
};
