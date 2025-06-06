
import React, { createContext, useState, useContext, useEffect, act } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

// Define your color themes
export const lightColors = {
  background: '#f0f0f0',
  text: '#000000',
  smalltext: "#333333",
  primary: '#42c8f5',
  secondary: '#737373',
  card: '#F9F9F9',
  border: '#CCCCCC',
  notification: '#FF3B30',
  placeholder: '#888888',
  profilebutton: "#e0e0e0",
  actdetailsheader: "#2c3e50",
};

export const darkColors = {
  background: '#121212',
  text: '#FFFFFF',
  smalltext: "#c9c9c9",
  primary: '#2196F3',
  secondary: '#b0b0b0',
  card: '#1E1E1E',
  border: '#333333',
  notification: '#FF453A',
  placeholder: '#1E1E1E',
  profilebutton: "#1E1E1E",
  actdetailsheader: "#2196F3",
};


type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: typeof lightColors;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  colors: lightColors
});

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Load saved theme preference on component mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // Use system preference if no saved preference
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, [systemColorScheme]);
  
  // Toggle theme function
  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    // Save theme preference
    try {
      await AsyncStorage.setItem('themePreference', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  // Get current theme colors
  const colors = isDarkMode ? darkColors : lightColors;
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
