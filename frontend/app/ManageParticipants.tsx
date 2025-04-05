import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from "../config.json";
import { Activity } from '../types/activity';
import { showAlert } from '../utils/alertUtils';

interface Participant {
  id: string;
  name: string;
  username: string;
  profilePicUrl: string;
}

const ManageParticipants = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const activityId = Array.isArray(id) ? id[0] : id;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<Participant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityData();
  }, [activityId]);

  const navigateToProfile = (userId: string) => {
    router.push(`/PublicProfile?id=${userId}`);
  };

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // Get current user ID
      const userResponse = await fetch(`${API_URL}/user/current_user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUserId(userData.id);
      }

      if (!activityId) {
        showAlert('Error', 'Invalid activity ID');
        setLoading(false);
        return;
      }
      
      // Use the activityId in your fetch URL:
      const activityResponse = await fetch(`${API_URL}/activity/${activityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!activityResponse.ok) {
        throw new Error('Failed to fetch activity details');
      }

      const activityData = await activityResponse.json();
      setActivity(activityData);

      // Fetch details for pending requests
      if (activityData.joinRequests?.length > 0) {
        const requestsData = await Promise.all(
          activityData.joinRequests.map((userId: string) => fetchUserDetails(userId, token))
        );
        setPendingRequests(requestsData.filter(user => user !== null) as Participant[]);
      } else {
        setPendingRequests([]);
      }

      // Fetch details for participants
      if (activityData.participants?.length > 0) {
        const participantsData = await Promise.all(
          activityData.participants.map((userId: string) => fetchUserDetails(userId, token))
        );
        setParticipants(participantsData.filter(user => user !== null) as Participant[]);
      } else {
        setParticipants([]);
      }

    } catch (error) {
      showAlert('Error', 'Failed to load activity data');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserDetails = async (userId: string, token: string | null): Promise<Participant | null> => {
    try {
      const response = await fetch(`${API_URL}/user/public/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        return {
          id: userId,
          name: `${userData.firstName} ${userData.lastName}`.trim() || userData.username,
          username: userData.username,
          profilePicUrl: userData.profilePicUrl || 'https://placehold.co/100/gray/white?text=User'
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      return null;
    }
  };

  const handleApproveRequest = async (userId: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/activity/${activityId}/approve/${userId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        showAlert('Success', 'Join request approved');
        // Refresh data
        fetchActivityData();
      } else {
        const errorData = await response.json();
        showAlert('Error', errorData.detail || 'Failed to approve request');
      }
    } catch (error) {
      showAlert('Error', 'An error occurred while approving the request');
      console.error(error);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    showAlert(
      'Reject Request',
      'Are you sure you want to reject this join request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(
                `${API_URL}/activity/${activityId}/reject/${userId}`,
                {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` }
                }
              );

              if (response.ok) {
                showAlert('Success', 'Join request rejected');
                // Refresh data
                fetchActivityData();
              } else {
                const errorData = await response.json();
                showAlert('Error', errorData.detail || 'Failed to reject request');
              }
            } catch (error) {
              showAlert('Error', 'An error occurred while rejecting the request');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const handleRemoveParticipant = async (userId: string) => {
    showAlert(
      'Remove Participant',
      'Are you sure you want to remove this participant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(
                `${API_URL}/activity/${activityId}/remove/${userId}`,
                {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}` }
                }
              );

              if (response.ok) {
                showAlert('Success', 'Participant removed');
                // Refresh data
                fetchActivityData();
              } else {
                const errorData = await response.json();
                showAlert('Error', errorData.detail || 'Failed to remove participant');
              }
            } catch (error) {
              showAlert('Error', 'An error occurred while removing the participant');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivityData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading participants...</Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Activity not found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if current user is the creator
  if (currentUserId !== activity.creator_id) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Only the activity creator can manage participants</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    
    
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
         <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color="#0066cc" />
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{activity.activityName}</Text>
      </View>
    </View>


      {/* Pending Requests Section */}
      {pendingRequests.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Join Requests ({pendingRequests.length})</Text>
          {pendingRequests.map((user) => (
            <View key={user.id} style={styles.userCard}>
                <TouchableOpacity 
                style={styles.userInfoContainer}
                onPress={() => navigateToProfile(user.id)}
                >
                <Image
                    source={{ uri: user.profilePicUrl }}
                    style={styles.userImage}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                </View>
                </TouchableOpacity>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleApproveRequest(user.id)}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectRequest(user.id)}
                >
                  <Ionicons name="close" size={18} color="white" />
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>No Pending Requests</Text>
          <Text style={styles.emptyText}>There are currently no pending join requests.</Text>
        </View>
      )}

      {/* Participants Section */}
      {participants.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Participants ({participants.length}/{activity.maxParticipants})
          </Text>
          {participants.map((user) => (
            <View key={user.id} style={styles.userCard}>
                <TouchableOpacity 
                style={styles.userInfoContainer}
                onPress={() => navigateToProfile(user.id)}
                >
                <Image
                    source={{ uri: user.profilePicUrl }}
                    style={styles.userImage}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userUsername}>@{user.username}</Text>
                </View>
                </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() => handleRemoveParticipant(user.id)}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.actionButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>No Participants Yet</Text>
          <Text style={styles.emptyText}>There are currently no participants in this activity.</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: 24,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userUsername: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  approveButton: {
    backgroundColor: '#28a745',
  },
  rejectButton: {
    backgroundColor: '#dc3545',
  },
  removeButton: {
    backgroundColor: '#dc3545',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  backButtonText: {
    marginLeft: 4,
    color: '#0066cc',
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Change from 'flex-start' to 'center'
    marginHorizontal: 40, // Add margin to prevent overlap
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
});

export default ManageParticipants;