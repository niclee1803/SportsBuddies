import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

interface NavigationBarProps {
  // Add props here
}

const NavigationBar: React.FC<NavigationBarProps> = () => {
  const router = useRouter();

  const handleNavigation = (route: '/Home' | '/Groups' | '/Create' | '/Profile' | '/Settings') => {
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('/Home')}>
        <Icon name="home" size={30} color="#000" />
        <Text style={styles.itemText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('/Groups')}>
        <Icon name="groups" size={30} color="#000" />
        <Text style={styles.itemText}>Groups</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('/Create')}>
        <Icon name="add-circle-outline" size={30} color="#000" />
        <Text style={styles.itemText}>Create</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('/Profile')}>
        <Icon name="person" size={30} color="#000" />
        <Text style={styles.itemText}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={() => handleNavigation('/Settings')}>
        <Icon name="settings" size={30} color="#000" />
        <Text style={styles.itemText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#5E83C6',
    height: 80,
    paddingBottom: 20,
  },
  item: {
    alignItems: 'center',
  },
  itemText: {
      color: '#000', 
  }
});

export default NavigationBar;
