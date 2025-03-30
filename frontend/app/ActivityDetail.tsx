import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.json";
import { Activity } from "@/types/activity";
import { format } from "date-fns";
import ConditionalMap from "@/components/map/ConditionalMap";
import { showAlert } from "@/utils/alertUtils";

// Default banner placeholder image URL from Cloudinary
const BANNER_PLACEHOLDER =
  "https://media-cldnry.s-nbcnews.com/image/upload/t_nbcnews-fp-1200-630,f_auto,q_auto:best/rockcms/2024-01/240102-sports-landing-01-coco-gauff-cs-646a9f.jpg";

export default function ActivityDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinRequestSent, setJoinRequestSent] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [creatorLoading, setCreatorLoading] = useState(false);

  useEffect(() => {
    const fetchActivityAndUser = async () => {
      try {
        // Get the auth token
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          showAlert(
            "Authentication Error",
            "You need to be logged in to view activity details.",
            [{ text: "OK", onPress: () => router.push("/Login") }]
          );
          return;
        }

        // Fetch the current user ID
        const userResponse = await fetch(`${API_URL}/user/current_user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log(userData);
          setCurrentUserId(userData.id);
        }

        // Fetch the activity details
        const activityResponse = await fetch(`${API_URL}/activity/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!activityResponse.ok) {
          throw new Error("Failed to fetch activity details");
        }

        const activityData = await activityResponse.json();
        setActivity(activityData);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        showAlert("Error", "Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityAndUser();
  }, [id]);

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (!activity || !activity.creator_id) return;
      
      setCreatorLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;
        
        const response = await fetch(`${API_URL}/user/public/${activity.creator_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          console.error("Failed to fetch creator info:", response.status);
          return;
        }
        
        const creatorData = await response.json();
        setCreatorInfo(creatorData);
      } catch (err) {
        console.error("Error fetching creator info:", err);
      } finally {
        setCreatorLoading(false);
      }
    };
    
    fetchCreatorInfo();
  }, [activity]);

  // Reset banner error state when activity changes
  useEffect(() => {
    if (activity) {
      setBannerError(false);
    }
  }, [activity?.bannerImageUrl]);

  const handleBack = () => {
    router.back();
  };

  const handleJoinRequest = async () => {
    if (!activity) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_URL}/activity/${activity.id}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update the activity with the new join request
        setJoinRequestSent(true);
        showAlert("Success", "Join request sent successfully!");

        // Refresh activity data to get updated status
        const updatedResponse = await fetch(`${API_URL}/activity/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setActivity(updatedData);
        }
      } else {
        showAlert("Error", data.detail || "Failed to send join request");
      }
    } catch (err: any) {
      showAlert("Error", err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveActivity = async () => {
    if (!activity) return;
  
    // Show confirmation dialog first
    showAlert(
      "Leave Activity", 
      "Are you sure you want to leave this activity?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem("token");
  
              const response = await fetch(`${API_URL}/activity/${activity.id}/leave`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
  
              const data = await response.json();
  
              if (response.ok) {
                showAlert("Success", "You have left this activity.");
  
                // Refresh activity data to get updated status
                const updatedResponse = await fetch(`${API_URL}/activity/${id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
  
                if (updatedResponse.ok) {
                  const updatedData = await updatedResponse.json();
                  setActivity(updatedData);
                }
              } else {
                showAlert("Error", data.detail || "Failed to leave the activity");
              }
            } catch (err: any) {
              showAlert("Error", err.message || "An error occurred");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCancelJoinRequest = async () => {
    if (!activity) return;
  
    // Show confirmation dialog first
    showAlert(
      "Cancel Request", 
      "Are you sure you want to cancel your join request?",
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const token = await AsyncStorage.getItem("token");
  
              const response = await fetch(`${API_URL}/activity/${activity.id}/cancel-request`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              });
  
              const data = await response.json();
  
              if (response.ok) {
                setJoinRequestSent(false);
                showAlert("Success", "Join request cancelled successfully.");
  
                // Refresh activity data to get updated status
                const updatedResponse = await fetch(`${API_URL}/activity/${id}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
  
                if (updatedResponse.ok) {
                  const updatedData = await updatedResponse.json();
                  setActivity(updatedData);
                }
              } else {
                showAlert("Error", data.detail || "Failed to cancel join request");
              }
            } catch (err: any) {
              showAlert("Error", err.message || "An error occurred");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleManageActivity = () => {
    //router.push(`/ManageActivity?id=${activity?.id}`);
  };

  const renderActionButton = () => {
    if (!activity || !currentUserId) return null;
  
    // Check if activity is expired based on datetime or status
    const isExpired = activity.status === "expired" || 
      activity.status === "cancelled" || 
      new Date(activity.dateTime) < new Date();
  
    // If current user is the creator
    if (activity.creator_id === currentUserId) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#4a6fa1" }]}
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
          style={[styles.actionButton, { backgroundColor: "#d9534f" }]}
          onPress={handleLeaveActivity}
        >
          <Text style={styles.actionButtonText}>Leave Activity</Text>
        </TouchableOpacity>
      );
    }
  
    // If user has a pending join request
    if (activity.joinRequests?.includes(currentUserId) || joinRequestSent) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#f0ad4e" }]}
          onPress={handleCancelJoinRequest}
        >
          <Text style={styles.actionButtonText}>Cancel Request</Text>
        </TouchableOpacity>
      );
    }
  
    // If activity is full
    if (activity.participants?.length >= activity.maxParticipants) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#d9534f" }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>Activity Full</Text>
        </TouchableOpacity>
      );
    }
  
    // If activity is cancelled or expired
    if (isExpired) {
      return (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: "#6c757d" }]}
          disabled={true}
        >
          <Text style={styles.actionButtonText}>Past Activity</Text>
        </TouchableOpacity>
      );
    }
  
    // Default: User can join
    return (
      <TouchableOpacity style={styles.actionButton} onPress={handleJoinRequest}>
        <Text style={styles.actionButtonText}>Join Activity</Text>
      </TouchableOpacity>
    );
  };

  const navigateToProfile = (userId: string) => {
    //router.push(`/UserProfile?id=${userId}`);
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
        <Text style={styles.errorText}>{error || "Activity not found"}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Format the date and time
  const activityDate = new Date(activity.dateTime);
  const formattedDate = format(activityDate, "EEEE, MMMM d, yyyy");
  const formattedTime = format(activityDate, "h:mm a");

  const bannerImageUrl =
    bannerError || !activity.bannerImageUrl
      ? BANNER_PLACEHOLDER
      : activity.bannerImageUrl;

  return (
    <ScrollView style={styles.container}>
      {/* Banner Image with Back Button Overlay */}
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: bannerImageUrl }}
          style={styles.bannerImage}
          resizeMode="cover"
          onError={() => {
            console.log("Banner image failed to load, using placeholder");
            setBannerError(true);
          }}
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

        {/* Add user status indicator */}
        {currentUserId && (
          <View style={styles.userStatusContainer}>
            {activity.creator_id === currentUserId ? (
              <View style={styles.userStatusBadge}>
                <Ionicons name="star" size={14} color="#fff" />
                <Text style={styles.userStatusText}>Creator</Text>
              </View>
            ) : activity.participants?.includes(currentUserId) ? (
              <View style={[styles.userStatusBadge, { backgroundColor: '#28a745' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.userStatusText}>Participating</Text>
              </View>
            ) : activity.joinRequests?.includes(currentUserId) ? (
              <View style={[styles.userStatusBadge, { backgroundColor: '#f0ad4e' }]}>
                <Ionicons name="time" size={14} color="#fff" />
                <Text style={styles.userStatusText}>Pending Request</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Activity Type and Price */}
        <View style={styles.tagRow}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  activity.type === "event" ? "#5cb85c" : "#f0ad4e",
              },
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {activity.type === "event" ? "Event" : "Coaching Session"}
            </Text>
          </View>

          {activity.price > 0 && (
            <Text style={styles.priceText}>${activity.price}</Text>
          )}
        </View>

        {/* Organizer Information */}
        <View style={styles.organizerSection}>
          <Text style={styles.sectionTitle}>Organiser</Text>
          
          {creatorLoading ? (
            <View style={styles.creatorLoadingContainer}>
              <ActivityIndicator size="small" color="#0066cc" />
              <Text style={styles.infoText}>Loading organizer info...</Text>
            </View>
          ) : creatorInfo ? (
            <TouchableOpacity 
              style={styles.organizerContainer}
              onPress={() => navigateToProfile(activity.creator_id)}
            >
              <Image
                source={{ 
                  uri: creatorInfo.profilePicUrl || "https://placehold.co/60/gray/white?text=User" 
                }}
                style={styles.organizerImage}
                onError={(e) => console.log("Organizer image failed to load")}
              />
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>
                  {creatorInfo.firstName} {creatorInfo.lastName}
                </Text>
                <Text style={styles.organizerUsername}>
                  @{creatorInfo.username}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ) : (
            <Text style={styles.infoText}>Organizer information unavailable</Text>
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
            {activity.participants?.length || 0}/{activity.maxParticipants}{" "}
            participants
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
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d9534f",
    textAlign: "center",
    marginBottom: 20,
  },
  bannerContainer: {
    position: "relative",
    width: "100%",
    height: 300,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  backIconButton: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#0066cc",
    borderRadius: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  detailsContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  activityName: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    marginRight: 10,
  },
  actionButton: {
    backgroundColor: "#0066cc",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  tagRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
  },
  typeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  organizerSection: {
    marginVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
  },
  organizerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  organizerUsername: {
    fontSize: 14,
    color: '#666',
  },
  creatorLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  infoText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  participantsText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    marginLeft: 5,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  userStatusContainer: {
    marginTop: -5,
    marginBottom: 15,
  },
  userStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a6fa1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  userStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});