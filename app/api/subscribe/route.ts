import { NextRequest, NextResponse } from "next/server";

// Email capture. Forwards to the configured list provider:
//   SUBSTACK_URL        e.g. https://donefriday.substack.com
//   BUTTONDOWN_API_KEY  Buttondown API key (used if SUBSTACK_URL is unset)
// Opt-in only — this endpoint only ever subscribes the address it is given.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let email = "";
  let honeypot = "";
  let isFormPost = false;

  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    email = String(body.email ?? "").trim();
    honeypot = String(body.company ?? "");
  } else {
    // Progressive enhancement: plain <form> POST works without JavaScript
    isFormPost = true;
    const form = await req.formData().catch(() => null);
    email = String(form?.get("email") ?? "").trim();
    honeypot = String(form?.get("company") ?? "");
  }

  const respond = (status: number, payload: { ok: boolean; error?: string }) => {
    if (isFormPost) {
      const url = new URL(payload.ok ? "/?subscribed=1#subscribe" : "/?subscribe_error=1#subscribe", req.url);
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.json(payload, { status });
  };

  // Bots fill the hidden field; pretend success, forward nothing.
  if (honeypot) return respond(200, { ok: true });

  if (!EMAIL_RE.test(email)) {
    return respond(400, { ok: false, error: "That doesn't look like an email address." });
  }

  try {
    if (process.env.SUBSTACK_URL) {
      const base = process.env.SUBSTACK_URL.replace(/\/+$/, "");
      const res = await fetch(`${base}/api/v1/free`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, first_url: "https://donefriday.com" }),
      });
      if (!res.ok) throw new Error(`Substack responded ${res.status}`);
      return respond(200, { ok: true });
    }

    if (process.env.BUTTONDOWN_API_KEY) {
      const res = await fetch("https://api.buttondown.email/v1/subscribers", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        },
        body: JSON.stringify({ email_address: email, tags: ["donefriday.com"] }),
      });
      // 400 with "already subscribed" still counts as done for the reader
      if (!res.ok && res.status !== 400) throw new Error(`Buttondown responded ${res.status}`);
      return respond(200, { ok: true });
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[subscribe] no list provider configured — would subscribe: ${email}`);
      return respond(200, { ok: true });
    }

    console.error("[subscribe] no list provider configured (set SUBSTACK_URL or BUTTONDOWN_API_KEY)");
    return respond(503, { ok: false, error: "Subscriptions aren't open yet. Try again shortly." });
  } catch (err) {
    console.error("[subscribe] provider error:", err);
    return respond(502, { ok: false, error: "Something broke on our side. Try again in a minute." });
  }
}
