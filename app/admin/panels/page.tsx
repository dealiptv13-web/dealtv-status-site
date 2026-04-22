"use client";

import { useEffect, useState } from "react";
import AdminTopNav from "@/components/admin/AdminTopNav";

type PanelStatus = "Stabil" | "Yoğun" | "Bakımda" | "Kapalı";

type PanelItem = {
  id: string;
  name: string;
  status: PanelStatus;
  note: string;
};

export default function AdminPanelsPage() {
  const [items, setItems] = useState<PanelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/panels", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Panel verileri yüklenemedi.");
      }

      setItems(data.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Panel verileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  function updateItem(index: number, field: keyof PanelItem, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function saveAll() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/panels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Kaydetme işlemi başarısız.");
      }

      setMessage("Panel durumları başarıyla güncellendi.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Kaydetme işlemi başarısız.");
    } finally {
      setSaving(false);
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
            Panel Durum Yönetimi
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">
            Ana sayfada görünen panel durumlarını buradan değiştirebilirsiniz.
          </p>
        </div>

        <AdminTopNav />

        <div className="rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {loading ? (
            <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4 text-sm text-slate-500">
              Yükleniyor...
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-5"
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Panel Adı
                      </label>
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Durum
                      </label>
                      <select
                        value={item.status}
                        onChange={(e) => updateItem(index, "status", e.target.value)}
                        className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
                      >
                        <option>Stabil</option>
                        <option>Yoğun</option>
                        <option>Bakımda</option>
                        <option>Kapalı</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Açıklama
                    </label>
                    <textarea
                      rows={3}
                      value={item.note}
                      onChange={(e) => updateItem(index, "note", e.target.value)}
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={saveAll}
                  disabled={saving}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Tüm Değişiklikleri Kaydet"}
                </button>

                <button
                  type="button"
                  onClick={loadItems}
                  className="rounded-2xl border border-[#dfe5e1] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
                >
                  Yenile
                </button>
              </div>

              {message ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}