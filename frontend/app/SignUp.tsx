import React, { useState } from "react";
import { View, Text, Alert, Platform, ActivityIndicator, Modal } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "../components/signup/StepIndicator";
import { Step1 } from "../components/signup/steps/Step1";
import { Step2 } from "../components/signup/steps/Step2";
import { Step3 } from "../components/signup/steps/Step3";
import { Step4 } from "../components/signup/steps/Step4";
import { Step5 } from "../components/signup/steps/Step5";
import {
  validatePhone,
  validatePassword
} from "../components/signup/ValidationUtils";
import styles from "../components/signup/styles";
import { API_URL } from "../config.json";

// Import Firebase authentication
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Initialize Firebase
const auth = getAuth();

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const totalSteps = 5;

  // Form state
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isChecked, setIsChecked] = useState<boolean>(false);

  // Password visibility
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false);

  // Error states
  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string | null>("");
  const [phoneError, setPhoneError] = useState<string | null>("");
  const [usernameError, setUsernameError] = useState<string | null>("");
  const [passwordError, setPasswordError] = useState<string | null>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>("");

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleNext = async () => {
    let isValid = true;

    switch (step) {
      case 2:
        if (emailError) {
          isValid = false;
        } else {
          isValid = await validatePhone(phone, setPhoneError);
        }
        break;
      case 3:
        if (usernameError || !username) {
          isValid = false;
        }
        break;
      case 4:
        isValid = validatePassword(password, setPasswordError);
        if (isValid && password !== confirmPassword) {
          setConfirmPasswordError("Passwords do not match");
          isValid = false;
        }
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // 1. Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // 2. Update user profile in Firebase Auth
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });
      
      // 3. Get ID token to use for backend API authentication
      const idToken = await user.getIdToken();
      console.log(idToken);
      // 4. Store user data in Firestore via our backend API
      const response = await fetch(`${API_URL}/user/create_user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          username
        }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        const successMessage = "Success! Your account has been created successfully!";
        if (Platform.OS === "web") {
          window.alert(successMessage);
          router.push("/Login");
        } else {
          Alert.alert("Success!", successMessage, [
            { text: "OK", onPress: () => router.push("/Login") },
          ]);
        }
      } else {
        // If backend user creation fails, we should delete the Firebase auth user
        try {
          await user.delete();
        } catch (deleteError) {
          console.error("Failed to clean up auth user after profile creation error:", deleteError);
        }
        
        if (Platform.OS === "web") {
          window.alert(`Error: ${data.error || "Failed to create user profile"}`);
        } else {
          Alert.alert("Error", data.error || "Failed to create user profile", [{ text: "OK" }]);
        }
      }
    } catch (error: any) {
      setLoading(false);
      
      // Firebase auth errors are well formatted for users
      const errorMessage = error.message || "Failed to create account";
      const errorCode = error.code;
      
      let displayMessage = errorMessage;
      
      // Handle common Firebase error codes with more user-friendly messages
      if (errorCode === 'auth/email-already-in-use') {
        displayMessage = "This email is already in use. Please try logging in or use another email.";
      } else if (errorCode === 'auth/invalid-email') {
        displayMessage = "Please enter a valid email address.";
      } else if (errorCode === 'auth/operation-not-allowed') {
        displayMessage = "Account creation is currently disabled. Please try again later.";
      } else if (errorCode === 'auth/weak-password') {
        displayMessage = "Password is too weak. Please choose a stronger password.";
      }
      
      if (Platform.OS === "web") {
        window.alert(`Error: ${displayMessage}`);
      } else {
        Alert.alert("Error", displayMessage, [{ text: "OK" }]);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Step1
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            firstNameError={firstNameError}
            setFirstNameError={setFirstNameError}
            lastNameError={lastNameError}
            setLastNameError={setLastNameError}
            onNext={handleNext}
            onLogin={() => router.push("/Login")}
          />
        );
      case 2:
        return (
          <Step2
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            emailError={emailError}
            setEmailError={setEmailError}
            phoneError={phoneError}
            setPhoneError={setPhoneError}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <Step3
            username={username}
            setUsername={setUsername}
            usernameError={usernameError}
            setUsernameError={setUsernameError}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 4:
        return (
          <Step4
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            passwordError={passwordError}
            setPasswordError={setPasswordError}
            confirmPasswordError={confirmPasswordError}
            setConfirmPasswordError={setConfirmPasswordError}
            isPasswordVisible={isPasswordVisible}
            setIsPasswordVisible={setIsPasswordVisible}
            isConfirmPasswordVisible={isConfirmPasswordVisible}
            setIsConfirmPasswordVisible={setIsConfirmPasswordVisible}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 5:
        return (
          <Step5
            isChecked={isChecked}
            setIsChecked={setIsChecked}
            onBack={handleBack}
            onSubmit={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.view}>
      <StepIndicator currentStep={step} totalSteps={totalSteps} />
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>Sign Up</Text>
        <Text style={styles.heading2}>It's free and takes one minute!</Text>
      </View>
      <View style={styles.formContainer}>{renderStep()}</View>
      
      {/* Loading Overlay */}
      {loading && (
        <Modal transparent={true} animationType="fade">
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Creating Account...</Text>
          </View>
        </Modal>
      )}
    </View>
  );
}