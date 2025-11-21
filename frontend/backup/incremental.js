/* ============================================================
   Archivo: frontend/backup/incremental.js
   Función: Sistema de Backup Incremental Local (LITE V37 FINAL)
   Autor: Cristian F. Choqui
   ============================================================ */

(function incrementalBackup() {
  const BACKUP_KEY = "cfc_backup_incremental_v37";

  // ============================================================
  // CARGAR BACKUP EXISTENTE DESDE LOCALSTORAGE
  // ============================================================
  function loadBackup() {
    try {
      const raw = localStorage.getItem(BACKUP_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("⚠️ Error al leer backup incremental:", e);
      return [];
    }
  }

  // ============================================================
  // GUARDAR NUEVO ESTADO (solo cambios)
  // ============================================================
  function saveIncrementalChange(moduleId, score, attempts, completed) {
    try {
      const backup = loadBackup();
      const timestamp = new Date().toISOString();

      // Buscar si el módulo ya está en backup
      const existing = backup.find((b) => b.mod === moduleId);

      if (existing) {
        // Actualizar solo si hay cambios nuevos
        if (
          existing.score !== score ||
          existing.attempts !== attempts ||
          existing.completed !== completed
        ) {
          existing.score = score;
          existing.attempts = attempts;
          existing.completed = completed;
          existing.updatedAt = timestamp;
        }
      } else {
        // Nuevo módulo añadido
        backup.push({
          mod: moduleId,
          score,
          attempts,
          completed,
          updatedAt: timestamp,
        });
      }

      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (e) {
      console.error("❌ Error al guardar backup incremental:", e);
    }
  }

  // ============================================================
  // GENERAR BACKUP CONSOLIDADO FINAL (para exportar ZIP)
  // ============================================================
  function exportIncrementalBackup() {
    try {
      const backup = loadBackup();
      if (backup.length === 0) {
        alert("⚠️ No hay registros en el backup incremental.");
        return;
      }

      const data = {
        version: "LITE V37 FINAL",
        fecha_exportacion: new Date().toISOString(),
        cantidad_modulos: backup.length,
        modulos: backup,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "backup_incremental_cfc.json";
      a.click();
      URL.revokeObjectURL(a.href);
      alert("✅ Backup incremental exportado correctamente.");
    } catch (e) {
      console.error("❌ Error al exportar backup incremental:", e);
    }
  }

  // ============================================================
  // API GLOBAL (para acceso desde admin.js u otros scripts)
  // ============================================================
  window.CFCBackup = {
    save: saveIncrementalChange,
    export: exportIncrementalBackup,
    load: loadBackup,
  };

  console.log("✅ Módulo incrementalBackup() cargado correctamente.");
})();
