import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { API_URL } from '../config.json';
import { fetchCurrentUser } from '@/utils/GetUser';

const Profile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
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
  const [activities, setActivities] = useState([]);

  // Fetch profile data using the utility function
  const loadProfile = async () => {
    setLoading(true);
    try {
      // Use the imported utility function
      const data = await fetchCurrentUser();
      console.log("User data from API:", data);

      // Update the user state with the backend data
      const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      setUser({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        name: fullName,
        username: data.username || '',
        bio: data.bio || '',
        preferences: data.preferences || [],
        friends: data.friends || [],
      });

      setProfilePic(data.profilePicUrl || 'https://placehold.co/150');
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load profile data."
      );
      
      // If there's an auth error, redirect to login
      if (error instanceof Error && error.message.includes("token")) {
        router.replace("/Login");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/user/activities`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load activities.');
    }
  };

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadActivities();
    }, [])
  );

  const shareProfile = async () => {
    try {
      const profileLink = `${API_URL}/profile/${user.username}`;
      await Clipboard.setStringAsync(profileLink);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(profileLink);
      } else {
        Alert.alert('Profile Link Copied!', 'Paste it anywhere to share.');
      }

      Toast.show({
        type: 'success',
        text1: 'Profile Link Copied!',
        text2: `Sent to a friend!`,
        position: 'top',
        visibilityTime: 2000,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share profile.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#42c8f5" />
        <Text style={styles.loadingText}>Loading profile data...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity>
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
          </TouchableOpacity>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.username}>@{user.username || '...'}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/friends')}>
            <FontAwesome5 name="users" size={20} color="black" />
            <Text style={styles.buttonText}>Friends</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={shareProfile}>
            <AntDesign name="sharealt" size={20} color="black" />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/Settings?edit=true')}>
            <Feather name="edit-3" size={20} color="black" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Activities section - commented out in your original code */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', padding: 20 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
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

export default Profile;