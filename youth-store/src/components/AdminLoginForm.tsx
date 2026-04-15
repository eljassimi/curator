"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

type Props = {
  locale: string;
};

export function AdminLoginForm({ locale }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("admin@curator.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Login failed");
      }
      const nextPath = locale === "en" ? "/admin" : `/${locale}/admin`;
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-20 w-full max-w-md space-y-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6">
      <h1 className="font-headline text-3xl text-primary">Admin Login</h1>
      <p className="text-sm text-on-surface-variant">Use your admin credentials to access the dashboard.</p>
      <label className="block text-xs uppercase tracking-widest text-on-surface-variant">
        Email
        <input
          type="email"
          className="mt-2 w-full rounded-lg border border-outline-variant/40 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block text-xs uppercase tracking-widest text-on-surface-variant">
        Password
        <input
          type="password"
          className="mt-2 w-full rounded-lg border border-outline-variant/40 px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-3 text-xs uppercase tracking-widest text-on-primary"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
