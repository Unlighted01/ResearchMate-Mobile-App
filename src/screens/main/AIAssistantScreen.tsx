// ============================================
// AI ASSISTANT SCREEN
// ============================================

// ============================================
// PART 1: IMPORTS & DEPENDENCIES
// ============================================

import React, { useState, useRef, useEffect } from "react";
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
  Animated,
} from "react-native";
import { colors } from "../../constants/colors";
import { getAllItems } from "../../services/storageService";
import { Card, Button } from "../../components/common";

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

  // Animation refs for each message
  const messageAnimations = useRef<Map<string, Animated.Value>>(new Map());

  // Get or create animation value for a message
  const getMessageAnimation = (messageId: string) => {
    if (!messageAnimations.current.has(messageId)) {
      messageAnimations.current.set(messageId, new Animated.Value(0));
    }
    return messageAnimations.current.get(messageId)!;
  };

  // Animate new messages
  useEffect(() => {
    messages.forEach((message) => {
      const anim = getMessageAnimation(message.id);
      Animated.spring(anim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    });
  }, [messages]);

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
          showsVerticalScrollIndicator={false}
        >
          {messages.map((message) => {
            const anim = getMessageAnimation(message.id);
            return (
              <Animated.View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.role === "user" ? styles.userWrapper : styles.assistantWrapper,
                  {
                    opacity: anim,
                    transform: [
                      {
                        translateY: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        }),
                      },
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Card
                  variant={message.role === "user" ? "default" : "glass"}
                  style={[
                    styles.messageBubble,
                    message.role === "user" ? styles.userBubble : styles.assistantBubble,
                  ]}
                  padding={12}
                >
                  <View style={styles.messageContent}>
                    {message.role === "assistant" && (
                      <View style={styles.assistantIconContainer}>
                        <Text style={styles.assistantIcon}>✨</Text>
                      </View>
                    )}
                    <Text
                      style={[
                        styles.messageText,
                        message.role === "user" ? styles.userText : styles.assistantText,
                      ]}
                    >
                      {message.content}
                    </Text>
                  </View>
                </Card>
              </Animated.View>
            );
          })}
          {loading && (
            <Animated.View style={[styles.messageWrapper, styles.assistantWrapper]}>
              <Card variant="glass" style={[styles.messageBubble, styles.assistantBubble]} padding={12}>
                <View style={styles.typingContainer}>
                  <ActivityIndicator size="small" color={colors.appleBlue} />
                  <Text style={styles.typingText}>Thinking...</Text>
                </View>
              </Card>
            </Animated.View>
          )}
        </ScrollView>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsContainer}
            contentContainerStyle={styles.suggestionsContent}
          >
            {suggestions.map((suggestion, index) => (
              <Card
                key={index}
                variant="outline"
                style={styles.suggestionChip}
                onPress={() => handleSuggestion(suggestion)}
                padding={10}
              >
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </Card>
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
  messageWrapper: {
    marginBottom: 12,
  },
  userWrapper: {
    alignItems: "flex-end",
  },
  assistantWrapper: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "85%",
  },
  userBubble: {
    backgroundColor: colors.appleBlue,
  },
  assistantBubble: {
    backgroundColor: "transparent",
  },
  messageContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  assistantIconContainer: {
    marginRight: 8,
  },
  assistantIcon: {
    fontSize: 18,
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
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  typingText: {
    color: colors.gray1,
    marginLeft: 8,
    fontSize: 14,
  },
  suggestionsContainer: {
    paddingVertical: 12,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    borderRadius: 20,
  },
  suggestionText: {
    color: colors.appleBlue,
    fontSize: 14,
    fontWeight: "500",
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
