// ============================================
// USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultCitationStyle: string;
  notifications: boolean;
}
