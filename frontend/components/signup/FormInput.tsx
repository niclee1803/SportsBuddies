import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import styles from './styles';
import { useTheme } from '@/hooks/ThemeContext';

interface FormInputProps extends TextInputProps {
  label: string;
  value: string;
  error?: string;
  containerStyle?: object;
  onChangeText: (text: string) => void;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  label, 
  value, 
  onChangeText, 
  error, 
  containerStyle,
  ...props 
}) => {
  const { colors } = useTheme(); 

  return (
    <View style={[[styles.inputContainer, containerStyle], {backgroundColor: "colors.card"}]}>
      <Text style={[styles.label, { color: colors.text}]}>{label}</Text>
      <TextInput
        style={[[styles.input, error ? styles.inputError : null], { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor="#888"
        {...props}
      />
      {error ? <Text style={[styles.errorText, { color: "red" }]}>{error}</Text> : null}
    </View>
  );
};