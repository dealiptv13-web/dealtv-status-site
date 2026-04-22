"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KnowledgeItem } from "@/lib/ai-support-knowledge";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  actions?: SupportAction[];
  knowledge?: KnowledgeItem[];
};

type SupportForm = {
  category: string;
  device: string;
  connectionType: string;
};

type SupportAction = {
  label: string;
  href?: string;
  fillInput?: string;
};

type ImportedSpeedTestContext = {
  qualityLabel: string;
  qualityScore: number;
  qualityMessage: string;
  tips: string[];
  form: {
    username: string;
    panel: string;
    device: string;
    connectionType: string;
    appName: string;
    issueType: string;
    note: string;
  };
};

function BotIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="8" width="16" height="10" rx="4" />
      <path d="M12 4v4" />
      <path d="M9 13h.01" />
      <path d="M15 13h.01" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 3.6L18 8.4l-3 2.9.7 4.1L12 13.7 8.3 15.4 9 11.3 6 8.4l4.2-.8L12 3z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function findRelevantKnowledge(
  input: string,
  form: SupportForm,
  knowledgeBase: KnowledgeItem[]
) {
  const haystack = [
    input.toLowerCase(),
    form.category.toLowerCase(),
    form.device.toLowerCase(),
    form.connectionType.toLowerCase(),
  ].join(" ");

  return knowledgeBase
    .map((item) => {
      let score = 0;
      for (const keyword of item.keywords) {
        if (haystack.includes(keyword.toLowerCase())) {
          score += 1;
        }
      }
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.item);
}

function buildKnowledgeText(knowledge: KnowledgeItem[]) {
  if (!knowledge.length) return "";
  return knowledge.map((item) => item.content).join(" ");
}

function getAiResponse(
  input: string,
  form: SupportForm,
  knowledgeBase: KnowledgeItem[]
): { text: string; actions: SupportAction[]; knowledge: KnowledgeItem[] } {
  const text = input.toLowerCase().trim();
  const category = form.category.toLowerCase();
  const device = form.device.toLowerCase();
  const connection = form.connectionType.toLowerCase();

  const knowledge = findRelevantKnowledge(input, form, knowledgeBase);
  const knowledgeText = buildKnowledgeText(knowledge);

  const deviceText =
    form.device && form.device !== "Seçilmedi"
      ? ` Kullandığınız cihaz: ${form.device}.`
      : "";

  const connectionText =
    form.connectionType && form.connectionType !== "Seçilmedi"
      ? ` Bağlantı türünüz: ${form.connectionType}.`
      : "";

  if (!text) {
    return {
      text: "Sorununuzu kısa şekilde yazarsanız size daha net yardımcı olabilirim.",
      actions: [{ label: "Yeni Soru Sor", fillInput: "" }],
      knowledge,
    };
  }

  if (
    text.includes("donma") ||
    text.includes("kasma") ||
    text.includes("takıl") ||
    category === "donma-kasma"
  ) {
    let reply =
      "Donma veya kasma sorunu yaşıyorsanız önce bağlantı kalitesini kontrol etmek en doğru adımdır. " +
      (knowledgeText || "Bağlantı kalitesi düşükse sorun büyük ihtimalle internet veya Wi-Fi kaynaklıdır. Bağlantı sonucu iyi çıkarsa cihaz, uygulama veya panel yoğunluğu kontrol edilmelidir.");

    if (connection === "wi-fi") {
      reply += " Wi-Fi bağlantılarda dalgalanma daha sık olur; modeme yakın test yapın ve mümkünse Ethernet ile tekrar deneyin.";
    }

    if (device.includes("android tv") || device.includes("box")) {
      reply += " Android TV ve box cihazlarda uygulama önbelleğini temizlemek ve cihazı yeniden başlatmak da faydalı olabilir.";
    }

    return {
      text: reply + deviceText + connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Panel Durumunu Kontrol Et", href: "/" },
        { label: "Şunu Sor", fillInput: "Bağlantım iyi çıkarsa başka neyi kontrol etmeliyim?" },
      ],
      knowledge,
    };
  }

  if (
    text.includes("wifi") ||
    text.includes("wi-fi") ||
    text.includes("kablosuz") ||
    category === "bağlantı"
  ) {
    return {
      text:
        (knowledgeText ||
          "Wi-Fi bağlantılarda anlık sinyal düşüşü, modem uzaklığı ve ağ yoğunluğu nedeniyle donma yaşanabilir. 5 GHz ağ kullanın, modeme yakın test yapın ve mümkünse Ethernet ile tekrar deneyin.") +
        deviceText +
        connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Ethernet Hakkında Sor", fillInput: "Ethernet ile bağlanırsam ne fark eder?" },
        { label: "Yeni Soru Sor", fillInput: "" },
      ],
      knowledge,
    };
  }

  if (text.includes("ethernet") || text.includes("kablolu")) {
    return {
      text:
        (knowledgeText ||
          "Ethernet bağlantı en stabil yöntemdir. Kablolu bağlantıda da sorun yaşıyorsanız internet gecikmesi, uygulama performansı veya panel yoğunluğu tarafı kontrol edilmelidir.") +
        deviceText +
        connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Panel Durumunu Kontrol Et", href: "/" },
        { label: "Yeni Soru Sor", fillInput: "" },
      ],
      knowledge,
    };
  }

  if (
    text.includes("iptv smarters") ||
    text.includes("tivimate") ||
    text.includes("uygulama") ||
    category === "uygulama"
  ) {
    return {
      text:
        (knowledgeText ||
          "Sorun belirli bir uygulamada oluyorsa önce uygulamayı tamamen kapatıp yeniden açın, güncellemeleri kontrol edin ve mümkünse farklı bir uygulama ile test edin.") +
        " Aynı sorun farklı uygulamalarda da varsa bağlantı veya panel tarafı incelenmelidir." +
        deviceText +
        connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Panel Durumunu Kontrol Et", href: "/" },
        { label: "Şunu Sor", fillInput: "Farklı uygulama denemek neden önemli?" },
      ],
      knowledge,
    };
  }

  if (
    text.includes("panel") ||
    text.includes("titan") ||
    text.includes("5g") ||
    text.includes("mpremium") ||
    category === "panel"
  ) {
    return {
      text:
        (knowledgeText ||
          "Panel kaynaklı bir durum düşünüyorsanız önce ana sayfadaki panel durumunu kontrol edin. Panel stabil görünüyorsa hız testi sonucu ve cihaz bilgisi ile birlikte değerlendirme yapmak daha doğru olur.") +
        deviceText +
        connectionText,
      actions: [
        { label: "Panel Durumunu Kontrol Et", href: "/" },
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Yeni Soru Sor", fillInput: "" },
      ],
      knowledge,
    };
  }

  if (
    text.includes("kurulum") ||
    text.includes("nasıl kurulur") ||
    text.includes("yükleme") ||
    category === "kurulum"
  ) {
    return {
      text:
        (knowledgeText ||
          "Kurulum için cihaz türü çok önemlidir. Hangi cihazı kullandığınızı yazarsanız size daha uygun yönlendirme yapabilirim. Genel olarak uygulama kurulumu, giriş bilgileri ve bağlantı testi ilk kontrol edilmesi gereken alanlardır.") +
        deviceText +
        connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Şunu Sor", fillInput: "Android TV için kurulumda önce neyi kontrol etmeliyim?" },
        { label: "Yeni Soru Sor", fillInput: "" },
      ],
      knowledge,
    };
  }

  if (
    text.includes("android") ||
    text.includes("box") ||
    text.includes("tv")
  ) {
    return {
      text:
        (knowledgeText ||
          "Android TV veya box cihazlarda performans genelde iyidir. Sorun varsa cihazı yeniden başlatın, uygulama önbelleğini temizleyin ve mümkünse Ethernet ile yeniden deneyin.") +
        deviceText +
        connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Şunu Sor", fillInput: "Android TV'de önbellek temizlemek işe yarar mı?" },
        { label: "Yeni Soru Sor", fillInput: "" },
      ],
      knowledge,
    };
  }

  if (
    text.includes("iphone") ||
    text.includes("ios") ||
    text.includes("ipad")
  ) {
    return {
      text:
        (knowledgeText ||
          "iPhone veya iPad tarafında uygulama seçimi önemlidir. Sorun yaşanıyorsa farklı internet bağlantısı ile test yapılmalı, uygulama yeniden başlatılmalı ve mümkünse aynı hesap başka cihazda denenmelidir.") +
        deviceText +
        connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Şunu Sor", fillInput: "iPhone'da uygulama değiştirsem fark eder mi?" },
        { label: "Yeni Soru Sor", fillInput: "" },
      ],
      knowledge,
    };
  }

  if (text.includes("hız testi") || text.includes("test")) {
    return {
      text:
        (knowledgeText ||
          "Hız testi bölümü bağlantı kalitesini Çok İyi, İyi, Orta, Kötü veya Çok Kötü olarak yorumlar. Test sonucunu aldıktan sonra kullanıcı bilgisiyle admine gönderirseniz destek daha hızlı ilerler.") +
        deviceText +
        connectionText,
      actions: [
        { label: "Hız Testine Git", href: "/speed-test" },
        { label: "Panel Durumunu Kontrol Et", href: "/" },
        { label: "Yeni Soru Sor", fillInput: "" },
      ],
      knowledge,
    };
  }

  return {
    text:
      (knowledgeText ||
        "Daha net yardımcı olabilmem için kullandığınız cihazı, bağlantı türünü ve yaşadığınız sorunu birlikte yazın. Örnek: 'Android TV kullanıyorum, Wi-Fi bağlıyım, canlı yayın donuyor.'") +
      deviceText +
      connectionText,
    actions: [
      { label: "Hız Testine Git", href: "/speed-test" },
      { label: "Panel Durumunu Kontrol Et", href: "/" },
      { label: "Yeni Soru Sor", fillInput: "" },
    ],
    knowledge,
  };
}

