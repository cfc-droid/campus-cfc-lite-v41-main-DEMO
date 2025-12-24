/* ============================================================
   PEA ENGINE — ORQUESTADOR DETERMINISTA
   Sistema: Análisis (PEA)
   Bloque: 7/14 — Motor
   Rol: Orquestar módulos puros del motor
   ============================================================

   REGLAS ABSOLUTAS:
   - NO interpreta
   - NO decide
   - NO valida
   - NO modifica input
   - Mismo input → mismo output
   ============================================================ */

import { calculateRiskScore } from "./pea_risk_score.js";
import { detectPatterns } from "./pea_rules.js";
import { getCorrectiveActions } from "./pea_corrective_actions.js";

/**
 * Ejecuta el motor determinista completo
 * @param {Object} record - PEARecord (persistido, no formulario)
 * @returns {Object} computed
 */
export function runPEAEngine(record) {
  if (!record) {
    return {
      patrones: [],
      riesgoScore: null,
      riesgoLabel: "Evidencia insuficiente",
      accionesCorrectivas: []
    };
  }

  const riesgo = calculateRiskScore(record);
  const patrones = detectPatterns(record);
  const acciones = getCorrectiveActions(record, riesgo);

  return {
    patrones,
    riesgoScore: riesgo.score,
    riesgoLabel: riesgo.label,
    accionesCorrectivas: acciones
  };
}
