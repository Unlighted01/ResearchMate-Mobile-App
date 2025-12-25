// ============================================
// PART 1: USER TYPES
// ============================================

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at?: string;
}

// ============================================
// PART 2: DEVICE SOURCE TYPES
// ============================================

export type DeviceSource = "extension" | "mobile" | "smart_pen" | "web";

export const DEVICE_SOURCES: Record<
  DeviceSource,
  { label: string; icon: string }
> = {
  extension: { label: "Browser Extension", icon: "laptop" },
  mobile: { label: "Mobile App", icon: "smartphone" },
  smart_pen: { label: "Smart Pen", icon: "edit-3" },
  web: { label: "Web App", icon: "globe" },
};

// ============================================
// PART 3: RESEARCH ITEM TYPES
// ============================================

export interface ResearchItem {
  id: string;
  user_id: string;
  text: string;
  source_url?: string;
  source_title?: string;
  tags?: string[];
  collection_id?: string;
  ai_summary?: string;
  device_source: DeviceSource;
  created_at: string;
  updated_at: string;
  notes?: string;
  image_url?: string;
  ocr_text?: string;
}

// ============================================
// PART 4: COLLECTION TYPES
// ============================================

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  items?: ResearchItem[];
  item_count?: number;
}

export const COLLECTION_COLORS = [
  "#4F46E5", // Indigo
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#6366F1", // Blue
];

// ============================================
// PART 5: CHAT TYPES
// ============================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  metadata?: {
    tokens?: number;
    model?: string;
    context?: string[];
  };
}

// ============================================
// PART 6: CITATION TYPES
// ============================================

export type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard" | "IEEE";

export interface Citation {
  id: string;
  type: "book" | "article" | "website" | "journal" | "video";
  title: string;
  authors?: string[];
  year?: number;
  url?: string;
  doi?: string;
  isbn?: string;
  formattedCitation?: Record<CitationStyle, string>;
  createdAt: string;
}

// ============================================
// PART 7: SETTINGS TYPES
// ============================================

export interface UserSettings {
  theme: "light" | "dark" | "system";
  default_citation_style: CitationStyle;
  notifications_enabled: boolean;
  ai_enabled: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: "system",
  default_citation_style: "APA",
  notifications_enabled: true,
  ai_enabled: true,
};

// ============================================
// PART 8: API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
}

// ============================================
// PART 9: FORM TYPES
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}
