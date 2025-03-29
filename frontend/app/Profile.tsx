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
import ActivityCard from '@/components/activity/ActivityCard';
import { Activity } from '@/types/activity';
import AuthLayout from '@/components/AuthLayout';

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
  const [activeTab, setActiveTab] = useState('created'); // 'created' or 'joined'
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [joinedActivities, setJoinedActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

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
    setActivitiesLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Load created activities - UPDATED ENDPOINT
      const createdResponse = await fetch(`${API_URL}/activity/my/created`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (createdResponse.ok) {
        const createdData = await createdResponse.json();
        setCreatedActivities(createdData || []);
      }

      // Load joined activities - UPDATED ENDPOINT
      const joinedResponse = await fetch(`${API_URL}/activity/my/participating`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (joinedResponse.ok) {
        const joinedData = await joinedResponse.json();
        setJoinedActivities(joinedData || []);
      }
      
    } catch (error) {
      console.error("Error fetching activities:", error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to load activities.');
    } finally {
      setActivitiesLoading(false);
    }
  };

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

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadActivities();
    }, [])
  );

  return (
    <AuthLayout>
      <ScrollView style={styles.container}>
        {/* Your existing header JSX */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
          </TouchableOpacity>
          <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.username}>@{user.username || '...'}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={shareProfile}>
            <AntDesign name="sharealt" size={20} color="black" />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/ProfileSettings')}>
            <Feather name="edit-3" size={20} color="black" />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        </View>
        {/* Activity Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'created' && styles.activeTab]} 
            onPress={() => setActiveTab('created')}
          >
            <Text style={[styles.tabText, activeTab === 'created' && styles.activeTabText]}>
              Created
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'joined' && styles.activeTab]} 
            onPress={() => setActiveTab('joined')}
          >
            <Text style={[styles.tabText, activeTab === 'joined' && styles.activeTabText]}>
              Joined
            </Text>
          </TouchableOpacity>
        </View>

        {/* Activities List */}
        <View style={styles.activitiesContainer}>
          {activitiesLoading ? (
            <ActivityIndicator size="small" color="#42c8f5" style={styles.activitiesLoader} />
          ) : activeTab === 'created' ? (
            createdActivities.length > 0 ? (
              createdActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))
            ) : (
              <Text style={styles.noActivityText}>You haven't created any activities yet.</Text>
            )
          ) : joinedActivities.length > 0 ? (
            joinedActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
          ) : (
            <Text style={styles.noActivityText}>You haven't joined any activities yet.</Text>
          )}
        </View>
      </ScrollView>
    </AuthLayout>
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
  
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  activeTabText: {
    color: '#42c8f5',
    fontWeight: 'bold',
  },
  
  // Activities styles
  activitiesContainer: {
    marginTop: 10,
  },
  activitiesLoader: {
    marginTop: 20,
  },
  noActivityText: { 
    textAlign: 'center', 
    color: 'gray',
    marginTop: 30,
    fontSize: 16,
    fontStyle: 'italic'
  },
});

export default Profile;