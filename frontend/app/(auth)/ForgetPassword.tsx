import React, { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "@/constants/firebaseConfig"; // Adjust path if needed
import { useTheme } from '@/hooks/ThemeContext';


export default function ForgetPassword() {
  const auth = getAuth(app);
  const router = useRouter();
    const { colors } = useTheme();
  const [email, setEmail] = useState("");

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Check Your Email",
        "A password reset link has been sent to your email."
      );
      router.push("/Login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
  <View style={[styles.view, {backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Forgot Password</Text>
      <Text style={[styles.subHeading, { color: colors.text }]}>
        Enter your email to receive a password reset link.
      </Text>
         <View style={[styles.formContainer, {backgroundColor: colors.background }]}>
        {/* Email Input */}
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={email}
          placeholder="hello@example.com"
          placeholderTextColor="#888"
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* Reset Password Button */}
        <TouchableOpacity style={styles.resetButton} onPress={handlePasswordReset}>
          <Text style={[styles.resetButtonText, { color: colors.text }]}>Send Reset Link</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <View style={styles.backToLoginContainer}>
          <Text style={[styles.backToLoginText, { color: colors.text }]}>Remember your password? </Text>
          <TouchableOpacity onPress={() => router.push("/Login")}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view: {
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  formContainer: {
    width: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "flex-start",
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  input: {
    height: 40,
    marginBottom: 15,
    backgroundColor: "#fff",
    width: "100%",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  resetButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#42c8f5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  resetButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backToLoginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  backToLoginText: {
    fontSize: 14,
  },
  linkText: {
    color: "#42c8f5",
    fontSize: 14,
    fontWeight: "bold",
  },
});