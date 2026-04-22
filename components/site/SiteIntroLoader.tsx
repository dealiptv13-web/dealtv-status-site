"use client";

import { useEffect, useState } from "react";

export default function SiteIntroLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2400);

    const hideTimer = setTimeout(() => {
      setVisible(false);
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-[#eef1ef] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center px-6 text-center">
        <div className="relative mb-6 h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-blue-500 border-l-blue-500" />
          <div className="absolute inset-[10px] rounded-full border border-slate-200/80" />
        </div>

        <h2 className="text-2xl font-semibold tracking-[0.12em] text-slate-800 md:text-3xl">
          DealTV Destek Paneli
        </h2>

        <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-slate-600 md:text-base">
          Yükleniyor...
        </p>

        <p className="mt-2 text-sm text-slate-400">Lütfen bekleyiniz</p>
      </div>
    </div>
  );
}