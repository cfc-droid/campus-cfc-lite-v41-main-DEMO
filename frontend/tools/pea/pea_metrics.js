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

  /* =========================
     TAREA 22 — Ranking de conductas
     (AGREGADO — NO reemplaza métricas existentes)
     Base: TOTAL DE ACCIONES
     ========================= */

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

  return {
    /* ===== MÉTRICAS EXISTENTES (NO TOCAR) ===== */
    total: list.length,
    accionMasFrecuente: mostFrequent(accionesCount),
    estadoDominante: mostFrequent(countBy(estados)),
    intensidadPromedio: average(intensidades),
    distribucionMomento: countBy(momentos),

    /* ===== MÉTRICAS NUEVAS (AGREGADAS) ===== */
    totalAcciones,
    rankingAcciones: top3
  };
}

/* ============================================================
   TAREA 17 — Estado del sistema (salud del dato)
   Auditoría objetiva. No interpreta. No modifica métricas.
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

  const rankingRows = (metrics.rankingAcciones || [])
    .map((r, i) => `
      <tr>
        <td>#${i + 1}</td>
        <td>${r.key}</td>
        <td>${r.count}</td>
        <td>${r.percent}%</td>
      </tr>
    `)
    .join("");

  box.innerHTML = `
    <!-- ===== MÉTRICAS EXISTENTES (SIN CAMBIOS) ===== -->

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

    <!-- ===== NUEVO BLOQUE: RANKING ===== -->

    <div class="pea-metric-item">
      <strong>Ranking de conductas operativas: Acción(es)</strong><br>
      <small>CANTIDAD DE Acción(es) EN TOTAL: ${metrics.totalAcciones}</small>

      <table class="pea-table">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Acción</th>
            <th>Cantidad</th>
            <th>PORCENTAJE</th>
          </tr>
        </thead>
        <tbody>
          ${rankingRows}
          <tr>
            <td><strong>TOTAL</strong></td>
            <td>—</td>
            <td><strong>${metrics.totalAcciones}</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tbody>
      </table>
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
