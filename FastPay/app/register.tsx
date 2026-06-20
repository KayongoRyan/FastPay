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

export default function RegisterScreen() {
  const { register, isLoading, error } = useAuthStore();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        password,
      });
      router.replace("/");
    } catch {
      // error surfaced via store
    }
  };

  const canSubmit =
    fullName.trim().length > 0 &&
    password.length >= 8 &&
    (email.trim().length > 0 || phone.trim().length > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Email or phone required</Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        placeholderTextColor="#737373"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#737373"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone (optional if email set)"
        placeholderTextColor="#737373"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Password (min 8 chars)"
        placeholderTextColor="#737373"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.button, (isLoading || !canSubmit) && styles.buttonDisabled]}
        disabled={isLoading || !canSubmit}
        onPress={() => void onSubmit()}
      >
        {isLoading ? (
          <ActivityIndicator color="#0a0a0a" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </Pressable>

      <Link href="/login" style={styles.link}>
        Already have an account? Sign in
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
