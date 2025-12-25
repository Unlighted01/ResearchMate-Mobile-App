// ============================================
// SOCIAL AUTH - Google/Apple Sign In Buttons
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { signInWithGoogle } from "../../services/supabaseClient";
import { colors } from "../../constants/colors";

// ============================================
// PART 2: MAIN COMPONENT
// ============================================

export default function SocialAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      Alert.alert("Google Sign In Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.divider} />
      </View>

      {/* Social Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.socialButton, isLoading && styles.buttonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} size="small" />
          ) : (
            <>
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Google</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================
// PART 3: STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray4,
  },
  dividerText: {
    color: colors.gray1,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray5,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  socialIcon: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  socialText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "500",
  },
});
