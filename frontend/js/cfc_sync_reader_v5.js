window.CFC_syncReaderV5 = () => {
    const allowed = [
        "progress_mod",
        "exam_mod",
        "CFC_STATS_",
        "CFC_TIME_",
        "CFC_ACTIVITY_",
        "CFC_BITACORA_"
    ];

    let out = {};

    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (allowed.some(a => k.startsWith(a))) {
            out[k] = localStorage.getItem(k);
        }
    }

    console.log("🟢 Reader V5 OK:", out);
    return out;
};
