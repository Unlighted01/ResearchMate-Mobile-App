// ============================================
// DASHBOARD SCREEN - Main Home Screen (Updated)
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";
import {
  getAllItems,
  getItemStats,
  deleteItem,
  StorageItem,
} from "../../services/storageService";
import {
  getAllCollections,
  Collection,
} from "../../services/collectionsService";
import ResearchCard from "../../components/dashboard/ResearchCard";
import ResearchItemModal from "../../components/dashboard/ResearchItemModal";

// ============================================
// PART 2: PROPS & MAIN COMPONENT
// ============================================

interface DashboardScreenProps {
  navigateToTab?: (tab: string) => void;
}

export default function DashboardScreen({
  navigateToTab,
}: DashboardScreenProps) {
  const { user } = useAuth();

  // ---------- PART 2A: STATE ----------
  const [items, setItems] = useState<StorageItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    withSummary: 0,
    totalTags: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [selectedItem, setSelectedItem] = useState<StorageItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ---------- PART 2B: DATA FETCHING ----------
  const fetchData = useCallback(async () => {
    try {
      const [itemsData, collectionsData, statsData] = await Promise.all([
        getAllItems(10), // Get last 10 items for recent
        getAllCollections(),
        getItemStats(),
      ]);

      setItems(itemsData);
      setCollections(collectionsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  // ---------- PART 2C: HANDLERS ----------
  const handleItemPress = (item: StorageItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setStats((prev) => ({ ...prev, total: prev.total - 1 }));
      Alert.alert("Deleted", "Research item deleted successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const handleQuickAction = (action: string) => {
    // Navigate to respective screens
    switch (action) {
      case "ai":
        if (navigateToTab) navigateToTab("ai");
        break;
      case "citation":
        if (navigateToTab) navigateToTab("citations");
        break;
      case "add":
        Alert.alert(
          "Add Research",
          "Use the browser extension or Smart Pen to add research items.",
          [
            {
              text: "Open Settings",
              onPress: () => navigateToTab?.("settings"),
            },
            { text: "OK", style: "cancel" },
          ]
        );
        break;
      case "stats":
        // Navigate to settings where Statistics is accessible
        if (navigateToTab) navigateToTab("settings");
        Alert.alert("Statistics", "Find Statistics in Settings → Features!");
        break;
    }
  };

  const handleVisitWebsite = () => {
    Linking.openURL("https://researchmate.vercel.app");
  };

  // ---------- PART 2D: RENDER ----------

  // ---------- PART 2C: RENDER ----------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.appleBlue} />
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
            tintColor={colors.appleBlue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.email}>
              {user?.email?.split("@")[0] || "Researcher"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={() =>
              Alert.alert("Profile", user?.email || "Not signed in", [
                { text: "Go to Settings", onPress: () => {} },
                { text: "Close", style: "cancel" },
              ])
            }
          >
            <Text style={styles.avatar}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Research Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{collections.length}</Text>
            <Text style={styles.statLabel}>Collections</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.withSummary}</Text>
            <Text style={styles.statLabel}>AI Summaries</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction("ai")}
            >
              <Text style={styles.actionIcon}>✨</Text>
              <Text style={styles.actionText}>Ask AI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction("citation")}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionText}>New Citation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction("add")}
            >
              <Text style={styles.actionIcon}>➕</Text>
              <Text style={styles.actionText}>Add Research</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => handleQuickAction("stats")}
            >
              <Text style={styles.actionIcon}>📊</Text>
              <Text style={styles.actionText}>Statistics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Research */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Research</Text>
            {items.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {items.length > 0 ? (
            items
              .slice(0, 5)
              .map((item) => (
                <ResearchCard
                  key={item.id}
                  item={item}
                  onPress={() => handleItemPress(item)}
                />
              ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>No research items yet</Text>
              <Text style={styles.emptySubtext}>
                Your saved research from all devices will appear here
              </Text>
            </View>
          )}
        </View>

        {/* Collections Preview */}
        {collections.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Collections</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.collectionsScroll}
            >
              {collections.slice(0, 5).map((collection) => (
                <TouchableOpacity
                  key={collection.id}
                  style={[
                    styles.collectionCard,
                    { borderLeftColor: collection.color },
                  ]}
                >
                  <Text style={styles.collectionName}>{collection.name}</Text>
                  <Text style={styles.collectionCount}>
                    {collection.itemCount || 0} items
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Research Item Detail Modal */}
      <ResearchItemModal
        visible={modalVisible}
        item={selectedItem}
        onClose={() => setModalVisible(false)}
        onDelete={handleDeleteItem}
      />
    </SafeAreaView>
  );
}

// ============================================
// PART 3: STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.darkBg,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.gray1,
  },
  email: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.gray5,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    fontSize: 24,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray5,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.appleBlue,
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray1,
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.white,
  },
  seeAll: {
    fontSize: 14,
    color: colors.appleBlue,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "47%",
    backgroundColor: colors.gray5,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
  },
  emptyState: {
    backgroundColor: colors.gray5,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray1,
    textAlign: "center",
  },
  collectionsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  collectionCard: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    borderLeftWidth: 4,
  },
  collectionName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 4,
  },
  collectionCount: {
    fontSize: 13,
    color: colors.gray1,
  },
});
