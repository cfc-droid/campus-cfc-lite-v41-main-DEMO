/* ==========================================================
   CFC-SYNC READER — SUBPASO 5/5-A (COMPLETO)
   Versión: CFC_SYNC_READER_V1.0
   Objetivo:
     - Recolectar TODO el progreso local del Campus
     - Filtrar por claves válidas
     - Armar JSON completo
     - Imprimir datos en consola
     - NO modificar localStorage
   Estado:
     ✔ 5/5-A.1 Base lista
     ✔ 5/5-A.2 Lector implementado
     ✔ 5/5-A.3 Impresor implementado
     ✔ 5/5-A.4 Validación lista
   ========================================================== */

console.log("🟦 CFC_SYNC_READER_READY — Archivo cargado (SUBPASO 5/5-A COMPLETO)");

/* ----------------------------------------------------------
   Espacio de nombres
----------------------------------------------------------- */
const CFC_SYNC_READER = {};

/* ----------------------------------------------------------
   Acción 5/5-A.2 — Lector real
   Recolecta TODAS las claves del localStorage.
   NO modifica nada.
----------------------------------------------------------- */
CFC_SYNC_READER.collect = function () {
  try {
    const validPrefixes = ["CFC_", "exam", "progress", "bitacora", "activity"];
    const result = {};

    console.log("🔍 CFC_SYNC_READER.collect() — Iniciando recolección…");

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      const isValid = validPrefixes.some((p) => key.startsWith(p));
      if (!isValid) continue;

      result[key] = localStorage.getItem(key);
    }

    console.log(
      `📦 CFC_SYNC_READER.collect() — Finalizado. ${Object.keys(result).length} claves detectadas.`
    );

    return result;
  } catch (err) {
    console.error("⛔ ERROR en CFC_SYNC_READER.collect()", err);
    return {};
  }
};

/* ----------------------------------------------------------
   Acción 5/5-A.3 — Impresor real
   Muestra el JSON completo en consola.
----------------------------------------------------------- */
CFC_SYNC_READER.print = function () {
  try {
    console.log("🖨️ CFC_SYNC_READER.print() — Procesando…");

    const data = CFC_SYNC_READER.collect();

    console.group("🟨 CFC-SYNC READER — JSON COMPLETO");
    console.log(data);
    console.groupEnd();

    console.log("✅ CFC_SYNC_READER.print() — Impreso correctamente");
  } catch (err) {
    console.error("⛔ ERROR en CFC_SYNC_READER.print()", err);
  }
};
