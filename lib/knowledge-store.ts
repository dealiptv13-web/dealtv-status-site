import { promises as fs } from "fs";
import path from "path";
import { defaultSupportKnowledge, type KnowledgeItem } from "@/lib/ai-support-knowledge";

const dataDir = path.join(process.cwd(), "data");
const knowledgeFile = path.join(dataDir, "ai-support-knowledge.json");

async function ensureKnowledgeFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(knowledgeFile);
  } catch {
    await fs.writeFile(
      knowledgeFile,
      JSON.stringify(defaultSupportKnowledge, null, 2),
      "utf8"
    );
  }
}

export async function readKnowledgeItems(): Promise<KnowledgeItem[]> {
  await ensureKnowledgeFile();
  const raw = await fs.readFile(knowledgeFile, "utf8");
  return JSON.parse(raw) as KnowledgeItem[];
}

export async function writeKnowledgeItems(items: KnowledgeItem[]) {
  await ensureKnowledgeFile();
  await fs.writeFile(knowledgeFile, JSON.stringify(items, null, 2), "utf8");
}

export async function addKnowledgeItem(
  item: Omit<KnowledgeItem, "id"> & { id?: string }
) {
  const items = await readKnowledgeItems();

  const id =
    item.id?.trim() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const newItem: KnowledgeItem = {
    id,
    title: item.title.trim(),
    keywords: item.keywords,
    content: item.content.trim(),
    suggestion: item.suggestion?.trim() || "",
  };

  items.unshift(newItem);
  await writeKnowledgeItems(items);
  return newItem;
}

export async function deleteKnowledgeItem(id: string) {
  const items = await readKnowledgeItems();
  const filtered = items.filter((item) => item.id !== id);
  await writeKnowledgeItems(filtered);
  return filtered;
}