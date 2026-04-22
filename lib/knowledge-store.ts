import { supabase } from "./supabase";
import {
  defaultSupportKnowledge,
  type KnowledgeItem,
} from "./ai-support-knowledge";

async function ensureSeed() {
  const { data, error } = await supabase
    .from("knowledge_items")
    .select("id")
    .limit(1);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    const seedRows = defaultSupportKnowledge.map((item) => ({
      id: item.id,
      title: item.title,
      keywords: item.keywords,
      content: item.content,
      suggestion: item.suggestion || "",
    }));

    const { error: insertError } = await supabase
      .from("knowledge_items")
      .insert(seedRows);

    if (insertError) {
      throw insertError;
    }
  }
}

export async function readKnowledgeItems(): Promise<KnowledgeItem[]> {
  await ensureSeed();

  const { data, error } = await supabase
    .from("knowledge_items")
    .select("id,title,keywords,content,suggestion,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    title: item.title,
    keywords: item.keywords || [],
    content: item.content,
    suggestion: item.suggestion || "",
  }));
}

export async function writeKnowledgeItems(items: KnowledgeItem[]) {
  const rows = items.map((item) => ({
    id: item.id,
    title: item.title,
    keywords: item.keywords,
    content: item.content,
    suggestion: item.suggestion || "",
  }));

  const { error } = await supabase.from("knowledge_items").upsert(rows, {
    onConflict: "id",
  });

  if (error) {
    throw error;
  }

  return rows;
}

export async function addKnowledgeItem(
  item: Omit<KnowledgeItem, "id"> & { id?: string }
) {
  const id =
    item.id?.trim() ||
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const newItem = {
    id,
    title: item.title.trim(),
    keywords: item.keywords,
    content: item.content.trim(),
    suggestion: item.suggestion?.trim() || "",
  };

  const { error } = await supabase.from("knowledge_items").insert(newItem);

  if (error) {
    throw error;
  }

  return newItem;
}

export async function deleteKnowledgeItem(id: string) {
  const { error } = await supabase
    .from("knowledge_items")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }

  return true;
}