/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V5.2 — Realtime + Cloudflare SAFE (Final)
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Crea o actualiza la sesión
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim(); // mantener exacto (puede ser numérico)

  console.log("🔐 Intentando login Supabase CLOUDSAFE:", e, k);

  // 1️⃣ Buscar registro exacto — Cloudflare SAFE (sin .eq)
  const { data: rows, error: lookupError } = await supabase
    .from("licenses")
    .select("*");

  if (lookupError) {
    console.error("❌ Error al consultar Supabase:", lookupError);
    alert("Error de conexión con Supabase.");
    return;
  }

  // 🔍 Coincidencia manual local (evita bug de tipo en Cloudflare)
  const row = (rows || []).find(
    (r) =>
      String(r.email).trim().toLowerCase() === e &&
      String(r.license_key).trim() === k
  );

  if (!row) {
    alert("❌ Licencia o email inválidos (no encontrado en la base)");
    console.warn("🧩 No se encontró coincidencia en los registros locales.");
    return;
  }

  // 2️⃣ Actualizar la sesión
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("id", row.id);

  if (updateError) {
    console.error("❌ Error al actualizar sesión:", updateError);
    alert("Error al actualizar la sesión.");
    return;
  }

  // 3️⃣ Guardar localmente
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada:", sessionId);

  // 4️⃣ Activar monitor Realtime
  startRealtimeMonitor(e, sessionId);

  // 5️⃣ Redirigir
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Finaliza sesión
   ========================================================== */
export async function CFC_logout() {
  const email = localStorage.getItem("CFC_EMAIL");
  if (!email) return;

  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", email);

  localStorage.clear();
  alert("🔒 Sesión cerrada correctamente.");
  window.location.href = "../html/login.html";
}

/* ==========================================================
   ⚡ MONITOR — Detección Realtime duplicada
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Realtime activo para:", email);

  supabase
    .channel("licenses-stream")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "licenses",
        filter: `email=eq.${email}`,
      },
      (payload) => {
        const remoteSID = payload?.new?.session_id;
        const active = payload?.new?.active_session;

        if (!remoteSID) return;

        if (active && remoteSID !== localSessionId) {
          console.warn("🚨 Sesión duplicada detectada (QA-SYNC)");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) => {
      console.log("🟢 Canal Realtime conectado:", status);
    });
}

/* ==========================================================
   🧩 AUTOLOAD — Sesión previa
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (email && sid) startRealtimeMonitor(email, sid);
});
