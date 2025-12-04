// ============================================================
// 🧩 CFC SYNC — REMOTE V5 (IMPORT / EXPORT)
// Guarda y restaura progreso real en Firestore
// ============================================================

window.CFC_syncRemoteV5_export = async (email, json) => {
    await firebase.firestore()
        .collection("users")
        .doc(email)
        .collection("sync")
        .doc("v1")
        .set(json, { merge: true });

    console.log("🟢 Remote Export V5 OK");
};

window.CFC_syncRemoteV5_import = async (email) => {
    const snap = await firebase.firestore()
        .collection("users")
        .doc(email)
        .collection("sync")
        .doc("v1")
        .get();

    const data = snap.data() || {};
    console.log("🟢 Remote Import V5:", data);
    return data;
};
