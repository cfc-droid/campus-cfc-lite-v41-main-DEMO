/* ============================================================
   PEA METRICS — BLOQUE 8 / 14
   Rol: Métricas agregadas descriptivas (sin juicio)
   Regla: ANULADO NO participa de métricas (solo evidencia)
   ============================================================ */

const $ = (id) => document.getElementById(id);

function countBy(array) {
  const map = {};
  array.forEach(v => {
    if (!v) return;
    map[v] = (map[v] || 0) + 1;
  });
  return map;
}

function mostFrequent(map) {
  let maxKey = null;
  let maxVal = 0;
  for (const k in map) {
    if (map[k] > maxVal) {
      maxVal = map[k];
      maxKey = k;
    }
  }
  return maxKey;
}

function average(nums) {
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return Math.round((sum / nums.length) * 100) / 100;
}

function onlyForMetrics(records) {
  const src = Array.isArray(records) ? records : [];
  return src.filter(r => (r?.meta?.estado || "VALIDO") !== "ANULADO");
}

function calculateMetrics(records) {
  const list = onlyForMetrics(records);
  if (!list.length) return null;

  const acciones = [];
  const estados = [];
  const intensidades = [];
  const momentos = [];

  /* ===== TAREA 22b — cobertura diaria por momento ===== */
  const days = {}; // { fecha: Set(momentos) }

  list.forEach(r => {
    const aks = Array.isArray(r?.acciones_keys) ? r.acciones_keys : [];
    acciones.push(...aks);

    if (r?.estado_key) estados.push(r.estado_key);
    if (typeof r?.intensidad === "number") intensidades.push(r.intensidad);
    if (r?.momento) momentos.push(r.momento);

    if (r?.fecha && r?.momento) {
      if (!days[r.fecha]) days[r.fecha] = new Set();
      days[r.fecha].add(r.momento);
    }
  });

  /* ===== Ranking acciones (TAREA 22) ===== */
  const accionesCount = countBy(acciones);
  const totalAcciones = acciones.length;

  const rankingRaw = Object.entries(accionesCount)
    .map(([key, count]) => ({
      key,
      count,
      percent: Math.round((count / totalAcciones) * 100)
    }))
    .sort((a, b) => b.count - a.count);

  const top3 = rankingRaw.slice(0, 3);
  const resto = rankingRaw.slice(3);

  let restoCount = 0;
  resto.forEach(r => (restoCount += r.count));

  if (restoCount > 0) {
    top3.push({
      key: "OTRAS",
      count: restoCount,
      percent: Math.round((restoCount / totalAcciones) * 100)
    });
  }

  /* ===== Cobertura diaria por momento (TAREA 22b) ===== */
  const REQUIRED = ["ANTES", "DURANTE", "DESPUÉS"];
  const daysEntries = Object.entries(days);

  let completeDays = 0;
  const incompleteDays = [];

  daysEntries.forEach(([date, set]) => {
    const missing = REQUIRED.filter(m => !set.has(m));
    if (missing.length === 0) {
      completeDays++;
    } else {
      incompleteDays.push({
        date,
        missing
      });
    }
  });

  const totalDays = daysEntries.length;
  const coveragePercent = totalDays
    ? Math.round((completeDays / totalDays) * 100)
    : 0;

  return {
    /* ===== métricas existentes ===== */
    total: list.length,
    accionMasFrecuente: mostFrequent(accionesCount),
    estadoDominante: mostFrequent(countBy(estados)),
    intensidadPromedio: average(intensidades),
    distribucionMomento: countBy(momentos),

    /* ===== métricas nuevas ===== */
    totalAcciones,
    rankingAcciones: top3,

    coverageByMoment: {
      totalDays,
      completeDays,
      coveragePercent,
      incompleteDays
    }
  };
}

/* ============================================================
   TAREA 17 — Estado del sistema (salud del dato)
   ============================================================ */

