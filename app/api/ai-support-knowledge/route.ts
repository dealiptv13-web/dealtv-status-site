import { addKnowledgeItem, deleteKnowledgeItem, readKnowledgeItems } from "@/lib/knowledge-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await readKnowledgeItems();
    return Response.json({ ok: true, items });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, message: "Bilgi kartları okunamadı." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = String(body?.title || "").trim();
    const content = String(body?.content || "").trim();
    const suggestion = String(body?.suggestion || "").trim();
    const keywordsRaw = String(body?.keywords || "").trim();

    if (!title || !content || !keywordsRaw) {
      return Response.json(
        { ok: false, message: "Başlık, anahtar kelimeler ve içerik zorunludur." },
        { status: 400 }
      );
    }

    const keywords = keywordsRaw
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);

    if (!keywords.length) {
      return Response.json(
        { ok: false, message: "En az bir anahtar kelime gerekli." },
        { status: 400 }
      );
    }

    const item = await addKnowledgeItem({
      title,
      content,
      suggestion,
      keywords,
    });

    return Response.json({ ok: true, item });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, message: "Bilgi kartı eklenemedi." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json(
        { ok: false, message: "Silinecek kayıt bulunamadı." },
        { status: 400 }
      );
    }

    await deleteKnowledgeItem(id);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, message: "Bilgi kartı silinemedi." },
      { status: 500 }
    );
  }
}