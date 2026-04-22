import { supabase } from "../../../lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const DAY_MS = 24 * 60 * 60 * 1000;

type ReportPayload = {
  username: string;
  panel: string;
  device: string;
  connectionType: string;
  appName: string;
  issueType: string;
  note: string;
  ping: number | null;
  download: number | null;
  upload: number | null;
  jitter: number | null;
  qualityLabel: string;
  qualityScore: number;
  qualityMessage: string;
};

async function pruneOldReports() {
  const cutoff = new Date(Date.now() - DAY_MS).toISOString();

  const { error } = await supabase
    .from("speed_test_reports")
    .delete()
    .lt("created_at", cutoff);

  if (error) {
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReportPayload;

    if (!body.username?.trim()) {
      return Response.json(
        { ok: false, message: "Kullanıcı adı gerekli." },
        { status: 400 }
      );
    }

    await pruneOldReports();

    const newReport = {
      id: Date.now().toString(),
      username: body.username,
      panel: body.panel || "",
      device: body.device || "",
      connection_type: body.connectionType || "",
      app_name: body.appName || "",
      issue_type: body.issueType || "",
      note: body.note || "",
      ping: body.ping,
      download: body.download,
      upload: body.upload,
      jitter: body.jitter,
      quality_label: body.qualityLabel,
      quality_score: body.qualityScore,
      quality_message: body.qualityMessage,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("speed_test_reports")
      .insert(newReport);

    if (error) {
      throw error;
    }

    return Response.json({ ok: true, report: newReport });
  } catch (error) {
    console.error("REPORT POST ERROR:", error);
    return Response.json(
      { ok: false, message: "Rapor kaydedilemedi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await pruneOldReports();

    const { data, error } = await supabase
      .from("speed_test_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const reports = (data || []).map((item) => ({
      id: item.id,
      username: item.username,
      createdAt: item.created_at,
      qualityLabel: item.quality_label,
      qualityScore: item.quality_score,
      status: "Yeni",
      panel: item.panel,
      device: item.device,
      connectionType: item.connection_type,
      issueType: item.issue_type,
      ping: item.ping,
      download: item.download,
      upload: item.upload,
      jitter: item.jitter,
      qualityMessage: item.quality_message,
      note: item.note,
      adminNote: "",
    }));

    return Response.json({ ok: true, reports });
  } catch (error) {
    console.error("REPORT GET ERROR:", error);
    return Response.json(
      { ok: false, message: "Raporlar okunamadı." },
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

    const { error } = await supabase
      .from("speed_test_reports")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("REPORT DELETE ERROR:", error);
    return Response.json(
      { ok: false, message: "Kayıt silinemedi." },
      { status: 500 }
    );
  }
}