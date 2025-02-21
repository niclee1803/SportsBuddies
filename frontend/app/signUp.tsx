import React, { useState } from "react";
import { View, Text, Alert, StyleSheet, Platform } from "react-native";
import { useRouter } from "expo-router";
import { StepIndicator } from "../components/signup/StepIndicator";
import { Step1 } from "../components/signup/steps/Step1";
import { Step2 } from "../components/signup/steps/Step2";
import { Step3 } from "../components/signup/steps/Step3";
import { Step4 } from "../components/signup/steps/Step4";
import { Step5 } from "../components/signup/steps/Step5";
import {
  validateEmail,
  validatePhone,
  validateUsername,
  validatePassword,
} from "../components/signup/ValidationUtils";

interface SignUpProps {}

export default function SignUp(props: SignUpProps) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
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
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);

  // Error states
  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [phoneError, setPhoneError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleNext = async () => {
    let isValid = true;

    switch (step) {
      case 2:
        isValid =
          validateEmail(email, setEmailError) &&
          validatePhone(phone, setPhoneError);
        break;
      case 3:
        isValid = await validateUsername(username, setUsernameError);
        break;
      case 4:
        isValid = validatePassword(password, setPasswordError);
        if (isValid && password !== confirmPassword) {
          setConfirmPasswordError("Passwords do not match");
          isValid = false;
        }
        break;
    }

    if (isValid) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const userData = {
        firstName,
        lastName,
        email,
        phone,
        username,
        password,
      };

      console.log("User Data:", userData);

      if (Platform.OS === "web") {
        // For browser testing and debugging
        window.alert("Success! Your account has been created successfully!");
        router.push("/Login");
      } else {
        Alert.alert("Success!", "Your account has been created successfully!", [
          {
            text: "OK",
            onPress: () => router.push("/Login"),
          },
        ]);
      }
    } catch (error) {
      if (Platform.OS === "web") {
        window.alert(
          "There was an error creating your account. Please try again."
        );
      } else {
        Alert.alert(
          "Error",
          "There was an error creating your account. Please try again.",
          [{ text: "OK" }]
        );
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
            setEmailError={(error) => setEmailError(error || "")}
            phoneError={phoneError}
            setPhoneError={(error) => setPhoneError(error || "")}
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
            setUsernameError={(error) => setUsernameError(error || "")}
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
            setPasswordError={(error) => setPasswordError(error || "")}
            confirmPasswordError={confirmPasswordError}
            setConfirmPasswordError={(error) =>
              setConfirmPasswordError(error || "")
            }
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
    </View>
  );
}

const styles = StyleSheet.create({
  view: { marginTop: 100, justifyContent: "center", alignItems: "center" },
  headingContainer: { alignItems: "center", marginBottom: 10 },
  heading: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  heading2: { fontSize: 16, marginBottom: 20 },
  formContainer: {
    width: 400,
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
});
