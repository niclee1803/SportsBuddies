import React from 'react';
import { View } from 'react-native';
import styles from './styles';
import { useTheme } from '@/hooks/ThemeContext';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.statusBarContainer, { backgroundColor: colors.background }]}>
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
};