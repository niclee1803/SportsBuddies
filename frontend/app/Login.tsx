import {
  Text,
  Button,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../constants/firebaseConfig';  // Adjust path if needed


export default function Login() {
  const auth = getAuth(app);
  const router = useRouter();
  const [email, setemail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // You can now do something with `user` if needed (e.g., save to context, navigate, etc.)
      Alert.alert('Welcome!', `Logged in as ${user.email}`);
      //router.push('/home');  // Adjust to wherever you want to send them after login.
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.view}>
      <Text style={styles.heading}>Login</Text>

      <View style={styles.formContainer}>
        {/* Email Label and Input */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          placeholder="hello@example.com"
          placeholderTextColor="#888"
          onChangeText={(text) => setemail(text)}
          autoCapitalize="none"
        />

        {/* Password Label and Input */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!isPasswordVisible}
            onChangeText={(text) => setPassword(text)}
          />
          {/* Eye Icon for Password Visibility Toggle */}
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

        {/* Forgot Password Button */}
        <TouchableOpacity style={styles.linkButton} onPress={() => {}}>
          <Text style={styles.linkButtonText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Don't have an account? */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signUp")}>
            <Text style={styles.linkButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
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
    marginBottom: 80,
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
    fontWeight: "normal",
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
});
