import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Send } from "lucide-react-native";

import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSend(trimmed);
    setValue("");
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder="Ask about bills, savings, transfers..."
        placeholderTextColor={colors.textMuted}
        multiline
        editable={!disabled}
      />
      <Pressable
        style={[styles.sendBtn, disabled && styles.sendBtnDisabled]}
        onPress={handleSend}
        disabled={disabled}
      >
        {disabled ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Send size={18} color={colors.white} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.inputBg,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    maxHeight: 120,
    paddingVertical: spacing.xs,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
});
