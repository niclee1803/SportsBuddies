import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import NavigationBar from './NavigationBar';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
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