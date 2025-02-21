import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
    disabledButton: { backgroundColor: "#ccc" },
    buttonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: 20,
    },
    navButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 5 },
    navButtonText: { fontSize: 16 },
    signupButton: { backgroundColor: "#42c8f5", padding: 10, borderRadius: 5 },
    signupButtonText: { color: "#fff", fontWeight: "bold" },
  });
  