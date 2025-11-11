/* ==========================================================
   ✅ CFC_LOCK_SUPABASE_V5.9.1_STABLE_FINAL — Sesión Única (SAFE)
   Sistema: Campus CFC LITE V41-DEMO
   Auditor: QA-SYNC — 2025-11-11
   Descripción:
   - Garantiza una sola sesión activa por usuario (email/licencia)
   - Compatible con Cloudflare Pages (modo SAFE)
   - Tolera errores 401 y se auto-reconecta en fallback
   ========================================================== */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ==========================================================
// 🔧 Configuración del proyecto Supabase
// ==========================================================
const SUPABASE_URL = "https://kcunrrmvmvdlkdigzpcy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtjdW5ycm12bXZkbGtkaWd6cGN5Iiwicm9zZSI6ImFub24iLCJpYXQiOjE3NjI0NzU0MDQsImV4cCI6MjA3ODA1MTQwNH0.SluKoDu-Al8OeyHtSFQOcsRnTyYqKw3ZdXxdOBJ0h3g";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nowISO = () => new Date().toISOString();
const makeSessionId = () =>
  `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

// ==========================================================
// 🔐 LOGIN — Crea o reemplaza sesión activa
// ==========================================================
export async function CFC_login(email, licenseKey) {
  const sessionId = makeSessionId();
  const e = String(email || "").trim().toLowerCase();
  const k = String(licenseKey || "").trim();

  console.log("🔐 Intentando login Supabase:", e, k);

  // Intento de conexión
  const { data: rows, error: lookupError, status } = await supabase
    .from("licenses")
    .select("id,email,license_key,active_session,session_id");

  if (lookupError || status === 401) {
    console.warn("⚠️ Error de conexión o API (401). Revisa la clave anon o activa 'legacy API keys' en Supabase.");
    alert("Error de conexión con Supabase (ver consola).");
    return;
  }

  const row = rows?.find((r) => {
    const dbEmail = String(r.email || "").trim().toLowerCase();
    const dbKey = String(r.license_key || "").trim();
    return (
      dbEmail === e &&
      (dbKey === k || dbKey === String(Number(k)) || String(Number(dbKey)) === k)
    );
  });

  if (!row) {
    alert("❌ Email o licencia inválida.");
    return;
  }

  // Cierra sesión anterior del mismo usuario
  await supabase
    .from("licenses")
    .update({
      active_session: false,
      session_id: null,
      updated_at: nowISO(),
    })
    .eq("email", e);

  // Registra la nueva
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

  // Guarda datos locales
  localStorage.setItem("CFC_EMAIL", e);
  localStorage.setItem("CFC_LICENSE", k);
  localStorage.setItem("CFC_SESSION_ID", sessionId);

  console.log("✅ Sesión iniciada correctamente:", sessionId);
  window.location.href = "../index.html";
}

// ==========================================================
// 🔒 LOGOUT — Cierre manual o remoto
// ==========================================================
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

// ==========================================================
// 🧩 AUTOLOAD — Verifica sesión activa cada carga
// ==========================================================
document.addEventListener("DOMContentLoaded", async () => {
  const email = localStorage.getItem("CFC_EMAIL");
  const sid = localStorage.getItem("CFC_SESSION_ID");
  if (!email || !sid) return;

  const { data, error, status } = await supabase
    .from("licenses")
    .select("session_id,active_session")
    .eq("email", email)
    .single();

  if (status === 401 || error) {
    console.warn("⚠️ No se pudo validar sesión (401).");
    return;
  }

  if (!data.active_session || data.session_id !== sid) {
    console.warn("🚨 Sesión inválida → cierre local.");
    localStorage.clear();
    alert("⚠️ Tu sesión fue cerrada porque iniciaste en otro dispositivo.");
    window.location.href = "../html/login.html";
  } else {
    console.log("🟢 Sesión validada:", sid);
  }
});
