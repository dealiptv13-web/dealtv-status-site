import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const reportsFile = path.join(dataDir, "speed-test-reports.json");
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

async function ensureFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(reportsFile);
  } catch {
    await fs.writeFile(reportsFile, "[]", "utf8");
  }
}

async function readReports() {
  await ensureFile();
  const raw = await fs.readFile(reportsFile, "utf8");
  return JSON.parse(raw);
}

async function writeReports(reports: any[]) {
  await ensureFile();
  await fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), "utf8");
}

async function pruneOldReports() {
  const reports = await readReports();
  const now = Date.now();

  const filtered = reports.filter((report: any) => {
    const createdAt = new Date(report.createdAt).getTime();
    return now - createdAt <= DAY_MS;
  });

  if (filtered.length !== reports.length) {
    await writeReports(filtered);
  }

  return filtered;
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

    const reports = await pruneOldReports();

    const newReport = {
      id: Date.now().toString(),
      username: body.username,
      panel: body.panel || "",
      device: body.device || "",
      connectionType: body.connectionType || "",
      appName: body.appName || "",
      issueType: body.issueType || "",
      note: body.note || "",
      ping: body.ping,
      download: body.download,
      upload: body.upload,
      jitter: body.jitter,
      qualityLabel: body.qualityLabel,
      qualityScore: body.qualityScore,
      qualityMessage: body.qualityMessage,
      createdAt: new Date().toISOString(),
      status: "Yeni",
      adminNote: "",
    };

    reports.unshift(newReport);
    await writeReports(reports);

    return Response.json({ ok: true, report: newReport });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, message: "Rapor kaydedilemedi." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const reports = await pruneOldReports();
    return Response.json({ ok: true, reports });
  } catch (error) {
    console.error(error);
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

    const reports = await pruneOldReports();
    const filtered = reports.filter((report: any) => report.id !== id);

    await writeReports(filtered);

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { ok: false, message: "Kayıt silinemedi." },
      { status: 500 }
    );
  }
}