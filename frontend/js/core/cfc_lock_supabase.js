/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V7.2_REALTIME_DIRECTIONAL
   Sistema: Campus CFC LITE V41-DEMO
   Autor: CFC-DROID | QA-SYNC V41.2 | 2025-11-11
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nowISO = () => new Date().toISOString();
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Activa sesión única
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const e = email.trim().toLowerCase();
  const k = licenseKey.trim();
  const sessionId = makeSessionId();

  console.log("🟡 Login iniciado:", e, k);

  // 1️⃣ Busca licencia
  const { data: rows, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("email", e);

  if (error) {
    alert("❌ Error de conexión con Supabase.");
    console.error(error);
    return;
  }

  const row = rows.find((r) => r.license_key === k);
  if (!row) {
    alert("⚠️ Licencia o correo inválido.");
    return;
  }

  // 2️⃣ Cierra sesiones anteriores
  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", e);

  // 3️⃣ Activa nueva sesión
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("id", row.id);

  if (updateError) {
    alert("❌ No se pudo iniciar sesión.");
    console.error(updateError);
    return;
  }

  // 4️⃣ Guarda local
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión creada:", sessionId);

  // 5️⃣ Inicia monitoreo realtime
  startRealtimeMonitor(e, sessionId);

  // 6️⃣ Redirige
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Manual o remoto
   ========================================================== */
export async function CFC_logout(manual = true) {
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

  if (manual) alert("🔒 Sesión cerrada correctamente.");
  window.location.href = "../html/login.html";
}

/* ==========================================================
   ⚡ MONITOR — Direccional (solo cierre remoto)
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Canal realtime iniciado:", email);

  // Limpieza de canales previos
  supabase.removeAllChannels();

  const channel = supabase
    .channel("cfc-lock-licenses")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "licenses",
        filter: `email=eq.${email}`,
      },
      (payload) => {
        const remoteId = payload?.new?.session_id;
        const active = payload?.new?.active_session;

        if (active && remoteId && remoteId !== localSessionId) {
          console.warn("🚨 Sesión remota detectada, cierre local activado");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) => console.log("🟢 Canal realtime:", status));

  // 🔁 Ping de seguridad cada 45 s
  setInterval(async () => {
    const { error } = await supabase
      .from("licenses")
      .select("id")
      .limit(1);
    if (error) console.warn("🔄 Ping fallido:", error.message);
  }, 45000);
}

/* ==========================================================
   ♻️ AUTOLOAD
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const e = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (e && sid) {
    console.log("♻️ Restaurando sesión previa:", sid);
    startRealtimeMonitor(e, sid);
  }
});
