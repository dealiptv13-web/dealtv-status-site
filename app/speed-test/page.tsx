"use client";

import { useMemo, useState } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type QualityLabel = "Çok İyi" | "İyi" | "Orta" | "Kötü" | "Çok Kötü";

type QualityResult = {
  label: QualityLabel;
  score: number;
  message: string;
};

type FormState = {
  username: string;
  panel: string;
  device: string;
  connectionType: string;
  appName: string;
  issueType: string;
  note: string;
};

type TestValues = {
  ping: number | null;
  jitter: number | null;
  download: number | null;
  upload: number | null;
};

function SpeedIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13a8 8 0 1 0-16 0" />
      <path d="M12 13l4-4" />
      <path d="M12 13h.01" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 12 18 9" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
    </svg>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getQualityResult(values: TestValues): QualityResult {
  const ping = values.ping ?? 999;
  const jitter = values.jitter ?? 999;
  const download = values.download ?? 0;
  const upload = values.upload ?? 0;

  let score = 100;

  if (ping <= 25) score -= 0;
  else if (ping <= 45) score -= 5;
  else if (ping <= 70) score -= 12;
  else if (ping <= 100) score -= 22;
  else if (ping <= 150) score -= 34;
  else score -= 45;

  if (jitter <= 5) score -= 0;
  else if (jitter <= 10) score -= 4;
  else if (jitter <= 20) score -= 10;
  else if (jitter <= 35) score -= 18;
  else score -= 28;

  if (download >= 80) score += 6;
  else if (download >= 40) score += 3;
  else if (download >= 20) score += 0;
  else if (download >= 10) score -= 5;
  else if (download >= 5) score -= 12;
  else score -= 18;

  if (upload >= 20) score += 4;
  else if (upload >= 10) score += 2;
  else if (upload >= 5) score += 0;
  else if (upload >= 2) score -= 4;
  else score -= 8;

  score = clamp(Math.round(score), 1, 100);

  if (score >= 85) {
    return {
      label: "Çok İyi",
      score,
      message:
        "Bağlantı kaliteniz oldukça iyi görünüyor. Donma veya kasma sorunu büyük ihtimalle internetten değil; cihaz, uygulama veya panel yoğunluğu gibi nedenlerden kaynaklanabilir.",
    };
  }

  if (score >= 70) {
    return {
      label: "İyi",
      score,
      message:
        "Bağlantınız genel olarak iyi durumda. Ara sıra oluşan sorunlar uygulama, cihaz performansı veya anlık ağ dalgalanmalarıyla ilgili olabilir.",
    };
  }

  if (score >= 50) {
    return {
      label: "Orta",
      score,
      message:
        "Bağlantınız kullanılabilir seviyede ancak tam stabil görünmüyor. Özellikle Wi-Fi kullanıyorsanız modeme yakın test yapmanız veya Ethernet ile tekrar denemeniz faydalı olabilir.",
    };
  }

  if (score >= 30) {
    return {
      label: "Kötü",
      score,
      message:
        "Bağlantı kaliteniz düşük görünüyor. Donma ve kasma sorunlarının internet bağlantısından kaynaklanma ihtimali yüksek.",
    };
  }

  return {
    label: "Çok Kötü",
    score,
    message:
      "Bağlantı kaliteniz oldukça zayıf görünüyor. Bu durumda yayın tarafında ciddi donma, çözünürlük düşmesi veya bağlantı kopmaları yaşanabilir.",
  };
}

function getQualityStyle(label: QualityLabel) {
  switch (label) {
    case "Çok İyi":
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        bar: "bg-emerald-500",
        dot: "bg-emerald-500",
      };
    case "İyi":
      return {
        badge: "border-lime-200 bg-lime-50 text-lime-700",
        bar: "bg-lime-500",
        dot: "bg-lime-500",
      };
    case "Orta":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        bar: "bg-amber-500",
        dot: "bg-amber-500",
      };
    case "Kötü":
      return {
        badge: "border-orange-200 bg-orange-50 text-orange-700",
        bar: "bg-orange-500",
        dot: "bg-orange-500",
      };
    case "Çok Kötü":
    default:
      return {
        badge: "border-rose-200 bg-rose-50 text-rose-700",
        bar: "bg-rose-500",
        dot: "bg-rose-500",
      };
  }
}

