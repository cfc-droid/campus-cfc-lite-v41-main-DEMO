/* =========================================================
   STAT 02 — TOP PENSAMIENTOS EN PÉRDIDAS (ANTES)
   Campus CFC LITE V41

   Objetivo:
   - Mostrar los pensamientos más frecuentes (ANTES)
     en días que terminaron en PÉRDIDA.

   Reglas:
   - La PÉRDIDA se detecta SOLO desde DESPUÉS
   - Cruce exclusivamente por FECHA
   - Usa primer registro ANTES por día
   - Solo meta.estado ∈ {VALIDO, CORREGIDO}
   - ANULADO fuera
   - Siempre muestra si existe ≥ 1 dato
   - Formato CUADRO (ranking + conteo + %)

   No interpreta. No aconseja. No diagnostica.
   ========================================================= */

(function () {
  window.renderStat_02_top_pensamientos_perdidas = function () {

    // ===============================
    // 1. CARGA Y FILTRO BASE
    // ===============================

    if (!window.PEA_STORAGE || !window.PEA_FILTERS) return;

    const allLogs = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(allLogs) || [];

    const validLogs = filtered.filter(r =>
      r &&
      r.meta &&
      (r.meta.estado === 'VALIDO' || r.meta.estado === 'CORREGIDO')
    );

    if (validLogs.length === 0) {
      renderEmpty();
      return;
    }

    // ===============================
    // 2. FECHAS QUE TERMINARON EN PÉRDIDA
    // ===============================

    const fechasPerdida = new Set();

    validLogs.forEach(r => {
      if (
        r.momento === 'DESPUÉS' &&
        r.resultado_operativo === 'PERDIDA' &&
        r.fecha
      ) {
        fechasPerdida.add(r.fecha);
      }
    });

    if (fechasPerdida.size === 0) {
      renderEmpty();
      return;
    }

    // ===============================
    // 3. PRIMER ANTES POR FECHA
    // ===============================

    const antesPorFecha = {};

    validLogs.forEach(r => {
      if (
        r.momento === 'ANTES' &&
        fechasPerdida.has(r.fecha)
      ) {
        if (!antesPorFecha[r.fecha]) {
          antesPorFecha[r.fecha] = r;
        }
      }
    });

    const pensamientos = Object.values(antesPorFecha)
      .map(r => r.pensamiento_key)
      .filter(Boolean);

    if (pensamientos.length === 0) {
      renderEmpty();
      return;
    }

    // ===============================
    // 4. CONTEO Y PORCENTAJES
    // ===============================

    const total = pensamientos.length;
    const conteo = {};

    pensamientos.forEach(p => {
      conteo[p] = (conteo[p] || 0) + 1;
    });

    const ranking = Object.entries(conteo)
      .map(([key, count]) => ({
        pensamiento: key,
        cantidad: count,
        porcentaje: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

  // ===============================
  // RENDER VACÍO CONTROLADO
  // ===============================

  function renderEmpty() {
    window.renderCuadroBasePEA({
      containerId: 'pea-level-1',
      titulo: 'Top Pensamientos en Pérdidas (ANTES)',
      subtitulo: 'Muestra insuficiente',
      tipo: 'texto',
      contenido: 'No hay registros ANTES válidos asociados a días que terminaron en PÉRDIDA con los filtros actuales.'
    });
  }

})();
