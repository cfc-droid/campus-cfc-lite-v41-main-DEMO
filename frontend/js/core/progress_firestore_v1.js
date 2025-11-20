/* ===========================================================================
   ✅ CFC_PROGRESS_FIRESTORE_V1 — Sincronización global REAL
   Sistema: Campus CFC LITE V41 — Firestore + LocalStorage
   =========================================================================== */

import { getFirestore, doc, getDoc, setDoc, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const db = getFirestore();

/* ==========================================================
   🔹 Obtener email del usuario
   ========================================================== */
export function getEmail() {
  return localStorage.getItem("CFC_EMAIL")?.trim().toLowerCase() || null;
}

/* ==========================================================
   🔹 Construir payload
   ========================================================== */
function buildLocalPayload() {
  const progressData = JSON.parse(localStorage.getItem("progressData") || "{}");
  const examResults = JSON.parse(localStorage.getItem("examResults") || "[]");
  const totalSeconds = parseFloat(localStorage.getItem("CFC_time_total") || 0);
  
  return {
    completed: progressData.completed || [],
    lastModule: progressData.lastModule || null,
    examResults,
    totalSeconds,
    updated_at: serverTimestamp(),
    updated_at_iso: new Date().toISOString()
  };
}

/* ==========================================================
   🔹 Guardar progreso en Firestore
   ========================================================== */
export async function saveProgressToFirestore() {
  const email = getEmail();
  if (!email) return;

  const ref = doc(db, "progress", email);

  const payload = buildLocalPayload();

  try {
    await setDoc(ref, payload, { merge: true });
    console.log("🟢 [FS] Progreso guardado en Firestore:", payload);
  } catch (err) {
    console.error("❌ Error guardando progreso en Firestore:", err);
  }
}

/* ==========================================================
   🔹 Cargar progreso remoto
   ========================================================== */
export async function loadProgressFromFirestore() {
  const email = getEmail();
  if (!email) return null;

  const ref = doc(db, "progress", email);

  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      console.log("ℹ️ [FS] No existe progreso remoto todavía.");
      return null;
    }

    const data = snap.data();
    console.log("🟢 [FS] Progreso remoto cargado:", data);
    return data;

  } catch (err) {
    console.error("❌ Error leyendo Firestore:", err);
    return null;
  }
}

/* ==========================================================
   🔹 Fusionar progreso local + remoto
   ========================================================== */
function mergeProgress(local, remote) {
  if (!remote) return local;

  const merged = { ...local };

  // Completados
  merged.completed = Array.from(new Set([
    ...(local.completed || []),
    ...(remote.completed || [])
  ]));

  // Último módulo (elige el más avanzado)
  const lmLocal = local.lastModule?.match(/(\d+)/);
  const lmRemote = remote.lastModule?.match(/(\d+)/);

  if (lmLocal && lmRemote) {
    merged.lastModule = parseInt(lmRemote[1]) > parseInt(lmLocal[1])
      ? remote.lastModule
      : local.lastModule;
  } else {
    merged.lastModule = remote.lastModule || local.lastModule;
  }

  // Exam results
  merged.examResults = remote.examResults && remote.examResults.length > 0
    ? remote.examResults
    : local.examResults;

  // Tiempo — toma el mayor
  merged.totalSeconds = Math.max(
    local.totalSeconds || 0,
    remote.totalSeconds || 0
  );

  return merged;
}

/* ==========================================================
   🔹 Aplicar fusión al localStorage
   ========================================================== */
function applyMergedToLocal(merged) {
  localStorage.setItem("progressData", JSON.stringify({
    completed: merged.completed,
    lastModule: merged.lastModule
  }));

  localStorage.setItem("examResults", JSON.stringify(merged.examResults));

  localStorage.setItem("CFC_time_total", merged.totalSeconds);

  console.log("🟢 Progreso local actualizado con remoto:", merged);
}

/* ==========================================================
   🔥 API PRINCIPAL — Llamar al iniciar sesión
   ========================================================== */
export async function syncProgressOnLogin() {
  const local = buildLocalPayload();
  const remote = await loadProgressFromFirestore();

  const merged = mergeProgress(local, remote);
  applyMergedToLocal(merged);
  await saveProgressToFirestore();

  return merged;
}

/* ==========================================================
   🔥 API — Guardar tras eventos importantes
   ========================================================== */
export function syncProgressEvent() {
  saveProgressToFirestore();
}

/* ==========================================================
   🔒 CFC_LOCK — Final
   ========================================================== */
console.log("🧩 CFC_PROGRESS_FIRESTORE_V1 cargado correctamente.");
