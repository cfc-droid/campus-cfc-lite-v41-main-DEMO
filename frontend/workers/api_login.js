// ✅ CFC_FUNC_47_1_DEMO_LOGIN_WORKER
export default {
  async fetch(req) {
    const { email, password } = await req.json();

    if (email === "demo@campuscfc.com" && password === "demo123") {
      const token = crypto.randomUUID();
      return new Response(JSON.stringify({ ok: true, token }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }
}
