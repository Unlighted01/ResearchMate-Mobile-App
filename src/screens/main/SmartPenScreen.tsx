// ============================================
// SMART PEN SCREEN - Handwritten Notes Gallery
// ============================================

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { colors } from "../../constants/colors";
import { getAllItems, StorageItem } from "../../services/storageService";

// ============================================
// MAIN COMPONENT
// ============================================

export default function SmartPenScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scans, setScans] = useState<StorageItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState<StorageItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch smart pen scans
  const fetchData = useCallback(async () => {
    try {
      const items = await getAllItems(1000);
      setScans(items.filter((i) => i.deviceSource === "smart_pen"));
    } catch (error) {
      console.error("Smart Pen fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Filter scans
  const filteredScans = scans.filter((scan) => {
    if (!searchQuery) return true;
    return (
      scan.sourceTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.text?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.appleOrange} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.appleOrange}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>✏️</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Smart Pen</Text>
            <Text style={styles.subtitle}>Handwritten notes with OCR</Text>
          </View>
          <View style={styles.scanCount}>
            <Text style={styles.scanCountText}>{scans.length} scans</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search scans..."
            placeholderTextColor={colors.gray2}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === "grid" && styles.viewButtonActive,
            ]}
            onPress={() => setViewMode("grid")}
          >
            <Text style={styles.viewButtonText}>⊞ Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewButton,
              viewMode === "list" && styles.viewButtonActive,
            ]}
            onPress={() => setViewMode("list")}
          >
            <Text style={styles.viewButtonText}>☰ List</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {filteredScans.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>✏️</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? "No scans found" : "No smart pen scans yet"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Connect your smart pen to digitize handwritten notes"}
            </Text>

            {!searchQuery && (
              <View style={styles.setupCard}>
                <Text style={styles.setupTitle}>How to get started</Text>
                {[
                  "Connect your smart pen via Bluetooth",
                  "Write on smart paper or tablet",
                  "Notes sync automatically with OCR",
                  "Access from any device instantly",
                ].map((step, idx) => (
                  <View key={idx} style={styles.setupStep}>
                    <View style={styles.setupNumber}>
                      <Text style={styles.setupNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.setupStepText}>{step}</Text>
                  </View>
                ))}
                <View style={styles.betaBadge}>
                  <Text style={styles.betaText}>
                    Smart Pen integration is in Beta. Compatible with Neo
                    Smartpen and Moleskine Pen+.
                  </Text>
                </View>
              </View>
            )}
          </View>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <View style={styles.gridContainer}>
            {filteredScans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                style={styles.gridCard}
                onPress={() => setSelectedScan(scan)}
              >
                <View style={styles.gridPreview}>
                  <Text style={styles.gridPreviewText}>📝</Text>
                  {scan.aiSummary && (
                    <View style={styles.aiBadge}>
                      <Text style={styles.aiBadgeText}>✨ AI</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.gridTitle} numberOfLines={1}>
                  {scan.sourceTitle || "Untitled Scan"}
                </Text>
                <Text style={styles.gridDate}>
                  {new Date(scan.createdAt).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* List View */
          <View style={styles.listContainer}>
            {filteredScans.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                style={styles.listCard}
                onPress={() => setSelectedScan(scan)}
              >
                <View style={styles.listPreview}>
                  <Text style={styles.listPreviewText}>📝</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listTitle} numberOfLines={1}>
                    {scan.sourceTitle || "Untitled Scan"}
                  </Text>
                  <Text style={styles.listExcerpt} numberOfLines={1}>
                    {scan.text?.substring(0, 60) || "No text extracted"}
                  </Text>
                </View>
                <View style={styles.listMeta}>
                  {scan.aiSummary && (
                    <View style={styles.aiBadgeSmall}>
                      <Text style={styles.aiBadgeSmallText}>✨</Text>
                    </View>
                  )}
                  <Text style={styles.listDate}>
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={!!selectedScan}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedScan(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSelectedScan(null)}
              style={styles.modalClose}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedScan?.sourceTitle || "Scan Details"}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* OCR Text */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>📝 OCR Text</Text>
              <Text style={styles.modalText}>
                {selectedScan?.text || "No text extracted"}
              </Text>
            </View>

            {/* AI Summary */}
            {selectedScan?.aiSummary && (
              <View style={styles.modalSummary}>
                <Text style={styles.modalSectionTitle}>✨ AI Summary</Text>
                <Text style={styles.modalText}>{selectedScan.aiSummary}</Text>
              </View>
            )}

            {/* Metadata */}
            <View style={styles.modalMeta}>
              <Text style={styles.modalMetaText}>
                Created:{" "}
                {selectedScan
                  ? new Date(selectedScan.createdAt).toLocaleString()
                  : ""}
              </Text>
              <View style={styles.modalSourceBadge}>
                <Text style={styles.modalSourceText}>✏️ Smart Pen</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.darkBg,
  },
  scrollView: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.appleOrange,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  headerIconText: { fontSize: 22 },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: colors.white },
  subtitle: { fontSize: 14, color: colors.gray1 },
  scanCount: {
    backgroundColor: `${colors.appleOrange}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scanCountText: { fontSize: 13, fontWeight: "600", color: colors.appleOrange },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.white,
  },
  viewToggle: { flexDirection: "row", gap: 8, marginBottom: 20 },
  viewButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.gray5,
    borderRadius: 10,
  },
  viewButtonActive: { backgroundColor: colors.gray4 },
  viewButtonText: { fontSize: 14, color: colors.gray1 },
  emptyState: { alignItems: "center", paddingVertical: 40 },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: `${colors.appleOrange}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyIconText: { fontSize: 36 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray1,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  setupCard: {
    backgroundColor: colors.gray5,
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    width: "100%",
  },
  setupTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 16,
  },
  setupStep: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  setupNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: `${colors.appleOrange}15`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  setupNumberText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.appleOrange,
  },
  setupStepText: { fontSize: 14, color: colors.gray1 },
  betaBadge: {
    backgroundColor: `${colors.appleOrange}10`,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  betaText: { fontSize: 12, color: colors.appleOrange },
  gridContainer: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  gridCard: {
    width: "48%",
    backgroundColor: colors.gray5,
    borderRadius: 16,
    overflow: "hidden",
  },
  gridPreview: {
    height: 120,
    backgroundColor: colors.gray4,
    justifyContent: "center",
    alignItems: "center",
  },
  gridPreviewText: { fontSize: 36 },
  aiBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.appleBlue,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: { fontSize: 10, fontWeight: "600", color: colors.white },
  gridTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  gridDate: {
    fontSize: 12,
    color: colors.gray2,
    paddingHorizontal: 12,
    paddingBottom: 12,
    marginTop: 4,
  },
  listContainer: { gap: 8 },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 12,
  },
  listPreview: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.gray4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  listPreviewText: { fontSize: 20 },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: "600", color: colors.white },
  listExcerpt: { fontSize: 13, color: colors.gray1, marginTop: 2 },
  listMeta: { alignItems: "flex-end" },
  aiBadgeSmall: { marginBottom: 4 },
  aiBadgeSmallText: { fontSize: 14 },
  listDate: { fontSize: 11, color: colors.gray2 },
  modalContainer: { flex: 1, backgroundColor: colors.darkBg },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray5,
  },
  modalClose: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray5,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: { fontSize: 18, color: colors.gray1 },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.white,
    flex: 1,
    textAlign: "center",
  },
  modalContent: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  modalSection: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray1,
    marginBottom: 10,
  },
  modalText: { fontSize: 15, color: colors.white, lineHeight: 22 },
  modalSummary: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.applePurple,
  },
  modalMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
  },
  modalMetaText: { fontSize: 12, color: colors.gray2 },
  modalSourceBadge: { flexDirection: "row", alignItems: "center" },
  modalSourceText: { fontSize: 13, color: colors.appleOrange },
});
