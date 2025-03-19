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

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false); // New loading state

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

  // Updated handleNext: assumes duplicate validations (for email, username, phone) have been performed in their respective steps.
  const handleNext = async () => {
    let isValid = true;

    switch (step) {
      case 2:
        // In Step2, duplicate email check is done onBlur.
        // Here, we re-run the phone duplicate check as a fallback.
        if (emailError) {
          isValid = false;
        } else {
          isValid = await validatePhone(phone, setPhoneError);
        }
        break;
      case 3:
        // In Step3, duplicate username check is assumed to have run onBlur.
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
    setLoading(true); // Show loading overlay

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          username,
          password,
        }),
      });

      const data = await response.json();

      setLoading(false); // Hide loading overlay before alert

      if (response.ok) {
        if (Platform.OS === "web") {
          window.alert("Success! Your account has been created successfully!");
          router.push("/Login");
        } else {
          Alert.alert("Success!", "Your account has been created successfully!", [
            { text: "OK", onPress: () => router.push("/Login") },
          ]);
        }
      } else {
        if (Platform.OS === "web") {
          window.alert(`Error: ${data.error}`);
        } else {
          Alert.alert("Error", data.error, [{ text: "OK" }]);
        }
      }
    } catch (error: any) {
      setLoading(false); // Hide loading overlay on error

      if (Platform.OS === "web") {
        window.alert(`Error: ${error.message}`);
      } else {
        Alert.alert("Error", error.message, [{ text: "OK" }]);
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