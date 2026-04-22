import { promises as fs } from "fs";
import path from "path";

export type PanelStatus = "Stabil" | "Yoğun" | "Bakımda" | "Kapalı";

export type PanelItem = {
  id: string;
  name: string;
  status: PanelStatus;
  note: string;
};

const dataDir = path.join(process.cwd(), "data");
const panelsFile = path.join(dataDir, "panels.json");

const defaultPanels: PanelItem[] = [
  {
    id: "titan",
    name: "Titan Panel",
    status: "Stabil",
    note: "Yayınlar sorunsuz çalışıyor.",
  },
  {
    id: "5g",
    name: "5G Panel",
    status: "Yoğun",
    note: "Yoğun saatlerde kısa gecikme olabilir.",
  },
  {
    id: "mpremium",
    name: "MPremium",
    status: "Bakımda",
    note: "Planlı bakım işlemi devam ediyor.",
  },
];

async function ensurePanelsFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(panelsFile);
  } catch {
    await fs.writeFile(panelsFile, JSON.stringify(defaultPanels, null, 2), "utf8");
  }
}

export async function readPanels(): Promise<PanelItem[]> {
  await ensurePanelsFile();
  const raw = await fs.readFile(panelsFile, "utf8");
  return JSON.parse(raw) as PanelItem[];
}

export async function writePanels(items: PanelItem[]) {
  await ensurePanelsFile();
  await fs.writeFile(panelsFile, JSON.stringify(items, null, 2), "utf8");
}

export function getPanelStyle(status: PanelStatus) {
  switch (status) {
    case "Stabil":
      return {
        statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dotClass: "bg-emerald-500",
      };
    case "Yoğun":
      return {
        statusClass: "border-amber-200 bg-amber-50 text-amber-700",
        dotClass: "bg-amber-400",
      };
    case "Bakımda":
      return {
        statusClass: "border-sky-200 bg-sky-50 text-sky-700",
        dotClass: "bg-sky-400",
      };
    case "Kapalı":
      return {
        statusClass: "border-rose-200 bg-rose-50 text-rose-700",
        dotClass: "bg-rose-500",
      };
    default:
      return {
        statusClass: "border-slate-200 bg-slate-50 text-slate-700",
        dotClass: "bg-slate-400",
      };
  }
}