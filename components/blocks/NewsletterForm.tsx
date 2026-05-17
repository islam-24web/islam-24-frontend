"use client";

import { useState } from "react";

interface Props {
  placeholder: string;
  ctaLabel: string;
  consentLabel: string;
  successMessage: string;
}

type State = "idle" | "submitting" | "success" | "error";

export default function NewsletterForm({
  placeholder,
  ctaLabel,
  consentLabel,
  successMessage,
}: Props) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "submitting") return;
    setState("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, consent, locale: "ar", source: "homepage-newsletter-cta" }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("success");
        setEmail("");
        setConsent(false);
      } else {
        setState("error");
        setErrorMsg(data?.error || "حدث خطأ، حاول لاحقاً");
      }
    } catch {
      setState("error");
      setErrorMsg("حدث خطأ في الاتصال");
    }
  }

  if (state === "success") {
    return (
      <div
        role="status"
        className="rounded-xl border border-[color:var(--site-border)] bg-[color:var(--site-surface)] p-4 text-center text-sm font-semibold text-[color:var(--site-heading)]"
      >
        {successMessage}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" dir="rtl" noValidate>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          {placeholder}
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-white/30 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[color:var(--site-gold)]"
        />
        <button
          type="submit"
          disabled={state === "submitting" || !email || !consent}
          className="rounded-xl bg-[color:var(--site-gold)] px-6 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-[color:var(--site-gold-strong)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {state === "submitting" ? "..." : ctaLabel}
        </button>
      </div>
      <label className="flex items-start gap-2 text-xs text-white/90 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 rounded border-white/40 text-[color:var(--site-gold)] focus:ring-[color:var(--site-gold)]"
        />
        <span className="leading-relaxed">{consentLabel}</span>
      </label>
      {state === "error" && errorMsg && (
        <p role="alert" className="text-xs text-red-100 bg-red-700/30 border border-red-300/30 rounded px-3 py-2">
          {errorMsg}
        </p>
      )}
    </form>
  );
}
