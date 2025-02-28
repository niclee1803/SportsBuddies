import React from 'react';
import { Text } from 'react-native';
import { FormInput } from '../FormInput';
import { NavigationButtons } from '../NavigationButtons';
import { validateUsername } from '../ValidationUtils';
import styles from '../styles';

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
