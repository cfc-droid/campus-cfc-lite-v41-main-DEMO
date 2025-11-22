async function verifyDeploy() {
  try {
    const response = await fetch(window.location.href);
    if (response.ok) {
      console.log("🚀 Deploy verificado en Cloudflare — todo operativo ✅");
    } else {
      console.error("⚠️ Error en el deploy — revisar build o rutas");
    }
  } catch (error) {
    console.error("❌ Error de conexión:", error);
  }
}
verifyDeploy();
