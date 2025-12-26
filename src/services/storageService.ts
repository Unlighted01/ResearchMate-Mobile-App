// ============================================
// STORAGE SERVICE - Mobile Version
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, isAuthenticated } from "./supabaseClient";
import { DeviceSource } from "../types";

// ============================================
// PART 2: TYPE DEFINITIONS
// ============================================

export interface StorageItem {
  id: string;
  text: string;
  tags: string[];
  note: string;
  sourceUrl: string;
  sourceTitle: string;
  createdAt: string;
  updatedAt?: string;
  aiSummary?: string;
  deviceSource: DeviceSource;
  collectionId?: string;
  imageUrl?: string;
  ocrText?: string;
}

export interface AddItemInput {
  text: string;
  tags?: string[];
  note?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  aiSummary?: string;
  deviceSource?: DeviceSource;
  collectionId?: string;
}

export interface UpdateItemInput {
  text?: string;
  tags?: string[];
  note?: string;
  aiSummary?: string;
  collectionId?: string;
}

// ============================================
// PART 3: LOCAL STORAGE HELPERS
// ============================================

const LOCAL_STORAGE_KEY = "researchMateItems";

async function getLocalItems(): Promise<StorageItem[]> {
  try {
    const stored = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("❌ Error reading local storage:", error);
    return [];
  }
}

async function setLocalItems(items: StorageItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("❌ Error writing to local storage:", error);
  }
}

// ============================================
// PART 4: DATA TRANSFORMATION
// ============================================

function transformDatabaseItem(item: any): StorageItem {
  return {
    id: item.id,
    text: item.text || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    note: item.note || item.notes || "",
    sourceUrl: item.source_url || "",
    sourceTitle: item.source_title || "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    aiSummary: item.ai_summary || "",
    deviceSource: item.device_source || "mobile",
    collectionId: item.collection_id,
    imageUrl: item.image_url,
    ocrText: item.ocr_text,
  };
}

function transformToDatabase(
  item: AddItemInput,
  userId: string
): Record<string, any> {
  return {
    user_id: userId,
    text: item.text,
    tags: item.tags || [],
    note: item.note || "",
    source_url: item.sourceUrl || "",
    source_title: item.sourceTitle || "",
    ai_summary: item.aiSummary || "",
    device_source: item.deviceSource || "mobile",
    collection_id: item.collectionId || null,
  };
}

// ============================================
// PART 5: MAIN CRUD FUNCTIONS
// ============================================

export async function getAllItems(
  limit: number = 100,
  offset: number = 0
): Promise<StorageItem[]> {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return (data || []).map(transformDatabaseItem);
    } catch (error) {
      console.error("☁️ Cloud fetch failed, using local:", error);
      return getLocalItems();
    }
  }

  const localItems = await getLocalItems();
  return localItems.slice(offset, offset + limit);
}

export async function addItem(item: AddItemInput): Promise<StorageItem> {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("items")
        .insert([transformToDatabase(item, user.id)])
        .select()
        .single();

      if (error) throw error;
      return transformDatabaseItem(data);
    } catch (error) {
      console.error("☁️ Cloud save failed:", error);
    }
  }

  // Guest mode: save locally
  const items = await getLocalItems();
  const newItem: StorageItem = {
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    text: item.text,
    tags: item.tags || [],
    note: item.note || "",
    sourceUrl: item.sourceUrl || "",
    sourceTitle: item.sourceTitle || "",
    createdAt: new Date().toISOString(),
    aiSummary: item.aiSummary || "",
    deviceSource: item.deviceSource || "mobile",
    collectionId: item.collectionId,
  };

  items.unshift(newItem);
  await setLocalItems(items);
  return newItem;
}

export async function updateItem(
  id: string,
  updates: UpdateItemInput
): Promise<void> {
  const itemId = String(id);

  if (itemId.startsWith("local_")) {
    const items = await getLocalItems();
    const index = items.findIndex((item) => item.id === itemId);
    if (index === -1) throw new Error("Item not found");

    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await setLocalItems(items);
    return;
  }

  const authenticated = await isAuthenticated();
  if (authenticated) {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.text !== undefined) updateData.text = updates.text;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.note !== undefined) updateData.note = updates.note;
    if (updates.aiSummary !== undefined)
      updateData.ai_summary = updates.aiSummary;
    if (updates.collectionId !== undefined)
      updateData.collection_id = updates.collectionId;

    const { error } = await supabase
      .from("items")
      .update(updateData)
      .eq("id", itemId);

    if (error) throw error;
  }
}

export async function deleteItem(id: string): Promise<void> {
  const itemId = String(id);

  if (itemId.startsWith("local_")) {
    const items = await getLocalItems();
    const filtered = items.filter((item) => item.id !== itemId);
    await setLocalItems(filtered);
    return;
  }

  const { error } = await supabase.from("items").delete().eq("id", itemId);
  if (error) throw error;
}

export async function getItemById(id: string): Promise<StorageItem | null> {
  const itemId = String(id);

  if (itemId.startsWith("local_")) {
    const items = await getLocalItems();
    return items.find((item) => item.id === itemId) || null;
  }

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", itemId)
    .single();

  if (error) {
    console.error("❌ Error fetching item:", error);
    return null;
  }

  return transformDatabaseItem(data);
}

// ============================================
// PART 6: SEARCH AND FILTER
// ============================================

export async function searchItems(query: string): Promise<StorageItem[]> {
  const authenticated = await isAuthenticated();
  const searchTerm = query.toLowerCase().trim();

  if (!searchTerm) {
    return getAllItems();
  }

  if (authenticated) {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .or(
          `text.ilike.%${searchTerm}%,source_title.ilike.%${searchTerm}%,note.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(transformDatabaseItem);
    } catch (error) {
      console.error("☁️ Cloud search failed:", error);
    }
  }

  const items = await getLocalItems();
  return items.filter(
    (item) =>
      item.text.toLowerCase().includes(searchTerm) ||
      item.sourceTitle.toLowerCase().includes(searchTerm) ||
      item.note.toLowerCase().includes(searchTerm) ||
      item.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
  );
}

export async function getItemsByCollection(
  collectionId: string
): Promise<StorageItem[]> {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    try {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("collection_id", collectionId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(transformDatabaseItem);
    } catch (error) {
      console.error("☁️ Cloud fetch by collection failed:", error);
    }
  }

  const items = await getLocalItems();
  return items.filter((item) => item.collectionId === collectionId);
}

// ============================================
// PART 7: STATISTICS
// ============================================

export async function getItemStats(): Promise<{
  total: number;
  bySource: Record<DeviceSource, number>;
  withSummary: number;
  totalTags: number;
}> {
  const items = await getAllItems();

  const bySource: Record<DeviceSource, number> = {
    extension: 0,
    mobile: 0,
    smart_pen: 0,
    web: 0,
  };

  let withSummary = 0;
  const allTags = new Set<string>();

  items.forEach((item) => {
    if (item.deviceSource) {
      bySource[item.deviceSource] = (bySource[item.deviceSource] || 0) + 1;
    }
    if (item.aiSummary) {
      withSummary++;
    }
    item.tags.forEach((tag) => allTags.add(tag));
  });

  return {
    total: items.length,
    bySource,
    withSummary,
    totalTags: allTags.size,
  };
}

// ============================================
// PART 8: EXPORTS
// ============================================

export default {
  getAllItems,
  addItem,
  updateItem,
  deleteItem,
  getItemById,
  searchItems,
  getItemsByCollection,
  getItemStats,
};
