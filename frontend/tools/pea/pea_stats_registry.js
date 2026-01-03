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
  // NIVEL 0 — BRÚJULA GENERAL
  'renderStat_01_brujula_perdidas',
   
   // NIVEL 0 — BRÚJULA DE PERDIDAS
  'renderStat_02_top_pensamientos_perdidas',
  'renderStat_03_top_acciones_perdidas',
  'renderStat_04_top_emociones_perdidas_despues',

  // NIVEL 2 — ESPEJO DE GANADAS
   'renderStat_05_top_pensamientos_ganadas',
   'renderStat_06_top_acciones_ganadas',
   'renderStat_07_top_emociones_ganadas_despues', 
   

  // NIVEL 3 — COMPARACIÓN REAL (OPERATIVO)
    'renderStat_08_indice_interferencia',
    'renderStat_09_indice_cumplimiento',
    'renderStat_10_balanza_cumplimiento_interferencia',

   
  // NIVEL 4 — SALUD, ESTRUCTURA Y CAMBIOS
"renderStat_11_top_interferencias_por_resultado",
"renderStat_12_intensidad_por_resultado",
"renderStat_13_salud_del_dato",
"renderStat_14_momentos_estructurales_cambios",
'renderStat_15_acciones_criticas_por_resultado',
'renderStat_16_pensamientos_criticos_por_resultado',  
'renderStat_17_estados_por_resultado',
   
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

  // ✅ avisar que ya están renderizadas
  document.dispatchEvent(new CustomEvent("PEA_STATS_RENDERED"));
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
