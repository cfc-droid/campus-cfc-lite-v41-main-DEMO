// ============================================================
// 🧩 CFC SYNC — WRITER V5
// Restaura solo claves seguras sin tocar device/session/license
// ============================================================

window.CFC_syncWriterV5 = (json) => {

    const forbidden = [
        "CFC_DEVICE",
        "CFC_SESSION",
        "CFC_LICENSE",
        "CFC_EMAIL",
        "CFC_HEART",
        "CFC_LOCK"
    ];

    for (const k in json) {

        // Saltar las claves protegidas del sistema
        if (forbidden.some(f => k.startsWith(f))) {
            console.warn("⛔ Omitida clave peligrosa:", k);
            continue;
        }

        localStorage.setItem(k, json[k]);
    }

    console.log("🟢 Writer V5 OK");
};
