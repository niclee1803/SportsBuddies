import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCurrentUser } from "@/utils/GetUser";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { API_URL } from "@/config.json";
import { useTheme } from '@/hooks/ThemeContext';

export default function Login() {
  const { colors } = useTheme();
  const router = useRouter();
  const [input, setInput] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  const resolveEmail = async (inputValue: string): Promise<string> => {
    if (inputValue.includes("@")) return inputValue;

    try {
      const response = await fetch(`${API_URL}/user/lookup?username=${inputValue}`);
      if (!response.ok) throw new Error("Username not found");
      const data = await response.json();
      return data.email;
    } catch (err) {
      throw new Error("Username not found");
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);

    try {
      const resolvedEmail = await resolveEmail(input);
      const userCredential = await signInWithEmailAndPassword(auth, resolvedEmail, password);
      const idToken = await userCredential.user.getIdToken();

      await AsyncStorage.setItem("token", idToken);

      const userData = await fetchCurrentUser();
      const preferencesSet = userData.preferences_set;
      console.log(idToken)
      router.replace(preferencesSet ? "/Dashboard" : "/SetPreferences");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert("Login Failed", error.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.view, {backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.text }]}>Login</Text>
      <Text style={[styles.heading2, { color: colors.text }]}>Welcome back!</Text>

      <View style={[styles.formContainer, {backgroundColor: colors.background }]}>
        <Text style={[styles.label, { color: colors.text }]}>Username or Email</Text>
        <TextInput
           style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
           value={input}
           placeholder="Enter your username or email"
           placeholderTextColor="#888"
           onChangeText={setInput}
           autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.text }]}>Password</Text>
        <View style={[styles.passwordContainer, {backgroundColor: colors.background }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            value={password}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!isPasswordVisible}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon name={isPasswordVisible ? "visibility-off" : "visibility"} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/ForgetPassword")}>
          <Text style={[styles.linkButtonText, { color: colors.text }]}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={[styles.signUpContainer, {backgroundColor: colors.background }]}>
          <Text style={[styles.signUpText, { color: colors.text }]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/SignUp")}>
            <Text style={styles.linkButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && { backgroundColor: "#aaa" }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={[styles.loginButtonText, { color: colors.text }]}>Login</Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <Modal transparent={true} animationType="fade">
          <View style={[styles.loadingOverlay, {backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color="#42c8f5" />
            <Text style={[styles.loadingText, { color: colors.text }]}>Logging in...</Text>
          </View>
        </Modal>
      )}
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
  heading2: {
    fontSize: 16,
    marginBottom: 60,
  },
  formContainer: {
    width: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    //backgroundColor: "#f9f9f9",
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
    //backgroundColor: "#fff",
    width: "100%",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  linkButton: {
    width: "100%",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  linkButtonText: {
    color: "#42c8f5",
    fontSize: 14,
    fontWeight: "bold",
  },
  signUpContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 14,
  },
  loginButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#42c8f5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    marginTop: 10,
  },
});
