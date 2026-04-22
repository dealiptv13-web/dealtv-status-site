"use client";

import { useEffect, useState } from "react";
import AdminTopNav from "@/components/admin/AdminTopNav";

type NoticeBlock = {
  enabled: boolean;
  title: string;
  message: string;
  durationSeconds: number;
};

type SiteNoticeSettings = {
  welcomeNotice: NoticeBlock;
  specialNotice: NoticeBlock;
};

export default function AdminNoticePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<SiteNoticeSettings>({
    welcomeNotice: {
      enabled: true,
      title: "",
      message: "",
      durationSeconds: 10,
    },
    specialNotice: {
      enabled: false,
      title: "",
      message: "",
      durationSeconds: 10,
    },
  });

  async function loadSettings() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/site-notice", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Bildirim ayarları yüklenemedi.");
      }

      setForm(data.settings);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Bildirim ayarları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/site-notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Kaydetme işlemi başarısız.");
      }

      setMessage("Bildirim ayarları başarıyla güncellendi.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Kaydetme işlemi başarısız.");
    } finally {
      setSaving(false);
    }
  }

  function updateBlock(
    block: keyof SiteNoticeSettings,
    field: keyof NoticeBlock,
    value: string | number | boolean
  ) {
    setForm((prev) => ({
      ...prev,
      [block]: {
        ...prev[block],
        [field]: value,
      },
    }));
  }

  return (
    <main className="min-h-screen bg-[#edf0ee] text-slate-800">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8">
          <a href="/" className="text-sm text-slate-500 transition hover:text-slate-800">
            ← Ana sayfaya dön
          </a>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
            Açılış Bildirimleri
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">
            Karşılama bildirimi ve özel mesaj bildirimini buradan yönetebilirsiniz.
          </p>
        </div>

        <AdminTopNav />

        <div className="rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {loading ? (
            <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4 text-sm text-slate-500">
              Yükleniyor...
            </div>
          ) : (
            <form onSubmit={saveSettings} className="space-y-8">
              <div className="rounded-3xl border border-[#e7ece9] bg-[#fbfcfc] p-5">
                <h2 className="text-xl font-semibold text-slate-800">Karşılama Bildirimi</h2>

                <div className="mt-5 space-y-5">
                  <div className="rounded-2xl border border-[#e7ece9] bg-white p-4">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.welcomeNotice.enabled}
                        onChange={(e) =>
                          updateBlock("welcomeNotice", "enabled", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Karşılama bildirimini aktif tut
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Başlık
                    </label>
                    <input
                      value={form.welcomeNotice.title}
                      onChange={(e) =>
                        updateBlock("welcomeNotice", "title", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Mesaj
                    </label>
                    <textarea
                      rows={6}
                      value={form.welcomeNotice.message}
                      onChange={(e) =>
                        updateBlock("welcomeNotice", "message", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Otomatik kapanma süresi (saniye)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={form.welcomeNotice.durationSeconds}
                      onChange={(e) =>
                        updateBlock(
                          "welcomeNotice",
                          "durationSeconds",
                          Number(e.target.value)
                        )
                      }
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5">
                <h2 className="text-xl font-semibold text-slate-800">Özel Mesaj Bildirimi</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Acil duyuru gerektiğinde bunu aktif edebilirsiniz. Aktif olduğunda,
                  kullanıcı girişinde önce bu mesaj gösterilir.
                </p>

                <div className="mt-5 space-y-5">
                  <div className="rounded-2xl border border-amber-200 bg-white p-4">
                    <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={form.specialNotice.enabled}
                        onChange={(e) =>
                          updateBlock("specialNotice", "enabled", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-300"
                      />
                      Özel mesaj bildirimini aktif tut
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Başlık
                    </label>
                    <input
                      value={form.specialNotice.title}
                      onChange={(e) =>
                        updateBlock("specialNotice", "title", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Mesaj
                    </label>
                    <textarea
                      rows={6}
                      value={form.specialNotice.message}
                      onChange={(e) =>
                        updateBlock("specialNotice", "message", e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Otomatik kapanma süresi (saniye)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={form.specialNotice.durationSeconds}
                      onChange={(e) =>
                        updateBlock(
                          "specialNotice",
                          "durationSeconds",
                          Number(e.target.value)
                        )
                      }
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 outline-none transition focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>

                <button
                  type="button"
                  onClick={loadSettings}
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
            </form>
          )}
        </div>
      </section>
    </main>
  );
}