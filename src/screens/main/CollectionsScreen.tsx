// ============================================
// COLLECTIONS SCREEN
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
  Alert,
  TextInput,
  Modal,
  Animated,
  FlatList,
} from "react-native";
import { colors } from "../../constants/colors";
import {
  getAllCollections,
  createCollection,
  deleteCollection,
  Collection,
  COLLECTION_COLORS,
} from "../../services/collectionsService";
import { Card, Button, Input, Loading } from "../../components/common";
import {
  getPreference,
  setPreference,
} from "../../services/preferencesService";

// ============================================
// PART 2: MAIN COMPONENT
// ============================================

export default function CollectionsScreen() {
  // ---------- PART 2A: STATE ----------
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    COLLECTION_COLORS[0].value
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];

  // ---------- PART 2B: DATA FETCHING ----------
  const fetchCollections = useCallback(async () => {
    try {
      const data = await getAllCollections();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
    // Load saved view mode preference
    loadViewModePreference();
  }, [fetchCollections]);

  // Load view mode preference
  const loadViewModePreference = async () => {
    try {
      const savedViewMode = await getPreference("collectionsViewMode");
      setViewMode(savedViewMode);
    } catch (error) {
      console.error("Error loading view mode preference:", error);
    }
  };

  // Save view mode preference when it changes
  useEffect(() => {
    const saveViewModePreference = async () => {
      try {
        await setPreference("collectionsViewMode", viewMode);
      } catch (error) {
        console.error("Error saving view mode preference:", error);
      }
    };
    saveViewModePreference();
  }, [viewMode]);

  // Animate on load
  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, fadeAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCollections();
  }, [fetchCollections]);

  // ---------- PART 2C: HANDLERS ----------
  const handleCreateCollection = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Please enter a collection name");
      return;
    }

    try {
      await createCollection({
        name: newName.trim(),
        description: newDescription.trim(),
        color: selectedColor,
      });
      setShowModal(false);
      setNewName("");
      setNewDescription("");
      fetchCollections();
    } catch (error) {
      Alert.alert("Error", "Failed to create collection");
    }
  };

  const handleDeleteCollection = (id: string, name: string) => {
    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCollection(id);
              fetchCollections();
            } catch (error) {
              Alert.alert("Error", "Failed to delete collection");
            }
          },
        },
      ]
    );
  };

  // ---------- PART 2D: RENDER ----------
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Loading text="Loading collections..." fullScreen />
      </SafeAreaView>
    );
  }

  // Render collection card based on view mode
  const renderCollectionItem = ({ item, index }: { item: Collection; index: number }) => (
    <Animated.View
      style={[
        viewMode === 'grid' ? styles.gridItem : styles.listItem,
        { opacity: fadeAnim },
      ]}
    >
      <Card
        variant="elevated"
        onPress={() => Alert.alert(item.name, `${item.itemCount || 0} items`)}
        onLongPress={() => handleDeleteCollection(item.id, item.name)}
        style={viewMode === 'grid' ? styles.gridCard : styles.listCard}
        padding={16}
      >
        <View style={[styles.colorBar, { backgroundColor: item.color }]} />
        <View style={styles.cardContent}>
          <Text style={styles.collectionName} numberOfLines={1}>{item.name}</Text>
          {item.description && (
            <Text style={styles.collectionDescription} numberOfLines={viewMode === 'grid' ? 2 : 1}>
              {item.description}
            </Text>
          )}
          <Text style={styles.itemCount}>{item.itemCount || 0} items</Text>
        </View>
      </Card>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Text style={styles.viewToggleText}>
              {viewMode === 'grid' ? '☰' : '⊞'}
            </Text>
          </TouchableOpacity>
          <Button
            title="+ New"
            onPress={() => setShowModal(true)}
            size="small"
            variant="primary"
          />
        </View>
      </View>

      <FlatList
        data={collections}
        renderItem={renderCollectionItem}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        key={viewMode}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.appleBlue}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyText}>No collections yet</Text>
            <Text style={styles.emptySubtext}>
              Create collections to organize your research
            </Text>
            <Button
              title="Create Collection"
              onPress={() => setShowModal(true)}
              variant="primary"
              style={{ marginTop: 16 }}
            />
          </View>
        }
      />

      {/* Create Collection Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Collection</Text>

            <Input
              placeholder="Collection name"
              value={newName}
              onChangeText={setNewName}
            />

            <Input
              placeholder="Description (optional)"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={3}
              style={{ height: 80, textAlignVertical: 'top' }}
            />

            <Text style={styles.colorLabel}>Color</Text>
            <View style={styles.colorGrid}>
              {COLLECTION_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.value },
                    selectedColor === color.value && styles.colorSelected,
                  ]}
                  onPress={() => setSelectedColor(color.value)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowModal(false)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <Button
                title="Create"
                onPress={handleCreateCollection}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.white,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  viewToggle: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.gray5,
    justifyContent: "center",
    alignItems: "center",
  },
  viewToggleText: {
    fontSize: 18,
    color: colors.white,
  },
  listContent: {
    padding: 16,
  },
  gridItem: {
    flex: 1,
    margin: 6,
  },
  listItem: {
    marginBottom: 12,
  },
  gridCard: {
    height: 140,
  },
  listCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  colorBar: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 13,
    color: colors.gray1,
    marginBottom: 6,
  },
  itemCount: {
    fontSize: 12,
    color: colors.gray2,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray1,
    textAlign: "center",
    marginBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.gray6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 20,
  },
  colorLabel: {
    fontSize: 14,
    color: colors.gray1,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: colors.white,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
});
