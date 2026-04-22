"use client";

import { useEffect, useState } from "react";
import AdminTopNav from "@/components/admin/AdminTopNav";

type KnowledgeItem = {
  id: string;
  title: string;
  keywords: string[];
  content: string;
  suggestion?: string;
};

export default function AdminKnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    keywords: "",
    content: "",
    suggestion: "",
  });

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai-support-knowledge", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Veriler yüklenemedi.");
      }

      setItems(data.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Veriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);

    try {
      const response = await fetch("/api/ai-support-knowledge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Kayıt eklenemedi.");
      }

      setForm({
        title: "",
        keywords: "",
        content: "",
        suggestion: "",
      });

      setMessage("Bilgi kartı başarıyla eklendi.");
      await loadItems();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Kayıt eklenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/ai-support-knowledge?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Kayıt silinemedi.");
      }

      setMessage("Bilgi kartı silindi.");
      await loadItems();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Kayıt silinemedi.");
    }
  }

  return (
    <main className="min-h-screen bg-[#edf0ee] text-slate-800">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <a href="/" className="text-sm text-slate-500 transition hover:text-slate-800">
            ← Ana sayfaya dön
          </a>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
            AI Bilgi Kartları
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">
            AI destekte kullanılan bilgi havuzunu buradan yönetebilirsiniz.
          </p>
        </div>

        <AdminTopNav />

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <h2 className="text-xl font-semibold text-slate-800">Yeni Bilgi Kartı</h2>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              Anahtar kelimeleri virgülle ayırın. AI destek bu kelimelere göre kartları eşleştirir.
            </p>

            <form onSubmit={handleAdd} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Başlık
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="Örn: Wi-Fi bağlantı kararlılığı"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Anahtar kelimeler
                </label>
                <input
                  value={form.keywords}
                  onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                  className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="wifi, modem, sinyal, kablosuz"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  İçerik
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="AI desteğin kullanacağı açıklama metni"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Kısa öneri
                </label>
                <input
                  value={form.suggestion}
                  onChange={(e) => setForm((prev) => ({ ...prev, suggestion: e.target.value }))}
                  className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  placeholder="Örn: Hız testini Wi-Fi ve Ethernet ile ayrı ayrı deneyin."
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Bilgi Kartı Ekle"}
              </button>
            </form>

            {message ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </div>

          <div className="rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Mevcut Bilgi Kartları</h2>
              <div className="rounded-2xl border border-[#dde5e0] bg-[#fbfcfc] px-4 py-2 text-sm text-slate-600">
                Toplam: {items.length}
              </div>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4 text-sm text-slate-500">
                  Yükleniyor...
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4 text-sm text-slate-500">
                  Bilgi kartı bulunamadı.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.content}</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>

                        {item.suggestion ? (
                          <p className="mt-3 text-sm font-medium text-emerald-700">
                            Öneri: {item.suggestion}
                          </p>
                        ) : null}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}