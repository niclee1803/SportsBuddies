import { Text, TextInput, StyleSheet, View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";

export default function SignUp() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View style={styles.view}>
      <Text style={styles.heading}>Sign Up</Text>
      <Text style={styles.subheading}>It's free and it takes one minute!</Text>

      <View style={styles.formContainer}>
        {/* First Name & Last Name */}
        <View style={styles.rowContainer}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              placeholder="John"
              placeholderTextColor="#888"
              onChangeText={(text) => setFirstName(text)}
            />
          </View>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              placeholder="Doe"
              placeholderTextColor="#888"
              onChangeText={(text) => setLastName(text)}
            />
          </View>
        </View>

        {/* Email */}
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          placeholder="hello@example.com"
          placeholderTextColor="#888"
          onChangeText={(text) => setEmail(text)}
          autoCapitalize="none"
        />

        {/* Phone Number */}
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          placeholder="+65 1234 5678"
          placeholderTextColor="#888"
          onChangeText={(text) => setPhone(text)}
          keyboardType="phone-pad"
        />

        {/* Create Username */}
        <Text style={styles.label}>Create Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          placeholder="yourusername"
          placeholderTextColor="#888"
          onChangeText={(text) => setUsername(text)}
          autoCapitalize="none"
        />

        {/* Password */}
        <Text style={styles.label}>Choose a Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry={!isPasswordVisible}
            onChangeText={(text) => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Icon name={isPasswordVisible ? "visibility-off" : "visibility"} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Re-enter Password */}
        <Text style={styles.label}>Re-enter Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor="#888"
            secureTextEntry={!isConfirmPasswordVisible}
            onChangeText={(text) => setConfirmPassword(text)}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
          >
            <Icon name={isConfirmPasswordVisible ? "visibility-off" : "visibility"} size={24} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Accept Terms & Conditions */}
        <View style={styles.termsContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#42c8f5" : undefined}
          />
          <Text style={styles.termsText}>I accept the Terms & Conditions</Text>
        </View>

        {/* Signup Button */}
        <TouchableOpacity style={styles.signupButton} onPress={() => {}}>
          <Text style={styles.signupButtonText}>Sign Up</Text>
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
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    marginBottom: 20,
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
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfInputContainer: {
    width: "48%",
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  termsText: {
    marginLeft: 8,
    fontSize: 14,
  },
  signupButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#42c8f5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signupButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
