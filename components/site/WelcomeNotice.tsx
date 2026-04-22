"use client";

import { useEffect, useRef, useState } from "react";

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

type QueueItem = {
  type: "special" | "welcome";
  data: NoticeBlock;
};

function InfoIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function AlertIcon() {
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
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

function CloseIcon() {
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
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function WelcomeNotice() {
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [canShow, setCanShow] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentNotice = queue[currentIndex] ?? null;
  const isSpecial = currentNotice?.type === "special";

  useEffect(() => {
    const waitTimer = setTimeout(() => {
      setCanShow(true);
    }, 3100);

    return () => clearTimeout(waitTimer);
  }, []);

  useEffect(() => {
    fetch("/api/site-notice", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!data?.ok || !data?.settings) return;

        const settings = data.settings as SiteNoticeSettings;
        const nextQueue: QueueItem[] = [];

        if (settings.specialNotice?.enabled) {
          nextQueue.push({
            type: "special",
            data: settings.specialNotice,
          });
        }

        if (settings.welcomeNotice?.enabled) {
          nextQueue.push({
            type: "welcome",
            data: settings.welcomeNotice,
          });
        }

        setQueue(nextQueue);
        setCurrentIndex(0);
        setOpen(nextQueue.length > 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!currentNotice || !open) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      handleClose();
    }, (currentNotice.data.durationSeconds || 10) * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [currentNotice, open]);

  function handleClose() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const isLast = currentIndex >= queue.length - 1;

    if (isLast) {
      setOpen(false);
      return;
    }

    setCurrentIndex((prev) => prev + 1);
    setOpen(true);
  }

  if (loading || !canShow || !currentNotice || !open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/25 px-4 pt-6 md:pt-10">
      <div
        className={`w-full max-w-2xl rounded-[28px] border p-5 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-md md:p-6 ${
          isSpecial
            ? "border-rose-200 bg-white"
            : "border-[#dfe5e1] bg-white"
        }`}
      >


        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isSpecial
                ? "bg-rose-100 text-rose-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {isSpecial ? <AlertIcon /> : <InfoIcon />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {isSpecial ? "Özel Mesaj" : "Bilgilendirme"}
                </p>
                <h2
                  className={`mt-1 text-xl font-semibold ${
                    isSpecial ? "text-rose-800" : "text-slate-800"
                  }`}
                >
                  {currentNotice.data.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#e3e8e5] bg-[#fbfcfc] text-slate-500 transition hover:bg-white hover:text-slate-800"
                aria-label="Bildirimi kapat"
              >
                <CloseIcon />
              </button>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600 md:text-[15px]">
              {currentNotice.data.message}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  isSpecial
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {currentNotice.data.durationSeconds} saniye içinde kapanır
              </span>

              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                DealTV
              </span>

              {queue.length > 1 ? (
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                  {currentIndex + 1} / {queue.length}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}