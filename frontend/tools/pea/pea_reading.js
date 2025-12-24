/* ============================================================
   PEA READING — CONTRATO DE LECTURA
   Sistema: Análisis (PEA)
   Bloque: 8/14 — Pantallas 2 y 3
   Rol: Leer vista filtrada SIN modificarla
   ============================================================

   REGLAS:
   - NO filtra
   - NO interpreta
   - NO calcula
   - NO muta datos
   - Solo lectura segura
   ============================================================ */

/**
 * Devuelve la vista filtrada actual del usuario
 * @param {string} emailHash
 * @returns {Object|null}
 */
export function readPEAView(emailHash) {
  if (!emailHash) return null;

  const key = `CFC_PEA_VIEW_${emailHash}`;
  const raw = localStorage.getItem(key);

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    // Validación mínima estructural
    if (
      !parsed ||
      parsed.source !== "FILTER" ||
      !Array.isArray(parsed.records)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Guarda una vista filtrada
 * (usado SOLO por filtros de Pantalla 3)
 * @param {string} emailHash
 * @param {Object} view
 */
export function savePEAView(emailHash, view) {
  if (!emailHash || !view) return;

  const key = `CFC_PEA_VIEW_${emailHash}`;
  localStorage.setItem(key, JSON.stringify(view));
}

/**
 * Limpia la vista activa
 * (opcional, para reset)
 * @param {string} emailHash
 */
export function clearPEAView(emailHash) {
  if (!emailHash) return;
  localStorage.removeItem(`CFC_PEA_VIEW_${emailHash}`);
}
