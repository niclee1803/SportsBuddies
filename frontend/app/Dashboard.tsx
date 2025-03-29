import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AuthLayout from '@/components/AuthLayout';
import { fetchCurrentUser } from '@/utils/GetUser';

const Dashboard = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user data on component mount
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await fetchCurrentUser();
        if (userData) {
          setUserName(userData.firstName || '');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const navigationOptions = [
    {
      id: 'feed',
      label: 'Feed',
      description: 'Browse local sports activities',
      icon: <FontAwesome5 name="stream" size={32} color="#42c8f5" />,
      onPress: () => router.push('/Feed')
    },
    {
      id: 'alerts',
      label: 'Alerts',
      description: 'View your notifications',
      icon: <Ionicons name="notifications-outline" size={32} color="#42c8f5" />,
      onPress: () => router.push('/Alerts')
    },
    {
      id: 'profile',
      label: 'Profile & Activities',
      description: 'Manage your profile and activities',
      icon: <FontAwesome5 name="user-circle" size={32} color="#42c8f5" />,
      onPress: () => router.push('/Profile')
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Adjust app preferences',
      icon: <Ionicons name="settings-outline" size={32} color="#42c8f5" />,
      onPress: () => router.push('/Settings')
    }
  ];

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#42c8f5" style={styles.loader} />
        ) : (
          <Text style={styles.subtitle}>
            {userName ? `Welcome back, ${userName}!` : 'Welcome to SportsBuddies!'}
          </Text>
        )}

        <View style={styles.optionsGrid}>
          {navigationOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {option.icon}
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30, 
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  loader: {
    marginBottom: 24,
    height: 16, // Match the height of the subtitle text
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
  },
});

export default Dashboard;