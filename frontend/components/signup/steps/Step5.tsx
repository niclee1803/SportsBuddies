import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Checkbox from "expo-checkbox";
import { NavigationButtons } from '../NavigationButtons';
import styles from '../styles';

interface Step5Props {
  isChecked: boolean;
  setIsChecked: (checked: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const Step5: React.FC<Step5Props> = ({
  isChecked,
  setIsChecked,
  onBack,
  onSubmit,
}) => (
  <>
    <Text style={styles.subheading}>Step 5: Accept Terms</Text>
    <View style={styles.termsContainer}>
      <Checkbox
        value={isChecked}
        onValueChange={setIsChecked}
        color={isChecked ? "#42c8f5" : undefined}
      />
      <Text style={styles.termsText}> I accept the </Text>
      <TouchableOpacity
        onPress={() => alert("Open Terms & Conditions")}
      >
        <Text style={styles.termsLink}>Terms & Conditions</Text>
      </TouchableOpacity>
    </View>
    <NavigationButtons
      step={5}
      onBack={onBack}
      onNext={onSubmit}
      isValid={isChecked}
      isLastStep
    />
  </>
);
