/* =========================================================
   PEA_JUMP_STAT.JS (tolerante / a prueba de formato)
   - NO depende de un header exacto
   - Siempre arma el dropdown si hay cuadros
   ========================================================= */

(function () {
  const SELECT_ID = "pea-jump-stat";
  const HEADER_SELECTOR = ".pea-estadistica";
  const CARD_SELECTOR = ".pea-cuadro-estadistico";

  const SCROLL_OFFSET = 120;

  function getSelect() {
    return document.getElementById(SELECT_ID);
  }

  function normalizeSpaces(s) {
    return String(s || "").replace(/\s+/g, " ").trim();
  }

  function extractNumFlexible(headerText) {
    // acepta: "ESTADÍSTICA 6/17 — ...", "ESTADISTICA 6 - ...", "6/17 — ...", "6 — ..."
    const t = normalizeSpaces(headerText);

    // 1) patrón clásico con /17
    let m = t.match(/(\d+)\s*\/\s*17/i);
    if (m) return parseInt(m[1], 10);

    // 2) patrón con palabra ESTADÍSTICA/ESTADISTICA
    m = t.match(/ESTAD[ÍI]STICA\s*(\d+)/i);
    if (m) return parseInt(m[1], 10);

    // 3) patrón: empieza con número
    m = t.match(/^(\d+)\b/);
    if (m) return parseInt(m[1], 10);

    return null;
  }

  function makeNiceLabel(headerText, fallbackNum) {
    const t = normalizeSpaces(headerText);

    // intentamos “limpiar” el prefijo
    // convierte: "ESTADÍSTICA 6/17 — TÍTULO" -> "6 — TÍTULO"
    // convierte: "ESTADISTICA 6 - TÍTULO" -> "6 — TÍTULO"
    const cleaned = t
      .replace(/^ESTAD[ÍI]STICA\s*/i, "")
      .replace(/\s*\/\s*17\s*/i, " ")
      .replace(/\s*[—–-]\s*/g, " — ")
      .trim();

    if (cleaned) return cleaned.includes("—") ? cleaned : `${fallbackNum} — ${cleaned}`;
    return `${fallbackNum} — Estadística`;
  }

  function tagAndCollectStats() {
    const cards = Array.from(document.querySelectorAll(CARD_SELECTOR));
    const items = [];

    cards.forEach((card, idx) => {
      const header = card.querySelector(HEADER_SELECTOR);
      const rawHeaderText = header ? header.textContent : "";
      const headerText = normalizeSpaces(rawHeaderText);

      const num = extractNumFlexible(headerText) ?? (idx + 1);

      // id estable por número
      const id = `pea-stat-${String(num).padStart(2, "0")}`;
      card.id = id;

      const label = headerText
        ? makeNiceLabel(headerText, num)
        : `${num} — Estadística`;

      items.push({ num, id, label });
    });

    // orden por número (por si el DOM está raro)
    items.sort((a, b) => a.num - b.num);

    return items;
  }

  function buildOptionsFromDOM() {
    const sel = getSelect();
    if (!sel) return false;

    const cards = document.querySelectorAll(CARD_SELECTOR);
    if (!cards.length) return false;

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

    if (tries < 40) {
      setTimeout(() => ensureBuiltWithRetries(tries + 1), 150);
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
    ensureBuiltWithRetries();
  });

  // si lo emitís desde el registry, mejor todavía
  document.addEventListener("PEA_STATS_RENDERED", () => {
    ensureBuiltWithRetries();
  });

  // fallback por filtros
  document.addEventListener("PEA_FILTERS_UPDATED", () => {
    setTimeout(() => ensureBuiltWithRetries(), 200);
  });

   // ...adentro del IIFE, reemplazá buildOptionsFromDOM() por esta versión:

function buildOptionsFromDOM() {
  const sel = getSelect();
  if (!sel) return false;

  const cards = document.querySelectorAll(CARD_SELECTOR);
  const items = tagAndCollectStats();

  // Si hay cuadros pero falta el 1, lo agregamos como ancla a NIVEL 0
  const has1 = items.some(it => it.num === 1);
  const hasAny = cards.length > 0 || items.length > 0;

  sel.innerHTML = `<option value="">—</option>`;

  if (hasAny && !has1) {
    const opt = document.createElement("option");
    opt.value = "level-0";               // <-- ancla existente en tu HTML
    opt.textContent = "1 — Brújula general";
    sel.appendChild(opt);
  }

  // opciones reales del DOM
  items.forEach((it) => {
    const opt = document.createElement("option");
    opt.value = it.id;
    opt.textContent = it.label;
    sel.appendChild(opt);
  });

  return true;
}

})();
