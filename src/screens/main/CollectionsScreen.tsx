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
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { colors } from "../../constants/colors";
import {
  getAllCollections,
  createCollection,
  deleteCollection,
  Collection,
  COLLECTION_COLORS,
} from "../../services/collectionsService";

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
  }, [fetchCollections]);

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.appleBlue} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Collections</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowModal(true)}
        >
          <Text style={styles.addButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

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
        {collections.length > 0 ? (
          collections.map((collection) => (
            <TouchableOpacity
              key={collection.id}
              style={styles.collectionCard}
              onLongPress={() =>
                handleDeleteCollection(collection.id, collection.name)
              }
            >
              <View
                style={[styles.colorBar, { backgroundColor: collection.color }]}
              />
              <View style={styles.collectionContent}>
                <Text style={styles.collectionName}>{collection.name}</Text>
                {collection.description ? (
                  <Text style={styles.collectionDescription} numberOfLines={2}>
                    {collection.description}
                  </Text>
                ) : null}
                <Text style={styles.itemCount}>
                  {collection.itemCount || 0} items
                </Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📁</Text>
            <Text style={styles.emptyText}>No collections yet</Text>
            <Text style={styles.emptySubtext}>
              Create collections to organize your research
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowModal(true)}
            >
              <Text style={styles.createButtonText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

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

            <TextInput
              style={styles.input}
              placeholder="Collection name"
              placeholderTextColor={colors.gray1}
              value={newName}
              onChangeText={setNewName}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor={colors.gray1}
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
              numberOfLines={3}
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
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleCreateCollection}
              >
                <Text style={styles.saveButtonText}>Create</Text>
              </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  addButton: {
    backgroundColor: colors.appleBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  collectionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  colorBar: {
    width: 4,
    height: "100%",
    position: "absolute",
    left: 0,
  },
  collectionContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 20,
  },
  collectionName: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 4,
  },
  collectionDescription: {
    fontSize: 14,
    color: colors.gray1,
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 13,
    color: colors.gray2,
  },
  arrow: {
    fontSize: 24,
    color: colors.gray2,
    marginRight: 16,
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
  createButton: {
    backgroundColor: colors.appleBlue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 16,
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
  input: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.white,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray5,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.appleBlue,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
