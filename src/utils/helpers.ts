// ============================================
// HELPERS - General helper functions
// ============================================

// TODO: Add helper functions as needed
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
