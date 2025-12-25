// ============================================
// RESEARCH TYPES
// ============================================

export interface ResearchItem {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  tags?: string[];
  collectionId?: string;
  createdAt: Date;
  updatedAt: Date;
}
