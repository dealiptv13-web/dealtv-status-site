import { readPanels, writePanels } from "../../../../lib/panel-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await readPanels();
    return Response.json({ ok: true, items });
  } catch (error) {
    console.error("ADMIN PANELS GET ERROR:", error);
    return Response.json(
      { ok: false, message: "Panel verileri okunamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items = body?.items;

    if (!Array.isArray(items)) {
      return Response.json(
        { ok: false, message: "Geçersiz veri." },
        { status: 400 }
      );
    }

    await writePanels(items);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("ADMIN PANELS POST ERROR:", error);
    return Response.json(
      { ok: false, message: "Panel verileri kaydedilemedi." },
      { status: 500 }
    );
  }
}