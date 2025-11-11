/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V5.9_STABLE — Sesión Única (Prioridad Nueva)
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   Descripción:
   - Garantiza 1 sola sesión activa por usuario.
   - Si se inicia en otro dispositivo → se cierra la anterior.
   - No usa Realtime (totalmente Cloudflare SAFE).
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nowISO = () => new Date().toISOString();
const makeSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

/* ==========================================================
   🔐 LOGIN — Crea sesión única y reemplaza la anterior
   ========================================================== */
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();

  console.log("🔐 Intentando login Supabase (modo prioridad nueva):", e, k);

  // 1️⃣ Buscar licencia válida
  const { data: rows, error: lookupError } = await supabase
    .from("licenses")
    .select("id,email,license_key,active_session,session_id");

  if (lookupError) {
    console.error("❌ Error al consultar Supabase:", lookupError);
    alert("Error de conexión con Supabase.");
    return;
  }

  const row = rows.find((r) => {
    const dbEmail = String(r.email || "").trim().toLowerCase();
    const dbKey = String(r.license_key || "").trim();
    return (
      dbEmail === e &&
      (dbKey === k ||
        dbKey === String(Number(k)) ||
        String(Number(dbKey)) === k)
    );
  });

  if (!row) {
    alert("❌ Email o licencia inválida.");
    return;
  }

  // 2️⃣ Cierra cualquier sesión previa del mismo usuario
  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", e);

  // 3️⃣ Registra nueva sesión (reemplaza la anterior)
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
    alert("Error al actualizar sesión en Supabase.");
    return;
  }

  // 4️⃣ Guardar datos locales
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada correctamente:", sessionId);

  // 5️⃣ Redirigir al Campus
  window.location.href = "../index.html";
}

/* ==========================================================
   🔒 LOGOUT — Finaliza sesión manual o remota
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
   🧩 AUTOLOAD — Verifica si la sesión local sigue activa
   ========================================================== */
document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");

  if (!email || !sid) return;

  // 🔍 Verifica en Supabase si la sesión actual sigue siendo la activa
  const { data, error } = await supabase
    .from("licenses")
    .select("session_id,active_session")
    .eq("email", email)
    .single();

  if (!error && data) {
    // ❌ Si la sesión fue reemplazada → cierre automático local
    if (!data.active_session || data.session_id !== sid) {
      console.warn("🚨 Sesión inválida o reemplazada → cierre forzado local");
      localStorage.clear();
      alert(
        "⚠️ Tu sesión fue cerrada automáticamente porque iniciaste en otro dispositivo."
      );
      window.location.href = "../html/login.html";
    } else {
      console.log("🟢 Sesión activa validada:", sid);
    }
  }
});
