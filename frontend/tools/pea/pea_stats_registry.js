/* ============================================================
   PEA — REGISTRO DE ESTADÍSTICAS
   Rol: Orquestar estadísticas 2/17 → 17/17
   Regla: NO tocar pea_metrics.js
   ============================================================ */

(function () {
  if (!window.PEA_STATS) window.PEA_STATS = {};

function getFilteredRecords() {
  if (!window.PEA_STORAGE || !window.PEA_FILTERS) return [];
  const all = window.PEA_STORAGE.loadPEALog();
  return window.PEA_FILTERS.apply(all);
}

  /* ============================================================
     ESTADÍSTICA 2/17 — BRÚJULA — GANADORAS vs PERDEDORAS
     NIVEL 1/4
     ============================================================ */

  window.PEA_STATS.renderBrújula = function () {
    const container = document.getElementById("pea-level-1");
    if (!container) return;

const base = getFilteredRecords().filter(
      r => r.resultado === "GANADA" || r.resultado === "PERDIDA"
    );

    let contenido = "";

    if (base.length >= 4) {
      const porResultado = {
        GANADA: base.filter(r => r.resultado === "GANADA"),
        PERDIDA: base.filter(r => r.resultado === "PERDIDA")
      };

      const top3 = (arr, fn) => {
        const all = [];
        arr.forEach(r => {
          const v = fn(r);
          if (Array.isArray(v)) all.push(...v);
          else if (v) all.push(v);
        });
        if (!all.length) return [];
        const map = {};
        all.forEach(v => (map[v] = (map[v] || 0) + 1));
        const total = all.length;
        return Object.entries(map)
          .map(([k, c]) => ({
            key: k,
            percent: Math.round((c / total) * 100)
          }))
          .sort((a, b) => b.percent - a.percent)
          .slice(0, 3);
      };

      const antes = {
        GANADA: top3(
          porResultado.GANADA.filter(r => r.momento === "ANTES"),
          r => r.pensamiento
        ),
        PERDIDA: top3(
          porResultado.PERDIDA.filter(r => r.momento === "ANTES"),
          r => r.pensamiento
        )
      };

      const durante = {
        GANADA: top3(
          porResultado.GANADA.filter(r => r.momento === "DURANTE"),
          r => r.acciones_keys
        ),
        PERDIDA: top3(
          porResultado.PERDIDA.filter(r => r.momento === "DURANTE"),
          r => r.acciones_keys
        )
      };

      contenido = `
<div class="pea-metric-item">
<strong>ANTES — Top 3 pensamientos</strong><br>
GANADA:<br>${antes.GANADA.map(e => `• ${e.key}: ${e.percent}%`).join("<br>") || "—"}
<br><br>
PERDIDA:<br>${antes.PERDIDA.map(e => `• ${e.key}: ${e.percent}%`).join("<br>") || "—"}
</div>

<div class="pea-metric-item" style="margin-top:8px;">
<strong>DURANTE — Top 3 acciones</strong><br>
GANADA:<br>${durante.GANADA.map(e => `• ${e.key}: ${e.percent}%`).join("<br>") || "—"}
<br><br>
PERDIDA:<br>${durante.PERDIDA.map(e => `• ${e.key}: ${e.percent}%`).join("<br>") || "—"}
</div>
`;
    }

    container.innerHTML = renderCuadroBasePEA({
      nivel: 1,
      indice: 2,
      titulo: "BRÚJULA — GANADORAS vs PERDEDORAS",
      totalRegistros: base.length,
      universo: "registros con estado_registro = VALIDO",
      criterios: ["Resultado ∈ {GANADA, PERDIDA}"],
      contenidoHTML: contenido
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.PEA_STATS.renderBrújula();
  });

  document.addEventListener("PEA_FILTERS_UPDATED", () => {
    window.PEA_STATS.renderBrújula();
  });
})();
