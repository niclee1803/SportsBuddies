import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchCurrentUser } from '@/utils/GetUser';
import AuthLayout from '@/components/AuthLayout';
import { useTheme } from '@/hooks/ThemeContext';



const Settings = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const router = useRouter();
  

  // Use the theme context
  const { isDarkMode, toggleTheme, colors } = useTheme();

  // Fetch user data from API
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Use the imported utility function
      const userData = await fetchCurrentUser();
      console.log("User data from API:", userData);
      
      // Set user data from API response
      setUser(userData);
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

  // Fetch user data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleLogoutConfirmation = () => {
    // Alert doesn't work for web so we have a different logout confirmation for web view
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to logout?');
      if (confirmLogout) {
        handleLogout();
      }
    } else {
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
      // Clear token from AsyncStorage
      await AsyncStorage.removeItem('token');
      router.replace('/Login'); // Navigate to the login page after logout
    } catch (error: any) {
      console.error('Logout failed:', error.message);
      Alert.alert('Logout Failed', 'An error occurred during logout.');
    }
  };

  const gotoProfileSettings = () => {
    router.push('/ProfileSettings');
  };

  if (loading) {
    return (
      <AuthLayout>
        <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading settings...</Text>
        </View>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {user && (
          <View style={styles.profileContainer}>
            <Image 
              source={{ 
                uri: user.profilePicUrl || "https://placehold.co/150"
              }} 
              style={styles.profileImage} 
            /> 
            <Text style={[styles.name, { color: colors.text }]}>{user.firstName} {user.lastName}</Text>
            <Text style={[styles.username, { color: colors.secondary }]}>@{user.username}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.settingItem}>
          <Text 
            style={[styles.editProfileButton, {fontWeight: 'bold'}, 
              {fontSize: 16}, 
              { backgroundColor: colors.primary},{ color: 'black' } ]} 
            onPress={gotoProfileSettings}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>

        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          <Switch 
            value={isDarkMode} 
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'} 
          />
        </View>

        <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
          <Text style={{ color: colors.secondary }}>ENG</Text>
        </TouchableOpacity>

        <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
          <Switch 
            value={notificationsEnabled} 
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={notificationsEnabled ? '#f5dd4b' : '#f4f3f4'} 
          />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutConfirmation}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  // Keep your existing styles
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
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
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: 'orange',
    borderRadius: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  editProfileButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',

  },
  logoutButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;