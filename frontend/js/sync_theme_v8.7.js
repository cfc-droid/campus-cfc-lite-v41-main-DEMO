/* ==========================================================
   ✅ CFC_SYNC V8.7 — Lote de actualización dual-theme
   Autor: Cristian F. Choqui
   Fecha: 2025-11-01
   Descripción: Inserta/actualiza automáticamente soporte de
   modo claro/oscuro y scripts globales QA-SYNC en todos los
   módulos (capítulos + exámenes).
   ========================================================== */

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '../modules');
const log = [];

// --- Bloques que se insertarán ---
const HEAD_INSERT = `
  <!-- ✅ Estilos necesarios para modo claro/oscuro -->
  <link rel="stylesheet" href="../../css/variables.css?v=20251102" />
  <link rel="stylesheet" href="../../css/premium.min.css?v=20251102" />
`;

const BODY_INSERT = `
  <!-- 🔙 Botón volver -->
  <script src="../../js/backButton.js"></script>
  <!-- ✅ CFC_SYNC QA-SYNC V9.8C — progreso global -->
  <script src="../../js/progress_v2.js?v=9.8C" defer></script>
  <!-- ✅ QA-SYNC V41.3 - Auto-Injector Global -->
  <script src="../../js/auto_injector.js?v=20251102" defer></script>
  <!-- ✅ CFC_FUNC_5_1C_V41_REAL — Modo claro/oscuro -->
  <script src="../../js/theme_chapter.js?v=20251102" defer></script>
`;

// --- Función recursiva ---
function updateFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) return updateFiles(fullPath);
    if (!file.endsWith('.html')) return;

    let content = fs.readFileSync(fullPath, 'utf8');

    // Agregar data-theme al <html>
    if (!content.includes('data-theme')) {
      content = content.replace('<html', '<html data-theme="light"');
    }

    // Inyectar estilos después del <head>
    if (!content.includes('variables.css')) {
      content = content.replace(/<head[^>]*>/i, match => `${match}\n${HEAD_INSERT}`);
    }

    // Reemplazar scripts al final del body
    if (!content.includes('theme_chapter.js')) {
      content = content.replace(/<\/body>/i, `${BODY_INSERT}\n</body>`);
    }

    fs.writeFileSync(fullPath, content, 'utf8');
    log.push(`✅ Actualizado: ${fullPath}`);
  });
}

// --- Ejecutar ---
updateFiles(baseDir);

// --- Reporte ---
console.log("=== QA-SYNC LOTE COMPLETADO ===");
console.log(log.join('\n'));
console.log(`Total archivos modificados: ${log.length}`);
