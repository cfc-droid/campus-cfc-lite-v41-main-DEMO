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

  // ✅ Normalizador: no dependemos de 1 solo nombre de campo
  function pickResultadoOperativo(r) {
    const v =
      r?.resultado_operativo ??
      r?.resultado_operativo_key ??
      r?.resultadoOperativo ??
      r?.resultado ??
      r?.resultado_key ??
      "";
    return String(v).trim().toUpperCase();
  }

  function pickMomento(r) {
    const v = r?.momento ?? r?.momento_key ?? "";
    return String(v).trim().toUpperCase();
  }

  function pickPensamiento(r) {
    const v = r?.pensamiento ?? "";
    return String(v).trim();
  }

  function pickAccionesKeys(r) {
    const v = r?.acciones_keys ?? r?.accionesKeys ?? [];
    return Array.isArray(v) ? v : [];
  }

  /* ============================================================
     ESTADÍSTICA 2/17 — BRÚJULA — GANADORAS vs PERDEDORAS
     NIVEL 1/4
     Qué hace:
       - Toma el MISMO universo que ves en la tabla (post-filtros)
       - Se queda con GANADA / PERDIDA
       - Top 3:
         * ANTES: pensamientos más frecuentes (GANADA vs PERDIDA)
         * DURANTE: acciones más frecuentes (GANADA vs PERDIDA)
     ============================================================ */

  window.PEA_STATS.renderBrújula = function () {
    const container = document.getElementById("pea-level-1");
    if (!container) return;

    const base = getFilteredRecords().filter(r => {
      const res = pickResultadoOperativo(r);
      return res === "GANADA" || res === "PERDIDA";
    });

    let contenido = "";

    // helper Top3 (por %)
    const top3 = (arr, extractor) => {
      const all = [];
      arr.forEach(r => {
        const v = extractor(r);
        if (Array.isArray(v)) all.push(...v);
        else if (v) all.push(v);
      });

      const clean = all
        .map(x => String(x).trim())
        .filter(Boolean);

      if (!clean.length) return [];

      const map = {};
      clean.forEach(v => (map[v] = (map[v] || 0) + 1));
      const total = clean.length;

      return Object.entries(map)
        .map(([k, c]) => ({
          key: k,
          percent: Math.round((c / total) * 100)
        }))
        .sort((a, b) => b.percent - a.percent)
        .slice(0, 3);
    };

    if (base.length >= 4) {
      const ganadas = base.filter(r => pickResultadoOperativo(r) === "GANADA");
      const perdidas = base.filter(r => pickResultadoOperativo(r) === "PERDIDA");

      const antes = {
        GANADA: top3(
          ganadas.filter(r => pickMomento(r) === "ANTES"),
          r => pickPensamiento(r)
        ),
        PERDIDA: top3(
          perdidas.filter(r => pickMomento(r) === "ANTES"),
          r => pickPensamiento(r)
        )
      };

      const durante = {
        GANADA: top3(
          ganadas.filter(r => pickMomento(r) === "DURANTE"),
          r => pickAccionesKeys(r)
        ),
        PERDIDA: top3(
          perdidas.filter(r => pickMomento(r) === "DURANTE"),
          r => pickAccionesKeys(r)
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

    container.innerHTML = window.renderCuadroBasePEA({
      nivel: 1,
      indice: 2,
      titulo: "BRÚJULA — GANADORAS vs PERDEDORAS",
      totalRegistros: base.length,
      universo: "registros post-filtros (se ve lo mismo que la tabla)",
      criterios: ["Resultado operativo ∈ {GANADA, PERDIDA}"],
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
