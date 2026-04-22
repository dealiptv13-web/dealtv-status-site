"use client";

import { useEffect, useState } from "react";
import AdminTopNav from "@/components/admin/AdminTopNav";

type ReportItem = {
  id: string;
  username: string;
  createdAt: string;
  qualityLabel: string;
  qualityScore: number;
  status: string;
  panel: string;
  device: string;
  connectionType: string;
  issueType: string;
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  qualityMessage: string;
  note: string;
};

function getBadgeClass(label: string) {
  switch (label) {
    case "Çok İyi":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "İyi":
      return "border-lime-200 bg-lime-50 text-lime-700";
    case "Orta":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Kötü":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-rose-200 bg-rose-50 text-rose-700";
  }
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/reports", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Kayıtlar yüklenemedi.");
      }

      setReports(data.reports || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Kayıtlar yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleDelete(id: string) {
    setMessage("");
    setError("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/reports?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Kayıt silinemedi.");
      }

      setReports((prev) => prev.filter((report) => report.id !== id));
      setMessage("Kayıt silindi.");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Kayıt silinemedi.");
    } finally {
      setDeletingId("");
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
            Admin Test Kayıtları
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-500 md:text-base">
            Son 24 saat içinde gönderilen hız testi sonuçları burada listelenir.
          </p>
        </div>

        <AdminTopNav />

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadReports}
            className="rounded-2xl border border-[#dfe5e1] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
          >
            Yenile
          </button>

          <div className="rounded-2xl border border-[#dde5e0] bg-white px-4 py-3 text-sm text-slate-600">
            Toplam kayıt: {reports.length}
          </div>
        </div>

        {message ? (
          <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-[#dfe5e1] bg-white p-6 text-slate-500">
              Yükleniyor...
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-3xl border border-[#dfe5e1] bg-white p-6 text-slate-500">
              Son 24 saate ait kayıt yok.
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className="rounded-3xl border border-[#dfe5e1] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <div className="flex flex-col gap-4 border-b border-[#e8eeea] pb-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      {report.username}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(report.createdAt).toLocaleString("tr-TR")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeClass(
                        report.qualityLabel
                      )}`}
                    >
                      {report.qualityLabel}
                    </span>

                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                      Puan: %{report.qualityScore}
                    </span>

                    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {report.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDelete(report.id)}
                      disabled={deletingId === report.id}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === report.id ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Panel</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{report.panel || "-"}</p>
                  </div>

                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Cihaz</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{report.device || "-"}</p>
                  </div>

                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Bağlantı</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {report.connectionType || "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Sorun</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">{report.issueType || "-"}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Ping</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {report.ping ? `${report.ping.toFixed(1)} ms` : "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Download</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {report.download ? `${report.download.toFixed(1)} Mbps` : "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Upload</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {report.upload ? `${report.upload.toFixed(1)} Mbps` : "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Jitter</p>
                    <p className="mt-2 text-sm font-medium text-slate-800">
                      {report.jitter ? `${report.jitter.toFixed(1)} ms` : "-"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Sistem Yorumu</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {report.qualityMessage}
                  </p>
                </div>

                <div className="mt-4 rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Kullanıcı Notu</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {report.note || "-"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}