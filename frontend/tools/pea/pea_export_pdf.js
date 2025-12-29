/* =========================================================
   PEA — EXPORT PDF LEGAL
   Archivo: pea_export_pdf.js
   Rol: exportar PDF legal solo lectura
   Fuente: viewModel filtrado (inyectado)
   ========================================================= */

import { generatePEAHash } from "./pea_hash.js";

export async function exportPEAPDF(viewModel) {
  if (!viewModel || !Array.isArray(viewModel.records)) {
    throw new Error("ViewModel inválido para export PDF");
  }

  const exportTime = new Date().toISOString();

  const payload = {
    export_type: "PEA_EXPORT_PDF_LEGAL",
    export_time: exportTime,
    filters: viewModel.filters || {},
    metrics: viewModel.metrics || {},
    records: viewModel.records
  };

  const serialized = JSON.stringify(payload, null, 2);
  const hash = await generatePEAHash(serialized);

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>PEA — Export Legal</title>
<style>
body { font-family: Arial, sans-serif; font-size: 12px; }
h1, h2 { margin-bottom: 6px; }
table { border-collapse: collapse; width: 100%; margin-top: 10px; }
td, th { border: 1px solid #000; padding: 4px; font-size: 11px; }
</style>
</head>
<body>

<h1>ANÁLISIS (PEA) — EXPORT LEGAL</h1>
<p>Fecha de exportación: ${exportTime}</p>
<p>Hash de integridad (SHA-256): ${hash}</p>

<h2>Filtros aplicados</h2>
<pre>${JSON.stringify(viewModel.filters || {}, null, 2)}</pre>

<h2>Métricas visibles</h2>
<pre>${JSON.stringify(viewModel.metrics || {}, null, 2)}</pre>

<h2>Registros</h2>
<table>
<thead>
<tr>
<th>Fecha</th>
<th>Momento</th>
<th>Pensamiento</th>
<th>Estado</th>
<th>Int.</th>
<th>Acciones</th>
<th>Dirección</th>
<th>Nota</th>
<th>Estado reg.</th>
</tr>
</thead>
<tbody>
${viewModel.records.map(r => `
<tr>
<td>${r.fecha}</td>
<td>${r.momento}</td>
<td>${r.P?.pensamiento_key || ""}</td>
<td>${r.E?.estado_key || ""}</td>
<td>${r.E?.intensidad ?? ""}</td>
<td>${(r.A?.acciones_keys || []).join(", ")}</td>
<td>${r.direccion}</td>
<td>${r.nota_factual || ""}</td>
<td>${r.meta?.estado || ""}</td>
</tr>
`).join("")}
</tbody>
</table>

</body>
</html>
`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  return {
    url,
    filename: `PEA_EXPORT_LEGAL_${exportTime}.html`,
    hash
  };
}
