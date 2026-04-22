import { supabase } from "./supabase";

export type NoticeBlock = {
  enabled: boolean;
  title: string;
  message: string;
  durationSeconds: number;
};

export type SiteNoticeSettings = {
  welcomeNotice: NoticeBlock;
  specialNotice: NoticeBlock;
};

const defaultNotice: SiteNoticeSettings = {
  welcomeNotice: {
    enabled: true,
    title: "DealTV Destek Merkezi",
    message:
      "Değerli kullanıcımız, bu platform DealTV kullanıcılarına özel olarak hazırlanmıştır. Burada yer alan araçlar ve destek alanları üzerinden birçok işlemi hızlıca gerçekleştirebilirsiniz. Sorununuz bu ekran üzerinden çözümlenmezse, sağ üst bölümde bulunan iletişim kanallarını kullanarak bizimle doğrudan bağlantıya geçebilir ve birebir canlı destek alabilirsiniz. İyi günler dileriz.",
    durationSeconds: 10,
  },
  specialNotice: {
    enabled: false,
    title: "Özel Mesaj Bildirimi",
    message: "Buraya acil duyuru mesajınızı yazabilirsiniz.",
    durationSeconds: 10,
  },
};

async function ensureSeed() {
  const { data, error } = await supabase
    .from("site_notice")
    .select("id")
    .in("id", ["welcome", "special"]);

  if (error) {
    throw error;
  }

  const existingIds = new Set((data || []).map((item) => item.id));
  const inserts = [];

  if (!existingIds.has("welcome")) {
    inserts.push({
      id: "welcome",
      enabled: defaultNotice.welcomeNotice.enabled,
      title: defaultNotice.welcomeNotice.title,
      message: defaultNotice.welcomeNotice.message,
      duration_seconds: defaultNotice.welcomeNotice.durationSeconds,
    });
  }

  if (!existingIds.has("special")) {
    inserts.push({
      id: "special",
      enabled: defaultNotice.specialNotice.enabled,
      title: defaultNotice.specialNotice.title,
      message: defaultNotice.specialNotice.message,
      duration_seconds: defaultNotice.specialNotice.durationSeconds,
    });
  }

  if (inserts.length > 0) {
    const { error: insertError } = await supabase
      .from("site_notice")
      .insert(inserts);

    if (insertError) {
      throw insertError;
    }
  }
}

export async function readSiteNotice(): Promise<SiteNoticeSettings> {
  await ensureSeed();

  const { data, error } = await supabase
    .from("site_notice")
    .select("id,enabled,title,message,duration_seconds");

  if (error) {
    throw error;
  }

  const welcome = data?.find((item) => item.id === "welcome");
  const special = data?.find((item) => item.id === "special");

  return {
    welcomeNotice: {
      enabled: welcome?.enabled ?? defaultNotice.welcomeNotice.enabled,
      title: welcome?.title ?? defaultNotice.welcomeNotice.title,
      message: welcome?.message ?? defaultNotice.welcomeNotice.message,
      durationSeconds:
        welcome?.duration_seconds ?? defaultNotice.welcomeNotice.durationSeconds,
    },
    specialNotice: {
      enabled: special?.enabled ?? defaultNotice.specialNotice.enabled,
      title: special?.title ?? defaultNotice.specialNotice.title,
      message: special?.message ?? defaultNotice.specialNotice.message,
      durationSeconds:
        special?.duration_seconds ?? defaultNotice.specialNotice.durationSeconds,
    },
  };
}

export async function writeSiteNotice(settings: SiteNoticeSettings) {
  const rows = [
    {
      id: "welcome",
      enabled: settings.welcomeNotice.enabled,
      title: settings.welcomeNotice.title,
      message: settings.welcomeNotice.message,
      duration_seconds: settings.welcomeNotice.durationSeconds,
      updated_at: new Date().toISOString(),
    },
    {
      id: "special",
      enabled: settings.specialNotice.enabled,
      title: settings.specialNotice.title,
      message: settings.specialNotice.message,
      duration_seconds: settings.specialNotice.durationSeconds,
      updated_at: new Date().toISOString(),
    },
  ];

  const { error } = await supabase.from("site_notice").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }

  return settings;
}