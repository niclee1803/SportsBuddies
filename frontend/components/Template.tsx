import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomNavigationBar from '../components/NavigationBar'; 

interface TemplateProps {
  children: React.ReactNode; 
}

const Template: React.FC<TemplateProps> = ({ children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {children} {}
      </View>
      <BottomNavigationBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9', 
  },
  content: {
    flex: 1, 
  },
});

export default Template;
