// ============================================================
// 🧩 CFC SYNC — REMOTE V5 (IMPORT / EXPORT)
// Guarda y restaura progreso real en Firestore (modo LITE)
// ============================================================

window.CFC_syncRemoteV5_export = async (email, payload) => {
    try {
        if (!window.CFC_DB) {
            console.warn("⚠ Remote Export V5: CFC_DB no está definido");
            return;
        }

        // ✅ Aceptar tanto objeto directo como Promise
        let json = payload;

        if (json && typeof json.then === "function") {
            // Si viene un Promise (ej: CFC_syncReaderV5()), esperamos el resultado
            json = await json;
        }

        if (!json) {
            json = {};
        }

        if (typeof json !== "object" || Array.isArray(json)) {
            console.warn("⚠ Remote Export V5: datos inválidos, se esperaba objeto:", json);
            return;
        }

        await window.CFC_DB
            .collection("sessions")
            .doc(email)
            .collection("sync_v5")
            .doc("data")
            .set(json, { merge: true });

        console.log("🟢 Remote Export V5 OK → sessions/" + email + "/sync_v5/data", json);
    } catch (err) {
        console.error("❌ Remote Export V5 ERROR:", err);
    }
};

window.CFC_syncRemoteV5_import = async (email) => {
    try {
        if (!window.CFC_DB) {
            console.warn("⚠ Remote Import V5: CFC_DB no está definido");
            return {};
        }

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
