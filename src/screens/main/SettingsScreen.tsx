// ============================================
// SETTINGS SCREEN - With Full Functionality
// ============================================

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
  Modal,
  Switch,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { colors } from "../../constants/colors";
import {
  getPreferences,
  updatePreferences,
} from "../../services/preferencesService";

// Import feature screens
import StatisticsScreen from "./StatisticsScreen";
import SmartPenScreen from "./SmartPenScreen";

// ============================================
// CONTACT INFO
// ============================================

const CONTACT_EMAIL = "netnetku21@gmail.com";
const CONTACT_PHONE = "09943818037";
const WEBSITE_URL = "https://researchmate.vercel.app";

// ============================================
// MAIN COMPONENT
// ============================================

export default function SettingsScreen() {
  const { user, signOut } = useAuth();

  // Settings state
  const [appearance, setAppearance] = useState<"system" | "dark" | "light">(
    "system"
  );
  const [citationStyle, setCitationStyle] = useState<
    "APA" | "MLA" | "Chicago" | "Harvard" | "IEEE"
  >("APA");
  const [notifications, setNotifications] = useState(true);

  // Modal state for sub-screens
  const [showStatistics, setShowStatistics] = useState(false);
  const [showSmartPen, setShowSmartPen] = useState(false);
  const [showAppearancePicker, setShowAppearancePicker] = useState(false);
  const [showCitationPicker, setShowCitationPicker] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getPreferences();
      setAppearance(prefs.theme);
      setCitationStyle(prefs.citationStyle);
      setNotifications(prefs.notificationsEnabled);
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  // Save preferences when they change
  useEffect(() => {
    const savePrefs = async () => {
      try {
        await updatePreferences({
          theme: appearance,
          citationStyle,
          notificationsEnabled: notifications,
        });
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    };
    savePrefs();
  }, [appearance, citationStyle, notifications]);

  // Handlers
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: signOut },
    ]);
  };

  const openWebsite = async () => {
    try {
      const supported = await Linking.canOpenURL(WEBSITE_URL);
      if (supported) {
        await Linking.openURL(WEBSITE_URL);
      } else {
        Alert.alert(
          "Error",
          "Cannot open website. Please visit researchmate.vercel.app in your browser."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open website");
    }
  };

  const handleContactSupport = () => {
    Alert.alert("Contact Support", "How would you like to reach us?", [
      {
        text: "📧 Email",
        onPress: () =>
          Linking.openURL(
            `mailto:${CONTACT_EMAIL}?subject=ResearchMate Mobile App Support`
          ),
      },
      {
        text: "📞 Call",
        onPress: () => Linking.openURL(`tel:${CONTACT_PHONE}`),
      },
      {
        text: "💬 WhatsApp",
        onPress: () =>
          Linking.openURL(`https://wa.me/63${CONTACT_PHONE.substring(1)}`),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleRateApp = () => {
    Alert.alert(
      "Rate ResearchMate",
      "Thank you for using ResearchMate! Your feedback helps us improve.",
      [
        {
          text: "⭐ Rate on App Store",
          onPress: () => {
            // For iOS: Linking.openURL('itms-apps://apps.apple.com/app/idXXXXXXXXX?action=write-review')
            // For Android: Linking.openURL('market://details?id=com.researchmate.app')
            Alert.alert(
              "Coming Soon",
              "App Store rating will be available once the app is published."
            );
          },
        },
        {
          text: "📧 Send Feedback",
          onPress: () =>
            Linking.openURL(
              `mailto:${CONTACT_EMAIL}?subject=ResearchMate App Feedback`
            ),
        },
        { text: "Maybe Later", style: "cancel" },
      ]
    );
  };

  const appearanceOptions: ("System" | "Dark" | "Light")[] = [
    "System",
    "Dark",
    "Light",
  ];
  const citationStyles: ("APA" | "MLA" | "Chicago" | "Harvard" | "IEEE")[] = [
    "APA",
    "MLA",
    "Chicago",
    "Harvard",
    "IEEE",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.email?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.email}>{user?.email || "Not signed in"}</Text>
              <Text style={styles.memberSince}>
                Member since{" "}
                {new Date(user?.created_at || Date.now()).getFullYear()}
              </Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowStatistics(true)}
          >
            <Text style={styles.settingIcon}>📊</Text>
            <Text style={styles.settingLabel}>Statistics</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowSmartPen(true)}
          >
            <Text style={styles.settingIcon}>✏️</Text>
            <Text style={styles.settingLabel}>Smart Pen</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowAppearancePicker(true)}
          >
            <Text style={styles.settingIcon}>🎨</Text>
            <Text style={styles.settingLabel}>Appearance</Text>
            <Text style={styles.settingValue}>{appearance}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowCitationPicker(true)}
          >
            <Text style={styles.settingIcon}>📝</Text>
            <Text style={styles.settingLabel}>Default Citation Style</Text>
            <Text style={styles.settingValue}>{citationStyle}</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: colors.gray4, true: colors.appleGreen }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity style={styles.settingRow} onPress={openWebsite}>
            <Text style={styles.settingIcon}>🌐</Text>
            <Text style={styles.settingLabel}>Visit Website</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleContactSupport}
          >
            <Text style={styles.settingIcon}>📧</Text>
            <Text style={styles.settingLabel}>Contact Support</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleRateApp}>
            <Text style={styles.settingIcon}>⭐</Text>
            <Text style={styles.settingLabel}>Rate App</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingIcon}>📱</Text>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          ResearchMate © {new Date().getFullYear()}
        </Text>
      </ScrollView>

      {/* Statistics Modal */}
      <Modal
        visible={showStatistics}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowStatistics(false)}
      >
        <View style={styles.modalWrapper}>
          <TouchableOpacity
            style={styles.modalBackButton}
            onPress={() => setShowStatistics(false)}
          >
            <Text style={styles.modalBackText}>← Back to Settings</Text>
          </TouchableOpacity>
          <StatisticsScreen />
        </View>
      </Modal>

      {/* Smart Pen Modal */}
      <Modal
        visible={showSmartPen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSmartPen(false)}
      >
        <View style={styles.modalWrapper}>
          <TouchableOpacity
            style={styles.modalBackButton}
            onPress={() => setShowSmartPen(false)}
          >
            <Text style={styles.modalBackText}>← Back to Settings</Text>
          </TouchableOpacity>
          <SmartPenScreen />
        </View>
      </Modal>

      {/* Appearance Picker Modal */}
      <Modal
        visible={showAppearancePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAppearancePicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowAppearancePicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Choose Appearance</Text>
            {appearanceOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.pickerOption,
                  appearance === option && styles.pickerOptionActive,
                ]}
                onPress={() => {
                  setAppearance(option);
                  setShowAppearancePicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>
                  {option === "System" ? "📱" : option === "Dark" ? "🌙" : "☀️"}{" "}
                  {option}
                </Text>
                {appearance === option && (
                  <Text style={styles.pickerCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Citation Style Picker Modal */}
      <Modal
        visible={showCitationPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCitationPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowCitationPicker(false)}
        >
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerTitle}>Default Citation Style</Text>
            {citationStyles.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.pickerOption,
                  citationStyle === style && styles.pickerOptionActive,
                ]}
                onPress={() => {
                  setCitationStyle(style);
                  setShowCitationPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{style}</Text>
                {citationStyle === style && (
                  <Text style={styles.pickerCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.darkBg },
  scrollView: { flex: 1 },
  header: { paddingHorizontal: 16, paddingVertical: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: colors.white },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.gray1,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray5,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.appleBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: "bold" },
  profileInfo: { flex: 1 },
  email: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 2,
  },
  memberSince: { fontSize: 13, color: colors.gray1 },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.gray5,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 2,
  },
  settingIcon: { fontSize: 20, marginRight: 12 },
  settingLabel: { flex: 1, fontSize: 16, color: colors.white },
  settingValue: { fontSize: 15, color: colors.gray1, marginRight: 8 },
  arrow: { fontSize: 20, color: colors.gray2 },
  signOutButton: {
    backgroundColor: colors.appleRed,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: { color: colors.white, fontSize: 16, fontWeight: "600" },
  footer: {
    textAlign: "center",
    color: colors.gray2,
    fontSize: 13,
    paddingVertical: 24,
  },
  modalWrapper: { flex: 1, backgroundColor: colors.darkBg },
  modalBackButton: { paddingHorizontal: 16, paddingTop: 16 },
  modalBackText: { fontSize: 16, color: colors.appleBlue },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  pickerContainer: {
    backgroundColor: colors.gray5,
    borderRadius: 16,
    width: "100%",
    maxWidth: 320,
    padding: 8,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    textAlign: "center",
    paddingVertical: 16,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 2,
  },
  pickerOptionActive: { backgroundColor: colors.gray4 },
  pickerOptionText: { fontSize: 16, color: colors.white },
  pickerCheck: { fontSize: 18, color: colors.appleBlue, fontWeight: "600" },
});
