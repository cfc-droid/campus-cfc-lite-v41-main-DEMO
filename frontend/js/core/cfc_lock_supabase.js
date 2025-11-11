/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V3 — Control de sesión Realtime
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
  console.log("🔐 Intentando login Supabase para:", email);

  // 1️⃣ Buscar la licencia
  const { data: existing } = await supabase
    .from("licenses")
    .select("*")
    .eq("email", email)
    .eq("license_key", licenseKey)
    .maybeSingle();

  if (!existing) {
    alert("❌ Licencia o email inválidos (no encontrado en la base)");
    return;
  }

  // 2️⃣ Actualizar el registro con el nuevo session_id
  const { error } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("email", email);

  if (error) {
    console.error("❌ Error al actualizar sesión:", error);
    return;
  }

  // 3️⃣ Guardar localmente
  localStorage.setItem("CFC_EMAIL", email);
  localStorage.setItem("CFC_LICENSE", licenseKey);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada correctamente:", sessionId);

  // 4️⃣ Activar monitor Realtime
  startRealtimeMonitor(email, sessionId);

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
   ⚡ MONITOR — Realtime detection de duplicado
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Monitor Realtime activo para:", email);

  const channel = supabase
    .channel("licenses-changes")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "licenses",
        filter: `email=eq.${email}`,
      },
      (payload) => {
        const newSID = payload.new.session_id;
        const active = payload.new.active_session;

        if (active && newSID !== localSessionId) {
          console.warn("🚨 Sesión duplicada detectada — cierre remoto");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) =>
      console.log("🟢 Canal Realtime conectado:", status)
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
