import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import styles from './styles';

interface NavigationButtonsProps {
  step: number;
  onBack: () => void;
  onNext: () => void;
  isValid: boolean;
  isLastStep: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  step,
  onBack,
  onNext,
  isValid,
  isLastStep,
}) => (
  <View style={styles.buttonContainer}>
    {step > 1 && (
      <TouchableOpacity
        style={styles.navButton}
        onPress={onBack}
      >
        <Text style={styles.navButtonText}>Back</Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity
      style={[
        isLastStep ? styles.signupButton : styles.navButton,
        !isValid ? styles.disabledButton : null,
      ]}
      onPress={onNext}
      disabled={!isValid}
    >
      <Text style={isLastStep ? styles.signupButtonText : styles.navButtonText}>
        {isLastStep ? "Sign Up" : "Next"}
      </Text>
    </TouchableOpacity>
  </View>
);
  