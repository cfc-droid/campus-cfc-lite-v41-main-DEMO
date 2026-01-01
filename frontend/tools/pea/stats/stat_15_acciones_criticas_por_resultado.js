/* =========================================================
   STAT 15 — ACCIONES CRÍTICAS POR RESULTADO (BANDERAS)
   (GANADA vs PERDIDA)

   Campus CFC LITE V41
   Nivel 3/4 (operativo directo)
   Estadística 15/17

   Qué hace:
   - Toma 3–6 acciones “bandera” (lista fija)
   - Calcula % de aparición en días GANADA vs PERDIDA
   - Presencia/ausencia por día (no frecuencia)
   - Co-ocurrencia, sin causalidad

   Por qué no duplica 03/06:
   - 03/06: Top ranking dentro de cada resultado
   - 15: misma acción comparada lado a lado GANADA vs PERDIDA
   ========================================================= */

(function () {

  window.renderStat_15_acciones_criticas_por_resultado = function () {

    const box = document.getElementById("pea-level-3") || document.getElementById("pea-level-4");
    if (!box || !window.PEA_STORAGE || !window.PEA_FILTERS || !window.renderCuadroBasePEA) return;

    const all = window.PEA_STORAGE.loadPEALog() || [];
    const filtered = window.PEA_FILTERS.apply(all) || [];

    // Solo VALIDO + CORREGIDO (igual que 8–11)
    const valid = filtered.filter(r =>
      r?.meta?.estado === "VALIDO" || r?.meta?.estado === "CORREGIDO"
    );

    /* ===============================
       1) Lista fija de BANDERAS
       - default: 6 acciones
       - opcional: window.PEA_STAT15_BANDERAS = [...]
       =============================== */

    const DEFAULT_BANDERAS = [
      "Entré sin señal",
      "Moví stop",
      "Re-entré sin señal",
      "Aumenté tamaño",
      "No respeté tamaño",
      "Dejé correr pérdida"
    ];

    let BANDERAS = Array.isArray(window.PEA_STAT15_BANDERAS) && window.PEA_STAT15_BANDERAS.length
      ? window.PEA_STAT15_BANDERAS.slice(0, 6)
      : DEFAULT_BANDERAS;

    // Si existe catálogo global, limpiamos banderas inválidas (sin inventar acciones)
    if (Array.isArray(window.PEA_ACCIONES) && window.PEA_ACCIONES.length) {
      const setCat = new Set(window.PEA_ACCIONES);
      BANDERAS = BANDERAS.filter(a => setCat.has(a));
    }

    if (!BANDERAS.length) {
      renderEmpty(box, "No hay acciones bandera definidas o no existen en el catálogo.");
      return;
    }

    /* ===============================
       2) Resultado final por fecha (GANADA/PERDIDA)
       =============================== */

    const resultadoPorFecha = {};

    valid.forEach(r => {
      if (
        r.momento === "DESPUÉS" &&
        (r.resultado_operativo === "GANADA" || r.resultado_operativo === "PERDIDA") &&
        r.fecha
      ) {
        // Nota: mismo comportamiento que tus stats actuales (si hay varios, pisa).
        resultadoPorFecha[r.fecha] = r.resultado_operativo;
      }
    });

    const fechas = Object.keys(resultadoPorFecha);
    if (!fechas.length) {
      renderEmpty(box, "No hay DESPUÉS con resultado GANADA/PERDIDA.");
      return;
    }

    /* ===============================
       3) Base por día + primer DURANTE
       - presencia/ausencia por bandera
       =============================== */

    const base = {
      GANADA: { total: 0, hit: {} },
      PERDIDA: { total: 0, hit: {} }
    };

    BANDERAS.forEach(a => {
      base.GANADA.hit[a] = 0;
      base.PERDIDA.hit[a] = 0;
    });

    fechas.forEach(fecha => {
      const res = resultadoPorFecha[fecha];
      base[res].total++;

      // Primer DURANTE con acciones_keys
      const durante = valid.find(r =>
        r.fecha === fecha &&
        r.momento === "DURANTE" &&
        Array.isArray(r.acciones_keys)
      );

      if (!durante) return;

      const acciones = new Set(durante.acciones_keys);

      BANDERAS.forEach(a => {
        if (acciones.has(a)) base[res].hit[a]++;
      });
    });

    /* ===============================
       4) Construcción de tabla
       =============================== */

    function pct(h, t) {
      return t ? Math.round((h / t) * 100) : 0;
    }

    function pp(a, b) {
      // delta en puntos porcentuales: PERDIDA - GANADA
      return (b - a);
    }

    const rows = BANDERAS.map(a => {
      const gH = base.GANADA.hit[a] || 0;
      const pH = base.PERDIDA.hit[a] || 0;
      const gT = base.GANADA.total || 0;
      const pT = base.PERDIDA.total || 0;

      const gPct = pct(gH, gT);
      const pPct = pct(pH, pT);
      const delta = pp(gPct, pPct);

      return { a, gH, gT, gPct, pH, pT, pPct, delta };
    });

    // Orden: mayor diferencia a favor de PERDIDA (más “alerta”)
    rows.sort((x, y) => (y.delta - x.delta));

    const body = rows.map(r => `
      <tr>
        <td>${escapeHtml(r.a)}</td>
        <td class="pea-n">${r.gPct}% <span style="opacity:.6;">(${r.gH}/${r.gT})</span></td>
        <td class="pea-n">${r.pPct}% <span style="opacity:.6;">(${r.pH}/${r.pT})</span></td>
        <td class="pea-n">${r.delta >= 0 ? "+" : ""}${r.delta} pp</td>
      </tr>
    `).join("");

    const contenidoHTML = `
      <table class="pea-table">
        <thead>
          <tr>
            <th>Acción bandera</th>
            <th>GANADA</th>
            <th>PERDIDA</th>
            <th>Δ (PERDIDA − GANADA)</th>
          </tr>
        </thead>
        <tbody>
          ${body}
        </tbody>
      </table>

      <div class="pea-metricas-secundarias">
        Presencia/ausencia por día (no frecuencia). Co-ocurrencia pura con el resultado final del día.<br>
        No mide gravedad. No interpreta. No establece causalidad.
      </div>
    `;

    // Estado del sistema (simple, como tus otros stats)
    const totalDias = fechas.length;
    const gDias = base.GANADA.total;
    const pDias = base.PERDIDA.total;

    let semaforo = "🟡 Datos parciales";
    if (gDias >= 3 && pDias >= 3) semaforo = "🟢 Datos suficientes";
    if (gDias === 0 || pDias === 0) semaforo = "🔴 Datos insuficientes";

    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 15,
      titulo: "Acciones críticas por resultado (banderas)",
      totalRegistros: totalDias,
      universo: "Primer DURANTE por fecha en días con DESPUÉS = GANADA o PERDIDA",
      criterios: [
        `Banderas: ${BANDERAS.length} (lista fija)`,
        "Presencia/ausencia por día (no ranking, no frecuencia)",
        "Resultado heredado del registro DESPUÉS",
        "Solo registros VALIDO y CORREGIDO",
        semaforo
      ],
      contenidoHTML
    }));
  };

  function renderEmpty(box, reason) {
    box.insertAdjacentHTML("beforeend", window.renderCuadroBasePEA({
      nivel: 3,
      indice: 15,
      titulo: "Acciones críticas por resultado (banderas)",
      totalRegistros: 0,
      universo: "—",
      criterios: null,
      contenidoHTML: `
        <div class="pea-empty">
          Evidencia insuficiente para esta estadística.<br>
          <span style="opacity:.85;">${escapeHtml(reason || "")}</span>
        </div>
      `
    }));
  }

  // Evitar inyectar HTML si el texto trae caracteres raros
  function escapeHtml(s) {
    return String(s || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

})();
