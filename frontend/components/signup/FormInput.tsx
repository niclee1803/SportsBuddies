import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import styles from './styles';

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
}) => (
  <View style={[styles.inputContainer, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, error ? styles.inputError : null]}
      value={value}
      onChangeText={onChangeText}
      placeholderTextColor="#888"
      {...props}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);