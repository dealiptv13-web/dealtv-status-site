"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message || "Giriş başarısız.");
        return;
      }

      window.location.href = "/admin/reports";
    } catch (err) {
      console.error(err);
      setError("Giriş sırasında hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#edf0ee] text-slate-800">
      <section className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
          <div className="mb-6">
            <a href="/" className="text-sm text-slate-500 transition hover:text-slate-800">
              ← Ana sayfaya dön
            </a>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800">
              Admin Girişi
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Test kayıtlarını görmek için admin şifresi ile giriş yapın.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                placeholder="Admin şifresi"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}