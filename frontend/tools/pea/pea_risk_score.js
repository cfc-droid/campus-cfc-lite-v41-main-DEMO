/* ============================================================
   PEA RISK SCORE — CÁLCULO DETERMINISTA
   Sistema: Análisis (PEA)
   Bloque: 7/14 — Motor
   Rol: Calcular score y label de riesgo operativo
   ============================================================

   REGLAS:
   - Input: PEARecord completo
   - Output: { score, label }
   - Mismo input → mismo output
   - Sin interpretación humana
   ============================================================ */

export function calculateRiskScore(record) {
  if (!record || !record.P || !record.E || !record.A) {
    return {
      score: null,
      label: "Evidencia insuficiente"
    };
  }

  let score = 0;

  // Plan definido
  if (record.P.planDefinido === false) score += 2;

  const acciones = record.A.accionesKeys || [];

  if (acciones.includes("Aumenté tamaño")) score += 2;
  if (acciones.includes("Moví stop")) score += 2;
  if (acciones.includes("Dejé correr pérdida")) score += 2;
  if (acciones.includes("Entré tarde") || acciones.includes("Entré antes")) score += 1;
  if (acciones.includes("Re-entré sin señal")) score += 1;

  // Intensidad emocional
  if (record.E.intensidad >= 4) score += 1;

  // Cumplimiento de plan reduce riesgo
  if (acciones.includes("Cumplí plan")) score -= 2;

  // Traducción score → label
  let label = "Bajo";

  if (score >= 7) label = "Crítico";
  else if (score >= 4) label = "Alto";
  else if (score >= 2) label = "Medio";

  return {
    score,
    label
  };
}
