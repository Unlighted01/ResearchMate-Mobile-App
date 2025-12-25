// ============================================
// MAIN NAVIGATOR - Bottom Tab Navigator
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";

// Placeholder screens for now
import DashboardScreen from "../screens/main/DashboardScreen";

// ============================================
// PART 2: TAB BAR CONFIGURATION
// ============================================

const tabs = [
  { key: "dashboard", label: "Home", icon: "🏠" },
  { key: "collections", label: "Collections", icon: "📁" },
  { key: "ai", label: "AI", icon: "✨" },
  { key: "citations", label: "Citations", icon: "📝" },
  { key: "settings", label: "Settings", icon: "⚙️" },
];

// ============================================
// PART 3: MAIN COMPONENT
// ============================================

export default function MainNavigator() {
  const [activeTab, setActiveTab] = React.useState("dashboard");

  // Render screen based on active tab
  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen />;
      case "collections":
        return <PlaceholderScreen title="Collections" icon="📁" />;
      case "ai":
        return <PlaceholderScreen title="AI Assistant" icon="✨" />;
      case "citations":
        return <PlaceholderScreen title="Citations" icon="📝" />;
      case "settings":
        return <PlaceholderScreen title="Settings" icon="⚙️" />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// PART 4: PLACEHOLDER SCREEN COMPONENT
// ============================================

function PlaceholderScreen({ title, icon }: { title: string; icon: string }) {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderIcon}>{icon}</Text>
      <Text style={styles.placeholderTitle}>{title}</Text>
      <Text style={styles.placeholderText}>Coming soon...</Text>
    </View>
  );
}

// ============================================
// PART 5: STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.gray6,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
    paddingBottom: 20, // Safe area padding
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.gray1,
  },
  tabLabelActive: {
    color: colors.appleBlue,
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.darkBg,
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.gray1,
  },
});