async function measurePing(samples = 5) {
  const values: number[] = [];

  for (let i = 0; i < samples; i += 1) {
    const startedAt = performance.now();

    await fetch(`/api/speed-test/ping?ts=${Date.now()}-${i}`, {
      method: "GET",
      cache: "no-store",
    });

    const endedAt = performance.now();
    values.push(endedAt - startedAt);
    await sleep(180);
  }

  const ping = average(values);
  const diffs: number[] = [];

  for (let i = 1; i < values.length; i += 1) {
    diffs.push(Math.abs(values[i] - values[i - 1]));
  }

  const jitter = diffs.length ? average(diffs) : 0;

  return {
    ping: Number(ping.toFixed(1)),
    jitter: Number(jitter.toFixed(1)),
  };
}

async function measureDownload() {
  const attempts: number[] = [];

  for (let i = 0; i < 3; i += 1) {
    const start = performance.now();

    const response = await fetch(`/api/speed-test/download?ts=${Date.now()}-${i}`, {
      method: "GET",
      cache: "no-store",
    });

    const blob = await response.blob();
    const end = performance.now();

    const bytes = blob.size;
    const durationSeconds = Math.max((end - start) / 1000, 0.2);
    const mbps = (bytes * 8) / durationSeconds / 1_000_000;

    attempts.push(mbps);
    await sleep(200);
  }

  return Number(average(attempts).toFixed(1));
}

async function measureUpload() {
  const attempts: number[] = [];
  const payload = new Uint8Array(400_000);

  for (let i = 0; i < payload.length; i += 1) {
    payload[i] = i % 255;
  }

  for (let i = 0; i < 3; i += 1) {
    const start = performance.now();

    await fetch("/api/speed-test/upload", {
      method: "POST",
      body: payload,
      cache: "no-store",
    });

    const end = performance.now();
    const durationSeconds = Math.max((end - start) / 1000, 0.2);
    const mbps = (payload.byteLength * 8) / durationSeconds / 1_000_000;

    attempts.push(mbps);
    await sleep(200);
  }

  return Number(average(attempts).toFixed(1));
}

