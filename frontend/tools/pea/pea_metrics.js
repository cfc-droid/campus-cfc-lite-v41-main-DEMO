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

function onlyDespues(records) {
  const src = Array.isArray(records) ? records : [];
  return src.filter(r =>
    (r?.meta?.estado || "VALIDO") !== "ANULADO" &&
    r?.momento === "DESPUÉS" &&
    r?.resultado_operativo
  );
}

function calculateMetrics(records) {
  const list = onlyForMetrics(records);
  if (!list.length) return null;

  const acciones = [];
  const estados = [];
  const intensidades = [];
  const momentos = [];

  /* ===== RESULTADO OPERATIVO (SOLO DESPUÉS) ===== */
  const despues = onlyDespues(records);
  const resultados = despues.map(r => r.resultado_operativo);
  const resultadoCount = countBy(resultados);

  /* ===== TAREA 22b — cobertura diaria por momento ===== */
  const days = {};

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

  const REQUIRED = ["ANTES", "DURANTE", "DESPUÉS"];
  const daysEntries = Object.entries(days);

  let completeDays = 0;
  const incompleteDays = [];

  daysEntries.forEach(([date, set]) => {
    const missing = REQUIRED.filter(m => !set.has(m));
    if (missing.length === 0) {
      completeDays++;
    } else {
      incompleteDays.push({ date, missing });
    }
  });

  const totalDays = daysEntries.length;
  const coveragePercent = totalDays
    ? Math.round((completeDays / totalDays) * 100)
    : 0;

  return {
    total: list.length,
    accionMasFrecuente: mostFrequent(accionesCount),
    estadoDominante: mostFrequent(countBy(estados)),
    intensidadPromedio: average(intensidades),
    distribucionMomento: countBy(momentos),

    totalAcciones,
    rankingAcciones: top3,

    coverageByMoment: {
      totalDays,
      completeDays,
      coveragePercent,
      incompleteDays
    },

    resultadoOperativo: {
      total: despues.length,
      distribucion: resultadoCount
    }
  };
}

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

  const ro = metrics.resultadoOperativo;
  const hasResultado = ro && ro.total > 0;

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

  box.innerHTML = `
    <div class="pea-metric-item">
      <strong>Cobertura diaria por Momento Operativo:</strong><br>
      El ${coverage.coveragePercent}% de los días tienen los 3 registros completos.
    </div>

    <div class="pea-metric-item">
      <strong>Estado del sistema:</strong> ${health.icon} ${health.text}
    </div>

    <div class="pea-metric-item">
      <strong>Total de registros:</strong> ${metrics.total}
    </div>

    <div class="pea-metric-item">
      <strong>Distribución por Momento:</strong>
      <ul>${momentoRows}</ul>
    </div>

    <div class="pea-metric-item">
      <strong>Resultado operativo (solo DESPUÉS):</strong><br>
      ${
        hasResultado
          ? `<ul>
              ${Object.entries(ro.distribucion)
                .map(([k, v]) => `<li>${k}: ${v}</li>`)
                .join("")}
            </ul>`
          : `<em>Evidencia insuficiente para estadísticas de resultado operativo.</em>`
      }
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
