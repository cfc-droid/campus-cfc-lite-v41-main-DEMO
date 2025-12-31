/* =========================================================
   PEA_STATS_REGISTRY.JS
   Campus CFC LITE V41

   Rol:
   - Orquestador mínimo de estadísticas PEA
   - NO contiene lógica de cálculo
   - NO filtra datos
   - NO interpreta resultados

   Responsabilidades:
   1) Ejecutar render de todas las estadísticas
   2) Re-ejecutar ante cambios de filtros
   3) Mantener aislamiento total entre stats

   Eventos escuchados:
   - DOMContentLoaded
   - PEA_FILTERS_UPDATED

   Dependencias esperadas (YA EXISTEN):
   - pea_storage.js
   - pea_filters.js
   - pea_metrics.js (renderCuadroBasePEA)

   IMPORTANTE:
   - Cada estadística vive en su propio archivo
   - Cada archivo expone UNA función global:
     window.renderStat_XX()
   ========================================================= */

/* =========================================================
   LISTADO OFICIAL DE ESTADÍSTICAS (ORDEN FIJO)
   ========================================================= */

const PEA_STATS_RENDERERS = [
  // NIVEL 1 — BRÚJULA
  'renderStat_01_brujula_perdidas',
  'renderStat_02_top_pensamientos_perdidas',
  'renderStat_03_top_acciones_perdidas',
  'renderStat_04_top_emociones_perdidas_despues',

  // NIVEL 2 — OPERATIVO
  'renderStat_05_interferencia_ganar_vs_perder',
  'renderStat_06_cumplimiento_ganar_vs_perder',
  'renderStat_07_balanza_cumplimiento_interferencia',
  'renderStat_08_intensidad_por_resultado',

  // NIVEL 3 — SALUD / CALIDAD
  'renderStat_09_cobertura_metodo',
  'renderStat_10_salud_dato',
  'renderStat_11_momentos_estructurales',
  'renderStat_12_distribucion_global',

  // NIVEL 4 — AVANZADAS
  'renderStat_13_matriz_momento_resultado',
  'renderStat_14_pareto_acciones',
  'renderStat_15_pareto_pensamientos',
  'renderStat_16_puentes_conductuales'
];

/* =========================================================
   FUNCIÓN CENTRAL DE EJECUCIÓN
   ========================================================= */

function runAllPEAStats() {
  if (!Array.isArray(PEA_STATS_RENDERERS)) return;

  // 🔑 LIMPIAR LOS CONTENEDORES DE NIVEL UNA SOLA VEZ
  document.querySelectorAll('.pea-level-content').forEach(el => {
    el.innerHTML = '';
  });

  // 🔁 Ejecutar cada estadística
  PEA_STATS_RENDERERS.forEach(fnName => {
    try {
      if (typeof window[fnName] === 'function') {
        window[fnName]();
      } else {
        console.warn('[PEA][STATS] Renderer no encontrado:', fnName);
      }
    } catch (err) {
      console.error('[PEA][STATS] Error ejecutando', fnName, err);
    }
  });
}

/* =========================================================
   HOOKS DE EJECUCIÓN
   ========================================================= */

// Al cargar la pantalla
document.addEventListener('DOMContentLoaded', () => {
  runAllPEAStats();
});

// Al cambiar filtros
document.addEventListener('PEA_FILTERS_UPDATED', () => {
  runAllPEAStats();
});
