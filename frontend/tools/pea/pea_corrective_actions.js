/* ============================================================
   PEA CORRECTIVE ACTIONS — REGLAS OPERATIVAS
   Sistema: Análisis (PEA)
   Bloque: 7/14 — Motor
   Rol: Traducir riesgo + patrones en reglas explícitas
   ============================================================

   PRINCIPIOS:
   - NO consejos
   - NO coaching
   - NO interpretación humana
   - Reglas operativas explícitas
   - Mismo input → mismo output
   ============================================================ */

export function getCorrectiveActions({ riesgoLabel, patrones }) {
  const actions = [];

  if (!riesgoLabel) {
    return [];
  }

  /* =========================
     REGLAS POR NIVEL DE RIESGO
     ========================= */

  if (riesgoLabel === "Crítico") {
    actions.push(
      "Bloqueo operativo recomendado hasta cumplir plan completo"
    );
  }

  if (riesgoLabel === "Alto") {
    actions.push(
      "Reducir riesgo planificado al siguiente nivel inferior"
    );
  }

  if (riesgoLabel === "Medio") {
    actions.push(
      "Operar solo configuraciones con validación completa"
    );
  }

  /* =========================
     REGLAS POR PATRÓN DETECTADO
     ========================= */

  if (patrones.includes("Persecución de precio")) {
    actions.push(
      "Regla de invalidación: si se pierde timing, no se persigue precio"
    );
  }

  if (patrones.includes("Sobreoperación")) {
    actions.push(
      "Límite operativo: máximo 1 operación por sesión en estado ≥ 4"
    );
  }

  if (patrones.includes("Ruptura de plan")) {
    actions.push(
      "Bloqueo: operar solo con checklist de plan completo"
    );
  }

  /* =========================
     ORDEN FINAL
     =========================
     Prioridad implícita:
     1. Bloqueos
     2. Riesgo
     3. Entrada
     ========================= */

  return actions;
}
