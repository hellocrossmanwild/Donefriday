"use client";

import { FormEvent, useState } from "react";
import StampMark from "@/components/StampMark";
import { COPY } from "@/lib/brand";
import { track } from "@/lib/analytics";

type Props = {
  /** server-detected success (no-JS form POST redirect) */
  initialDone?: boolean;
  /** called when the subscribe succeeds — the cinematic uses it to fire the 3D press */
  onDone?: (email: string) => void;
  id?: string;
};

export default function SubscribeForm({ initialDone = false, onDone, id }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    initialDone ? "done" : "idle",
  );
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setError("");
    track("subscribe_submitted");
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          company: String(form.get("company") ?? ""),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something broke. Try again in a minute.");
      }
      setStatus("done");
      track("subscribe_done");
      onDone?.(email);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something broke. Try again in a minute.");
      track("subscribe_error");
    }
  }

  if (status === "done") {
    return (
      <div className="subscribe" id={id} aria-live="polite">
        <div className="subscribe-done">
          <span className="stamped-email">{email || "Subscribed"}</span>
          <span className="done-print">
            <StampMark word="DONE" height={46} title="Done" />
          </span>
        </div>
        <p className="subscribe-done-line">{COPY.successLine}</p>
      </div>
    );
  }

  return (
    <form
      className="subscribe"
      id={id}
      action="/api/subscribe"
      method="post"
      onSubmit={handleSubmit}
      aria-live="polite"
    >
      <label className="sr-only" htmlFor={`${id ?? "subscribe"}-email`}>
        Your email address
      </label>
      <div className="subscribe-row">
        <input
          id={`${id ?? "subscribe"}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Stamping…" : "Subscribe"}
        </button>
      </div>
      {/* honeypot — humans never see this */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", height: 0, width: 0, opacity: 0 }}
      />
      {status === "error" ? (
        <p className="subscribe-error" role="alert">
          {error}
        </p>
      ) : null}
      <p className="subscribe-note mono">{COPY.finaleSub}</p>
    </form>
  );
}
