import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome5, AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { API_URL } from '../config.json';

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
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get the token from AsyncStorage
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Error', 'User authentication token not available. Please log in again.');
          router.replace('/Login');
          return;
        }

        // Fetch user data from the backend
        const response = await fetch(`${API_URL}/user/current_user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch user data');
        }

        const data = await response.json();

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

        setProfilePic(data.profilePicUrl || profilePic);
      } catch (error) {
        Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong.');
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
        Alert.alert('Error', error instanceof Error ? error.message : 'Something went wrong.');
      }
    };

    loadProfile();
    loadActivities();
  }, [router]);

  const shareProfile = async () => {
    try {
      const profileLink = `${API_URL}/profile/${user.username}`;
      await Clipboard.setStringAsync(profileLink);
      Clipboard.setString(profileLink);
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

        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
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
                  <FontAwesome5 name="soccer-ball-o" size={18} color="black" />
                  <Text>{activity.sport}</Text>
                </View>
                <View style={styles.activityDetails}>
                  <Feather name="bar-chart-2" size={18} color="black" />
                  <Text>{activity.level}</Text>
                </View>
                <Text style={styles.activityTags}>Tags: {activity.tags.join(', ')}</Text>
              </View>
            ))
          )}
        </View> */}
      </ScrollView>
    </View>
  );
};

export default Profile;