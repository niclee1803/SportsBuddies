import {
  Text,
  TextInput,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import React, { useState } from "react";
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <View style={styles.view}>
      <Text style={styles.heading}>Sign Up</Text>

      <View style={styles.formContainer}>
        {/* Step 1: First & Last Name */}
        {step === 1 && (
          <>
            <Text style={styles.subheading}>Step 1: Tell us your name</Text>
            <View style={styles.rowContainer}>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  placeholder="John"
                  placeholderTextColor="#888"
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.halfInputContainer}>
                <Text style={styles.label}>Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  placeholder="Doe"
                  placeholderTextColor="#888"
                  onChangeText={setLastName}
                />
              </View>
            </View>

            {/* Back to Login? */}
            <View style={styles.loginContainer}>
              <Text>Have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/Login")}>
                <Text style={styles.loginButtonText}>Login</Text>
              </TouchableOpacity>
            </View>

            {/* Navigation Buttons for Step 1 */}
            <View style={styles.buttonContainer}>
              <View style={{ flex: 1 }} />{" "}
              {/* Empty space to push the button to the right */}
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setStep(step + 1)}
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Step 2: Email & Phone */}
        {step === 2 && (
          <>
            <Text style={styles.subheading}>Step 2: Contact Information</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              placeholder="hello@example.com"
              placeholderTextColor="#888"
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              placeholder="+65 1234 5678"
              placeholderTextColor="#888"
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </>
        )}

        {/* Step 3: Username */}
        {step === 3 && (
          <>
            <Text style={styles.subheading}>Step 3: Create a Username</Text>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              placeholder="yourusername"
              placeholderTextColor="#888"
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </>
        )}

        {/* Step 4: Password & Confirm Password */}
        {step === 4 && (
          <>
            <Text style={styles.subheading}>Step 4: Secure Your Account</Text>
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
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor="#888"
                secureTextEntry={!isConfirmPasswordVisible}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
              >
                <Icon
                  name={
                    isConfirmPasswordVisible ? "visibility-off" : "visibility"
                  }
                  size={24}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Step 5: Terms & Conditions */}
        {step === 5 && (
          <>
            <Text style={styles.subheading}>Step 5: Accept Terms</Text>
            <View style={styles.termsContainer}>
              <Checkbox
                value={isChecked}
                onValueChange={setIsChecked}
                color={isChecked ? "#42c8f5" : undefined}
              />
              <Text style={styles.termsText}> I accept the </Text>
              <TouchableOpacity
                onPress={() => alert("Open Terms & Conditions")}
              >
                <Text style={styles.termsLink}>Terms & Conditions</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Navigation Buttons */}
        {step !== 1 && (
          <View style={styles.buttonContainer}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setStep(step - 1)}
              >
                <Text style={styles.navButtonText}>Back</Text>
              </TouchableOpacity>
            )}
            {step < 5 ? (
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => setStep(step + 1)}
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signupButton}
                onPress={() => alert("Signed Up!")}
              >
                <Text style={styles.signupButtonText}>Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  view: { marginTop: 100, justifyContent: "center", alignItems: "center" },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 80 },
  subheading: { fontSize: 16, marginBottom: 20 },
  formContainer: {
    width: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfInputContainer: { width: "48%" },
  label: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
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
  loginButtonText: {
    color: "#42c8f5",
    fontSize: 14,
    fontWeight: "normal",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeIcon: { position: "absolute", right: 10, top: 10 },
  termsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  termsText: { fontSize: 14 },
  termsLink: {
    fontSize: 14,
    color: "#42c8f5",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  navButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 5 },
  navButtonText: { fontSize: 16 },
  signupButton: { backgroundColor: "#42c8f5", padding: 10, borderRadius: 5 },
  signupButtonText: { color: "#fff", fontWeight: "bold" },
});
