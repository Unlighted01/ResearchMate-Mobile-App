// ============================================
// COLLECTIONS SERVICE - Mobile Version
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import { supabase, isAuthenticated } from "./supabaseClient";

// ============================================
// PART 2: TYPE DEFINITIONS
// ============================================

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  itemCount?: number;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  color?: string;
}

// ============================================
// PART 3: COLLECTION COLORS
// ============================================

export const COLLECTION_COLORS = [
  { name: "Indigo", value: "#4F46E5" },
  { name: "Blue", value: "#2563EB" },
  { name: "Cyan", value: "#06B6D4" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Orange", value: "#F97316" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Gray", value: "#6B7280" },
];

// ============================================
// PART 4: DATA TRANSFORMATION
// ============================================

function transformCollection(row: any): Collection {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || "",
    color: row.color || "#4F46E5",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    itemCount: row.item_count,
  };
}

// ============================================
// PART 5: CRUD OPERATIONS
// ============================================

export async function getAllCollections(): Promise<Collection[]> {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    console.log("Not authenticated, returning empty collections");
    return [];
  }

  try {
    // Get collections without join to avoid foreign key errors
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get item counts separately
    const collections = (data || []).map(transformCollection);

    // Fetch item counts for each collection
    for (const collection of collections) {
      const { count } = await supabase
        .from("items")
        .select("*", { count: "exact", head: true })
        .eq("collection_id", collection.id);

      collection.itemCount = count || 0;
    }

    return collections;
  } catch (error) {
    console.error("❌ Failed to fetch collections:", error);
    return [];
  }
}

export async function getCollectionById(
  id: string
): Promise<Collection | null> {
  try {
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return transformCollection(data);
  } catch (error) {
    console.error("❌ Failed to fetch collection:", error);
    return null;
  }
}

export async function createCollection(
  input: CreateCollectionInput
): Promise<Collection> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Must be logged in to create collections");
  }

  const { data, error } = await supabase
    .from("collections")
    .insert([
      {
        user_id: user.id,
        name: input.name,
        description: input.description || "",
        color: input.color || "#4F46E5",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return transformCollection(data);
}

export async function updateCollection(
  id: string,
  input: UpdateCollectionInput
): Promise<Collection> {
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined)
    updateData.description = input.description;
  if (input.color !== undefined) updateData.color = input.color;

  const { data, error } = await supabase
    .from("collections")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return transformCollection(data);
}

export async function deleteCollection(id: string): Promise<void> {
  // First, remove collection_id from all items in this collection
  await supabase
    .from("items")
    .update({ collection_id: null })
    .eq("collection_id", id);

  // Then delete the collection
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// PART 6: ITEM-COLLECTION OPERATIONS
// ============================================

export async function addItemToCollection(
  itemId: string,
  collectionId: string
): Promise<void> {
  const { error } = await supabase
    .from("items")
    .update({ collection_id: collectionId })
    .eq("id", itemId);

  if (error) throw error;
}

export async function removeItemFromCollection(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("items")
    .update({ collection_id: null })
    .eq("id", itemId);

  if (error) throw error;
}

// ============================================
// PART 7: EXPORTS
// ============================================

export default {
  getAllCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  addItemToCollection,
  removeItemFromCollection,
  COLLECTION_COLORS,
};
