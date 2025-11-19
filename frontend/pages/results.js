/* ==========================================================
✅ CFC_FUNC_3_3_FIX_V11.1 — Renderizado robusto del historial (multi-key)
========================================================== */
console.log("🧩 CFC_SYNC checkpoint:", "results.js — QA-SYNC V11.1 iniciado", new Date().toLocaleString());

document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("examHistory");
  if (!table) {
    console.warn("⚠️ Tabla no encontrada — QA-SYNC V11.1");
    return;
  }

  // 🔍 Intentar obtener datos desde varias claves posibles
  const possibleKeys = ["examResults", "results", "exam_history", "examHistory"];
  let examResults = [];

  for (const key of possibleKeys) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      if (Array.isArray(data) && data.length > 0) {
        examResults = data;
        console.log(`🧩 CFC_SYNC checkpoint: datos encontrados en "${key}" (${data.length} registros)`);
        break;
      }
    } catch (e) {
      console.warn(`⚠️ Clave inválida o vacía: ${key}`);
    }
  }

  // 📉 Si no hay datos
  if (examResults.length === 0) {
    console.warn("⚠️ No se encontraron resultados en ninguna clave localStorage.");
    table.insertAdjacentHTML(
      "beforeend",
      `<tr><td colspan="4" style="opacity:0.7;">🕓 Aún no realizaste ningún examen.</td></tr>`
    );
    return;
  }

  // 🧮 Renderizar tabla
  examResults.forEach((r) => {
    const status = r.status || (r.score >= 70 ? "✅ Aprobado" : "❌ Reprobado");
    const row = `
      <tr>
        <td>${r.module || "-"}</td>
        <td>${r.date || "-"}</td>
        <td>${r.score ?? "-"}%</td>
        <td>${status}</td>
      </tr>`;
    table.insertAdjacentHTML("beforeend", row);
  });

  console.log(`🧩 CFC_SYNC checkpoint: ${examResults.length} registros cargados — QA-SYNC V11.1`);
});
