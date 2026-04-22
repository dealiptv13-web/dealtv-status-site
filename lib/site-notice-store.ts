import { promises as fs } from "fs";
import path from "path";

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

const dataDir = path.join(process.cwd(), "data");
const noticeFile = path.join(dataDir, "site-notice.json");

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

async function ensureNoticeFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(noticeFile);
  } catch {
    await fs.writeFile(noticeFile, JSON.stringify(defaultNotice, null, 2), "utf8");
    return;
  }

  try {
    const raw = await fs.readFile(noticeFile, "utf8");
    const parsed = JSON.parse(raw);

    if (!parsed.welcomeNotice || !parsed.specialNotice) {
      const merged: SiteNoticeSettings = {
        welcomeNotice: {
          ...defaultNotice.welcomeNotice,
          ...(parsed.welcomeNotice || parsed),
        },
        specialNotice: {
          ...defaultNotice.specialNotice,
          ...(parsed.specialNotice || {}),
        },
      };

      await fs.writeFile(noticeFile, JSON.stringify(merged, null, 2), "utf8");
    }
  } catch {
    await fs.writeFile(noticeFile, JSON.stringify(defaultNotice, null, 2), "utf8");
  }
}

export async function readSiteNotice(): Promise<SiteNoticeSettings> {
  await ensureNoticeFile();
  const raw = await fs.readFile(noticeFile, "utf8");
  return JSON.parse(raw) as SiteNoticeSettings;
}

export async function writeSiteNotice(settings: SiteNoticeSettings) {
  await ensureNoticeFile();
  await fs.writeFile(noticeFile, JSON.stringify(settings, null, 2), "utf8");
}