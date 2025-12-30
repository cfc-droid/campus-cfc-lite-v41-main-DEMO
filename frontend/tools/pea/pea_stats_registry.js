/* ============================================================
   PEA — REGISTRO DE ESTADÍSTICAS
   Rol: Orquestar estadísticas 2/17 → 17/17
   CAMINO B: mostrar aunque haya 1 sola ocurrencia
   Regla: NO tocar pea_metrics.js
   ============================================================ */

(function () {
  if (!window.PEA_STATS) window.PEA_STATS = {};

  function getFilteredRecords() {
    if (!window.PEA_STORAGE || !window.PEA_FILTERS) return [];
    const all = window.PEA_STORAGE.loadPEALog();
    return window.PEA_FILTERS.apply(all);
  }

  /* ========= Normalizadores ========= */

  function pickResultado(r) {
    const v =
      r?.resultado_operativo ??
      r?.resultado_operativo_key ??
      r?.resultado ??
      "";
    return String(v).trim().toUpperCase();
  }

  function pickMomento(r) {
    return String(r?.momento ?? "").trim().toUpperCase();
  }

function pickPensamiento(r) {
  return String(r?.pensamiento_key ?? "").trim();
}

function pickAcciones(r) {
  const v = r?.acciones_keys;
  return Array.isArray(v) && v.length ? v : [];
}

  /* ========= Contador SIMPLE (no exige dominancia) ========= */

  function topSimple(arr, extractor, limit = 3) {
    const map = {};

    arr.forEach(r => {
      const v = extractor(r);
      if (Array.isArray(v)) {
        v.forEach(x => {
          if (!x) return;
          map[x] = (map[x] || 0) + 1;
        });
      } else if (v) {
        map[v] = (map[v] || 0) + 1;
      }
    });

    return Object.entries(map)
      .map(([k, c]) => ({ key: k, count: c }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /* ============================================================
     ESTADÍSTICA 2/17 — BRÚJULA
     ============================================================ */

  window.PEA_STATS.renderBrújula = function () {
    const container = document.getElementById("pea-level-1");
    if (!container) return;

const base = getFilteredRecords().filter(r => {
  const res = pickResultado(r);
  const aks = Array.isArray(r?.acciones_keys) ? r.acciones_keys : [];
  return (
    res === "GANADA" ||
    res === "PERDIDA" ||
    aks.length > 0
  );
});

    let contenido = "";

    if (base.length) {
      const ganadas = base.filter(r => pickResultado(r) === "GANADA");
      const perdidas = base.filter(r => pickResultado(r) === "PERDIDA");

      const bloque = (titulo, g, p) => `
<div class="pea-metric-item">
<strong>${titulo}</strong><br>
GANADA:<br>${g.length ? g.map(e => `• ${e.key} (${e.count})`).join("<br>") : "—"}
<br><br>
PERDIDA:<br>${p.length ? p.map(e => `• ${e.key} (${e.count})`).join("<br>") : "—"}
</div>
`;

      contenido = `
${bloque(
  "ANTES — Pensamientos",
  topSimple(ganadas.filter(r => pickMomento(r) === "ANTES"), pickPensamiento),
  topSimple(perdidas.filter(r => pickMomento(r) === "ANTES"), pickPensamiento)
)}

${bloque(
  "DURANTE — Acciones",
  topSimple(ganadas.filter(r => pickMomento(r) === "DURANTE"), pickAcciones),
  topSimple(perdidas.filter(r => pickMomento(r) === "DURANTE"), pickAcciones)
)}

`;
    }

    container.innerHTML = window.renderCuadroBasePEA({
      nivel: 1,
      indice: 2,
      titulo: "BRÚJULA — GANADORAS vs PERDEDORAS",
      totalRegistros: base.length,
      universo: "registros post-filtros (igual a la tabla)",
      criterios: ["Resultado ∈ {GANADA, PERDIDA}"],
      contenidoHTML: contenido
    });
  };

  document.addEventListener("DOMContentLoaded", window.PEA_STATS.renderBrújula);
  document.addEventListener("PEA_FILTERS_UPDATED", window.PEA_STATS.renderBrújula);
})();
