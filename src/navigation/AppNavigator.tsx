// ============================================
// APP NAVIGATOR - Main Navigation Container
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { colors } from "../constants/colors";

// ============================================
// PART 2: MAIN COMPONENT
// ============================================

export default function AppNavigator() {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.appleBlue} />
      </View>
    );
  }

  // Show auth screens if not logged in, otherwise show main app
  return user ? <MainNavigator /> : <AuthNavigator />;
}

// ============================================
// PART 3: STYLES
// ============================================

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.darkBg,
  },
});