const initialAssistantMessage: ChatMessage = {
  role: "assistant",
  text: "Merhaba, ben DealTV AI Destek asistanıyım. Cihaz, bağlantı, panel ve yayın sorunlarında size hızlı yönlendirme sağlayabilirim.",
  actions: [
    { label: "Hız Testine Git", href: "/speed-test" },
    { label: "Panel Durumunu Kontrol Et", href: "/" },
  ],
};

export default function AiSupportPage() {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    initialAssistantMessage,
  ]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([]);

  const [form, setForm] = useState<SupportForm>({
    category: "Seçilmedi",
    device: "Seçilmedi",
    connectionType: "Seçilmedi",
  });

  const quickPrompts = useMemo(
    () => [
      "Canlı yayın donuyor ne yapmalıyım?",
      "Wi-Fi ile izliyorum, kasma neden olur?",
      "Panel mi sorunlu internet mi nasıl anlarım?",
      "Android TV için ne önerirsin?",
    ],
    []
  );

  const templates = useMemo(
    () => [
      "Android TV kullanıyorum, Wi-Fi bağlıyım, canlı yayın donuyor.",
      "iPhone kullanıyorum, uygulama açılıyor ama yayın takılıyor.",
      "Panel durumu stabil görünüyor ama kasma yaşıyorum.",
      "Ethernet bağlıyım ama kalite düşmesi oluyor.",
    ],
    []
  );

  const chatBoxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/ai-support-knowledge", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && Array.isArray(data.items)) {
          setKnowledgeBase(data.items);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  useEffect(() => {
    const raw = sessionStorage.getItem("dealtv_ai_support_context");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as ImportedSpeedTestContext;

      const introUserText =
        `Hız testi sonucumu yorumlar mısın? Sonuç: ${parsed.qualityLabel} (%${parsed.qualityScore}). ` +
        `Bağlantı türüm: ${parsed.form.connectionType || "-"}. ` +
        `Cihazım: ${parsed.form.device || "-"}. ` +
        `Panel: ${parsed.form.panel || "-"}. ` +
        `Sorun tipim: ${parsed.form.issueType || "-"}.`;

      const assistantText =
        `Hız testi sonucunu aldım. Sonuç seviyeniz ${parsed.qualityLabel} ve kalite puanınız %${parsed.qualityScore} görünüyor. ${parsed.qualityMessage} ` +
        (parsed.tips?.length ? `Öne çıkan öneriler: ${parsed.tips.join(" ")}` : "");

      setMessages((prev) => {
        const alreadyImported = prev.some((m) =>
          m.text.includes("Hız testi sonucumu yorumlar mısın?")
        );
        if (alreadyImported) return prev;

        return [
          ...prev,
          { role: "user", text: introUserText },
          {
            role: "assistant",
            text: assistantText,
            actions: [
              { label: "Hız Testine Dön", href: "/speed-test" },
              {
                label: "Şunu Sor",
                fillInput:
                  "Bu sonuca göre önce interneti mi cihazı mı kontrol etmeliyim?",
              },
              { label: "Panel Durumunu Kontrol Et", href: "/" },
            ],
          },
        ];
      });

      if (parsed.form.device && parsed.form.device.trim()) {
        setForm((prev) => ({
          ...prev,
          device: parsed.form.device,
          connectionType: parsed.form.connectionType || prev.connectionType,
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      sessionStorage.removeItem("dealtv_ai_support_context");
    }
  }, []);

  async function sendMessage(customText?: string) {
    const text = (customText ?? input).trim();

    if (!text || isThinking) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setIsThinking(true);

    setTimeout(() => {
      const reply = getAiResponse(text, form, knowledgeBase);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: reply.text,
          actions: reply.actions,
          knowledge: reply.knowledge,
        },
      ]);
      setIsThinking(false);
    }, 900);
  }

  function clearChat() {
    if (isThinking) return;
    setMessages([initialAssistantMessage]);
    setInput("");
  }

  function handleAction(action: SupportAction) {
    if (action.href) {
      window.location.href = action.href;
      return;
    }

    if (typeof action.fillInput !== "undefined") {
      setInput(action.fillInput);
    }
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
              DealTV AI Destek
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              Cihaz, bağlantı, panel ve yayın sorunları için akıllı destek alanı.
            </p>
          </div>


        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-[30px] border border-[#dfe5e1] bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-7">
            <div className="rounded-[24px] border border-[#e7ece9] bg-white p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <BotIcon />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Destek Ayarları
                  </h2>
                  <p className="text-sm text-slate-500">
                    Soruyu daha doğru yönlendirmek için seçim yapın
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Kategori
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                  >
                    <option>Seçilmedi</option>
                    <option>Donma-Kasma</option>
                    <option>Bağlantı</option>
                    <option>Uygulama</option>
                    <option>Panel</option>
                    <option>Kurulum</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Cihaz
                  </label>
                  <select
                    value={form.device}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, device: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                  >
                    <option>Seçilmedi</option>
                    <option>Android TV</option>
                    <option>Android Box</option>
                    <option>Telefon</option>
                    <option>iPhone / iPad</option>
                    <option>PC / Laptop</option>
                    <option>Smart TV</option>
                  </select>
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
                    className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 text-sm outline-none transition focus:border-emerald-400"
                  >
                    <option>Seçilmedi</option>
                    <option>Wi-Fi</option>
                    <option>Ethernet</option>
                    <option>Mobil Veri</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 border-t border-[#e8eeea] pt-6">
                <h3 className="text-sm font-semibold text-slate-800">
                  Hızlı Konular
                </h3>

                <div className="mt-3 space-y-3">
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-white"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-[#e8eeea] pt-6">
                <h3 className="text-sm font-semibold text-slate-800">
                  Hazır Mesaj Şablonları
                </h3>

                <div className="mt-3 space-y-3">
                  {templates.map((template) => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => setInput(template)}
                      className="w-full rounded-2xl border border-[#dfe7e2] bg-white px-4 py-3 text-left text-sm text-slate-600 transition hover:bg-[#fbfcfc]"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <SparkIcon />
                  <h3 className="text-sm font-semibold">Bilgi Havuzu Aktif</h3>
                </div>
                <p className="mt-2 text-sm leading-7 text-emerald-800/90">
                  Bilgi Havuzundan dilediğiniz gibi yararlanabilirsiniz.
                </p>

              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-[#dfe5e1] bg-white/92 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-7">
            <div className="rounded-[24px] border border-[#e7ece9] bg-white p-5 md:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    Sohbet Alanı
                  </h2>
                  <p className="text-sm text-slate-500">
                    Aşağıdan AI Yardımıyla Sorununuzu Çözebilirsiniz.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearChat}
                  disabled={isThinking}
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <TrashIcon />
                  Sohbeti Temizle
                </button>
              </div>

              <div
                ref={chatBoxRef}
                className="h-[520px] overflow-y-auto rounded-2xl border border-[#e7ece9] bg-[#fbfcfc] p-4"
              >
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={index}>
                      <div
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${
                            message.role === "user"
                              ? "bg-emerald-600 text-white"
                              : "border border-[#e7ece9] bg-white text-slate-700"
                          }`}
                        >
                          {message.text}
                        </div>
                      </div>

                      {message.role === "assistant" && message.actions?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.actions.map((action, actionIndex) => (
                            <button
                              key={`${index}-${actionIndex}`}
                              type="button"
                              onClick={() => handleAction(action)}
                              className="rounded-full border border-[#dfe7e2] bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-[#f8faf9]"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      ) : null}

                      {message.role === "assistant" && message.knowledge?.length ? (
                        <div className="mt-3 space-y-2">
                          {message.knowledge.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3"
                            >
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                                Bilgi Kartı
                              </p>
                              <h3 className="mt-1 text-sm font-semibold text-emerald-800">
                                {item.title}
                              </h3>
                              <p className="mt-1 text-sm leading-6 text-emerald-800/90">
                                {item.content}
                              </p>
                              {item.suggestion ? (
                                <p className="mt-2 text-xs font-medium text-emerald-700">
                                  Öneri: {item.suggestion}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {isThinking ? (
                    <div className="flex justify-start">
                      <div className="rounded-2xl border border-[#e7ece9] bg-white px-4 py-3 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                          <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-500" />
                          <span className="ml-2">Yazıyor...</span>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 border-t border-[#e8eeea] pt-5">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="flex-1 rounded-2xl border border-[#dfe7e2] bg-[#fbfcfc] px-4 py-3 outline-none transition focus:border-emerald-400"
                    placeholder="Örn: Android TV kullanıyorum, Wi-Fi bağlıyım, canlı yayın donuyor."
                  />

                  <button
                    type="button"
                    onClick={() => sendMessage()}
                    disabled={isThinking || !input.trim()}
                    className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Gönder
                  </button>
                </div>


              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}