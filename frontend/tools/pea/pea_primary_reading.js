/* ============================================================
   PEA PRIMARY READING — BLOQUE 8.5 / 14
   Rol: Cálculo PURO de repetición conductual
   Naturaleza: Fija · Automática · No interpretativa

   REGLAS ABSOLUTAS:
   - NO une registros
   - NO analiza operaciones
   - NO analiza días
   - NO interpreta
   - NO genera texto humano
   - SOLO frecuencia y porcentaje
   ============================================================ */

import {
  PEA_ACCIONES
} from "./pea_catalog.js";

/* =========================
   UTILIDADES PURAS
   ========================= */

function groupBy(arr, keyFn) {
  const map = {};
  arr.forEach(item => {
    const key = keyFn(item);
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });
  return map;
}

function frequencyMap(arr) {
  const map = {};
  arr.forEach(v => {
    map[v] = (map[v] || 0) + 1;
  });
  return map;
}

function topNFromFrequency(freqMap, n = 3) {
  return Object.entries(freqMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, count]) => ({ key, count }));
}

function percent(part, total) {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

/* =========================
   FILTROS DUROS DE BLOQUE 8.5
   ========================= */

function isGanadora(r) {
  return r.resultado === "Ganancia";
}

function isPerdedora(r) {
  return r.resultado === "Pérdida";
}

/* =========================
   CÁLCULO POR MOMENTO
   ========================= */

function calculateAntes(records) {
  const values = records.map(r => r.pensamiento_key).filter(Boolean);
  const freq = frequencyMap(values);
  const total = values.length;

  return {
    total,
    dominante: topNFromFrequency(freq, 1)[0] || null,
    top3: topNFromFrequency(freq, 3),
    porcentajes: Object.fromEntries(
      Object.entries(freq).map(([k, v]) => [k, percent(v, total)])
    )
  };
}

function calculateDurante(records) {
  const acciones = records.flatMap(r => r.acciones_keys || []);
  const freq = frequencyMap(acciones);
  const total = acciones.length;

  return {
    total,
    dominante: topNFromFrequency(freq, 1)[0] || null,
    top3: topNFromFrequency(freq, 3),
    porcentajes: Object.fromEntries(
      Object.entries(freq).map(([k, v]) => [k, percent(v, total)])
    )
  };
}

function calculateDespues(records) {
  const estados = records.map(r => r.estado_key).filter(Boolean);
  const intensidades = records.map(r => r.intensidad).filter(Boolean);

  const freqEstados = frequencyMap(estados);
  const freqIntensidad = frequencyMap(intensidades);

  const total = estados.length;
  const intensidadesAltas = intensidades.filter(i => i >= 4).length;

  return {
    total,
    estado_dominante: topNFromFrequency(freqEstados, 1)[0] || null,
    distribucion_intensidad: freqIntensidad,
    porcentaje_intensidad_alta: percent(intensidadesAltas, intensidades.length)
  };
}

/* =========================
   MÉTRICAS OBJETIVAS EXTRA
   ========================= */

function calculateConsistencia(records) {
  const total = records.length;
  const cumplioPlan = records.filter(r =>
    (r.acciones_keys || []).includes("Cumplí plan")
  ).length;

  return percent(cumplioPlan, total);
}

function calculateDesviacionRiesgo(records) {
  const desviaciones = [
    "Moví stop",
    "Aumenté tamaño",
    "No respeté tamaño"
  ];

  const total = records.length;
  const count = records.filter(r =>
    (r.acciones_keys || []).some(a => desviaciones.includes(a))
  ).length;

  return percent(count, total);
}

function calculateInterferencia(records) {
  const total = records.length;

  const interferidos = records.filter(r =>
    r.intensidad >= 4 &&
    (r.acciones_keys || []).some(a => !PEA_ACCIONES.includes(a))
  ).length;

  return percent(interferidos, total);
}

/* =========================
   FUNCIÓN PRINCIPAL (EXPORT)
   ========================= */

export function calculatePrimaryReading(allRecords = []) {
  // BE y NA quedan fuera
  const ganadoras = allRecords.filter(isGanadora);
  const perdedoras = allRecords.filter(isPerdedora);

  if (ganadoras.length === 0 && perdedoras.length === 0) {
    return {
      hasData: false
    };
  }

  const byMomentoGanadoras = groupBy(ganadoras, r => r.momento);
  const byMomentoPerdedoras = groupBy(perdedoras, r => r.momento);

  return {
    hasData: true,

    GANADORAS: {
      ANTES: calculateAntes(byMomentoGanadoras["ANTES"] || []),
      DURANTE: calculateDurante(byMomentoGanadoras["DURANTE"] || []),
      DESPUES: calculateDespues(byMomentoGanadoras["DESPUÉS"] || []),

      consistencia: calculateConsistencia(ganadoras),
      desviacion_riesgo: calculateDesviacionRiesgo(ganadoras),
      interferencia: calculateInterferencia(ganadoras)
    },

    PERDEDORAS: {
      ANTES: calculateAntes(byMomentoPerdedoras["ANTES"] || []),
      DURANTE: calculateDurante(byMomentoPerdedoras["DURANTE"] || []),
      DESPUES: calculateDespues(byMomentoPerdedoras["DESPUÉS"] || []),

      consistencia: calculateConsistencia(perdedoras),
      desviacion_riesgo: calculateDesviacionRiesgo(perdedoras),
      interferencia: calculateInterferencia(perdedoras)
    }
  };
}
