/* =========================================================
   PEA — EXPORT AUDITORÍA COMPLETA
   Archivo: pea_export_audit.js
   Rol: generar ZIP con todos los exports + hash
   ========================================================= */

import { exportPEAExcel } from "./pea_export_excel.js";
import { exportPEAPDF } from "./pea_export_pdf.js";
import { exportPEAWord } from "./pea_export_word.js";
import { generatePEAHash } from "./pea_hash.js";

/**
 * @param {Object} viewModel
 * @param {Function} zipBuilder
 * zipBuilder = función externa ya existente que:
 *  - create()
 *  - addFile(name, blob|string)
 *  - finalize() => Blob
 */
export async function exportPEAAudit(viewModel, zipBuilder) {
  if (!viewModel || !Array.isArray(viewModel.records)) {
    throw new Error("ViewModel inválido para auditoría");
  }

  if (!zipBuilder) {
    throw new Error("ZIP builder no disponible");
  }

  const zip = zipBuilder.create();

  // Excel limpio
  const excel = await exportPEAExcel(viewModel);
  const excelBlob = await fetch(excel.url).then(r => r.blob());
  zip.addFile(excel.filename, excelBlob);

  // PDF legal
  const pdf = await exportPEAPDF(viewModel);
  const pdfBlob = await fetch(pdf.url).then(r => r.blob());
  zip.addFile(pdf.filename, pdfBlob);

  // Word legal
  const word = await exportPEAWord(viewModel, "LEGAL");
  const wordBlob = await fetch(word.url).then(r => r.blob());
  zip.addFile(word.filename, wordBlob);

  // JSON crudo (solo lectura)
  const rawJSON = JSON.stringify(viewModel, null, 2);
  zip.addFile("PEA_RAW_VIEWMODEL.json", rawJSON);

  // Hash global de auditoría
  const auditPayload = {
    excel_hash: excel.hash,
    pdf_hash: pdf.hash,
    word_hash: word.hash,
    raw_hash: await generatePEAHash(rawJSON)
  };

  const auditHash = await generatePEAHash(JSON.stringify(auditPayload));
  zip.addFile("hash.txt", `PEA AUDIT HASH (SHA-256)\n${auditHash}`);

  const zipBlob = await zip.finalize();
  const url = URL.createObjectURL(zipBlob);

  return {
    url,
    filename: `PEA_AUDITORIA_COMPLETA_${new Date().toISOString()}.zip`,
    hash: auditHash
  };
}
