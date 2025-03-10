import {
  Text,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../constants/firebaseConfig';  // Adjust path if needed

export default function Login() {
  const auth = getAuth(app);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Alert.alert('Welcome!', `Logged in as ${user.email}`);
      router.push('/Home');  // Navigate after login
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.view}>
      <Text style={styles.heading}>Login</Text>
      <Text style={styles.heading2}>Welcome back!</Text>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          placeholder="hello@example.com"
          placeholderTextColor="#888"
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType='emailAddress'
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
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
            <Icon
              name={isPasswordVisible ? "visibility-off" : "visibility"}
              size={24}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/ForgetPassword")}>
          <Text style={styles.linkButtonText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/SignUp")}>
            <Text style={styles.linkButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && { backgroundColor: "#aaa" }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <Modal transparent={true} animationType="fade">
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Logging in...</Text>
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
    marginBottom: 60 
  },
  formContainer: {
    width: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
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
