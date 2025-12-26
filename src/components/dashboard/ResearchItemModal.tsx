// ============================================
// RESEARCH ITEM DETAIL MODAL
// Full view of a research item with actions
// ============================================

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { colors } from "../../constants/colors";
import { StorageItem } from "../../services/storageService";
import { DEVICE_SOURCES } from "../../types";

// ============================================
// PROPS
// ============================================

interface ResearchItemModalProps {
  visible: boolean;
  item: StorageItem | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export default function ResearchItemModal({
  visible,
  item,
  onClose,
  onDelete,
}: ResearchItemModalProps) {
  // Guard against undefined item or item without id
  if (!item || !item.id) return null;

  const deviceInfo = DEVICE_SOURCES[item.deviceSource] || DEVICE_SOURCES.web;

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Actions
  const handleVisitWebsite = () => {
    if (item.sourceUrl) {
      Linking.openURL(item.sourceUrl);
    } else {
      Alert.alert("No URL", "This item doesn't have a source URL.");
    }
  };

  const handleCopyText = async () => {
    await Clipboard.setStringAsync(item.text);
    Alert.alert("Copied!", "Text copied to clipboard");
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${item.text}\n\nSource: ${
          item.sourceTitle || item.sourceUrl || "Unknown"
        }`,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this research item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (onDelete) onDelete(item.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Research Item</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Source Info */}
          <View style={styles.sourceInfo}>
            <Text style={styles.deviceIcon}>
              {item.deviceSource === "mobile"
                ? "📱"
                : item.deviceSource === "extension"
                ? "💻"
                : item.deviceSource === "smart_pen"
                ? "✏️"
                : "🌐"}
            </Text>
            <Text style={styles.deviceLabel}>{deviceInfo.label}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>

          {/* Source Title */}
          {item.sourceTitle && (
            <TouchableOpacity
              style={styles.sourceTitleContainer}
              onPress={handleVisitWebsite}
            >
              <Text style={styles.sourceTitle}>📎 {item.sourceTitle}</Text>
              {item.sourceUrl && <Text style={styles.visitLink}>Visit →</Text>}
            </TouchableOpacity>
          )}

          {/* Main Text */}
          <Text style={styles.mainText}>{item.text}</Text>

          {/* AI Summary */}
          {item.aiSummary && (
            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>✨ AI Summary</Text>
              <Text style={styles.summaryText}>{item.aiSummary}</Text>
            </View>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>🏷️ Tags</Text>
              <View style={styles.tagsContainer}>
                {item.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCopyText}
            >
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionText}>Copy Text</Text>
            </TouchableOpacity>

            {item.sourceUrl && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleVisitWebsite}
              >
                <Text style={styles.actionIcon}>🌐</Text>
                <Text style={styles.actionText}>Visit Website</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Text style={styles.actionIcon}>🗑️</Text>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>

          {/* Metadata */}
          <View style={styles.metadataSection}>
            <Text style={styles.metadataLabel}>
              ID: {String(item.id || "").slice(0, 8) || "N/A"}...
            </Text>
            {item.updatedAt && item.updatedAt !== item.createdAt && (
              <Text style={styles.metadataLabel}>
                Updated: {formatDate(item.updatedAt)}
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray5,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 18,
    color: colors.gray1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sourceInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  deviceIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  deviceLabel: {
    fontSize: 14,
    color: colors.gray1,
  },
  separator: {
    marginHorizontal: 8,
    color: colors.gray2,
  },
  dateText: {
    fontSize: 13,
    color: colors.gray2,
  },
  sourceTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  sourceTitle: {
    fontSize: 14,
    color: colors.appleBlue,
    flex: 1,
  },
  visitLink: {
    fontSize: 14,
    color: colors.appleBlue,
    fontWeight: "600",
  },
  mainText: {
    fontSize: 17,
    color: colors.white,
    lineHeight: 26,
    marginBottom: 24,
  },
  summarySection: {
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: colors.applePurple,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.gray1,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: colors.white,
    lineHeight: 22,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: colors.gray5,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: colors.white,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: colors.white,
  },
  deleteButton: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  deleteText: {
    color: colors.appleRed,
  },
  metadataSection: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
    marginBottom: 40,
  },
  metadataLabel: {
    fontSize: 12,
    color: colors.gray2,
    marginBottom: 4,
  },
});
