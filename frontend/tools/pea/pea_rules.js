/* ============================================================
   PEA RULES — DETECCIÓN DE PATRONES (SI / ENTONCES)
   Sistema: Análisis (PEA)
   Bloque: 7/14 — Motor
   Rol: Detectar patrones operativos repetidos
   ============================================================

   REGLAS:
   - Input: PEARecord completo
   - Output: Array de patrones (máx. 2)
   - Ordenados por severidad
   - Mismo input → mismo output
   - Sin lenguaje humano
   ============================================================ */

export function detectPatterns(record) {
  if (!record || !record.P || !record.E || !record.A) {
    return [];
  }

  const patterns = [];
  const pensamiento = record.P.pensamientoKey;
  const acciones = record.A.accionesKeys || [];
  const intensidad = record.E.intensidad || 0;

  /* =========================
     PATRÓN: PERSECUCIÓN DE PRECIO
     ========================= */
  if (
    pensamiento === "Si espero pierdo la entrada" &&
    acciones.includes("Entré tarde")
  ) {
    patterns.push("Persecución de precio");
  }

  /* =========================
     PATRÓN: SOBREOPERACIÓN
     ========================= */
  if (
    acciones.includes("Re-entré sin señal") &&
    intensidad >= 4
  ) {
    patterns.push("Sobreoperación");
  }

  /* =========================
     PATRÓN: RUPTURA DE PLAN
     ========================= */
  if (
    record.P.planDefinido === true &&
    !acciones.includes("Cumplí plan")
  ) {
    patterns.push("Ruptura de plan");
  }

  /* =========================
     REGLAS FINALES
     ========================= */

  // Máximo 2 patrones
  return patterns.slice(0, 2);
}
