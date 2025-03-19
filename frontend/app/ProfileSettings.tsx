import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { app } from '../constants/firebaseConfig';  
import { useRouter } from 'expo-router';
import Template from '../components/Template'; 
import DropDownPicker from 'react-native-dropdown-picker';

const ProfileSettings: React.FC = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const router = useRouter();

  interface UserData {
    firstName: string;
    lastName: string;
    username: string;
    phone: string;
    email: string;
    preferences: {sports: string, fitnessLevel: string};
  }

  const [sportsOptions, setSportsOptions] = useState<string[]>([]);
  const [sportOpen, setSportOpen] = useState<boolean>(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);

  const [fitnessOptions, setFitnessOptions] = useState<string[]>([]);
  const [fitnessOpen, setFitnessOpen] = useState<boolean>(false);
  const [selectedFitness, setSelectedFitness] = useState<string | null>(null);

  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    email: '',
    preferences: {sports: '', fitnessLevel: ''},
  });

  const fetchFitnessOptions = async () => {
    try {
      const docRef = doc(db, 'fitnessLevels', 'types');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.levels)) {
          setFitnessOptions(data.levels);
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching fitness level options:', error);
    }
  };

  const fetchSportsOptions = async () => {
    try {
      const docRef = doc(db, 'sports', 'types');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && Array.isArray(data.sports)) {
          setSportsOptions(data.sports);
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching sports options:', error);
    }
  };

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
          preferences: { 
            sports: data.preferences?.sports || '', 
            fitnessLevel: data.preferences?.fitnessLevel || '' 
          }
        });
        setSelectedSport(data.preferences?.sports || null);
        setSelectedFitness(data.preferences?.fitnessLevel || null);
      } else {
        console.log('No such document!');
      }
    }
  };
 
  const handleSave = async () => {
    try {
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await updateDoc(userRef, { 
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          email: userData.email,
          preferences: { 
            sports: userData.preferences.sports, 
            fitnessLevel: userData.preferences.fitnessLevel 
          }
        });
        Alert.alert('Profile Updated', 'Your changes have been saved.');
        router.back();
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
          // delete function here, not implemented
        }
      ]
    );
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchSportsOptions();
    fetchFitnessOptions();
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

          <Text style={styles.label}>Preferred Sport 1</Text>
          <DropDownPicker
            listMode='SCROLLVIEW'
            open={sportOpen}
            value={selectedSport}
            items={sportsOptions.map(option => ({ label: option, value: option }))}
            setOpen={setSportOpen}
            setValue={(callback) => {
              const value = callback(selectedSport);
              setSelectedSport(value);
              setUserData({ 
                ...userData, 
                preferences: { 
                  ...userData.preferences,
                  sports: value || '' 
                } 
              });
            }}
            placeholder={userData.preferences.sports || "Select a sport"}
            containerStyle={{ width: '100%', marginBottom: 20 }}
            dropDownContainerStyle={{ backgroundColor: '#fafafa' }}
          />   

          <Text style={styles.label}>Sport 1 Proficiency</Text>
          <DropDownPicker
            listMode='SCROLLVIEW'
            open={fitnessOpen}
            value={selectedFitness}
            items={fitnessOptions.map(option => ({ label: option, value: option }))}
            setOpen={setFitnessOpen}
            setValue={(callback) => {
              const value = callback(selectedFitness);
              setSelectedFitness(value);
              setUserData({ 
                ...userData, 
                preferences: { 
                  ...userData.preferences,
                  fitnessLevel: value || '' 
                } 
              });
            }}
            placeholder={userData.preferences.fitnessLevel || "Select proficiency level"}
            containerStyle={{ width: '100%', marginBottom: 20 }}
            dropDownContainerStyle={{ backgroundColor: '#fafafa' }}
          />   
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
    borderColor: 'black',
    width: '100%',
  },
  saveButton: {
    width: "20%",
    height: 40,
    backgroundColor: "#42c8f5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  ButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  delAccButton: {
    width: "50%",
    height: 40,
    backgroundColor: "red",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
});

export default ProfileSettings;
