/* ============================================================
   PEA PRIMARY TABLES — BLOQUE 8.5 / 14
   Rol: Render frío (Excel-like) de lectura primaria
   ============================================================ */

import { calculatePrimaryReading } from "./pea_primary_reading.js";

/* =========================
   UTILIDADES DE RENDER
   ========================= */

function clear(el) {
  el.innerHTML = "";
}

function createTable(title, headers, rows) {
  const wrapper = document.createElement("div");
  wrapper.className = "pea-primary-block";

  const h3 = document.createElement("h3");
  h3.textContent = title;
  wrapper.appendChild(h3);

  const table = document.createElement("table");
  table.className = "pea-table pea-primary-table";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  headers.forEach(h => {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell ?? "—";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);

  return wrapper;
}

/* =========================
   SECCIONES POR MOMENTO
   ========================= */

function renderAntes(data, label) {
  if (!data || data.total === 0) return null;

  const rows = data.top3.map(item => [
    item.key,
    item.count,
    `${data.porcentajes[item.key]}%`
  ]);

  return createTable(
    `${label} — ANTES (Pensamiento)`,
    ["Pensamiento", "Frecuencia", "%"],
    rows
  );
}

function renderDurante(data, label) {
  if (!data || data.total === 0) return null;

  const rows = data.top3.map(item => [
    item.key,
    item.count,
    `${data.porcentajes[item.key]}%`
  ]);

  return createTable(
    `${label} — DURANTE (Acción)`,
    ["Acción", "Frecuencia", "%"],
    rows
  );
}

function renderDespues(data, label) {
  if (!data || data.total === 0) return null;

  const rows = [
    ["Estado dominante", data.estado_dominante?.key || "—", ""],
    ["% Intensidad alta (4–5)", `${data.porcentaje_intensidad_alta}%`, ""]
  ];

  return createTable(
    `${label} — DESPUÉS (Estado)`,
    ["Variable", "Valor", ""],
    rows
  );
}

/* =========================
   MÉTRICAS OBJETIVAS
   ========================= */

function renderMetrics(metrics, label) {
  const rows = [
    ["Consistencia operativa (%)", `${metrics.consistencia}%`],
    ["Desviación de riesgo (%)", `${metrics.desviacion_riesgo}%`],
    ["Interferencia durante ejecución (%)", `${metrics.interferencia}%`]
  ];

  return createTable(
    `${label} — Métricas objetivas`,
    ["Métrica", "Valor"],
    rows
  );
}

/* =========================
   RENDER PRINCIPAL
   ========================= */

export function renderPrimaryTables(records) {
  const container = document.getElementById("pea-primary-reading");
  if (!container) return;

  clear(container);

  const result = calculatePrimaryReading(records);

  if (!result.hasData) {
    container.innerHTML = `
      <div class="pea-empty">
        Evidencia insuficiente para lectura primaria.
      </div>
    `;
    return;
  }

  ["GANADORAS", "PERDEDORAS"].forEach(tipo => {
    const section = document.createElement("section");
    section.className = "pea-primary-section";

    const h2 = document.createElement("h2");
    h2.textContent = tipo;
    section.appendChild(h2);

    const antes = renderAntes(result[tipo].ANTES, tipo);
    const durante = renderDurante(result[tipo].DURANTE, tipo);
    const despues = renderDespues(result[tipo].DESPUES, tipo);
    const metrics = renderMetrics(result[tipo], tipo);

    [antes, durante, despues, metrics].forEach(block => {
      if (block) section.appendChild(block);
    });

    container.appendChild(section);
  });
}
