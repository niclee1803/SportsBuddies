import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => (
  <View style={styles.statusBarContainer}>
    {Array.from({ length: totalSteps }, (_, index) => (
      <View
        key={index}
        style={[
          styles.statusBarStep,
          { backgroundColor: currentStep > index ? "#42c8f5" : "#ddd" },
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
    statusBarContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "80%",
      marginBottom: 20,
    },
    statusBarStep: {
      flex: 1,
      height: 5,
      marginHorizontal: 3,
      borderRadius: 5,
    },
  });