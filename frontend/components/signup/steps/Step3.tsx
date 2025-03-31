import React from 'react';
import { Text } from 'react-native';
import { FormInput } from '../FormInput';
import { NavigationButtons } from '../NavigationButtons';
import { validateUsername } from '../ValidationUtils';
import styles from '../styles';
import { useTheme } from '@/hooks/ThemeContext';

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
  const { colors } = useTheme();
  return (
    <>
      <Text style={[styles.subheading, {color:colors.text}]}>Step 3: Create a Username</Text>
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
