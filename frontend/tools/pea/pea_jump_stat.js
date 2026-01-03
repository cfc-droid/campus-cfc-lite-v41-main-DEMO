/* =========================================================
   PEA_JUMP_STAT.JS
   Rol:
   - Dropdown "Ir a estadísticas" (17)
   - Opciones con NOMBRE EXACTO desde .pea-estadistica
   - IDs por número REAL de estadística (no por índice DOM)
   - Scroll exacto con offset (barra flotante)
   - Rebuild al re-render (PEA_FILTERS_UPDATED)
   ========================================================= */

(function () {
  const SELECT_ID = "pea-jump-stat";
  const HEADER_SELECTOR = ".pea-estadistica";
  const CARD_SELECTOR = ".pea-cuadro-estadistico";

  // Ajuste fino: altura aprox de la floatbar + aire
  const SCROLL_OFFSET = 120;

  function getSelect() {
    return document.getElementById(SELECT_ID);
  }

  function parseStatHeader(text) {
    // Ej: "ESTADÍSTICA 9/17 — Índice de Cumplimiento (GANADA vs PERDIDA)"
    const m = String(text || "").match(/ESTADÍSTICA\s+(\d+)\/\d+\s+—\s+(.+)$/i);
    if (!m) return null;
    const num = parseInt(m[1], 10);
    const titulo = m[2].trim();
    return { num, titulo, label: `${num} — ${titulo}` };
  }

  function tagAndCollectStats() {
    const cards = Array.from(document.querySelectorAll(CARD_SELECTOR));
    const items = [];

    cards.forEach((card) => {
      const header = card.querySelector(HEADER_SELECTOR);
      const parsed = parseStatHeader(header?.textContent);

      if (!parsed || !parsed.num) return;

      // ID estable por número real
      const id = `pea-stat-${String(parsed.num).padStart(2, "0")}`;
      card.id = id;

      items.push({
        num: parsed.num,
        id,
        label: parsed.label
      });
    });

    // Orden numérico 1..17 (por si el DOM cambia)
    items.sort((a, b) => a.num - b.num);

    return items;
  }

  function buildOptionsFromDOM() {
    const sel = getSelect();
    if (!sel) return false;

    const items = tagAndCollectStats();
    if (!items.length) return false;

    sel.innerHTML = `<option value="">—</option>`;

    items.forEach((it) => {
      const opt = document.createElement("option");
      opt.value = it.id;
      opt.textContent = it.label;
      sel.appendChild(opt);
    });

    return true;
  }

  function scrollToStat(statId) {
    if (!statId) return;
    const el = document.getElementById(statId);
    if (!el) return;

    const y = el.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  function ensureBuiltWithRetries(tries = 0) {
    const ok = buildOptionsFromDOM();
    if (ok) return;

    if (tries < 30) {
      setTimeout(() => ensureBuiltWithRetries(tries + 1), 120);
    }
  }

  function wireEvents() {
    const sel = getSelect();
    if (!sel) return;

    sel.addEventListener("change", () => {
      scrollToStat(sel.value);
    });
  }

document.addEventListener("DOMContentLoaded", () => {
  wireEvents();
  // por si ya están listas
  ensureBuiltWithRetries();
});

// ✅ cuando el registry termina de renderizar, reconstruimos SÍ o SÍ
document.addEventListener("PEA_STATS_RENDERED", () => {
  ensureBuiltWithRetries();
});

// cuando cambian filtros, el registry re-renderiza y luego emitirá PEA_STATS_RENDERED
document.addEventListener("PEA_FILTERS_UPDATED", () => {
  // no reconstruyas acá con timeout; esperá el evento final del registry
});
})();
