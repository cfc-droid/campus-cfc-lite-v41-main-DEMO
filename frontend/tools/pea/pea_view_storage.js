/* ============================================================
   PEA VIEW STORAGE — CONTRATO DE VISTA
   Sistema: Análisis (PEA)
   Bloque: 8/14 — Pantallas 2 y 3
   Rol: Contrato único de vista (lectura segura)
   ============================================================

   REGLAS:
   - NO filtra
   - NO calcula
   - NO interpreta
   - NO muta registros
   - Mismo estado → misma lectura
   ============================================================ */

/**
 * Lee la vista activa del usuario
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

    // Validación estructural estricta
    if (
      !parsed ||
      parsed.source !== "FILTER" ||
      !Array.isArray(parsed.recordIds)
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
 * @param {string} emailHash
 * @param {Object} view
 *  Estructura esperada:
 *  {
 *    source: "FILTER",
 *    recordIds: [id1, id2, ...],
 *    appliedFilters: {},
 *    selectedId: string | null
 *  }
 */
export function savePEAView(emailHash, view) {
  if (!emailHash || !view) return;
  if (!Array.isArray(view.recordIds)) return;

  const key = `CFC_PEA_VIEW_${emailHash}`;
  localStorage.setItem(key, JSON.stringify(view));
}

/**
 * Limpia la vista activa
 * @param {string} emailHash
 */
export function clearPEAView(emailHash) {
  if (!emailHash) return;
  localStorage.removeItem(`CFC_PEA_VIEW_${emailHash}`);
}
