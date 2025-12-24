/* ============================================================
   PEA METRICS — MÉTRICAS AGREGADAS
   Sistema: Análisis (PEA)
   Bloque: 8/14 — Pantalla 3
   Rol: Calcular métricas sin interpretación
   ============================================================ */

/**
 * Calcula métricas agregadas sobre registros filtrados
 * @param {Array} records - Array de PEARecord
 * @returns {Object}
 */
export function calculatePEAMetrics(records) {
  if (!Array.isArray(records) || records.length === 0) {
    return {
      patronMasRepetido: "—",
      estadoDominante: "—",
      accionMasCostosa: "—",
      riesgoPromedio: "—"
    };
  }

  const patronCount = {};
  const estadoCount = {};
  const accionCount = {};
  let riesgoTotal = 0;
  let riesgoN = 0;

  records.forEach(r => {
    // Patrones
    (r.computed?.patrones || []).forEach(p => {
      patronCount[p] = (patronCount[p] || 0) + 1;
    });

    // Estado
    if (r.E?.estadoKey) {
      estadoCount[r.E.estadoKey] = (estadoCount[r.E.estadoKey] || 0) + 1;
    }

    // Acción más costosa
    const a = r.A?.accionMasCostosa;
    if (a) {
      accionCount[a] = (accionCount[a] || 0) + 1;
    }

    // Riesgo promedio
    if (typeof r.computed?.riesgoScore === "number") {
      riesgoTotal += r.computed.riesgoScore;
      riesgoN++;
    }
  });

  return {
    patronMasRepetido: getMaxKey(patronCount),
    estadoDominante: getMaxKey(estadoCount),
    accionMasCostosa: getMaxKey(accionCount),
    riesgoPromedio: riesgoN ? (riesgoTotal / riesgoN).toFixed(2) : "—"
  };
}

/* =========================
   HELPERS
   ========================= */

function getMaxKey(map) {
  let maxKey = "—";
  let maxVal = 0;

  for (const key in map) {
    if (map[key] > maxVal) {
      maxVal = map[key];
      maxKey = key;
    }
  }

  return maxKey;
}
