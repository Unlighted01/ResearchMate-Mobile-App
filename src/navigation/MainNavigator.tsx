// ============================================
// MAIN NAVIGATOR - Bottom Tab Navigator
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../constants/colors";

// Import all main screens
import DashboardScreen from "../screens/main/DashboardScreen";
import CollectionsScreen from "../screens/main/CollectionsScreen";
import AIAssistantScreen from "../screens/main/AIAssistantScreen";
import CitationsScreen from "../screens/main/CitationsScreen";
import SettingsScreen from "../screens/main/SettingsScreen";

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

  // Navigation function to pass to screens
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  // Render screen based on active tab
  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardScreen navigateToTab={navigateToTab} />;
      case "collections":
        return <CollectionsScreen />;
      case "ai":
        return <AIAssistantScreen />;
      case "citations":
        return <CitationsScreen />;
      case "settings":
        return <SettingsScreen />;
      default:
        return <DashboardScreen navigateToTab={navigateToTab} />;
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
            <Text
              style={[
                styles.tabIcon,
                activeTab === tab.key && styles.tabIconActive,
              ]}
            >
              {tab.icon}
            </Text>
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
// PART 4: STYLES
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
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: colors.gray1,
  },
  tabLabelActive: {
    color: colors.appleBlue,
  },
});
