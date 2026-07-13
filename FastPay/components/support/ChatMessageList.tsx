import { Pressable, StyleSheet, Text, View } from "react-native";
import { ThumbsDown, ThumbsUp } from "lucide-react-native";

import type { ChatMessage } from "@/store/chatStore";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

import { ChatActionRow } from "./ChatActionRow";
import { SourceChips } from "./SourceChips";

interface ChatMessageListProps {
  messages: ChatMessage[];
  conversationId?: string | null;
  onFeedback?: (
    message: ChatMessage,
    rating: 1 | -1,
  ) => void;
}

export function ChatMessageList({
  messages,
  conversationId,
  onFeedback,
}: ChatMessageListProps) {
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
        const lowConfidence =
          !isUser &&
          message.confidence != null &&
          message.confidence < 0.55;

        return (
          <View
            key={message.id}
            style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}
          >
            <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
              {message.content}
            </Text>
            {!isUser && message.engine ? (
              <View style={styles.metaRow}>
                <View style={styles.engineChip}>
                  <Text style={styles.engineText}>
                    {message.engine === "cloud" ? "Cloud" : "Local"}
                    {message.latencyMs ? ` · ${message.latencyMs}ms` : ""}
                    {message.confidence != null
                      ? ` · ${Math.round(message.confidence * 100)}%`
                      : ""}
                  </Text>
                </View>
                {lowConfidence ? (
                  <View style={styles.lowConfidenceChip}>
                    <Text style={styles.lowConfidenceText}>Low confidence</Text>
                  </View>
                ) : null}
              </View>
            ) : null}
            {!isUser && message.sources ? (
              <SourceChips sources={message.sources} lowConfidence={lowConfidence} />
            ) : null}
            {!isUser && message.actions ? (
              <ChatActionRow actions={message.actions} />
            ) : null}
            {!isUser && onFeedback ? (
              <View style={styles.feedbackRow}>
                <Pressable
                  accessibilityLabel="Helpful answer"
                  onPress={() => onFeedback(message, 1)}
                  style={styles.feedbackBtn}
                >
                  <ThumbsUp size={16} color={colors.textMuted} />
                </Pressable>
                <Pressable
                  accessibilityLabel="Unhelpful answer"
                  onPress={() => onFeedback(message, -1)}
                  style={styles.feedbackBtn}
                >
                  <ThumbsDown size={16} color={colors.textMuted} />
                </Pressable>
              </View>
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
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  engineChip: {
    alignSelf: "flex-start",
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
  lowConfidenceChip: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.pillTrack,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lowConfidenceText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  feedbackRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  feedbackBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
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
