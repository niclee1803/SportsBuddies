import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../constants/firebaseConfig';  
import { useRouter } from 'expo-router';
import Template from '../components/Template'; 

const ProfileSettings: React.FC = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
  });

  const fetchUserData = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: data.username || '',
          phone: data.phone || '',
          email: data.email || auth.currentUser.email || '',
        });
      } else {
        console.log('No such document!');
      }
    }
  };

  const handleSave = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, userData);
        Alert.alert('Profile Updated', 'Your changes have been saved.');
        router.back(); // Go back after saving
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          // delete function here
        }
      ]
    );
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <Template>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => {}} style={styles.profileContainer}>
          <Image
            source={{
              uri: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1642355.png',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.changePicText}>Change Pic</Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <View style={styles.nameRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={userData.firstName}
                onChangeText={(text) => setUserData({ ...userData, firstName: text })}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={userData.lastName}
                onChangeText={(text) => setUserData({ ...userData, lastName: text })}
              />
            </View>
          </View>

          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={userData.username}
              onChangeText={(text) => setUserData({ ...userData, username: text })}
            />
          </View>

          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
            />
          </View>

          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.ButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.delAccButton} onPress={handleDeleteAccount}>
          <Text style={styles.ButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </Template>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    width: '100%',
    backgroundColor: '#D3D3D3',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 200,
    borderColor: 'black',
    borderWidth: 1,
  },
  changePicText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'blue',
  },
  inputGroup: {
    width: '90%',
    paddingHorizontal: 20,
    gap: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputWrapper: {
    width: '48%',
    marginBottom: 10,
  },
  fullInputWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#42c8f5',
    borderRadius: 5,
    paddingVertical: 12,
    width: '90%',
    marginTop: 30,
    alignItems: 'center',
  },
  ButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  delAccButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 5,
    paddingVertical: 12,
    width: '90%',
    marginTop: 15,
    marginBottom: 30,
    alignItems: 'center',
  },
});

export default ProfileSettings;
