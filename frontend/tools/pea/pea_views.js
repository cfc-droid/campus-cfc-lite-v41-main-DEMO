/* ============================================================
   PEA VIEWS — BLOQUE 18 / 14
   Vistas guardadas (configuración de filtros)
   No modifica datos · No crea registros
   ============================================================ */

const VIEWS_KEY = "CFC_PEA_VIEWS";

function getUserKey() {
  const hash = localStorage.getItem("PEA_EMAIL_HASH");
  if (!hash) throw new Error("PEA VIEWS: email hash no disponible.");
  return `${VIEWS_KEY}_${hash}`;
}

function loadViews() {
  const raw = localStorage.getItem(getUserKey());
  try {
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveViews(list) {
  localStorage.setItem(getUserKey(), JSON.stringify(list));
}

function getCurrentFilters() {
  const inputs = document.querySelectorAll(
    ".pea-filters select, .pea-filters input"
  );

  const data = {};
  inputs.forEach(el => {
    if (!el.id) return;
    if (el.value) data[el.id] = el.value;
  });

  return data;
}

function applyFiltersFromView(view) {
  Object.entries(view.filters).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.value = value;
  });

  document.dispatchEvent(new CustomEvent("PEA_FILTERS_UPDATED"));
}

function refreshViewsSelect() {
  const select = document.getElementById("pea-views-select");
  if (!select) return;

  const views = loadViews();
  select.innerHTML = `<option value="">— Vistas guardadas —</option>`;

  views.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = v.name;
    select.appendChild(opt);
  });
}

/* =========================
   UI Actions
   ========================= */

function onSaveView() {
  const name = prompt("Nombre de la vista:");
  if (!name) return;

  const views = loadViews();
  views.push({
    name,
    created_at: new Date().toISOString(),
    filters: getCurrentFilters()
  });

  saveViews(views);
  refreshViewsSelect();
}

function onApplyView() {
  const select = document.getElementById("pea-views-select");
  if (!select || !select.value) return;

  const views = loadViews();
  const view = views[Number(select.value)];
  if (!view) return;

  applyFiltersFromView(view);
}

function onDeleteView() {
  const select = document.getElementById("pea-views-select");
  if (!select || !select.value) return;

  const views = loadViews();
  const index = Number(select.value);
  const view = views[index];
  if (!view) return;

  const ok = confirm(`¿Eliminar la vista "${view.name}"?`);
  if (!ok) return;

  views.splice(index, 1);
  saveViews(views);
  refreshViewsSelect();
}

/* =========================
   INIT
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  refreshViewsSelect();

  document
    .getElementById("pea-view-save")
    ?.addEventListener("click", onSaveView);

  document
    .getElementById("pea-view-apply")
    ?.addEventListener("click", onApplyView);

   document
  .getElementById("pea-view-delete")
  ?.addEventListener("click", onDeleteView);

});
