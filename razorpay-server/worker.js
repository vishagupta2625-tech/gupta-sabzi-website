/* =====================================================================
   GUPTA SABZI BHANDAR — Razorpay server (Cloudflare Worker, free)
   ---------------------------------------------------------------------
   Ye code Cloudflare Worker mein paste karna hai (README dekhein).
   Secret key YAHAN MAT LIKHNA — Cloudflare ke "Variables and Secrets" mein daalna:
     RZP_KEY_ID      = rzp_test_xxx  (ya rzp_live_xxx)
     RZP_KEY_SECRET  = (Razorpay dashboard se Key Secret)   <- type: Secret
     ALLOWED_ORIGIN  = https://vishagupta2625-tech.github.io
   ===================================================================== */

const MIN_RUPEES = 1, MAX_RUPEES = 20000;   // ek order ki limit

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGIN || "").split(",").map(s => s.trim()).filter(Boolean);
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : (allowed[0] || ""),
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
    if (req.method !== "POST") return json({ ok: true, service: "gupta-sabzi-razorpay" });
    if (allowed.length && !allowed.includes(origin)) return json({ error: "origin not allowed" }, 403);
    if (!env.RZP_KEY_ID || !env.RZP_KEY_SECRET) return json({ error: "server keys not set" }, 500);

    const auth = "Basic " + btoa(env.RZP_KEY_ID + ":" + env.RZP_KEY_SECRET);
    const path = new URL(req.url).pathname;
    let body = {};
    try { body = await req.json(); } catch (_) { return json({ error: "bad json" }, 400); }

    // 1) Create order
    if (path.endsWith("/create-order")) {
      const rupees = Math.round(Number(body.amount));
      if (!(rupees >= MIN_RUPEES && rupees <= MAX_RUPEES)) return json({ error: "amount out of range" }, 400);
      const notes = {};
      for (const [k, v] of Object.entries(body.notes || {}).slice(0, 10)) notes[String(k).slice(0, 40)] = String(v).slice(0, 250);
      const r = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: rupees * 100, currency: "INR", receipt: String(body.receipt || "").slice(0, 40), payment_capture: 1, notes })
      });
      const o = await r.json();
      if (!r.ok) return json({ error: (o.error && o.error.description) || "order failed" }, 502);
      return json({ order_id: o.id, amount: o.amount, currency: o.currency, key: env.RZP_KEY_ID });
    }

    // 2) Verify payment (signature + order status from Razorpay)
    if (path.endsWith("/verify")) {
      const { order_id, payment_id, signature } = body;
      if (!order_id || !payment_id || !signature) return json({ ok: false, error: "missing fields" }, 400);
      const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.RZP_KEY_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(order_id + "|" + payment_id));
      const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, "0")).join("");
      if (hex !== signature) return json({ ok: false, error: "signature mismatch" }, 400);
      const r = await fetch("https://api.razorpay.com/v1/orders/" + encodeURIComponent(order_id), { headers: { Authorization: auth } });
      const o = await r.json();
      return json({ ok: true, status: o.status, amount_paid: Math.round((o.amount_paid || 0) / 100), payment_id });
    }
    return json({ error: "not found" }, 404);
  }
};
