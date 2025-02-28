import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { FormInput } from '../FormInput';
import { NavigationButtons } from '../NavigationButtons';
import { validateName } from '../ValidationUtils';
import styles from '../styles';

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