"use client";

import { useEffect, useState } from "react";

type NetworkInfo = {
  ok: boolean;
  city: string;
  country: string;
  region: string;
  provider: string;
  ip: string;
};

function GlobeIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18" />
      <path d="M12 3a15 15 0 0 0 0 18" />
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

function ShieldIcon() {
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
      <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
    </svg>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${className}`} />;
}

export default function NetworkInfoCards() {
  const [info, setInfo] = useState<NetworkInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const response = await fetch("/api/network-info", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!mounted) return;
        setInfo(data);
      } catch (error) {
        console.error(error);
        if (!mounted) return;
        setInfo({
          ok: false,
          city: "Bilinmiyor",
          country: "Bilinmiyor",
          region: "",
          provider: "Tespit edilemedi",
          ip: "Bilinmiyor",
        });
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const locationText = info
    ? [info.city, info.country].filter(Boolean).join(", ")
    : "Tespit ediliyor";

  const providerText = info ? info.provider : "Tespit ediliyor";

  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <GlobeIcon />
            Konum
          </p>
          <p className="mt-3 text-base font-semibold text-slate-800">
            {locationText || "Bilinmiyor"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <ServerIcon />
            Sağlayıcı
          </p>
          <p className="mt-3 text-base font-semibold text-slate-800">
            {providerText || "Tespit edilemedi"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
            <ShieldIcon />
            Durum
          </p>
          <p className="mt-3 flex items-center gap-2 text-base font-semibold text-emerald-700">
            <Dot className="bg-emerald-500" />
            Engel Yok
          </p>
        </div>
      </div>
    </>
  );
}