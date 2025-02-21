import React from 'react';
import { View, Text, TextInput, TextInputProps, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
    inputContainer: {
      marginBottom: 15,
    },
    label: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
    },
    input: {
      height: 40,
      backgroundColor: "#fff",
      width: "100%",
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 5,
    },
    inputError: {
      borderColor: 'red',
      borderWidth: 1,
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 5,
    },
  });