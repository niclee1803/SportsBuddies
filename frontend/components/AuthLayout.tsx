import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import NavigationBar from './NavigationBar';
import { useTheme } from '@/hooks/ThemeContext';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {children}
      </View>
      <NavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    marginTop: 50,
  },
  content: {
    flex: 1,
    paddingBottom: 2, // Add some padding to prevent content from being hidden behind the nav bar
  },
});

export default AuthLayout;