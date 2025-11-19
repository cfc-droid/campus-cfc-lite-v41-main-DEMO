# 🧭 Campus CFC Trading LITE — Versión V41

## 🏗️ Base técnica
Estructura estática optimizada para despliegue gratuito en **Cloudflare Pages**.  
Esta versión no requiere backend activo, todo funciona 100 % desde el **frontend**.

---

## 📂 Estructura general
CFC_DEPLOY_CLEAN_BASE/
┣ backend/         → scripts de prueba y conexión (solo referencia)
┣ docs/ops/        → documentación operativa (estructura, QA, etc.)
┣ frontend/        → UI, módulos, estilos, scripts y salida /out
┣ .env.example     → variables Supabase (URL y ANON_KEY)
┗ README.md        → guía técnica general

---

## ⚙️ Secrets requeridos (para GitHub → Settings → Secrets → Actions)
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY

---

## 🚀 Deploy automático
1. Subir a GitHub (nombre del repo: `campus-cfc-lite-v14`)
2. Vincular con **Cloudflare Pages**
3. Directorio de salida: `/frontend/out`
4. Build command: *(vacío, lo maneja el workflow automáticamente)*
5. Resultado esperado:
