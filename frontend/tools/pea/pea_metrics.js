/* ============================================================
   PEA METRICS — BLOQUE 8 / 14
   Rol: Métricas agregadas descriptivas (sin juicio)
   ============================================================ */

const $ = (id) => document.getElementById(id);

/* =========================
   HELPERS
   ========================= */

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

/* =========================
   MÉTRICAS
   ========================= */

function calculateMetrics(records) {
  if (!records || records.length === 0) {
    return null;
  }

  const acciones = [];
  const estados = [];
  const intensidades = [];
  const momentos = [];

  records.forEach(r => {
    if (Array.isArray(r.acciones_keys)) {
      acciones.push(...r.acciones_keys);
    }
    if (r.estado_key) estados.push(r.estado_key);
    if (typeof r.intensidad === "number") intensidades.push(r.intensidad);
    if (r.momento) momentos.push(r.momento);
  });

  return {
    total: records.length,
    accionMasFrecuente: mostFrequent(countBy(acciones)),
    estadoDominante: mostFrequent(countBy(estados)),
    intensidadPromedio: average(intensidades),
    distribucionMomento: countBy(momentos)
  };
}

/* =========================
   RENDER
   ========================= */

function renderMetrics(metrics) {
  if (!metrics) {
    $("pea-metrics").innerHTML = `
      <p class="pea-muted">Evidencia insuficiente para métricas.</p>
    `;
    return;
  }

  const momentoRows = Object.entries(metrics.distribucionMomento)
    .map(([k, v]) => `<li>${k}: ${v}</li>`)
    .join("");

  $("pea-metrics").innerHTML = `
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
      <strong>Distribución por momento:</strong>
      <ul>${momentoRows}</ul>
    </div>
  `;
}

/* =========================
   ORQUESTADOR
   ========================= */

function updateMetrics() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

  const all = window.PEA_STORAGE.loadPEALog();
  const filtered = window.PEA_FILTERS.apply(all);

  const metrics = calculateMetrics(filtered);
  renderMetrics(metrics);
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", updateMetrics);
document.addEventListener("PEA_FILTERS_UPDATED", updateMetrics);