function renderMetrics(metrics) {
  const box = $("pea-level-0");
  if (!box) return;

if (!metrics) {
  box.innerHTML = `
    <div class="pea-empty">
      Evidencia insuficiente para calcular esta métrica.
    </div>
  `;
  return;
}
   
  const momentoRows = Object.entries(metrics.distribucionMomento || {})
    .map(([k, v]) => `<li>${k}: ${v}</li>`)
    .join("") || `<li>—</li>`;

  const rankingRows = metrics.rankingAcciones
    .map((r, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${r.key}</td>
        <td>${r.count}</td>
        <td>${r.percent}%</td>
      </tr>
    `)
    .join("");

  const coverage = metrics.coverageByMoment;
  const incompleteRows = coverage.incompleteDays.length
    ? coverage.incompleteDays
        .map(d => `${d.date} → faltan: ${d.missing.join(", ")}`)
        .join("<br>")
    : "—";

const contenidoEstadistica1 = `
  <div class="pea-metric-item">
    <strong>Cobertura por día (faltantes de los 3 registros):</strong>
    El ${coverage.coveragePercent}% de los días tienen los 3 registros completos (ANTES, DURANTE y DESPUES de una operación).
    
  <details style="margin-top:6px;">
  <summary><strong>Días con cobertura incompleta</strong></summary>
  <div style="max-height:120px; overflow:auto; padding-left:8px; margin-top:4px;">
    ${coverage.incompleteDays.length ? incompleteRows : "—"}
  </div>
</details>
  </div>
`;

box.innerHTML = renderCuadroBasePEA({
  nivel: 0,
  indice: 1,
  titulo: "Cobertura por día (faltantes de los 3 registros)",
  totalRegistros: metrics.total,
  universo: "registros con estado_registro = VALIDO",
  criterios: null,
  contenidoHTML: contenidoEstadistica1
});

} // ← CIERRA renderMetrics
   
function updateMetrics() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

  const all = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(all);

  const metrics = calculateMetrics(filtered);
  renderMetrics(metrics);
}

document.addEventListener("DOMContentLoaded", updateMetrics);
document.addEventListener("PEA_FILTERS_UPDATED", updateMetrics);

/* ============================================================
   PEA — RENDER BASE CUADRO ESTADÍSTICO (ACCIÓN 31f.2)
   Rol: Forzar el ESTÁNDAR ÚNICO DE CUADRO ESTADÍSTICO — PEA
   Nota: NO calcula métricas. SOLO render estructural.
   ============================================================ */

function renderCuadroBasePEA({
  nivel,               // 0–4
  indice,              // 1–17
  titulo,              // string exacto contrato PEA
  totalRegistros,      // N
  universo,            // string
  criterios = null,    // array de strings o null
  contenidoHTML = "",  // cuerpo ya calculado
}) {
  const estado =
    totalRegistros >= 6
      ? { icon: "🟢", text: `Datos suficientes (${totalRegistros} registros)` }
      : totalRegistros >= 4
      ? { icon: "🟡", text: `Datos parciales (${totalRegistros} registros)` }
      : { icon: "🔴", text: "Datos insuficientes" };

  return `
<div class="pea-cuadro-estadistico">

  <div class="pea-identidad">
    <div class="pea-nivel">
      NIVEL ${nivel}/4 — ${getNombreNivelPEA(nivel)}
    </div>
    <div class="pea-estadistica">
      ${indice}/17 — ${titulo}
    </div>
  </div>

  <div class="pea-cabecera">
    Estado del sistema: ${estado.icon} ${estado.text}<br>
    Total de registros: ${totalRegistros}
  </div>

  <div class="pea-separador">────────────────────────────</div>

  <div class="pea-universo">
    Universo: ${universo}
  </div>

  ${
    criterios && criterios.length
      ? `
  <div class="pea-criterios">
    Criterios adicionales:
    <ul>
      ${criterios.map(c => `<li>${c}</li>`).join("")}
    </ul>
  </div>
  `
      : ""
  }

  <div class="pea-cuerpo">
    ${
      estado.icon === "🔴"
        ? "Evidencia insuficiente para calcular esta métrica."
        : contenidoHTML
    }
  </div>

  <div class="pea-nav">
    <a href="#top">[ Subir arriba ]</a>
  </div>

</div>
`;
}

function getNombreNivelPEA(nivel) {
  switch (nivel) {
    case 0:
      return "INFORMACIÓN A CORROBORRAR / COMPLETAR (INFLUYE EN TODO)";
    case 1:
      return "BRÚJULA (LECTURA PRIMARIA)";
    case 2:
      return "SECUNDARIAS DE ALTO VALOR";
    case 3:
      return "CONTEXTO Y SALUD DEL SISTEMA";
    case 4:
      return "EXPLORATORIAS (AVANZADAS)";
    default:
      return "—";
  }
}
