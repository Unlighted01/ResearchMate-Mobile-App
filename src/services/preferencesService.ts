// ============================================
// PREFERENCES SERVICE - User Settings Persistence
// ============================================

import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFERENCES_KEY = "@researchmate:preferences";

export interface UserPreferences {
  theme: "system" | "dark" | "light";
  citationStyle: "APA" | "MLA" | "Chicago" | "Harvard" | "IEEE";
  collectionsViewMode: "grid" | "list";
  notificationsEnabled: boolean;
  defaultSource: "Extension" | "Mobile" | "Smart Pen" | "Web";
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "system",
  citationStyle: "APA",
  collectionsViewMode: "grid",
  notificationsEnabled: true,
  defaultSource: "Mobile",
};

/**
 * Get all user preferences
 */
export async function getPreferences(): Promise<UserPreferences> {
  try {
    const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const preferences = JSON.parse(stored);
      // Merge with defaults to handle new preference keys
      return { ...DEFAULT_PREFERENCES, ...preferences };
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error getting preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Update user preferences (partial update supported)
 */
export async function updatePreferences(
  updates: Partial<UserPreferences>
): Promise<UserPreferences> {
  try {
    const current = await getPreferences();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
}

/**
 * Get a specific preference value
 */
export async function getPreference<K extends keyof UserPreferences>(
  key: K
): Promise<UserPreferences[K]> {
  const preferences = await getPreferences();
  return preferences[key];
}

/**
 * Set a specific preference value
 */
export async function setPreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): Promise<void> {
  await updatePreferences({ [key]: value } as Partial<UserPreferences>);
}

/**
 * Reset preferences to defaults
 */
export async function resetPreferences(): Promise<UserPreferences> {
  try {
    await AsyncStorage.setItem(
      PREFERENCES_KEY,
      JSON.stringify(DEFAULT_PREFERENCES)
    );
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error resetting preferences:", error);
    throw error;
  }
}

/**
 * Clear all preferences
 */
export async function clearPreferences(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error("Error clearing preferences:", error);
    throw error;
  }
}
