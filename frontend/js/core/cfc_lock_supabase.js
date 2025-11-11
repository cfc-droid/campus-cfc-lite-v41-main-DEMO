/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V4.2 — Control de sesión Realtime (Stable)
   Sistema: Campus CFC LITE V41-DEMO (Cloudflare SAFE)
   Auditor: QA-SYNC — 2025-11-11
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ==========================================================
   🔹 Configuración Supabase
   ========================================================== */
const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ==========================================================
   🧩 Utilidades
   ========================================================== */
const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Crea o actualiza la sesión
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();
  console.log("🔐 Intentando login Supabase QA-SYNC:", email);

  // 1️⃣ Buscar la licencia (insensible a mayúsculas)
  const { data: existing, error: errLookup } = await supabase
    .from("licenses")
    .select("*")
    .ilike("email", email.trim())
    .ilike("license_key", licenseKey.trim())
    .maybeSingle();

  if (errLookup) {
    console.error("❌ Error al consultar la licencia:", errLookup);
    alert("Error de conexión con Supabase.");
    return;
  }

  if (!existing) {
    alert("❌ Licencia o email inválidos (no encontrado en la base)");
    return;
  }

  // 2️⃣ Actualizar el registro
  const { error: errUpdate } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("id", existing.id);

  if (errUpdate) {
    console.error("❌ Error al actualizar sesión:", errUpdate);
    return;
  }

  // 3️⃣ Guardar localmente
  localStorage.setItem("CFC_EMAIL", existing.email);
  localStorage.setItem("CFC_LICENSE", existing.license_key);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada:", sessionId);

  // 4️⃣ Activar monitor
  startRealtimeMonitor(existing.email, sessionId);

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
    .ilike("email", email);

  localStorage.clear();
  alert("🔒 Sesión cerrada correctamente.");
  window.location.href = "../html/login.html";
}

/* ==========================================================
   ⚡ MONITOR — Detección Realtime
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Monitor Realtime activo QA-SYNC para:", email);

  const channel = supabase
    .channel("licenses-realtime")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "licenses",
        filter: `email=eq.${email}`,
      },
      (payload) => {
        if (!payload?.new) return;

        const remoteSID = payload.new.session_id;
        const active = payload.new.active_session;

        // 🚨 Sesión duplicada
        if (active && remoteSID !== localSessionId) {
          console.warn("[QA-SYNC] 🚨 Sesión duplicada detectada");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) =>
      console.log("🟢 Canal Realtime conectado (QA-SYNC):", status)
    );

  return channel;
}

/* ==========================================================
   🧩 AUTOLOAD — si hay sesión local
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (email && sid) startRealtimeMonitor(email, sid);
});
