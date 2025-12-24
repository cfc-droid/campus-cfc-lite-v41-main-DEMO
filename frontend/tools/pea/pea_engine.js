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
  // Regla de nulos: sin input suficiente → salida técnica, sin lectura
  if (!record) {
    return {
      patrones: [],
      riesgoScore: null,
      riesgoLabel: "Evidencia insuficiente",
      accionesCorrectivas: []
    };
  }

  // 1) Riesgo (score + label)
  const riesgo = calculateRiskScore(record);
  const riesgoScore =
    riesgo && typeof riesgo.score === "number" ? riesgo.score : null;
  const riesgoLabel =
    riesgo && typeof riesgo.label === "string" ? riesgo.label : "Evidencia insuficiente";

  // 2) Patrones (array)
  const patrones = Array.isArray(record?.computed?.patrones)
    ? record.computed.patrones
    : detectPatterns(record);

  // 3) Acciones correctivas (REGLAS) — usa firma correcta del módulo
  const accionesCorrectivas = getCorrectiveActions({
    riesgoLabel,
    patrones
  });

  return {
    patrones,
    riesgoScore,
    riesgoLabel,
    accionesCorrectivas
  };
}
