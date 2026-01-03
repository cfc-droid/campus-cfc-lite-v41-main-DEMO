/* =========================================================
   PEA_JUMP_STAT.JS
   Rol:
   - Mostrar dropdown "Ir a estadísticas" (17)
   - Construir opciones automáticamente leyendo lo renderizado
   - Hacer scroll al cuadro seleccionado
   - Re-armar la lista cuando cambian filtros (re-render)
   ========================================================= */

(function () {
  const SELECT_ID = "pea-jump-stat";

  function getSelect() {
    return document.getElementById(SELECT_ID);
  }

  function extractTitleFromHeader(text) {
    // Ej: "ESTADÍSTICA 9/17 — Índice de Cumplimiento (GANADA vs PERDIDA)"
    // Queremos: "9 — Índice de Cumplimiento (GANADA vs PERDIDA)"
    const m = String(text || "").match(/ESTADÍSTICA\s+(\d+)\/\d+\s+—\s+(.+)$/i);
    if (!m) return null;
    return `${m[1]} — ${m[2]}`;
  }

  function tagStatsWithIds() {
    const cards = Array.from(document.querySelectorAll(".pea-cuadro-estadistico"));
    cards.forEach((card, idx) => {
      // id estable por orden render
      card.id = `pea-stat-${idx + 1}`;
    });
    return cards;
  }

  function buildOptionsFromDOM() {
    const sel = getSelect();
    if (!sel) return false;

    const cards = tagStatsWithIds();
    if (!cards.length) return false;

    // limpiar y reconstruir
    sel.innerHTML = `<option value="">—</option>`;

    cards.forEach((card, idx) => {
      const header = card.querySelector(".pea-estadistica");
      const label =
        extractTitleFromHeader(header?.textContent) || `${idx + 1} — Estadística`;

      const opt = document.createElement("option");
      opt.value = card.id;
      opt.textContent = label;
      sel.appendChild(opt);
    });

    return true;
  }

  function scrollToStat(statId) {
    if (!statId) return;
    const el = document.getElementById(statId);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function ensureBuiltWithRetries(tries = 0) {
    const ok = buildOptionsFromDOM();
    if (ok) return;

    // stats pueden tardar un pelín en renderizar (DOMContentLoaded + registry)
    if (tries < 25) {
      setTimeout(() => ensureBuiltWithRetries(tries + 1), 120);
    }
  }

  function wireEvents() {
    const sel = getSelect();
    if (!sel) return;

    sel.addEventListener("change", () => {
      scrollToStat(sel.value);
      // opcional: volver a placeholder después de saltar
      // sel.value = "";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireEvents();
    ensureBuiltWithRetries();
  });

  // Cuando cambian filtros se re-renderizan las stats (se vacían contenedores)
  document.addEventListener("PEA_FILTERS_UPDATED", () => {
    // esperar a que runAllPEAStats termine
    setTimeout(() => ensureBuiltWithRetries(), 50);
  });
})();
