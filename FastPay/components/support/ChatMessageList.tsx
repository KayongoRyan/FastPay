import { StyleSheet, Text, View } from "react-native";

import type { ChatMessage } from "@/store/chatStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

import { ChatActionRow } from "./ChatActionRow";
import { SourceChips } from "./SourceChips";

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export function ChatMessageList({ messages }: ChatMessageListProps) {
  if (!messages.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Ask FastPay</Text>
        <Text style={styles.emptyText}>
          Ask about transfers, bills, savings, loans, KYC, or any feature in the app.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {messages.map((message) => {
        const isUser = message.role === "user";
        return (
          <View
            key={message.id}
            style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
          >
            <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
              {message.content}
            </Text>
            {!isUser && message.engine ? (
              <View style={styles.engineChip}>
                <Text style={styles.engineText}>
                  {message.engine === "cloud" ? "Cloud" : "Local"}
                  {message.latencyMs ? ` · ${message.latencyMs}ms` : ""}
                </Text>
              </View>
            ) : null}
            {!isUser && message.sources ? (
              <SourceChips sources={message.sources} />
            ) : null}
            {!isUser && message.actions ? (
              <ChatActionRow actions={message.actions} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: "92%",
    borderRadius: radius.md,
    padding: spacing.md,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
  },
  assistantText: {
    color: colors.white,
  },
  engineChip: {
    alignSelf: "flex-start",
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.pillTrack,
  },
  engineText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  empty: {
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
