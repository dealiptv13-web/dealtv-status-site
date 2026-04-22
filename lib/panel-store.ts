import { supabase } from "./supabase";

export type PanelStatus = "Stabil" | "Yoğun" | "Bakımda" | "Kapalı";

export type PanelItem = {
  id: string;
  name: string;
  status: PanelStatus;
  note: string;
};

const defaultPanels: PanelItem[] = [
  {
    id: "titan",
    name: "Titan",
    status: "Stabil",
    note: "Panel stabil şekilde çalışıyor.",
  },
  {
    id: "5g",
    name: "5G",
    status: "Stabil",
    note: "Panel stabil şekilde çalışıyor.",
  },
  {
    id: "mpremium",
    name: "MPremium",
    status: "Stabil",
    note: "Panel stabil şekilde çalışıyor.",
  },
];

async function ensureSeed() {
  const { data, error } = await supabase
    .from("panel_status")
    .select("id")
    .limit(1);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    const { error: insertError } = await supabase
      .from("panel_status")
      .insert(defaultPanels);

    if (insertError) {
      throw insertError;
    }
  }
}

export async function readPanels(): Promise<PanelItem[]> {
  await ensureSeed();

  const { data, error } = await supabase
    .from("panel_status")
    .select("id,name,status,note")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as PanelItem[];
}

export async function writePanels(items: PanelItem[]) {
  const cleaned = items.map((item) => ({
    id: item.id,
    name: item.name,
    status: item.status,
    note: item.note || "",
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from("panel_status").upsert(cleaned, {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }

  return cleaned;
}

export function getPanelStyle(status: PanelStatus) {
  switch (status) {
    case "Stabil":
      return {
        dotClass: "bg-emerald-500",
        statusClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    case "Yoğun":
      return {
        dotClass: "bg-amber-500",
        statusClass: "border-amber-200 bg-amber-50 text-amber-700",
      };
    case "Bakımda":
      return {
        dotClass: "bg-blue-500",
        statusClass: "border-blue-200 bg-blue-50 text-blue-700",
      };
    case "Kapalı":
    default:
      return {
        dotClass: "bg-rose-500",
        statusClass: "border-rose-200 bg-rose-50 text-rose-700",
      };
  }
}