import React from "react";
import { Text } from "react-native";
import { PasswordInput } from "../PasswordInput";
import { NavigationButtons } from "../NavigationButtons";
import { validatePassword } from "../ValidationUtils";
import styles from "../styles";

interface Step4Props {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  passwordError: string | null;
  setPasswordError: (error: string | null) => void;
  confirmPasswordError: string | null;
  setConfirmPasswordError: (error: string | null) => void;
  isPasswordVisible: boolean;
  setIsPasswordVisible: (visible: boolean) => void;
  isConfirmPasswordVisible: boolean;
  setIsConfirmPasswordVisible: (visible: boolean) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step4: React.FC<Step4Props> = ({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  passwordError,
  setPasswordError,
  confirmPasswordError,
  setConfirmPasswordError,
  isPasswordVisible,
  setIsPasswordVisible,
  isConfirmPasswordVisible,
  setIsConfirmPasswordVisible,
  onBack,
  onNext,
}) => {
  const isValid =
    !!password && !!confirmPassword && !passwordError && !confirmPasswordError;

  return (
    <>
      <Text style={styles.subheading}>Step 4: Secure Your Account</Text>
      <PasswordInput
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          validatePassword(text, setPasswordError);
        }}
        error={passwordError || undefined}
        isVisible={isPasswordVisible}
        setIsVisible={setIsPasswordVisible}
        placeholder="Enter your password"
        label="Password"
      />
      <PasswordInput
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (text !== password) {
            setConfirmPasswordError("Passwords do not match");
          } else {
            setConfirmPasswordError("");
          }
        }}
        error={confirmPasswordError || undefined}
        isVisible={isConfirmPasswordVisible}
        setIsVisible={setIsConfirmPasswordVisible}
        placeholder="Confirm your password"
        label="Confirm Password"
      />
      <NavigationButtons
        step={4}
        onBack={onBack}
        onNext={onNext}
        isValid={isValid}
        isLastStep={false}
      />
    </>
  );
};