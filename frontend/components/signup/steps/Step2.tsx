import React from 'react';
import { Text } from 'react-native';
import { FormInput } from '../FormInput';
import { NavigationButtons } from '../NavigationButtons';
import { validateEmail, validatePhone } from '../ValidationUtils';
import styles from '../styles';

interface Step2Props {
  email: string;
  setEmail: (email: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  emailError: string | null;
  setEmailError: (error: string | null) => void;
  phoneError: string | null;
  setPhoneError: (error: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step2: React.FC<Step2Props> = ({
  email,
  setEmail,
  phone,
  setPhone,
  emailError,
  setEmailError,
  phoneError,
  setPhoneError,
  onBack,
  onNext,
}) => {
    const isValid = !!email && !!phone && !emailError && !phoneError;
  return (
    <>
      <Text style={styles.subheading}>Step 2: Contact Information</Text>
      <FormInput
        label="Email"
        value={email}
        placeholder="hello@example.com"
        error={emailError || undefined}
        onChangeText={(text) => {
          setEmail(text);
          validateEmail(text, setEmailError);
        }}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType='emailAddress'
      />
      <FormInput
        label="Phone Number"
        value={phone}
        placeholder="8/9xxxxxxx"
        error={phoneError || undefined}
        onChangeText={(text) => {
          setPhone(text);
          validatePhone(text, setPhoneError);
        }}
        keyboardType="phone-pad"
      />
      <NavigationButtons
              step={2}
              onBack={onBack}
              onNext={onNext}
              isValid={isValid} isLastStep={false}      />
    </>
  );
};