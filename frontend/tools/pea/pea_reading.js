/* ============================================================
   PEA READING — ORQUESTADOR DE HISTORIAL
   Sistema: Análisis (PEA)
   Bloque: 8/14 — Pantalla 3
   Rol: Lectura, filtrado y preparación de datos
   ============================================================ */

import { runPEAEngine } from "./pea_engine.js";
import { calculatePEAMetrics } from "./pea_metrics.js";

/**
 * Lee historial completo del usuario
 * @param {string} emailHash
 * @returns {Array<PEARecord>}
 */
export function loadFullPEALog(emailHash) {
  if (!emailHash) return [];

  const raw = localStorage.getItem(`CFC_PEA_LOG_${emailHash}`);
  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Aplica filtros arbitrarios sobre registros
 * @param {Array<PEARecord>} records
 * @param {Object} filters
 * @returns {Array<PEARecord>}
 */
export function applyPEAFilters(records, filters = {}) {
  return records.filter(r => {
    // Fecha
    if (filters.from || filters.to) {
      const t = new Date(r.createdAtISO).getTime();
      if (filters.from && t < new Date(filters.from).getTime()) return false;
      if (filters.to && t > new Date(filters.to).getTime()) return false;
    }

    // Momento
    if (filters.momento && r.momento !== filters.momento) return false;

    // Pensamiento
    if (
      filters.pensamiento &&
      r.P?.pensamientoKey !== filters.pensamiento
    ) return false;

    // Estado
    if (filters.estado && r.E?.estadoKey !== filters.estado) return false;

    // Acción
    if (
      filters.accion &&
      !r.A?.accionesKeys?.includes(filters.accion)
    ) return false;

    // Riesgo
    if (
      filters.riesgo &&
      r.computed?.riesgoLabel !== filters.riesgo
    ) return false;

    // Patrón
    if (
      filters.patron &&
      !r.computed?.patrones?.includes(filters.patron)
    ) return false;

    return true;
  });
}

/**
 * Garantiza que todos los registros tengan computed
 * @param {Array<PEARecord>} records
 * @returns {Array<PEARecord>}
 */
export function ensureComputed(records) {
  return records.map(r => {
    if (!r.computed) {
      return {
        ...r,
        computed: runPEAEngine(r)
      };
    }
    return r;
  });
}

/**
 * Flujo completo de lectura para Pantalla 3
 * @param {string} emailHash
 * @param {Object} filters
 * @returns {Object}
 */
export function getPEAReading(emailHash, filters = {}) {
  const fullLog = loadFullPEALog(emailHash);
  const withComputed = ensureComputed(fullLog);
  const filtered = applyPEAFilters(withComputed, filters);
  const metrics = calculatePEAMetrics(filtered);

  return {
    totalRegistros: filtered.length,
    registros: filtered,
    metrics
  };
}
