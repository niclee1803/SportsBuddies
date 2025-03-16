import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import Template from '../components/Template';
import { FontAwesome } from '@expo/vector-icons';


const Profile = () => {
  // Dummy data—replace with backend data later
  const user = {
    name: 'Roopa',
    username: '@sportsbuddy',
    bio: 'Passionate about sports!',
    profileImage: 'https://placehold.co/150',
    preferences: ['Badminton', 'Yoga', 'Running'],
    friends: ['Alice', 'Bob', 'Charlie'],
  };

  return (
    <Template>
      <ScrollView style={styles.container}>
        {/* Profile Picture & Name */}
        <View style={styles.header}>
          <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>

        {/* Bio */}
        <Text style={styles.bio}>{user.bio}</Text>

        {/* Buttons: Edit & Share */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.editButton}>
            <FontAwesome name="edit" size={16} color="#fff" />
            <Text style={styles.buttonText}> Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton}>
            <FontAwesome name="share-alt" size={16} color="#fff" />
            <Text style={styles.buttonText}> Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.preferences}>
            {user.preferences.map((pref, idx) => (
              <View key={idx} style={styles.preferenceChip}>
                <Text style={styles.preferenceText}>{pref}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Friends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends</Text>
          {user.friends.map((friend, idx) => (
            <View key={idx} style={styles.friendItem}>
              <FontAwesome name="user-circle" size={24} color="#007bff" />
              <Text style={styles.friendText}>{friend}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Template>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  username: {
    color: 'gray',
    marginBottom: 10,
  },
  bio: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 15,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  shareButton: {
    backgroundColor: '#28a745',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  preferences: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  preferenceChip: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  preferenceText: {
    fontSize: 14,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },
  friendText: {
    fontSize: 15,
  },
});

export default Profile;
