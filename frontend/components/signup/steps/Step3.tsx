import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { FormInput } from '../FormInput';
import { NavigationButtons } from '../NavigationButtons';
import { validateUsername } from '../ValidationUtils';

interface Step3Props {
  username: string;
  setUsername: (username: string) => void;
  usernameError: string | null;
  setUsernameError: (error: string | null) => void;
  onBack: () => void;
  onNext: () => void;
}

export const Step3: React.FC<Step3Props> = ({
  username,
  setUsername,
  usernameError,
  setUsernameError,
  onBack,
  onNext,
}) => {
  const isValid = username && !usernameError;

  return (
    <>
      <Text style={styles.subheading}>Step 3: Create a Username</Text>
      <FormInput
        label="Username"
        value={username}
        placeholder="yourusername"
        error={usernameError || undefined}
        onChangeText={(text) => {
          setUsername(text);
          validateUsername(text, setUsernameError);
        }}
        autoCapitalize="none"
      />
      <NavigationButtons
              step={3}
              onBack={onBack}
              onNext={onNext}
              isValid={!!isValid} isLastStep={false}      />
    </>
  );
};


const styles = StyleSheet.create({
    subheading: { fontSize: 16, marginBottom: 20 },
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
  });