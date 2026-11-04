"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, KeyRound, LoaderCircle, Lock, Mail } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed.");
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-cream-300 bg-white py-3 pl-11 pr-11 text-[14px] text-stone-700 outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-berry/50 focus:ring-4 focus:ring-berry/10";
  const labelCls = "mb-1.5 block text-[13px] font-medium text-stone-600";

  return (
    <div className="w-full max-w-md">
      {/* mobile brand */}
      <div className="mb-8 flex flex-col items-center text-center lg:hidden">
        <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-berry">
          <KeyRound className="h-6 w-6 text-white" strokeWidth={1.8} />
        </span>
        <h1 className="font-display text-3xl font-bold text-ink">
          Bakery Delight
        </h1>
        <p className="mt-1 text-[12px] font-medium text-berry-deep">
          Admin panel
        </p>
      </div>

      <div className="rounded-2xl bg-white p-7 ring-1 ring-cream-300 sm:p-9">
        <h2 className="hidden font-display text-3xl font-bold text-ink lg:block">
          Sign in
        </h2>
        <p className="mt-1 hidden text-[14px] text-stone-500 lg:block">
          Enter your admin credentials to open the kitchen.
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-danger-soft px-4 py-3 text-[13px] font-medium text-berry-deep">
            {error}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className={labelCls}>
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                strokeWidth={1.8}
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className={inputCls}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>
              Password
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                strokeWidth={1.8}
              />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600"
              >
                {showPw ? (
                  <EyeOff className="h-4.5 w-4.5" strokeWidth={1.8} />
                ) : (
                  <Eye className="h-4.5 w-4.5" strokeWidth={1.8} />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-berry py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep disabled:opacity-60"
          >
            {loading && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {loading ? "Opening the kitchen…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-[12px] text-stone-500">
        Protected area · authorised bakers only
      </p>
    </div>
  );
}
