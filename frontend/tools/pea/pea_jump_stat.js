/* =========================================================
   PEA_JUMP_STAT.JS (robusto)
   - Reconstruye el dropdown cuando aparecen stats
   - Funciona con re-render y con demoras
   ========================================================= */

(function () {
  const SELECT_ID = "pea-jump-stat";
  const HEADER_SELECTOR = ".pea-estadistica";
  const CARD_SELECTOR = ".pea-cuadro-estadistico";
  const SCROLL_OFFSET = 120;

  function getSelect() {
    return document.getElementById(SELECT_ID);
  }

  function parseStatHeader(text) {
    // Soporta: "ESTADÍSTICA 9/17 — ..."
    const m = String(text || "").match(/ESTADÍSTICA\s+(\d+)\/\d+\s+—\s+(.+)$/i);
    if (!m) return null;
    const num = parseInt(m[1], 10);
    const titulo = m[2].trim();
    return { num, label: `${num} — ${titulo}` };
  }

  function tagAndCollectStats() {
    const cards = Array.from(document.querySelectorAll(CARD_SELECTOR));
    const items = [];

    cards.forEach((card) => {
      const header = card.querySelector(HEADER_SELECTOR);
      const parsed = parseStatHeader(header?.textContent);

      if (!parsed?.num) return;

      const id = `pea-stat-${String(parsed.num).padStart(2, "0")}`;
      card.id = id;

      items.push({ num: parsed.num, id, label: parsed.label });
    });

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

  function wireEvents() {
    const sel = getSelect();
    if (!sel) return;
    sel.addEventListener("change", () => scrollToStat(sel.value));
  }

  // ✅ Observa cambios hasta que encuentre stats y pueda armar el combo
  let obs = null;
  function observeUntilBuilt(timeoutMs = 12000) {
    if (buildOptionsFromDOM()) return;

    if (obs) obs.disconnect();
    const root = document.querySelector(".pea-zone-secondary") || document.body;

    obs = new MutationObserver(() => {
      if (buildOptionsFromDOM()) {
        obs.disconnect();
        obs = null;
      }
    });

    obs.observe(root, { childList: true, subtree: true });

    setTimeout(() => {
      if (obs) {
        obs.disconnect();
        obs = null;
      }
    }, timeoutMs);
  }

  document.addEventListener("DOMContentLoaded", () => {
    wireEvents();
    observeUntilBuilt();
  });

  // cuando termina el registry, reconstruimos
  document.addEventListener("PEA_STATS_RENDERED", () => {
    observeUntilBuilt();
  });

  // cuando cambian filtros se re-renderiza: volvemos a observar
  document.addEventListener("PEA_FILTERS_UPDATED", () => {
    observeUntilBuilt();
  });
})();
