// ============================================
// CITATION TYPES
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
  createdAt: Date;
}
