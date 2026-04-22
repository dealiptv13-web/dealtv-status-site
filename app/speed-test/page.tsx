"use client";

import { useMemo, useState } from "react";

type TestState = {
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
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

type QualityResult = {
  score: number;
  label: "Çok İyi" | "İyi" | "Orta" | "Kötü" | "Çok Kötü";
  colorClass: string;
  barClass: string;
  message: string;
  tips: string[];
};

function GaugeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13a8 8 0 1 0-16 0" />
      <path d="M12 13l4-4" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l1.8 3.6L18 8.4l-3 2.9.7 4.1L12 13.7 8.3 15.4 9 11.3 6 8.4l4.2-.8L12 3z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
    </svg>
  );
}

function BotIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="8" width="16" height="10" rx="4" />
      <path d="M12 4v4" />
      <path d="M9 13h.01" />
      <path d="M15 13h.01" />
    </svg>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getQualityResult(result: TestState, form: FormState): QualityResult | null {
  const { ping, download, upload, jitter } = result;

  if (ping == null || download == null || upload == null) {
    return null;
  }

  let score = 100;
  const tips: string[] = [];

  if (download < 8) score -= 35;
  else if (download < 15) score -= 22;
  else if (download < 25) score -= 12;
  else if (download < 40) score -= 5;

  if (upload < 2) score -= 15;
  else if (upload < 5) score -= 8;
  else if (upload < 10) score -= 3;

  if (ping > 150) score -= 30;
  else if (ping > 100) score -= 20;
  else if (ping > 70) score -= 10;
  else if (ping > 40) score -= 4;

  if (jitter != null) {
    if (jitter > 40) score -= 20;
    else if (jitter > 25) score -= 10;
    else if (jitter > 15) score -= 5;
  }

  if (form.connectionType === "Wi-Fi") {
    score -= 5;
    tips.push("Mümkünse Ethernet ile tekrar test edin.");
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  if (download < 15) {
    tips.push("İnternet hızınız yayın için düşük olabilir.");
  }

  if (ping > 80) {
    tips.push("Gecikme yüksek görünüyor, canlı yayınlarda donma yaşanabilir.");
  }

  if ((jitter ?? 0) > 20) {
    tips.push("Bağlantınız dalgalanıyor, modeme yakın test yapmanız faydalı olabilir.");
  }

  if (form.connectionType === "Wi-Fi") {
    tips.push("Wi-Fi kaynaklı kararsızlık ihtimali bulunuyor.");
  }

  if (score >= 85) {
    return {
      score,
      label: "Çok İyi",
      colorClass: "text-emerald-700",
      barClass: "from-emerald-400 to-emerald-600",
      message:
        "Bağlantı kaliteniz oldukça iyi görünüyor. Donma veya kasma sorunu büyük ihtimalle internetten değil; cihaz, uygulama veya panel yoğunluğu gibi nedenlerden kaynaklanabilir.",
      tips:
        tips.length > 0
          ? tips.slice(0, 2)
          : ["Bağlantı genel kullanım için yeterli görünüyor."],
    };
  }

  if (score >= 70) {
    return {
      score,
      label: "İyi",
      colorClass: "text-lime-700",
      barClass: "from-lime-300 to-emerald-500",
      message:
        "Bağlantı kaliteniz genel olarak iyi görünüyor. Normal kullanımda yeterli olabilir ancak yoğun saatlerde kısa süreli sorunlar yaşanabilir.",
      tips:
        tips.length > 0
          ? tips.slice(0, 3)
          : ["Yoğun saatlerde tekrar test etmeniz önerilir."],
    };
  }

  if (score >= 50) {
    return {
      score,
      label: "Orta",
      colorClass: "text-amber-700",
      barClass: "from-amber-300 to-yellow-500",
      message:
        "Bağlantı kaliteniz orta seviyede görünüyor. Zaman zaman donma, kalite düşmesi veya gecikme yaşanabilir.",
      tips:
        tips.length > 0
          ? tips.slice(0, 3)
          : ["Bağlantı kararlılığı kontrol edilmelidir."],
    };
  }

  if (score >= 30) {
    return {
      score,
      label: "Kötü",
      colorClass: "text-orange-700",
      barClass: "from-orange-300 to-orange-500",
      message:
        "Bağlantı kaliteniz düşük görünüyor. Donma ve kasma sorununun temel sebebi büyük ihtimalle internet bağlantısı veya Wi-Fi kararsızlığı olabilir.",
      tips:
        tips.length > 0
          ? tips.slice(0, 4)
          : ["Modeme yakın test yapın ve mümkünse Ethernet deneyin."],
    };
  }

  return {
    score,
    label: "Çok Kötü",
    colorClass: "text-rose-700",
    barClass: "from-rose-300 to-rose-600",
    message:
      "Bağlantı kaliteniz şu an stabil yayın için yetersiz görünüyor. Sorunun ana kaynağı büyük ihtimalle bağlantı hızı, gecikme veya kararsızlık.",
    tips:
      tips.length > 0
        ? tips.slice(0, 4)
        : ["Bağlantı koşulları iyileştirilmeden stabil yayın almak zor olabilir."],
  };
}

export default function SpeedTestPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [analysisStep, setAnalysisStep] = useState("");
  const [visualProgress, setVisualProgress] = useState(0);

  const [result, setResult] = useState<TestState>({
    ping: null,
    download: null,
    upload: null,
    jitter: null,
  });

  const [form, setForm] = useState<FormState>({
    username: "",
    panel: "",
    device: "",
    connectionType: "Wi-Fi",
    appName: "",
    issueType: "Donma",
    note: "",
  });

  const quality = useMemo(() => getQualityResult(result, form), [result, form]);

  async function animateProgress(from: number, to: number, duration: number, stepText: string) {
    setAnalysisStep(stepText);
    const totalSteps = Math.max(to - from, 1);
    const stepDelay = duration / totalSteps;

    for (let i = from; i <= to; i += 1) {
      setVisualProgress(i);
      await sleep(stepDelay);
    }
  }

  async function measurePing() {
    const samples: number[] = [];

    for (let i = 0; i < 4; i += 1) {
      const start = performance.now();
      const response = await fetch(`/api/speed-test/ping?ts=${Date.now()}-${i}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Ping testi başarısız oldu.");
      }

      const end = performance.now();
      samples.push(end - start);
    }

    const average = samples.reduce((a, b) => a + b, 0) / samples.length;

    let jitter = 0;
    for (let i = 1; i < samples.length; i += 1) {
      jitter += Math.abs(samples[i] - samples[i - 1]);
    }
    jitter = jitter / Math.max(samples.length - 1, 1);

    return {
      ping: average,
      jitter,
    };
  }

  async function measureDownload() {
    const start = performance.now();

    const response = await fetch(
      `/api/speed-test/download?size=1000000&ts=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error("Download testi başarısız oldu.");
    }

    const blob = await response.blob();
    const end = performance.now();

    const seconds = Math.max((end - start) / 1000, 0.001);
    const bits = blob.size * 8;
    return bits / seconds / 1_000_000;
  }

  async function measureUpload() {
    const size = 300_000;
    const bytes = new Uint8Array(size).fill(1);

    const start = performance.now();

    const response = await fetch("/api/speed-test/upload", {
      method: "POST",
      body: bytes,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Upload testi başarısız oldu.");
    }

    const end = performance.now();
    const seconds = Math.max((end - start) / 1000, 0.001);
    const bits = size * 8;
    return bits / seconds / 1_000_000;
  }

  async function runTest() {
    setError("");
    setSubmitMessage("");
    setIsRunning(true);
    setVisualProgress(0);
    setAnalysisStep("Analiz başlatılıyor...");

    try {
      await animateProgress(1, 18, 900, "Bağlantı hazırlanıyor...");
      const pingResult = await measurePing();

      await animateProgress(19, 52, 1400, "Gecikme ve kararlılık analiz ediliyor...");
      const download = await measureDownload();

      await animateProgress(53, 82, 1300, "İndirme performansı değerlendiriliyor...");
      const upload = await measureUpload();

      await animateProgress(83, 96, 900, "Yükleme performansı değerlendiriliyor...");

      setResult({
        ping: pingResult.ping,
        jitter: pingResult.jitter,
        download,
        upload,
      });

      await animateProgress(97, 100, 700, "Sonuç hazırlanıyor...");
      setAnalysisStep("Analiz tamamlandı.");
      await sleep(300);
    } catch (err) {
      console.error(err);
      setError("Test sırasında bir hata oluştu.");
      setAnalysisStep("");
      setVisualProgress(0);
    } finally {
      setIsRunning(false);
    }
  }

  async function submitToAdmin() {
    setSubmitMessage("");
    setError("");

    if (!quality) {
      setError("Önce testi tamamlamanız gerekiyor.");
      return;
    }

    if (!form.username.trim()) {
      setError("Kullanıcı adı girmeniz gerekiyor.");
      return;
    }

    setIsSubmitting(true);

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
          ping: result.ping,
          download: result.download,
          upload: result.upload,
          jitter: result.jitter,
          qualityLabel: quality.label,
          qualityScore: quality.score,
          qualityMessage: quality.message,
        }),
      });

      if (!response.ok) {
        throw new Error("Gönderim başarısız oldu.");
      }

      setSubmitMessage("Sonuç başarıyla admine gönderildi.");
    } catch (err) {
      console.error(err);
      setError("Sonuç admine gönderilirken hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function sendToAiSupport() {
    if (!quality) {
      setError("Önce testi tamamlamanız gerekiyor.");
      return;
    }

    const payload = {
      qualityLabel: quality.label,
      qualityScore: quality.score,
      qualityMessage: quality.message,
      tips: quality.tips,
      form,
    };

    sessionStorage.setItem("dealtv_ai_support_context", JSON.stringify(payload));
    window.location.href = "/ai-support";
  }

  return (
    <main className="min-h-screen bg-[#edf0ee] text-slate-800">
      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <a
              href="/"
              className="text-sm text-slate-500 transition hover:text-slate-800"
            >
              ← Ana sayfaya dön
            </a>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-800 md:text-4xl">
              Bağlantı Kalitesi Testi
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              Sistem, bağlantınızı arka planda analiz eder ve size tek bir kalite sonucu sunar.
            </p>
          </div>


        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[30px] border border-[#dfe5e1] bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-7">
            <div className="rounded-[24px] border border-[#e7ece9] bg-white p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <GaugeIcon />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Test Merkezi
                  </h2>
                  <p className="text-sm text-slate-500">
                   Bağlantı Kalitenizi Ölçüp Değerleri Admine Bildirin.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[#e7ece9] bg-[#fbfcfc] p-5 md:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                      Bağlantı Kalitesi
                    </p>
                    <h3
                      className={`mt-2 text-3xl font-semibold ${
                        quality?.colorClass ?? "text-slate-700"
                      }`}
                    >
                      {quality ? quality.label : isRunning ? "Analiz Ediliyor" : "Hazır Değil"}
                    </h3>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f7f5] text-slate-700">
                    <SparkIcon />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="relative h-5 w-full overflow-hidden rounded-full bg-[#e5ebe7]">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-300 ${
                        isRunning
                          ? "from-emerald-300 via-emerald-400 to-emerald-500"
                          : quality?.barClass ?? "from-slate-300 to-slate-400"
                      }`}
                      style={{ width: `${isRunning ? visualProgress : quality?.score ?? 0}%` }}
                    />

                    {isRunning ? (
                      <div
                        className="absolute top-0 h-full w-16 animate-pulse bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-70"
                        style={{
                          left: `calc(${Math.max(visualProgress - 8, 0)}% - 2rem)`,
                          transition: "left 0.25s linear",
                        }}
                      />
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
                    <span>Çok Kötü</span>
                    <span>Kötü</span>
                    <span>Orta</span>
                    <span>İyi</span>
                    <span>Çok İyi</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
                  <div className="flex items-center justify-center">
                    <div className="relative flex h-44 w-44 items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-emerald-200" />
                      <div className="absolute inset-[12px] rounded-full border border-emerald-200/80" />
                      <div className="absolute inset-[24px] rounded-full border border-emerald-200/70" />

                      {isRunning ? (
                        <div className="absolute inset-0 animate-spin rounded-full border-t-2 border-emerald-500/80 border-r-2 border-r-transparent border-b-2 border-b-transparent border-l-2 border-l-transparent" />
                      ) : null}

                      {isRunning ? (
                        <div className="absolute h-[1px] w-40 origin-center bg-gradient-to-r from-emerald-500/0 via-emerald-500/80 to-emerald-500/0 animate-spin" />
                      ) : null}

                      <div className="absolute h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)]" />

                      <div className="relative z-10 flex flex-col items-center">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                          Durum
                        </span>
                        <span className="mt-2 text-4xl font-semibold text-emerald-700">
                          %{isRunning ? visualProgress : quality?.score ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#e6ece8] bg-white p-4">
                    <p className="text-sm leading-7 text-slate-600">
                      {isRunning
                        ? analysisStep || "Bağlantı analiz ediliyor..."
                        : quality
                        ? quality.message
                        : "Test başlatıldığında bağlantınız analiz edilip kalite sonucu burada gösterilecek."}
                    </p>
                  </div>
                </div>

                {isRunning ? (
                  <div className="mt-4 flex items-center gap-3 text-sm text-emerald-700">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-emerald-500" />
                    Ölçüm sürüyor... %{visualProgress}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={runTest}
                  disabled={isRunning}
                  className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRunning ? "Analiz sürüyor..." : "Testi Başlat"}
                </button>

                {quality && !isRunning ? (
                  <button
                    type="button"
                    onClick={sendToAiSupport}
                    className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                  >
                    <BotIcon />
                    AI Destekte Yorumlat
                  </button>
                ) : null}

                <div className="text-sm text-slate-500">
                  Sonuç birkaç saniye içinde hazırlanır.
                </div>
              </div>

              {error ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              ) : null}

              {submitMessage ? (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {submitMessage}
                </div>
              ) : null}

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldIcon />
                  <h3 className="text-base font-semibold">Akıllı Yorum</h3>
                </div>

                <div className="mt-3 space-y-2">
                  {quality && !isRunning ? (
                    quality.tips.map((tip, index) => (
                      <p key={index} className="text-sm leading-7 text-emerald-800/90">
                        • {tip}
                      </p>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-emerald-800/90">
                      Test tamamlandığında bağlantınız için öneriler burada görünecek.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#dfe5e1] bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-7">
            <div className="rounded-[24px] border border-[#e7ece9] bg-white p-5 md:p-6">
              <h2 className="text-xl font-semibold text-slate-800">
                Kullanıcı Bilgileri
              </h2>
              <p className="mt-2 text-sm text-slate-500">
               Lütfen Bilgilerinizi Doğru Giriniz Aksi Halde Tam Destek Alamazsınız.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Kullanıcı adı
                  </label>
                  <input
                    value={form.username}
                    onChange={(e) =>
                      setForm({ ...form, username: e.target.value })
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                    placeholder="Örn: murat123"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Panel
                  </label>
                  <select
                    value={form.panel}
                    onChange={(e) => setForm({ ...form, panel: e.target.value })}
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  >
                    <option value="">Seçiniz</option>
                    <option value="Titan">Titan</option>
                    <option value="5G">5G</option>
                    <option value="MPremium">MPremium</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cihaz
                  </label>
                  <input
                    value={form.device}
                    onChange={(e) => setForm({ ...form, device: e.target.value })}
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                    placeholder="Örn: Android TV, iPhone, Box"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Bağlantı türü
                  </label>
                  <select
                    value={form.connectionType}
                    onChange={(e) =>
                      setForm({ ...form, connectionType: e.target.value })
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
                    Uygulama
                  </label>
                  <input
                    value={form.appName}
                    onChange={(e) => setForm({ ...form, appName: e.target.value })}
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                    placeholder="Örn: IPTV Smarters, Tivimate"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Sorun tipi
                  </label>
                  <select
                    value={form.issueType}
                    onChange={(e) =>
                      setForm({ ...form, issueType: e.target.value })
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                  >
                    <option>Donma</option>
                    <option>Kasma</option>
                    <option>Kalite Düşmesi</option>
                    <option>Açılmama</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Not
                  </label>
                  <textarea
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    rows={4}
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                    placeholder="Ek açıklama yazabilirsiniz"
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={submitToAdmin}
                  disabled={isRunning || isSubmitting || !quality}
                  className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Gönderiliyor..." : "Sonucu Admine Gönder"}
                </button>


              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}