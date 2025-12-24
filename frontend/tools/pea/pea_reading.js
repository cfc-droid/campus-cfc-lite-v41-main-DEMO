/* ============================================================
   PEA READING — ORQUESTADOR DE LECTURA
   Sistema: Análisis (PEA)
   Bloque: 8/14 — Pantalla 3
   Rol: Lectura y preparación de datos (SIN mutaciones)
   ============================================================

   REGLAS:
   - NO filtra
   - NO guarda vistas
   - NO interpreta
   - NO decide navegación
   - NO muta registros persistidos
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
 * Garantiza que todos los registros tengan campo computed
 * @param {Array<PEARecord>} records
 * @returns {Array<PEARecord>}
 */
export function ensureComputed(records) {
  if (!Array.isArray(records)) return [];

  return records.map(r => {
    if (!r) return r;

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
 * Calcula métricas agregadas sobre un subconjunto de registros
 * @param {Array<PEARecord>} records
 * @returns {Object}
 */
export function computeMetrics(records) {
  return calculatePEAMetrics(records);
}

/**
 * Flujo de lectura base para Pantalla 3
 * @param {string} emailHash
 * @returns {Object}
 */
export function getPEAReading(emailHash) {
  const fullLog = loadFullPEALog(emailHash);
  const withComputed = ensureComputed(fullLog);

  return {
    totalRegistros: withComputed.length,
    registros: withComputed,
    metrics: calculatePEAMetrics(withComputed)
  };
}
