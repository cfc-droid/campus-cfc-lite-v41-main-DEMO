// ============================================================
// 🧩 CFC SYNC — READER V5 (REAL)
// Lee progreso LOCAL permitido + progreso REMOTO desde Firestore
// ============================================================

window.CFC_syncReaderV5 = async (email) => {

    console.log("🔵 Reader V5 — iniciado para:", email);

    // -------------------------------
    // 1) Leer progreso remoto (Firestore)
    // -------------------------------
    let remote = {};
    try {
        remote = await window.CFC_syncRemoteV5_import(email);
        console.log("🟣 Reader V5 — remoto:", remote);
    } catch (err) {
        console.warn("⚠ Reader V5 — error leyendo remoto:", err);
        remote = {};
    }

    // -------------------------------
    // 2) Leer progreso local filtrado
    // -------------------------------
    const allowed = [
        "progress_mod",
        "exam_mod",
        "CFC_STATS_",
        "CFC_TIME_",
        "CFC_ACTIVITY_",
        "CFC_BITACORA_"
    ];

    let local = {};

    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (allowed.some(a => k.startsWith(a))) {
            local[k] = localStorage.getItem(k);
        }
    }

    console.log("🟢 Reader V5 — local:", local);

    // -------------------------------
    // 3) Merge: prioridad al REMOTO
    // -------------------------------
    const merged = { ...local, ...remote };

    console.log("🟢 Reader V5 — MERGED:", merged);

    return merged;
};
