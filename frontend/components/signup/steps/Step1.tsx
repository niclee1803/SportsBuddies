import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FormInput } from '../FormInput';
import { NavigationButtons } from '../NavigationButtons';
import { validateName } from '../ValidationUtils';

interface Step1Props {
  firstName: string;
  setFirstName: (firstName: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  firstNameError: string;
  setFirstNameError: (error: string) => void;
  lastNameError: string;
  setLastNameError: (error: string) => void;
  onNext: () => void;
  onLogin: () => void;
}

export const Step1: React.FC<Step1Props> = ({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  firstNameError,
  setFirstNameError,
  lastNameError,
  setLastNameError,
  onNext,
  onLogin,
}) => {
  const isValid = !!firstName && !!lastName && !firstNameError && !lastNameError;

  return (
    <>
      <Text style={styles.subheading}>Step 1: Tell us your name</Text>
      <View style={styles.rowContainer}>
        <FormInput
          label="First Name"
          value={firstName}
          placeholder="John"
          error={firstNameError}
          onChangeText={(text) => {
            setFirstName(text);
            validateName(text, setFirstNameError);
          }}
          containerStyle={styles.halfInputContainer}
        />
        <FormInput
          label="Last Name"
          value={lastName}
          placeholder="Doe"
          error={lastNameError}
          onChangeText={(text) => {
            setLastName(text);
            validateName(text, setLastNameError);
          }}
          containerStyle={styles.halfInputContainer}
        />
      </View>

      <View style={styles.loginContainer}>
        <Text style={styles.haveAnAccountText}>Have an account? </Text>
        <TouchableOpacity onPress={onLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <NavigationButtons
              step={1}
              onNext={onNext}
              isValid={isValid} onBack={function (): void {
                  throw new Error('Function not implemented.');
              } } isLastStep={false}      />
    </>
  );
};


const styles = StyleSheet.create({
  subheading: { fontSize: 16, marginBottom: 20 },
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
  haveAnAccountText: { fontSize: 14 },
  loginButtonText: {
    color: "#42c8f5",
    fontSize: 14,
    fontWeight: "normal",
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});
