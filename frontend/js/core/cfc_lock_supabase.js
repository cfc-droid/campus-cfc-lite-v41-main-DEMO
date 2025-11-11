/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V7.2_REALTIME_DIRECTIONAL
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — Restaurado a versión funcional original
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
   🔐 LOGIN — Crea sesión única y cierra las anteriores
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();

  console.log("🔐 Intentando login Supabase Realtime:", e, k);

  const { data: rows, error: lookupError } = await supabase
    .from("licenses")
    .select("id,email,license_key,active_session,session_id");

  if (lookupError) {
    alert("Error de conexión con Supabase.");
    console.error(lookupError);
    return;
  }

  const row = rows.find(
    (r) =>
      r.email?.trim().toLowerCase() === e &&
      (r.license_key?.trim() === k ||
        String(r.license_key) === String(Number(k)))
  );

  if (!row) {
    alert("❌ Email o licencia inválida.");
    return;
  }

  // 1️⃣ Desactiva sesiones previas
  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", e);

  // 2️⃣ Activa la nueva
  const { error: updateError } = await supabase
    .from("licenses")
    .update({
      active_session: true,
      session_id: sessionId,
      updated_at: nowISO(),
    })
    .eq("id", row.id);

  if (updateError) {
    alert("Error al actualizar sesión.");
    console.error(updateError);
    return;
  }

  // 3️⃣ Guarda localmente
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada correctamente:", sessionId);

  // 4️⃣ Activa Realtime
  startRealtimeMonitor(e, sessionId);

  // 5️⃣ Redirige
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Cierre manual o remoto
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
   ⚡ MONITOR — Solo cierra si detecta sesión distinta
   ========================================================== */
export function startRealtimeMonitor(email, localSessionId) {
  console.log("👁️ Realtime activo para:", email);

  const channel = supabase
    .channel("licenses-stream")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "licenses", filter: `email=eq.${email}` },
      (payload) => {
        const remoteSID = payload?.new?.session_id;
        const active = payload?.new?.active_session;

        // ✅ Solo cerrar si existe una sesión nueva (diferente)
        if (active && remoteSID && remoteSID !== localSessionId) {
          console.warn("🚨 Sesión remota detectada, cierre local activado");
          localStorage.clear();
          alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
          window.location.href = "../html/login.html";
        }
      }
    )
    .subscribe((status) => console.log("🟢 Canal Realtime:", status));

  // 🔁 Reintento de conexión cada 60s
  setInterval(() => {
    if (channel.state !== "joined") {
      console.warn("🔄 Reintentando conexión Realtime...");
      startRealtimeMonitor(email, localSessionId);
    }
  }, 60000);
}

/* ==========================================================
   🧩 AUTOLOAD — Restaura sesión activa
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (email && sid) {
    console.log("♻️ Restaurando sesión previa:", sid);
    startRealtimeMonitor(email, sid);
  }
});
