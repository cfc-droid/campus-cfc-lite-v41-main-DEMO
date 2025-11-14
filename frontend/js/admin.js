/*
===============================================================
  ARCHIVO: frontend/js/admin.js
  VERSIÓN: V37.4 FINAL — PUNTO 7/15 COMPLETADO
  FECHA: 19/10/2025
  AUTOR: Cristian F. Choqui
  DESCRIPCIÓN:
  Panel Admin del Campus CFC Trading LITE V37 FINAL
  Funciones: historial, exportar CSV/JSON/ZIP, limpiar progreso,
  estadísticas, backup incremental y configuración (settings.json)
===============================================================
*/

(function adminPanel() {
  const tbody = document.querySelector("#table-history tbody");

  // ============================================================
  // CARGAR HISTORIAL DESDE LOCALSTORAGE
  // ============================================================
  function loadHistoryFromLS() {
    let hist = [];
    const raw = localStorage.getItem("cfc_history");
    if (raw) hist = JSON.parse(raw);

    for (let i = 1; i <= 20; i++) {
      const score = parseInt(localStorage.getItem(`mod${i}_score`)) || 0;
      const attempts = parseInt(localStorage.getItem(`mod${i}_attempts`)) || 0;
      const date = localStorage.getItem(`mod${i}_ts`) || new Date().toISOString();
      if (attempts > 0) hist.push({ mod: i, score, attempts, fecha: date });
    }

    hist.sort((a, b) => a.mod - b.mod);
    return hist;
  }

  // ============================================================
  // RENDERIZAR TABLA DE HISTORIAL
  // ============================================================
  function render() {
    const hist = loadHistoryFromLS();
    tbody.innerHTML = "";

    hist.forEach((h) => {
      tbody.innerHTML += `
        <tr>
          <td>Módulo ${h.mod}</td>
          <td>${h.score}%</td>
          <td>${h.attempts}</td>
          <td>${new Date(h.fecha).toLocaleString()}</td>
        </tr>`;
    });

    // Actualizar barra de progreso
    const progreso = calculateProgress();
    const barra = document.getElementById("barra-progreso");
    const texto = document.getElementById("porcentaje-progreso");
    barra.style.width = `${progreso}%`;
    texto.textContent = `Progreso general: ${progreso}%`;
  }

  // ============================================================
  // EXPORTAR CSV
  // ============================================================
  function exportCSV() {
    const hist = loadHistoryFromLS();
    let lines = ["Módulo,Puntaje,Intentos,Fecha"];
    hist.forEach((h) => lines.push(`${h.mod},${h.score},${h.attempts},${h.fecha}`));
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Historial_CFC.csv";
    a.click();
    URL.revokeObjectURL(a.href);
    alert("✅ Historial exportado a formato CSV.");
  }

  // ============================================================
  // EXPORTAR JSON
  // ============================================================
  function exportJSON() {
    const data = {
      fecha_exportacion: new Date().toISOString(),
      version: "LITE V37 FINAL",
      autor: "Cristian F. Choqui",
      progreso: calculateProgress(),
      historial: loadHistoryFromLS(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Backup_CFC_History.json";
    a.click();
    URL.revokeObjectURL(a.href);
    alert("✅ Backup exportado como JSON.");
  }

  // ============================================================
  // EXPORTAR BACKUP ZIP
  // ============================================================
  async function exportBackupZIP() {
    try {
      const hist = loadHistoryFromLS();
      const progreso = calculateProgress();

      const lines = ["Módulo,Puntaje,Intentos,Fecha"];
      hist.forEach((h) =>
        lines.push(`${h.mod},${h.score},${h.attempts},${h.fecha}`)
      );

      const jsonData = {
        version: "LITE V37 FINAL",
        autor: "Cristian F. Choqui",
        fecha: new Date().toISOString(),
        progreso,
        historial: hist,
      };

      const infoText = `Campus CFC Trading LITE V37 FINAL
Autor: Cristian F. Choqui
Fecha: ${new Date().toLocaleString()}
Progreso: ${progreso}%`;

      const zip = new JSZip();
      zip.file("historial.csv", lines.join("\n"));
      zip.file("backup.json", JSON.stringify(jsonData, null, 2));
      zip.file("info.txt", infoText);

      const blob = await zip.generateAsync({ type: "blob" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "Backup_CFC_LITE_V37.zip";
      a.click();
      URL.revokeObjectURL(a.href);
      alert("✅ Backup ZIP local generado correctamente.");
    } catch (e) {
      console.error("Error al generar ZIP:", e);
      alert("❌ Error al generar ZIP. Revisa consola.");
    }
  }

  // ============================================================
  // EXPORTAR CONFIGURACIÓN
  // ============================================================
  function exportSettings() {
    const config = {
      version: "LITE V37 FINAL",
      autor: "Cristian F. Choqui",
      tema: localStorage.getItem("cfc_theme") || "oscuro",
      branding: {
        nombre: "Campus CFC Trading",
        color_principal: "#00ccff",
      },
      usuario: {
        progreso: calculateProgress(),
        idioma: "es",
      },
      fecha_exportacion: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "settings.json";
    a.click();
    URL.revokeObjectURL(a.href);
    alert("✅ Configuración exportada como settings.json");
  }

  // ============================================================
  // ACTUALIZAR ESTADÍSTICAS
  // ============================================================
  function updateStats() {
    const hist = loadHistoryFromLS();
    if (hist.length === 0) {
      alert("⚠️ No hay datos disponibles en LocalStorage.");
      return;
    }
    const promedio = (
      hist.reduce((a, b) => a + b.score, 0) / hist.length
    ).toFixed(0);
    const intentos = hist.reduce((a, b) => a + b.attempts, 0);
    const aprobados = hist.filter((h) => h.score >= 70).length;

    document.getElementById("stat-promedio").textContent = `Promedio general: ${promedio}%`;
    document.getElementById("stat-intentos").textContent = `Intentos totales: ${intentos}`;
    document.getElementById("stat-aprobados").textContent = `Módulos aprobados: ${aprobados}/20`;
  }

  // ============================================================
  // LIMPIAR TODO EL HISTORIAL
  // ============================================================
  function clearAll() {
    if (!confirm("⚠️ ¿Seguro que deseas borrar todo el progreso del alumno?")) return;
    try {
      localStorage.removeItem("cfc_history");
      for (let i = 1; i <= 20; i++) {
        localStorage.removeItem(`mod${i}_score`);
        localStorage.removeItem(`mod${i}_attempts`);
        localStorage.removeItem(`mod${i}_completed`);
      }
      localStorage.setItem("mod_unlocked", "true");
      alert("✅ Progreso del alumno reiniciado correctamente.");
      location.reload();
    } catch (e) {
      console.error("Error al limpiar progreso:", e);
      alert("❌ Error al limpiar progreso.");
    }
  }

  // ============================================================
  // FUNCIÓN AUXILIAR DE PROGRESO
  // ============================================================
  function calculateProgress() {
    let completados = 0;
    for (let i = 1; i <= 20; i++) {
      if (localStorage.getItem(`mod${i}_completed`) === "true") completados++;
    }
    return ((completados / 20) * 100).toFixed(0);
  }

  // ============================================================
  // EVENTOS
  // ============================================================
  document.getElementById("btn-refresh").addEventListener("click", render);
  document.getElementById("btn-export").addEventListener("click", exportCSV);
  document.getElementById("btn-export-json").addEventListener("click", exportJSON);
  document.getElementById("btn-backup-zip").addEventListener("click", exportBackupZIP);
  document.getElementById("btn-update-stats").addEventListener("click", updateStats);
  document.getElementById("btn-clear").addEventListener("click", clearAll);

  const btnSettings = document.createElement("button");
  btnSettings.className = "btn";
  btnSettings.textContent = "⚙️ Exportar Configuración";
  btnSettings.addEventListener("click", exportSettings);
  document.getElementById("btn-backup-zip")?.insertAdjacentElement("afterend", btnSettings);

  const btnBackupIncremental = document.createElement("button");
  btnBackupIncremental.className = "btn";
  btnBackupIncremental.textContent = "💾 Guardar Backup Incremental";
  btnBackupIncremental.addEventListener("click", () => {
    try {
      const hist = loadHistoryFromLS();
      hist.forEach((h) =>
        window.CFCBackup.save(h.mod, h.score, h.attempts, h.score >= 70)
      );
      alert("✅ Backup incremental actualizado con éxito.");
    } catch (e) {
      console.error("Error al crear backup incremental:", e);
      alert("❌ Error al crear backup incremental.");
    }
  });
  btnSettings.insertAdjacentElement("afterend", btnBackupIncremental);

  render();
  updateStats();
})();

/* ============================================================
   (B) CFC_HEARTBEAT DOMINIO
============================================================ */
setInterval(() => {
  if (!window.CFC_DOMAIN_OK) {
    window.location.href = "/frontend/blocked.html";
  }
}, 10000);

/* ============================================================
   (C)(F) ROOT GUARD + IDENTIDAD
============================================================ */
import "/frontend/js/core/cfc_lock_identity.js";

/* ============================================================
   (G) HEARTCORE MONITOR
============================================================ */
setInterval(() => {
  const sessionId = localStorage.getItem("CFC_SESSION_ID");
  if (!sessionId) {
    const ov = document.createElement("div");
    ov.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.85);color:#ffd700;font-family:Poppins,sans-serif;display:flex;align-items:center;justify-content:center;z-index:999999;";
    ov.innerHTML = "<div>⚠️ Sesión inválida</div>";
    document.body.appendChild(ov);
    setTimeout(() => (window.location.href = "/html/login.html"), 1500);
  }
}, 5000);
