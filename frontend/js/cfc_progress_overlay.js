/* ============================================================================
   CFC_PROGRESS_OVERLAY.JS — OVERLAY PREMIUM NUEVO (Fase 3/5 completa)
   ---------------------------------------------------------------------------
   Versión B3 — Opción A (todo el texto en color dorado #FFD700)
   Subpasos mantenidos:
   - 1.3 — Estructura base del overlay
   - 2.3 — Listado con los 11 datos
   - 3.3 — Animaciones + cierre seguro + tecla ESC
   ============================================================================ */
(function () {

    window.CFC_showProgressOverlayV3 = function () {

        const existing = document.getElementById("cfc-progress-overlay-v3");
        if (existing) existing.remove();

        const data = (typeof CFC_getProgressV3 === "function")
            ? CFC_getProgressV3()
            : {};

        const overlay = document.createElement("div");
        overlay.id = "cfc-progress-overlay-v3";
        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            background: "rgba(0,0,0,0.86)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "999999",
            opacity: "0",
            transition: "opacity .35s ease-in-out"
        });

        const box = document.createElement("div");
        Object.assign(box.style, {
            background: "rgba(20,20,20,0.92)",
            padding: "32px 38px",
            borderRadius: "14px",
            border: "1px solid #FFD700",
            boxShadow: "0 0 28px rgba(255,215,0,0.45)",
            width: "420px",
            maxWidth: "90%",
            fontFamily: "Poppins, sans-serif",
            color: "#FFD700", /* ← COLOR DORADO GLOBAL */
            textAlign: "left",
            transform: "translateY(20px)",
            transition: "transform .35s ease-in-out"
        });

        const title = document.createElement("h2");
        title.textContent = "📊 Tu Progreso";
        title.style.textAlign = "center";
        title.style.marginBottom = "22px";
        title.style.color = "#FFD700";
        box.appendChild(title);

        const barContainer = document.createElement("div");
        Object.assign(barContainer.style, {
            width: "100%",
            height: "14px",
            background: "#444",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "20px"
        });

        const barFill = document.createElement("div");
        barFill.style.width = `${data.percent || 0}%`;
        barFill.style.height = "100%";
        barFill.style.background = "linear-gradient(90deg,#FFD700,#FFEE88)";
        barFill.style.transition = "width .5s ease-out";

        barContainer.appendChild(barFill);
        box.appendChild(barContainer);

        // =======================================================
        // LISTA — TODO DORADO (OPCIÓN A)
        // Se eliminan los colores individuales.
        // =======================================================
        const ul = document.createElement("ul");
        ul.style.listStyle = "none";
        ul.style.padding = "0";
        ul.style.margin = "0";
        ul.style.lineHeight = "1.75";
        ul.style.fontSize = "0.93rem";
        ul.style.color = "#FFD700"; // ← aseguramos dorado total

        ul.innerHTML = `
            <li>📘 <b>Módulos completados:</b> ${data.modulesCompleted}/20 (${data.percent}%)</li>
            <li>🎯 <b>Último módulo completado:</b> ${data.lastCompletedModule}</li>
            <li>📚 <b>Módulo actual:</b> ${data.currentModule}</li>
            <li>🟢 <b>Primera sesión:</b> ${data.firstSessionDate}</li>
            <li>🔵 <b>Última sesión:</b> ${data.lastSessionDate}</li>
            <li>📅 <b>Días totales de estudio:</b> ${data.daysStudiedTotal}</li>
            <li>⏱️ <b>Horas activas:</b> ${data.timeTotalText}</li>
            <li>⚡ <b>Tiempo activo hoy:</b> ${data.timeTodayText}</li>
            <li>⏳ <b>Tiempo promedio por módulo:</b> ${data.avgPerModuleText}</li>
            <li>🚀 <b>Tiempo estimado para terminar:</b> ${data.estimatedText}</li>
        `;

        box.appendChild(ul);

        const btnClose = document.createElement("button");
        btnClose.textContent = "Cerrar";
        Object.assign(btnClose.style, {
            marginTop: "24px",
            width: "100%",
            padding: "10px 0",
            border: "none",
            borderRadius: "10px",
            fontWeight: "700",
            background: "linear-gradient(90deg,#FFD700,#FFEE88)",
            color: "#000",
            cursor: "pointer",
            boxShadow: "0 0 14px rgba(255,215,0,0.4)"
        });

        btnClose.onclick = closeOverlay;
        box.appendChild(btnClose);

        overlay.appendChild(box);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = "1";
            box.style.transform = "translateY(0)";
        }, 50);

        document.addEventListener("keydown", escClose);

        function closeOverlay() {
            overlay.style.opacity = "0";
            box.style.transform = "translateY(20px)";
            setTimeout(() => {
                overlay.remove();
                document.removeEventListener("keydown", escClose);
            }, 350);
        }

        function escClose(e) {
            if (e.key === "Escape") closeOverlay();
        }
    };

})();
