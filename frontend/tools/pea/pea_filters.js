/* ============================================================
   PEA FILTERS — FILTRADO ABSOLUTO
   Sistema: Análisis (PEA)
   Bloque: 8/14 — Pantalla 3
   Rol: Filtrar registros SIN interpretar
   ============================================================ */

import { savePEAView } from "./pea_view_storage.js";

/**
 * Aplica filtros arbitrarios sobre el log completo
 * @param {string} emailHash
 * @param {Array} log - Array de PEARecord (ya con computed)
 * @param {Object} filters - objeto libre de filtros
 * @returns {Array} registros filtrados
 */
export function applyPEAFilters(emailHash, log, filters = {}) {
  if (!emailHash || !Array.isArray(log)) return [];

  const result = log.filter(record => {
    if (!record) return false;

    /* =========================
       FECHA
       ========================= */
    if (filters.fromDate) {
      if (new Date(record.createdAtISO) < new Date(filters.fromDate)) {
        return false;
      }
    }

    if (filters.toDate) {
      if (new Date(record.createdAtISO) > new Date(filters.toDate)) {
        return false;
      }
    }

    /* =========================
       MOMENTO
       ========================= */
    if (filters.momento && record.momento !== filters.momento) {
      return false;
    }

    /* =========================
       PENSAMIENTO
       ========================= */
    if (
      filters.pensamiento &&
      record.P?.pensamientoKey !== filters.pensamiento
    ) {
      return false;
    }

    /* =========================
       ESTADO OPERATIVO
       ========================= */
    if (
      filters.estado &&
      record.E?.estadoKey !== filters.estado
    ) {
      return false;
    }

    /* =========================
       INTENSIDAD
       ========================= */
    if (filters.intensidadMin != null) {
      if (record.E?.intensidad < filters.intensidadMin) return false;
    }

    if (filters.intensidadMax != null) {
      if (record.E?.intensidad > filters.intensidadMax) return false;
    }

    /* =========================
       ACCIONES
       ========================= */
    if (filters.actionIncludes) {
      if (
        !record.A?.accionesKeys?.includes(filters.actionIncludes)
      ) {
        return false;
      }
    }

    if (filters.actionExcludes) {
      if (
        record.A?.accionesKeys?.includes(filters.actionExcludes)
      ) {
        return false;
      }
    }

    /* =========================
       RESULTADO
       ========================= */
    if (
      filters.resultado &&
      record.resultado !== filters.resultado
    ) {
      return false;
    }

    /* =========================
       RIESGO PLANIFICADO
       ========================= */
    if (
      filters.riesgoPlan &&
      record.riesgoPlanificado !== filters.riesgoPlan
    ) {
      return false;
    }

    /* =========================
       RIESGO OPERATIVO (LABEL)
       ========================= */
    if (
      filters.riesgoLabel &&
      record.computed?.riesgoLabel !== filters.riesgoLabel
    ) {
      return false;
    }

    /* =========================
       PATRÓN
       ========================= */
    if (filters.patron) {
      if (
        !record.computed?.patrones?.includes(filters.patron)
      ) {
        return false;
      }
    }

    /* =========================
       INSTRUMENTO
       ========================= */
    if (
      filters.instrumento &&
      record.instrumento !== filters.instrumento
    ) {
      return false;
    }

    /* =========================
       DIRECCIÓN
       ========================= */
    if (
      filters.direccion &&
      record.direccion !== filters.direccion
    ) {
      return false;
    }

    /* =========================
       NOTA (MATCH SIMPLE)
       ========================= */
    if (filters.noteIncludes) {
      if (
        !record.nota180 ||
        !record.nota180
          .toLowerCase()
          .includes(filters.noteIncludes.toLowerCase())
      ) {
        return false;
      }
    }

    /* =========================
       ID EXPLÍCITO (DEBUG)
       ========================= */
    if (filters.onlyIds) {
      if (!filters.onlyIds.includes(record.id)) {
        return false;
      }
    }

    return true;
  });

  /* =========================
     CONTRATO DE VISTA
     =========================
     - Se guardan SOLO IDs
     - No se guardan objetos
     - selectedId inicia en null
     ========================= */

  savePEAView(emailHash, {
    source: "FILTER",
    recordIds: result.map(r => r.id),
    appliedFilters: filters,
    selectedId: null
  });

  return result;
}
