import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuthStore } from "@/store/authStore";

export default function LoginScreen() {
  const { login, isLoading, error } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    try {
      await login({ identifier: identifier.trim(), password });
      router.replace("/");
    } catch {
      // error surfaced via store
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <Text style={styles.subtitle}>Use your email or phone number</Text>

      <TextInput
        style={styles.input}
        placeholder="Email or phone"
        placeholderTextColor="#737373"
        autoCapitalize="none"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#737373"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        disabled={isLoading || !identifier || !password}
        onPress={() => void onSubmit()}
      >
        {isLoading ? (
          <ActivityIndicator color="#0a0a0a" />
        ) : (
          <Text style={styles.buttonText}>Sign in</Text>
        )}
      </Pressable>

      <Link href="/register" style={styles.link}>
        Create an account
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#a3a3a3",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#404040",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fafafa",
    marginBottom: 12,
    fontSize: 16,
  },
  error: {
    color: "#f87171",
    marginBottom: 12,
    fontSize: 13,
  },
  button: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#0a0a0a",
    fontWeight: "600",
    fontSize: 15,
  },
  link: {
    color: "#ffffff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
  },
});
