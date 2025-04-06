import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import AuthLayout from '@/components/AuthLayout';
import { fetchCurrentUser } from '@/utils/GetUser';
import { useTheme } from '@/hooks/ThemeContext';
import { API_URL } from "@/config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [unreadAlerts, setUnreadAlerts] = useState<number>(0);

  // Fetch user data and unread alerts on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userData = await fetchCurrentUser();
        if (userData) {
          setUserName(userData.firstName || '');
        }
        
        // Fetch unread alerts count
        await fetchUnreadAlertsCount();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch unread alerts count
  const fetchUnreadAlertsCount = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_URL}/user/alerts/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadAlerts(data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch unread alerts count:', error);
    }
  };

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
      icon: <View style={styles.iconWithBadge}>
        <Ionicons name="notifications-outline" size={32} color="#42c8f5" />
        {unreadAlerts > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {unreadAlerts > 99 ? '99+' : unreadAlerts}
            </Text>
          </View>
        )}
      </View>,
      onPress: () => router.push('/Alerts')
    },
    {
      id: 'messages',
      label: 'Activity Threads',
      description: 'View conversations in activities',
      icon: <Ionicons name="chatbubbles-outline" size={32} color="#42c8f5" />,
      onPress: () => router.push('/UserThreads')
    },
    {
      id: 'profile',
      label: 'Profile & Activities',
      description: 'Manage your profile and activities',
      icon: <FontAwesome5 name="user-circle" size={32} color="#42c8f5" />,
      onPress: () => router.push('/Profile')
    },
    {
      id: 'create',
      label: 'Create Activity',
      description: 'Organise an event or coaching session',
      icon: <MaterialIcons name="add-circle-outline" size={32} color="#42c8f5" />,
      onPress: () => router.push('/Create')
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
      <View style={[styles.container, {backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Dashboard</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color={colors.smalltext} style={styles.loader} />
        ) : (
          <Text style={[styles.subtitle,{color:colors.smalltext}]}>
            {userName ? `Welcome back, ${userName}!` : 'Welcome to SportsBuddies!'}
          </Text>
        )}

        <View style={[styles.optionsGrid, {backgroundColor: colors.background}]}>
          {navigationOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionCard, {backgroundColor: colors.card}]}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {option.icon}
              </View>
              <Text style={[styles.optionLabel, {color:colors.text}]}>{option.label}</Text>
              <Text style={[styles.optionDescription, {color:colors.smalltext}]}>{option.description}</Text>
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
    marginTop: 10, 
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  loader: {
    marginBottom: 24,
    height: 16,
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
    position: 'relative',
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
  iconWithBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  }
});

export default Dashboard;