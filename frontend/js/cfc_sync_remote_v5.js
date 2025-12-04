// ============================================================
// 🧩 CFC SYNC — REMOTE V5 (IMPORT / EXPORT)
// Guarda y restaura progreso real en Firestore (modo LITE)
// ============================================================

window.CFC_syncRemoteV5_export = async (email, json) => {
    try {
        await window.CFC_DB
            .collection("sessions")
            .doc(email)
            .collection("sync_v5")
            .doc("data")
            .set(json, { merge: true });

        console.log("🟢 Remote Export V5 OK → sessions/" + email + "/sync_v5/data");
    } catch (err) {
        console.error("❌ Remote Export V5 ERROR:", err);
    }
};

window.CFC_syncRemoteV5_import = async (email) => {
    try {
        const snap = await window.CFC_DB
            .collection("sessions")
            .doc(email)
            .collection("sync_v5")
            .doc("data")
            .get();

        const data = snap.exists ? snap.data() : {};
        console.log("🟢 Remote Import V5 OK:", data);
        return data;

    } catch (err) {
        console.error("❌ Remote Import V5 ERROR:", err);
        return {};
    }
};
