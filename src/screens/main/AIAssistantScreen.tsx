// ============================================
// AI ASSISTANT SCREEN
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../constants/colors";
import { getAllItems } from "../../services/storageService";

// ============================================
// PART 2: TYPE DEFINITIONS
// ============================================

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// ============================================
// PART 3: API CONFIG
// ============================================

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://researchmate.vercel.app";

// ============================================
// PART 4: MAIN COMPONENT
// ============================================

export default function AIAssistantScreen() {
  // ---------- PART 4A: STATE ----------
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi! I'm your research assistant. I can help you understand and summarize your saved research. What would you like to know?",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // ---------- PART 4B: HANDLERS ----------
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Get research context
      const items = await getAllItems(10);
      const context = items
        .map(
          (item) =>
            `- ${item.text.slice(0, 200)}${item.text.length > 200 ? "..." : ""}`
        )
        .join("\n");

      // Call API
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: context,
        }),
      });

      const data = await response.json();

      if (data.response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- PART 4C: SUGGESTION CHIPS ----------
  const suggestions = [
    "Summarize my research",
    "What are my main topics?",
    "Find connections",
    "Key insights",
  ];

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  // ---------- PART 4D: RENDER ----------
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Assistant</Text>
          <Text style={styles.subtitle}>Powered by your research</Text>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === "user"
                  ? styles.userBubble
                  : styles.assistantBubble,
              ]}
            >
              {message.role === "assistant" && (
                <Text style={styles.assistantIcon}>✨</Text>
              )}
              <Text
                style={[
                  styles.messageText,
                  message.role === "user"
                    ? styles.userText
                    : styles.assistantText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color={colors.appleBlue} />
              <Text style={styles.typingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
          >
            {suggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestionChip}
                onPress={() => handleSuggestion(suggestion)}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask about your research..."
            placeholderTextColor={colors.gray1}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={loading || !input.trim()}
          >
            <Text style={styles.sendButtonText}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray1,
    marginTop: 2,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  userBubble: {
    backgroundColor: colors.appleBlue,
    alignSelf: "flex-end",
  },
  assistantBubble: {
    backgroundColor: colors.gray5,
    alignSelf: "flex-start",
  },
  assistantIcon: {
    marginRight: 8,
    fontSize: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  userText: {
    color: colors.white,
  },
  assistantText: {
    color: colors.white,
  },
  typingText: {
    color: colors.gray1,
    marginLeft: 8,
  },
  suggestionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 50,
  },
  suggestionChip: {
    backgroundColor: colors.gray5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.gray4,
  },
  suggestionText: {
    color: colors.white,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray5,
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.white,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: colors.appleBlue,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
});
