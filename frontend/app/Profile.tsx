import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Clipboard from '@react-native-clipboard/clipboard';
import { Feather, AntDesign, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { query, collection, where, getDocs, doc, getDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getStorage } from 'firebase/storage';
import { db, auth, storage } from '../constants/firebaseConfig';
import Template from '../components/Template';
import { onAuthStateChanged } from 'firebase/auth';
import { DocumentData } from "firebase/firestore";
import Toast from 'react-native-toast-message';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { getAuth } from 'firebase/auth';
import { app } from '../constants/firebaseConfig'; 

type Activity = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  sport: string;
  level: string;
  tags: string[];
};

const Profile = () => {
  const router = useRouter();
  const [profilePic, setProfilePic] = useState('https://placehold.co/150');
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    name: '',   
    username: '',
    bio: '',
    preferences: [],
    friends: [],
  });
  
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("User not logged in", "Please sign in to access your profile.");
          return;
        }
    
        const userRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userRef);
    
        if (docSnap.exists()) {
          const data = docSnap.data();
          const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim(); // ✅ Concatenate First & Last Name
    
          setUser({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            name: fullName,   // ✅ Store full name
            username: data.username || "",
            bio: data.bio || "",
            preferences: data.preferences || [],
            friends: data.friends || [],
          });
    
          setProfilePic(data.profilePicUrl || profilePic);
        } else {
          Alert.alert("Profile not found");
        }
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong.");
      }
    };
    
    


    const handleProfilePictureUpdate = async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permissions required', 'Please allow access to select a photo.');
          return;
        }
    
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 1,
        });
    
        if (!result.canceled && result.assets.length > 0) {
          const imageUri = result.assets[0].uri;
          const response = await fetch(imageUri);
          const blob = await response.blob();
          const storage = getStorage(app);
          const storageRef = ref(storage, `profilePictures/${auth.currentUser?.uid}_${Date.now()}`);
    
          await uploadBytes(storageRef, blob);
          const downloadURL = await getDownloadURL(storageRef);
    
         
          if (auth.currentUser) {
            const userRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userRef, { profilePicUrl: downloadURL });
            setProfilePic(downloadURL);
            Alert.alert('Profile Picture Updated');
            
            loadProfile();; 
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Could not update profile picture.');
      }
    };
    
    

    const loadActivities = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const activitiesQuery = query(
          collection(db, "activities"),
          where("userId", "==", currentUser.uid)
        );

        const activitySnapshots = await getDocs(activitiesQuery);

        const userActivities: Activity[] = activitySnapshots.docs.map((doc) => ({
          id: doc.id,
          title: doc.data().title ?? "",
          date: doc.data().date ?? "",
          time: doc.data().time ?? "",
          location: doc.data().location ?? "",
          sport: doc.data().sport ?? "",
          level: doc.data().level ?? "",
          tags: Array.isArray(doc.data().tags) ? doc.data().tags : [],
        }));

        setActivities(userActivities);
      } catch (error) {
        Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong.");
      }
    };

    loadProfile();
    loadActivities();
  }, []);

  const shareProfile = async () => {
    try {
      const profileLink = `https://myapp.com/Profile/${user.username}`; 
      Clipboard.setString(profileLink); 
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(profileLink);
      } else {
        Alert.alert("Profile Link Copied!", "Paste it anywhere to share.");
      }
  
     
      Toast.show({
        type: 'success',
        text1: 'Profile Link Copied!',
        text2: `Sent to a friend!`,
        position: 'top',
        visibilityTime: 2000,
      });
  
    } catch (error) {
      Alert.alert("Error", "Could not share profile.");
    }
  };
  

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2', padding: 20 },
    header: { alignItems: 'center', marginBottom: 20 },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: 'black' },
    name: { fontSize: 22, fontWeight: 'bold', marginTop: 8 },
    username: { color: 'gray', fontSize: 16, marginBottom: 10 },
  
    buttonContainer: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginVertical: 10 },
    button: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e0e0e0', padding: 10, borderRadius: 20 },
    buttonText: { marginLeft: 5, fontSize: 16 },
  
    section: { marginTop: 20 },
    sectionTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
    noActivityText: { textAlign: 'center', color: 'gray' },
    
    activityCard: { backgroundColor: 'white', padding: 15, borderRadius: 10, shadowOpacity: 0.2, shadowRadius: 5, marginBottom: 10 },
    activityHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    activityUserImage: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
    activityUserName: { fontWeight: 'bold' },
    activityTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    activityDetails: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 5 },
    activityTags: { marginTop: 10, fontStyle: 'italic' },
  });
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Image source={{ uri: profilePic }} style={styles.profileImage} />
        </TouchableOpacity>
        <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.username}>@{user.username || "..."}</Text>
      </View>

      <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.push('/friends')}>
      <FontAwesome name="users" size={20} color="black" />
      <Text style={styles.buttonText}>Friends</Text>
      </TouchableOpacity>


        <TouchableOpacity 
          style={styles.button} 
          onPress={shareProfile}  
>
        <AntDesign name="sharealt" size={20} color="black" />
        <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.push('/Settings?edit=true')}>
        <Feather name="edit-3" size={20} color="black" />
        <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}></Text>
        {activities.length === 0 ? (
          <Text style={styles.noActivityText}>No recent activities</Text>
        ) : (
          activities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Image source={{ uri: profilePic }} style={styles.activityUserImage} />
                <Text style={styles.activityUserName}>{user.name}</Text>
              </View>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <View style={styles.activityDetails}>
                <Ionicons name="calendar" size={18} color="black" />
                <Text>{activity.date}, {activity.time}</Text>
              </View>
              <View style={styles.activityDetails}>
                <Ionicons name="location" size={18} color="black" />
                <Text>{activity.location}</Text>
              </View>
              <View style={styles.activityDetails}>
                <FontAwesome name="soccer-ball-o" size={18} color="black" />
                <Text>{activity.sport}</Text>
              </View>
              <View style={styles.activityDetails}>
                <Feather name="bar-chart-2" size={18} color="black" />
                <Text>{activity.level}</Text>
              </View>
              <Text style={styles.activityTags}>Tags: {activity.tags.join(", ")}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default Profile;
