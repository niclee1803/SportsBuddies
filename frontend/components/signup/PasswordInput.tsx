import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { FormInput } from './FormInput';

interface PasswordInputProps {
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    isVisible: boolean;
    setIsVisible: (isVisible: boolean) => void;
    placeholder: string;
    label: string;  // Add the label prop here
  }
  
  export const PasswordInput: React.FC<PasswordInputProps> = ({
    value,
    onChangeText,
    error,
    isVisible,
    setIsVisible,
    placeholder,
    label,  // Destructure the label prop
  }) => (
    <View style={styles.inputContainer}>
      <FormInput
        label={label}  // Pass label here
        value={value}
        onChangeText={onChangeText}
        error={error}
        secureTextEntry={!isVisible}
        placeholder={placeholder}
        containerStyle={styles.inputContainer}
      />
      <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Icon
          name={isVisible ? "visibility-off" : "visibility"}
          size={24}
          color="#888"
        />
      </TouchableOpacity>
    </View>
  );
  

const styles = StyleSheet.create({
    inputContainer: {
        marginBottom: 15,
      },
      eyeIcon: { position: "absolute", right: 10, top: 30 }
});
