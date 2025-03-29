import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config.json';
import { Activity } from '@/types/activity';
import { format } from 'date-fns';
import ConditionalMap from '@/components/map/ConditionalMap';


export default function ActivityDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityAndUser = async () => {
      try {
        // Get the auth token
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert('Authentication Error', 'You need to be logged in to view activity details.');
          router.push('/Login');
          return;
        }

        // Fetch the current user ID
        const userResponse = await fetch(`${API_URL}/user/current_user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log(userData);
          setCurrentUserId(userData.id);
        }

        // Fetch the activity details
        const activityResponse = await fetch(`${API_URL}/activity/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!activityResponse.ok) {
          throw new Error('Failed to fetch activity details');
        }

        const activityData = await activityResponse.json();
        setActivity(activityData);
      } catch (err: any) {
        setError(err.message || 'An error occurred');
        Alert.alert('Error', 'Failed to load activity details');
      } finally {
        setLoading(false);
      }
    };

    fetchActivityAndUser();
  }, [id]);

  const handleBack = () => {
    router.back();
  };

  const handleJoinRequest = async () => {
    if (!activity) return;
    
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/activity/${activity.id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // Update the activity with the new join request
        setJoinRequestSent(true);
        Alert.alert('Success', 'Join request sent successfully!');
        
        // Refresh activity data to get updated status
        const updatedResponse = await fetch(`${API_URL}/activity/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setActivity(updatedData);
        }
      } else {
        Alert.alert('Error', data.detail || 'Failed to send join request');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleManageActivity = () => {
    //router.push(`/ManageActivity?id=${activity?.id}`);
  };

  const renderActionButton = () => {
    if (!activity || !currentUserId) return null;
    
    // If current user is the creator
    if (activity.creator_id === currentUserId) {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#4a6fa1' }]}
          onPress={handleManageActivity}
        >
          <Text style={styles.actionButtonText}>Manage Activity</Text>
        </TouchableOpacity>
      );
    }
    
    // If user is already a participant
    if (activity.participants?.includes(currentUserId)) {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#58a758' }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>Joined ✓</Text>
        </TouchableOpacity>
      );
    }
    
    // If user has a pending join request
    if (activity.joinRequests?.includes(currentUserId) || joinRequestSent) {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#f0ad4e' }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>Request Pending</Text>
        </TouchableOpacity>
      );
    }
    
    // If activity is full
    if (activity.participants?.length >= activity.maxParticipants) {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#d9534f' }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>Activity Full</Text>
        </TouchableOpacity>
      );
    }
    
    // If activity is cancelled or expired
    if (activity.status === 'cancelled' || activity.status === 'expired') {
      return (
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#6c757d' }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>
            {activity.status === 'cancelled' ? 'Cancelled' : 'Expired'}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Default: User can join
    return (
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={handleJoinRequest}
      >
        <Text style={styles.actionButtonText}>Join Activity</Text>
      </TouchableOpacity>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading activity details...</Text>
      </View>
    );
  }
  
  if (error || !activity) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Activity not found'}
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format the date and time
  const activityDate = new Date(activity.dateTime);
  const formattedDate = format(activityDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(activityDate, 'h:mm a');

  return (
    <ScrollView style={styles.container}>
      {/* Banner Image with Back Button Overlay */}
      <View style={styles.bannerContainer}>
        <Image 
          source={{ 
            uri: activity.bannerImageUrl || 'https://res.cloudinary.com/dv5hycdyw/image/upload/v1743145714/samples/cloudinary-logo-vector.svg'
          }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.backIconButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Activity Details */}
      <View style={styles.detailsContainer}>
        {/* Activity Name and Action Button */}
        <View style={styles.headerRow}>
          <Text style={styles.activityName}>{activity.activityName}</Text>
          {renderActionButton()}
        </View>
        
        {/* Activity Type and Price */}
        <View style={styles.tagRow}>
          <View style={[
            styles.typeBadge, 
            { backgroundColor: activity.type === 'event' ? '#5cb85c' : '#f0ad4e' }
          ]}>
            <Text style={styles.typeBadgeText}>
              {activity.type === 'event' ? 'Event' : 'Coaching Session'}
            </Text>
          </View>
          
          {activity.price > 0 && (
            <Text style={styles.priceText}>${activity.price}</Text>
          )}
        </View>
        
        {/* Sport and Skill Level */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="running" size={16} color="#555" />
            <Text style={styles.infoText}>{activity.sport}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="stats-chart" size={16} color="#555" />
            <Text style={styles.infoText}>{activity.skillLevel}</Text>
          </View>
        </View>
        
        {/* Participants */}
        <View style={styles.participantsRow}>
          <Ionicons name="people" size={16} color="#555" />
          <Text style={styles.participantsText}>
            {activity.participants?.length || 0}/{activity.maxParticipants} participants
          </Text>
        </View>
        
        {/* Date and Time */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color="#555" />
            <Text style={styles.infoText}>{formattedDate}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="time" size={16} color="#555" />
            <Text style={styles.infoText}>{formattedTime}</Text>
          </View>
        </View>
        
        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={16} color="#555" />
          <Text style={styles.locationText}>{activity.placeName}</Text>
        </View>
        
        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{activity.description}</Text>
        </View>
        
        {/* Map Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            {activity.location && (
                <ConditionalMap
                latitude={activity.location.latitude}
                longitude={activity.location.longitude}
                placeName={activity.placeName}
                />
            )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 20,
  },
  bannerContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  backIconButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#0066cc',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  detailsContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activityName: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  actionButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  participantsText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});