export default function SpeedTestPage() {
  const [form, setForm] = useState<FormState>({
    username: "",
    panel: "",
    device: "",
    connectionType: "Wi-Fi",
    appName: "",
    issueType: "Donma",
    note: "",
  });

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phaseText, setPhaseText] = useState("Hazır");
  const [values, setValues] = useState<TestValues>({
    ping: null,
    jitter: null,
    download: null,
    upload: null,
  });
  const [result, setResult] = useState<QualityResult | null>(null);
  const [sendState, setSendState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  const qualityStyle = useMemo(
    () => (result ? getQualityStyle(result.label) : null),
    [result]
  );

  async function runTest() {
    setIsRunning(true);
    setProgress(0);
    setPhaseText("Hazırlanıyor...");
    setSendState("idle");
    setResult(null);
    setValues({
      ping: null,
      jitter: null,
      download: null,
      upload: null,
    });

    try {
      for (let i = 1; i <= 8; i += 1) {
        setProgress(i);
        await sleep(35);
      }

      setPhaseText("Gecikme ölçülüyor...");
      const pingResult = await measurePing();
      setValues((prev) => ({
        ...prev,
        ping: pingResult.ping,
        jitter: pingResult.jitter,
      }));

      for (let i = 9; i <= 38; i += 1) {
        setProgress(i);
        await sleep(18);
      }

      setPhaseText("İndirme kalitesi analiz ediliyor...");
      const download = await measureDownload();
      setValues((prev) => ({
        ...prev,
        download,
      }));

      for (let i = 39; i <= 72; i += 1) {
        setProgress(i);
        await sleep(20);
      }

      setPhaseText("Yükleme kalitesi analiz ediliyor...");
      const upload = await measureUpload();
      const finalValues = {
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        download,
        upload,
      };

      setValues(finalValues);

      for (let i = 73; i <= 96; i += 1) {
        setProgress(i);
        await sleep(22);
      }

      setPhaseText("Sonuç hazırlanıyor...");
      await sleep(500);

      const quality = getQualityResult(finalValues);
      setResult(quality);

      for (let i = 97; i <= 100; i += 1) {
        setProgress(i);
        await sleep(40);
      }

      setPhaseText("Tamamlandı");
    } catch (error) {
      console.error(error);
      setPhaseText("Test sırasında bir hata oluştu");
    } finally {
      setIsRunning(false);
    }
  }

  async function sendToAdmin() {
    if (!result) return;

    setSendState("sending");

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          panel: form.panel,
          device: form.device,
          connectionType: form.connectionType,
          appName: form.appName,
          issueType: form.issueType,
          note: form.note,
          ping: values.ping,
          download: values.download,
          upload: values.upload,
          jitter: values.jitter,
          qualityLabel: result.label,
          qualityScore: result.score,
          qualityMessage: result.message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || "Gönderim başarısız.");
      }

      setSendState("done");
    } catch (error) {
      console.error(error);
      setSendState("error");
    }
  }

  return (
    <main className="min-h-screen bg-[#edf0ee] px-6 py-8 text-slate-800">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <a href="/" className="text-sm text-slate-500 transition hover:text-slate-800">
            ← Ana sayfaya dön
          </a>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Bağlantı Kalite Testi
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
            Bu test tam anlamıyla profesyonel bir speedtest değil; bağlantı kalitesini,
            gecikmeyi ve genel kullanım stabilitesini ölçerek donma veya kasma sorunlarının
            internet kaynaklı olup olmadığını analiz etmeye yardımcı olur.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <SpeedIcon />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Test Başlat</h2>
                <p className="text-sm text-slate-500">
                  Tek tıkla bağlantı kalitenizi analiz edin
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[26px] border border-[#e7ece9] bg-[#fbfcfc] p-6">
              <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-slate-200" />
                <div className="absolute inset-[16px] rounded-full border border-slate-200" />
                <div className="absolute inset-[34px] rounded-full border border-slate-200" />

                {isRunning ? (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-200 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-spin" />
                    <div className="absolute inset-x-6 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-80" />
                  </>
                ) : null}

                <div className="relative z-10 text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2f7f4] text-emerald-700">
                    <RadarIcon />
                  </div>
                  <p className="text-3xl font-semibold tracking-tight">{progress}%</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    Test Durumu
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-3 text-center text-sm font-medium text-slate-600">
                  {phaseText}
                </p>
              </div>

              <button
                type="button"
                onClick={runTest}
                disabled={isRunning}
                className="mt-6 w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isRunning ? "Test Devam Ediyor..." : "Kalite Testini Başlat"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Ping</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {values.ping !== null ? `${values.ping} ms` : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Jitter</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {values.jitter !== null ? `${values.jitter} ms` : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Download</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {values.download !== null ? `${values.download} Mbps` : "-"}
                </p>
              </div>

              <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Upload</p>
                <p className="mt-2 text-lg font-semibold text-slate-800">
                  {values.upload !== null ? `${values.upload} Mbps` : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-xl font-semibold">Sonuç Analizi</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Test tamamlandığında bağlantı kalitenizin genel değerlendirmesi burada görünür.
              </p>

              <div className="mt-6 rounded-3xl border border-[#e7ece9] bg-[#fbfcfc] p-5">
                {result ? (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${qualityStyle?.badge}`}
                      >
                        {result.label}
                      </span>

                      <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        Kalite Puanı: %{result.score}
                      </span>
                    </div>

                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${qualityStyle?.bar}`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>

                    <p className="mt-5 text-sm leading-7 text-slate-700">
                      {result.message}
                    </p>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#d8e0da] bg-white px-4 py-6 text-sm text-slate-500">
                    Henüz sonuç oluşmadı. Testi başlatınca kalite değerlendirmesi burada görünecek.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[30px] border border-[#dfe5e1] bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <h2 className="text-xl font-semibold">Admine Sonuç Gönder</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Sonucu yönetime iletmek için aşağıdaki alanları doldurabilirsiniz.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Kullanıcı Adı
                  </label>
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, username: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Panel
                  </label>
                  <input
                    value={form.panel}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, panel: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cihaz
                  </label>
                  <input
                    value={form.device}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, device: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Bağlantı Türü
                  </label>
                  <select
                    value={form.connectionType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        connectionType: e.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  >
                    <option>Wi-Fi</option>
                    <option>Ethernet</option>
                    <option>Mobil Veri</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Kullanılan Uygulama
                  </label>
                  <input
                    value={form.appName}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, appName: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Sorun Tipi
                  </label>
                  <select
                    value={form.issueType}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, issueType: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  >
                    <option>Donma</option>
                    <option>Kasma</option>
                    <option>Kanal Açılmıyor</option>
                    <option>Bağlantı Kopuyor</option>
                    <option>Diğer</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Kısa Not
                </label>
                <textarea
                  rows={4}
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                />
              </div>

              <button
                type="button"
                onClick={sendToAdmin}
                disabled={!result || sendState === "sending"}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SendIcon />
                {sendState === "sending"
                  ? "Gönderiliyor..."
                  : sendState === "done"
                  ? "Sonuç Gönderildi"
                  : sendState === "error"
                  ? "Gönderim Başarısız"
                  : "Sonucu Admine Gönder"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}