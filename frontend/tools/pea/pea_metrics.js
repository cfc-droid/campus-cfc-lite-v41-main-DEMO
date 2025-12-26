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

function renderMetrics(metrics) {
  const box = $("pea-metrics");
  if (!box) return;

  if (!metrics) {
    box.innerHTML = `
      <div class="pea-empty">Evidencia insuficiente para calcular métricas.</div>
    `;
    return;
  }

  const momentoEntries = Object.entries(metrics.distribucionMomento || {});
  const momentoRows = momentoEntries.length
    ? momentoEntries.map(([k, v]) => `<li>${k}: ${v}</li>`).join("")
    : `<li>—</li>`;

  box.innerHTML = `
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
