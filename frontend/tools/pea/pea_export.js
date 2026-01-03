/* =========================================================
   PEA_EXPORT.JS
   - Exportar REGISTROS (tabla) y EXPORTAR HISTORIAL COMPLETO
   - Formatos: PNG, PDF, XLSX, CSV, DOC (Word compatible)
   ========================================================= */

(function () {
  const btnReg = document.getElementById("pea-btn-export-registros");
  const btnAll = document.getElementById("pea-btn-export-historial");

  if (!btnReg || !btnAll) return;

  // Qué parte capturar para "todo"
  const FULL_SELECTOR = ".pea-shell"; // captura filtros + tabla + stats (todo dentro del shell)
  const TABLE_SELECTOR = ".pea-table-wrap"; // sección de registros (incluye tabla)

  function safeFileName(base) {
    const d = new Date();
    const stamp = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
      "_",
      String(d.getHours()).padStart(2, "0"),
      String(d.getMinutes()).padStart(2, "0"),
    ].join("");
    return `${base}_${stamp}`;
  }

  function downloadBlob(blob, filename) {
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function chooseFormat(title, allowed) {
    const msg =
      `${title}\n` +
      `Elegí formato: ${allowed.join(", ")}\n` +
      `Escribí uno tal cual (ej: PDF)`;
    const v = (prompt(msg, allowed[0]) || "").trim().toUpperCase();
    if (!allowed.includes(v)) return null;
    return v;
  }

  async function captureToCanvas(element) {
    if (!window.html2canvas) throw new Error("html2canvas no está cargado");

    // Captura del tamaño REAL del elemento (incluye scrollWidth/scrollHeight)
    const w = Math.max(
      element.scrollWidth || 0,
      element.offsetWidth || 0,
      element.clientWidth || 0
    );
    const h = Math.max(
      element.scrollHeight || 0,
      element.offsetHeight || 0,
      element.clientHeight || 0
    );

    // Mejor calidad
    return await window.html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      scrollX: 0,
      scrollY: 0,
      windowWidth: w,
      windowHeight: h,
      width: w,
      height: h,
    });
  }

  // 🔑 Captura expandida: clona el bloque y abre contenedores con scroll interno
  async function captureExpandedClone(originalEl) {
    const clone = originalEl.cloneNode(true);

    // contenedor offscreen
    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-100000px";
    host.style.top = "0";
    host.style.width = "max-content";
    host.style.zIndex = "-1";
    host.appendChild(clone);
    document.body.appendChild(host);

    // Abrir scroll interno típico de la tabla
    const scrollBoxes = clone.querySelectorAll(".pea-table-scroll");
    scrollBoxes.forEach((box) => {
      box.style.overflow = "visible";
      box.style.maxHeight = "none";
      box.style.height = "auto";
    });

    // Abrir cualquier overflow/scroll interno que pueda recortar (solo en el clone)
    const allNodes = clone.querySelectorAll("*");
    allNodes.forEach((node) => {
      try {
        const cs = window.getComputedStyle(node);
        const ox = cs.overflowX;
        const oy = cs.overflowY;
        if (ox === "auto" || ox === "scroll") node.style.overflowX = "visible";
        if (oy === "auto" || oy === "scroll") node.style.overflowY = "visible";

        if (
          (ox === "auto" || ox === "scroll" || oy === "auto" || oy === "scroll") &&
          (cs.maxHeight && cs.maxHeight !== "none")
        ) {
          node.style.maxHeight = "none";
          node.style.height = "auto";
        }
      } catch (_) {
        // no-op
      }
    });

    // Por si hay wrappers con overflow/height
    clone.style.overflow = "visible";
    clone.style.maxHeight = "none";
    clone.style.height = "auto";

    // esperar layout
    await new Promise((r) => requestAnimationFrame(r));

    const canvas = await captureToCanvas(clone);

    // limpiar
    host.remove();

    return canvas;
  }

  async function exportPNG(element, baseName) {
    const canvas = await captureToCanvas(element);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    downloadBlob(blob, `${safeFileName(baseName)}.png`);
  }

  async function exportPDF(element, baseName) {
    const canvas = await captureToCanvas(element);
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) throw new Error("jsPDF no está cargado");

    // A4 portrait
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Imagen en mm manteniendo ratio
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Multipágina si es alto
    let y = 0;
    let remaining = imgHeight;

    while (remaining > 0) {
      pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
      remaining -= pageHeight;
      if (remaining > 0) {
        pdf.addPage();
        y -= pageHeight;
      }
    }

    pdf.save(`${safeFileName(baseName)}.pdf`);
  }

  function exportCSVFromTable(tableEl, baseName) {
    const rows = Array.from(tableEl.querySelectorAll("tr")).map((tr) =>
      Array.from(tr.querySelectorAll("th,td"))
        .map((td) => {
          const text = (td.innerText || "").replace(/\s+/g, " ").trim();
          // CSV escaping
          const escaped = text.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    );

    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    downloadBlob(blob, `${safeFileName(baseName)}.csv`);
  }

  function exportXLSXFromTable(tableEl, baseName) {
    if (!window.XLSX) throw new Error("XLSX no está cargado");

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(tableEl);
    XLSX.utils.book_append_sheet(wb, ws, "Registros");

    XLSX.writeFile(wb, `${safeFileName(baseName)}.xlsx`);
  }

  function exportDOCFromElement(element, baseName) {
    // Word abre HTML si lo guardás como .doc
    const html =
      `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>` +
      element.outerHTML +
      `</body></html>`;

    const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
    downloadBlob(blob, `${safeFileName(baseName)}.doc`);
  }

  function findElementOrThrow(selector) {
    const el = document.querySelector(selector);
    if (!el) throw new Error(`No encuentro el contenedor: ${selector}`);
    return el;
  }

  // ========= Acciones principales =========

  btnReg.addEventListener("click", async () => {
    try {
      const fmt = chooseFormat(
        "EXPORTAR REGISTROS",
        ["XLSX", "CSV", "PDF", "PNG", "DOC"]
      );
      if (!fmt) return;

      const wrap = findElementOrThrow(TABLE_SELECTOR);
      const table = wrap.querySelector("table");
      if (!table) throw new Error("No encuentro la tabla de registros");

      if (fmt === "CSV") return exportCSVFromTable(table, "PEA_REGISTROS");
      if (fmt === "XLSX") return exportXLSXFromTable(table, "PEA_REGISTROS");
      if (fmt === "DOC") return exportDOCFromElement(wrap, "PEA_REGISTROS");

      // 🔑 PNG/PDF: capturar el bloque expandido para que no recorte por overflow/scroll
      if (fmt === "PNG") {
        const canvas = await captureExpandedClone(wrap);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
        return downloadBlob(blob, `${safeFileName("PEA_REGISTROS")}.png`);
      }

      if (fmt === "PDF") {
        const canvas = await captureExpandedClone(wrap);
        const imgData = canvas.toDataURL("image/png");

        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) throw new Error("jsPDF no está cargado");

        // A4 portrait
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let y = 0;
        let remaining = imgHeight;

        while (remaining > 0) {
          pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
          remaining -= pageHeight;
          if (remaining > 0) {
            pdf.addPage();
            y -= pageHeight;
          }
        }

        return pdf.save(`${safeFileName("PEA_REGISTROS")}.pdf`);
      }
    } catch (e) {
      console.error("[PEA][EXPORT]", e);
      alert("Error exportando REGISTROS. Mirá consola (F12).");
    }
  });

  btnAll.addEventListener("click", async () => {
    try {
      const fmt = chooseFormat(
        "EXPORTAR HISTORIAL COMPLETO (TODO)",
        ["PDF", "PNG", "DOC"]
      );
      if (!fmt) return;

      const full = findElementOrThrow(FULL_SELECTOR);

      if (fmt === "DOC") return exportDOCFromElement(full, "PEA_HISTORIAL_TODO");

      // 🔑 PNG/PDF: usar captura expandida para NO recortar la tabla (17 columnas) dentro del historial
      if (fmt === "PNG") {
        const canvas = await captureExpandedClone(full);
        const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
        return downloadBlob(blob, `${safeFileName("PEA_HISTORIAL_TODO")}.png`);
      }

      if (fmt === "PDF") {
        const canvas = await captureExpandedClone(full);
        const imgData = canvas.toDataURL("image/png");

        const { jsPDF } = window.jspdf || {};
        if (!jsPDF) throw new Error("jsPDF no está cargado");

        // A4 portrait
        const pdf = new jsPDF("p", "mm", "a4");

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let y = 0;
        let remaining = imgHeight;

        while (remaining > 0) {
          pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
          remaining -= pageHeight;
          if (remaining > 0) {
            pdf.addPage();
            y -= pageHeight;
          }
        }

        return pdf.save(`${safeFileName("PEA_HISTORIAL_TODO")}.pdf`);
      }
    } catch (e) {
      console.error("[PEA][EXPORT]", e);
      alert("Error exportando HISTORIAL COMPLETO. Mirá consola (F12).");
    }
  });
})();
