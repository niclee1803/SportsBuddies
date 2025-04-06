import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size: number;
}

const Avatar: React.FC<AvatarProps> = ({ uri, name, size }) => {
  const getInitials = () => {
    if (!name) return '?';
    
    const nameArray = name.split(' ').filter(n => n.length > 0);
    if (nameArray.length === 0) return '?';
    
    if (nameArray.length === 1) {
      return nameArray[0].charAt(0).toUpperCase();
    }
    
    return (
      nameArray[0].charAt(0).toUpperCase() + 
      nameArray[nameArray.length - 1].charAt(0).toUpperCase()
    );
  };
  
  const getRandomColor = () => {
    const colors = [
      '#4285F4', // blue
      '#34A853', // green
      '#FBBC05', // yellow
      '#EA4335', // red
      '#8142FF', // purple
      '#00ACC1', // cyan
      '#FF5722', // deep orange
      '#607D8B'  // blue grey
    ];
    
    if (!name) return colors[0];
    
    // Use name to generate a consistent color
    const charCodeSum = name.split('').reduce(
      (sum, char) => sum + char.charCodeAt(0), 0
    );
    
    return colors[charCodeSum % colors.length];
  };
  
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: getRandomColor()
  };
  
  const textStyle = {
    fontSize: size * 0.4,
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, containerStyle]}
      />
    );
  }
  
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.initials, textStyle]}>{getInitials()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: 'white',
    fontWeight: 'bold',
  },
  image: {
    resizeMode: 'cover',
  }
});

export default Avatar;