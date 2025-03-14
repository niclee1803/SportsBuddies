import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, Alert, Platform } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../constants/firebaseConfig';  
import { useRouter } from 'expo-router';
import Template from '../components/Template'; 

const Settings = () => {
  const [user, setUser] = useState<any>(null); 
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid); 
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUser(userSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserData();
  }, [auth.currentUser, db]);

  const handleLogoutConfirmation = () => {
    //alert dont work for web so we have a diff logout confirmation for web view
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        handleLogout();
      }
    }
      else{

    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          onPress: handleLogout 
        }
      ]
    );
    }
  };
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/Login'); // Navigate to the login page after logout
    } catch (error: any) {
      console.error('Logout failed:', error.message);
    }
  };

  return ( // profile pic part is not working, need to connect to firebase storage, added placeholder to see how it looks like
    <Template>
      <View style={styles.container}>
        {user && (
          <View style={styles.profileContainer}>
            <Image source={{ uri: "https://cdn.nba.com/headshots/nba/latest/1040x760/1642355.png" }} style={styles.profileImage} /> 
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.username}>@{user.username}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.settingItem}>
          <Text style={[styles.settingText,{fontWeight:'bold'}]}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Language</Text>
          <Text>ENG</Text>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutConfirmation}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Template>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#D9D9D9',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'black'
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: 'gray',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#42c8f5',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

export default Settings;
