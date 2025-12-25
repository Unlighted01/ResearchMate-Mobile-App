// ============================================
// AUTH NAVIGATOR - Authentication Flow Stack
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// ============================================
// PART 2: TYPE DEFINITIONS
// ============================================

type AuthScreen = "login" | "signup" | "forgotPassword";

// ============================================
// PART 3: MAIN COMPONENT
// ============================================

export default function AuthNavigator() {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>("login");

  // Simple screen-based navigation for auth flow
  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            onNavigateToSignup={() => setCurrentScreen("signup")}
            onNavigateToForgotPassword={() =>
              setCurrentScreen("forgotPassword")
            }
          />
        );
      case "signup":
        return (
          <SignupScreen onNavigateToLogin={() => setCurrentScreen("login")} />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordScreen
            onNavigateBack={() => setCurrentScreen("login")}
          />
        );
      default:
        return (
          <LoginScreen
            onNavigateToSignup={() => setCurrentScreen("signup")}
            onNavigateToForgotPassword={() =>
              setCurrentScreen("forgotPassword")
            }
          />
        );
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

// ============================================
// PART 4: STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
