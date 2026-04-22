import { headers } from "next/headers";
import { getPanelStyle, readPanels } from "../lib/panel-store";
import WelcomeNotice from "../components/site/WelcomeNotice";
import SiteIntroLoader from "../components/site/SiteIntroLoader";
import NetworkInfoCards from "../components/site/NetworkInfoCards";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Action = {
  title: string;
  text: string;
  href: string;
  icon: React.ReactNode;
};

async function getClientIp() {
  const headersList = await headers();

  const forwardedFor = headersList.get("x-forwarded-for");
  const realIp = headersList.get("x-real-ip");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "Bilinmiyor";
  }

  if (realIp) {
    return realIp;
  }

  return "Bilinmiyor";
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ServerIcon() {
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
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01" />
      <path d="M7 17h.01" />
    </svg>
  );
}

function SpeedIcon() {
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
      <path d="M20 13a8 8 0 1 0-16 0" />
      <path d="M12 13l4-4" />
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
      strokeWidth="2"
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

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.89c0 2.1.55 4.16 1.6 5.98L0 24l6.3-1.65a11.84 11.84 0 0 0 5.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.16-3.45-8.44ZM12.07 21.8h-.01a9.88 9.88 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.64-.24-.37a9.86 9.86 0 0 1-1.52-5.28c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.13 1.03 6.99 2.9a9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.89-9.89 9.89Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.24-.46-2.36-1.46-.87-.78-1.46-1.75-1.63-2.04-.17-.3-.02-.45.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.71.62.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M21.94 4.66a1.5 1.5 0 0 0-1.63-.22L2.98 11.74a1.5 1.5 0 0 0 .1 2.81l4.24 1.42 1.42 4.24a1.5 1.5 0 0 0 2.81.1l7.3-17.33a1.5 1.5 0 0 0-.91-2.02ZM9.4 18.08l-.9-2.67 6.14-6.14-7.34 4.78-2.67-.9 14.44-6.09L9.4 18.08Z" />
    </svg>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />;
}

export default async function HomePage() {
  const clientIp = await getClientIp();
  const panels = await readPanels();

  const actions: Action[] = [
    {
      title: "Hız Testi",
      text: "Bağlantı testini çalıştırın ve sonucu doğrudan admine gönderin.",
      href: "/speed-test",
      icon: <SpeedIcon />,
    },
    {
      title: "AI Destek",
      text: "Kurulum, donma, cihaz ve panel sorularınız için akıllı destek alanı.",
      href: "/ai-support",
      icon: <BotIcon />,
    },
  ];

  const whatsappHref = "https://wa.me/12264773628";
  const telegramHref = "https://t.me/dealiptv";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf0ee] text-slate-800">
      <SiteIntroLoader />
      <WelcomeNotice />

      <div className="pointer-events-none absolute inset-0">
        <img
          src="/world-map.svg"
          alt="World map background"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.13]"
        />
      </div>

      <header className="relative z-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">
              DealTV Control
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sistem durumu, hız testi ve AI destek merkezi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="hidden items-center gap-8 text-sm text-slate-500 md:flex">
              <a href="/" className="transition hover:text-slate-800">
                Durum
              </a>
              <a href="/speed-test" className="transition hover:text-slate-800">
                Hız Testi
              </a>
              <a href="/ai-support" className="transition hover:text-slate-800">
                AI Destek
              </a>
            </nav>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#dfe5e1] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-[#f8faf9]"
            >
              <span className="text-emerald-600">
                <WhatsappIcon />
              </span>
              WhatsApp
            </a>

            <a
              href={telegramHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-[#dfe5e1] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:bg-[#f8faf9]"
            >
              <span className="text-sky-600">
                <TelegramIcon />
              </span>
              Telegram
            </a>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-14 pt-4 md:pb-20 md:pt-10">
        <div className="mx-auto max-w-4xl rounded-[34px] border border-[#dfe5e1] bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-md md:p-8">
          <div className="rounded-[28px] border border-[#e7ece9] bg-white p-6 md:p-8">
            <div className="flex flex-col gap-6 border-b border-[#e8eeea] pb-7 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/70">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckIcon />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Genel Sistem Durumu
                  </p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-emerald-700 md:text-4xl">
                    Erişim Aktif
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 md:text-base">
                    Global ağ taraması ve panel durum görünürlüğü
                  </p>
                </div>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                <Dot className="bg-emerald-500" />
                Sistem Aktif
              </div>
            </div>

            <div className="mt-6 rounded-[22px] border border-[#e7ece9] bg-[#f8faf9] p-4 md:p-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                <ServerIcon />
                Bağlantı Noktaları
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    IPv4
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {clientIp}
                  </p>
                </div>

                <div className="rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Son Güncelleme
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Az önce
                  </p>
                </div>
              </div>
            </div>

            <NetworkInfoCards />

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {panels.map((panel) => {
                const style = getPanelStyle(panel.status);
                return (
                  <div
                    key={panel.id}
                    className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Dot className={style.dotClass} />
                        <h3 className="text-base font-semibold text-slate-800">
                          {panel.name}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${style.statusClass}`}
                      >
                        {panel.status}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {panel.note}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-5 md:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckIcon />
                </div>

                <div>
                  <h3 className="text-xl font-semibold tracking-tight text-emerald-800">
                    Erişim engeli yoktur
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-emerald-700/90">
                    Sistem genelinde büyük bir erişim problemi görünmüyor.
                    Panel bazlı durum değişiklikleri, bakım süreçleri ve güncel
                    bilgilendirmeler bu ekran üzerinden sade şekilde paylaşılabilir.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-7 grid max-w-4xl gap-4 md:grid-cols-2">
          {actions.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="rounded-2xl border border-[#dde5e0] bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-md transition hover:bg-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3f7f4] text-emerald-700">
                {item.icon}
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-800">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.text}
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}