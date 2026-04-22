import { readSiteNotice, writeSiteNotice } from "../../../lib/site-notice-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function normalizeBlock(block: any, fallbackTitle: string) {
  return {
    enabled: Boolean(block?.enabled),
    title: String(block?.title || fallbackTitle).trim(),
    message: String(block?.message || "").trim(),
    durationSeconds: Number(block?.durationSeconds || 10),
  };
}

function validateBlock(block: {
  title: string;
  message: string;
  durationSeconds: number;
}) {
  if (!block.title) return "Başlık zorunludur.";
  if (!block.message) return "Mesaj zorunludur.";

  if (
    !Number.isFinite(block.durationSeconds) ||
    block.durationSeconds < 1 ||
    block.durationSeconds > 60
  ) {
    return "Süre 1 ile 60 saniye arasında olmalıdır.";
  }

  return null;
}

export async function GET() {
  try {
    const settings = await readSiteNotice();
    return Response.json({ ok: true, settings });
  } catch (error) {
    console.error("SITE NOTICE GET ERROR:", error);
    return Response.json(
      { ok: false, message: "Bildirim ayarları okunamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const settings = {
      welcomeNotice: normalizeBlock(body?.welcomeNotice, "DealTV Destek Merkezi"),
      specialNotice: normalizeBlock(body?.specialNotice, "Özel Mesaj Bildirimi"),
    };

    const welcomeError = validateBlock(settings.welcomeNotice);
    if (welcomeError) {
      return Response.json(
        { ok: false, message: `Karşılama bildirimi: ${welcomeError}` },
        { status: 400 }
      );
    }

    const specialError = validateBlock(settings.specialNotice);
    if (specialError) {
      return Response.json(
        { ok: false, message: `Özel mesaj bildirimi: ${specialError}` },
        { status: 400 }
      );
    }

    await writeSiteNotice(settings);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("SITE NOTICE POST ERROR:", error);
    return Response.json(
      { ok: false, message: "Bildirim ayarları kaydedilemedi." },
      { status: 500 }
    );
  }
}