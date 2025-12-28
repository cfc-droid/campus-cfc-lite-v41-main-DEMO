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

  list.forEach(r => {
    const aks = Array.isArray(r?.acciones_keys) ? r.acciones_keys : [];
    acciones.push(...aks);

    if (r?.estado_key) estados.push(r.estado_key);
    if (typeof r?.intensidad === "number") intensidades.push(r.intensidad);
    if (r?.momento) momentos.push(r.momento);
  });

  return {
    total: list.length,
    accionMasFrecuente: mostFrequent(countBy(acciones)),
    estadoDominante: mostFrequent(countBy(estados)),
    intensidadPromedio: average(intensidades),
    distribucionMomento: countBy(momentos)
  };
}

/* ============================================================
   TAREA 21a — Cobertura del dataset
   Auditoría de completitud del dato (no interpretativa)
   ============================================================ */

function calculateDatasetCoverage(records) {
  const list = onlyForMetrics(records);
  if (!list.length) return null;

  const total = list.length;

  const fields = {
    accion: 0,
    instrumento: 0,
    activo: 0,
    pensamiento: 0,
    estado: 0,
    intensidad: 0
  };

  list.forEach(r => {
    if (Array.isArray(r?.acciones_keys) && r.acciones_keys.length) fields.accion++;
    if (r?.instrumento_key && r.instrumento_key !== "OTROS") fields.instrumento++;
    if (r?.activo_key && r.activo_key !== "OTROS") fields.activo++;
    if (r?.pensamiento) fields.pensamiento++;
    if (r?.estado_key) fields.estado++;
    if (typeof r?.intensidad === "number") fields.intensidad++;
  });

  const percent = {};
  Object.keys(fields).forEach(k => {
    percent[k] = Math.round((fields[k] / total) * 100);
  });

  return {
    total,
    percent
  };
}

/* ============================================================
   TAREA 17 — Estado del sistema (salud del dato)
   Auditoría objetiva. No interpreta. No modifica métricas.
   Umbral definido:
   0–2  → Insuficiente
   3–4  → Parcial
   ≥5   → Suficiente
   ============================================================ */

function calculateDataHealth(metrics) {
  if (!metrics || metrics.total <= 2) {
    return {
      level: "INSUFICIENTE",
      icon: "🔴",
      text: metrics?.total
        ? `Datos insuficientes (${metrics.total} registros)`
        : "Datos insuficientes"
    };
  }

  if (metrics.total <= 4) {
    return {
      level: "PARCIAL",
      icon: "🟡",
      text: `Datos parciales (${metrics.total} registros)`
    };
  }

  return {
    level: "SUFICIENTE",
    icon: "🟢",
    text: `Datos suficientes (${metrics.total} registros)`
  };
}

function renderDatasetCoverage() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return "";

  const all = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(all);
  const coverage = calculateDatasetCoverage(filtered);

  if (!coverage) return "";

  return `
    <div class="pea-metric-item">
      <strong>Cobertura del dataset:</strong>
      <ul>
        <li>Acción válida: ${coverage.percent.accion}%</li>
        <li>Instrumento válido: ${coverage.percent.instrumento}%</li>
        <li>Activo válido: ${coverage.percent.activo}%</li>
        <li>Pensamiento: ${coverage.percent.pensamiento}%</li>
        <li>Estado emocional: ${coverage.percent.estado}%</li>
        <li>Intensidad: ${coverage.percent.intensidad}%</li>
      </ul>
    </div>
  `;
}

function renderMetrics(metrics) {
  const box = $("pea-metrics");
  if (!box) return;

  const health = calculateDataHealth(metrics);

  if (!metrics) {
    box.innerHTML = `
      <div class="pea-empty">
        ${health.icon} ${health.text}
      </div>
    `;
    return;
  }

  const momentoEntries = Object.entries(metrics.distribucionMomento || {});
  const momentoRows = momentoEntries.length
    ? momentoEntries.map(([k, v]) => `<li>${k}: ${v}</li>`).join("")
    : `<li>—</li>`;

  box.innerHTML = `
    <div class="pea-metric-item">
      <strong>Estado del sistema:</strong> ${health.icon} ${health.text}
    </div>

    <div class="pea-metric-item">
      <strong>Total de registros:</strong> ${metrics.total}
    </div>

    <div class="pea-metric-item">
      <strong>Acción más frecuente:</strong> ${metrics.accionMasFrecuente || "—"}
    </div>

    <div class="pea-metric-item">
      <strong>Estado dominante:</strong> ${metrics.estadoDominante || "—"}
    </div>

    <div class="pea-metric-item">
      <strong>Intensidad promedio:</strong> ${metrics.intensidadPromedio ?? "—"}
    </div>

    <div class="pea-metric-item">
      <strong>Distribución por Momento:</strong>
      <ul>${momentoRows}</ul>
    </div>

    ${renderDatasetCoverage()}
  `;
}

function updateMetrics() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

  const all = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(all);

  const metrics = calculateMetrics(filtered);
  renderMetrics(metrics);
}

document.addEventListener("DOMContentLoaded", updateMetrics);
document.addEventListener("PEA_FILTERS_UPDATED", updateMetrics);
