/* =======================================================
   CFC — SERVICE WORKER AUTO-INJECTOR V1.0 (QA-SYNC 2025-11-01)
   ======================================================= */

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Solo interceptar archivos HTML de módulos y capítulos
  if (url.includes("/modules/") && url.endsWith(".html")) {
    event.respondWith(
      (async () => {
        const response = await fetch(event.request);
        const text = await response.text();

        // Si ya tiene progress_v2.js, no inyectar
        if (text.includes("progress_v2.js")) return response;

        // Inyectar justo antes del cierre </body>
        const modified = text.replace(
          /<\/body>/i,
          `<script defer src="../../js/progress_v2.js"></script>\n</body>`
        );

        return new Response(modified, {
          headers: response.headers,
          status: response.status,
          statusText: response.statusText,
        });
      })()
    );
  }
});
