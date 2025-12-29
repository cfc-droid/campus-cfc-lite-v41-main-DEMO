/* =========================================================
   PEA — EXPORT EXCEL LIMPIO
   Archivo: pea_export_excel.js
   Rol: exportar datos crudos + filtros + métricas visibles
   Fuente: viewModel filtrado (inyectado)
   ========================================================= */

import { generatePEAHash } from "./pea_hash.js";

/**
 * @param {Object} viewModel
 * {
 *   records: Array<PEARecord>,
 *   filters: Object,
 *   metrics: Object
 * }
 */
export async function exportPEAExcel(viewModel) {
  if (!viewModel || !Array.isArray(viewModel.records)) {
    throw new Error("ViewModel inválido para export Excel");
  }

  const rows = [];

  // Header técnico
  rows.push([
    "EXPORT_TYPE",
    "PEA_EXPORT_LIMPIO"
  ]);

  rows.push([]);
  rows.push(["FILTROS APLICADOS"]);
  Object.entries(viewModel.filters || {}).forEach(([k, v]) => {
    rows.push([k, JSON.stringify(v)]);
  });

  rows.push([]);
  rows.push(["MÉTRICAS VISIBLES"]);
  Object.entries(viewModel.metrics || {}).forEach(([k, v]) => {
    rows.push([k, JSON.stringify(v)]);
  });

  rows.push([]);
  rows.push(["REGISTROS"]);

  // Encabezado de columnas
  rows.push([
    "id",
    "createdAtISO",
    "fecha",
    "momento",
    "activo",
    "instrumento",
    "direccion",
    "pensamiento_key",
    "estado_key",
    "intensidad",
    "acciones_keys",
    "nota_factual",
    "schema_version",
    "estado_registro"
  ]);

  // Filas de datos
  viewModel.records.forEach(r => {
    rows.push([
      r.id,
      r.createdAtISO,
      r.fecha,
      r.momento,
      r.activo || "",
      r.instrumento || "",
      r.direccion,
      r.P?.pensamiento_key || "",
      r.E?.estado_key || "",
      r.E?.intensidad ?? "",
      (r.A?.acciones_keys || []).join("|"),
      r.nota_factual || "",
      r.meta?.schema_version || "",
      r.meta?.estado || ""
    ]);
  });

  const csvContent = rows
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const hash = await generatePEAHash(csvContent);

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  return {
    url,
    filename: `PEA_EXPORT_LIMPIO_${new Date().toISOString()}.csv`,
    hash
  };
}
