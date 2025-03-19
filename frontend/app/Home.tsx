import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';


const Home = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/*Made the back button to go back to login page */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/Login')}>
      <Ionicons name="arrow-back" size={30} color="black" />
      </TouchableOpacity>


      <Text style={styles.title}>Dashboard</Text>

      {/*Dashboard Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => router.push('/Feed')}>
        <FontAwesome5 name="home" size={20} color="black" />
        <Text style={styles.buttonText}>Feed</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/Notifications')}>
        <Ionicons name="notifications-outline" size={20} color="black" />
        <Text style={styles.buttonText}>Notifications</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/Groups')}>
        <FontAwesome5 name="users" size={20} color="black" />
        <Text style={styles.buttonText}>Group Activities</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/SearchActivity')}>
        <FontAwesome5 name="search" size={20} color="black" />
        <Text style={styles.buttonText}>Search Activity</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/friends')}>
        <FontAwesome5 name="user-friends" size={20} color="black" />
        <Text style={styles.buttonText}>Friends</Text>
      </TouchableOpacity>

     
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => router.push('/Home')} style={styles.navButton}>
          <FontAwesome5 name="home" size={24} color="black" />
          <Text>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Groups')} style={styles.navButton}>
          <FontAwesome5 name="users" size={24} color="black" />
          <Text>Groups</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Create')} style={styles.navButton}>
          <Ionicons name="add-circle-outline" size={24} color="black" />
          <Text>Create</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Profile')} style={styles.navButton}>
          <FontAwesome5 name="user-circle" size={24} color="black" />
          <Text>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/Settings')} style={styles.navButton}>
          <Ionicons name="settings-outline" size={24} color="black" />
          <Text>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7B9ACC',
    alignItems: 'center',
    paddingTop: 40,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D3D3D3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '80%',
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#7B9ACC',
    padding: 10,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  navButton: {
    alignItems: 'center',
  },
});

export default Home;
