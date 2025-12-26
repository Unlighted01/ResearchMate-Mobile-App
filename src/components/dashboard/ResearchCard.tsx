// ============================================
// RESEARCH CARD - Display research item
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../../constants/colors";
import { StorageItem } from "../../services/storageService";
import { DEVICE_SOURCES } from "../../types";

// ============================================
// PART 2: TYPE DEFINITIONS
// ============================================

interface ResearchCardProps {
  item: StorageItem;
  onPress?: () => void;
  onLongPress?: () => void;
}

// ============================================
// PART 3: MAIN COMPONENT
// ============================================

export default function ResearchCard({
  item,
  onPress,
  onLongPress,
}: ResearchCardProps) {
  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Get device icon
  const deviceInfo = DEVICE_SOURCES[item.deviceSource] || DEVICE_SOURCES.web;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.sourceInfo}>
          <Text style={styles.sourceIcon}>
            {item.deviceSource === "mobile"
              ? "📱"
              : item.deviceSource === "extension"
              ? "💻"
              : item.deviceSource === "smart_pen"
              ? "✏️"
              : "🌐"}
          </Text>
          <Text style={styles.sourceLabel}>{deviceInfo.label}</Text>
        </View>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>

      {/* Content */}
      <Text style={styles.text} numberOfLines={3}>
        {item.text}
      </Text>

      {/* Source */}
      {item.sourceTitle ? (
        <Text style={styles.sourceTitle} numberOfLines={1}>
          📎 {item.sourceTitle}
        </Text>
      ) : null}

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={styles.moreTags}>+{item.tags.length - 3}</Text>
          )}
        </View>
      )}

      {/* AI Summary indicator */}
      {item.aiSummary && (
        <View style={styles.summaryIndicator}>
          <Text style={styles.summaryIcon}>✨</Text>
          <Text style={styles.summaryText}>AI Summary</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================
// PART 4: STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sourceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  sourceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sourceLabel: {
    fontSize: 12,
    color: colors.gray1,
  },
  date: {
    fontSize: 12,
    color: colors.gray1,
  },
  text: {
    fontSize: 15,
    color: colors.white,
    lineHeight: 22,
    marginBottom: 10,
  },
  sourceTitle: {
    fontSize: 13,
    color: colors.appleBlue,
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8,
  },
  tag: {
    backgroundColor: colors.gray4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: colors.gray1,
  },
  moreTags: {
    fontSize: 12,
    color: colors.gray1,
  },
  summaryIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  summaryText: {
    fontSize: 12,
    color: colors.applePurple,
  },
});
