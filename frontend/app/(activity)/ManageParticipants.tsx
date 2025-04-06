import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config.json";
import { Activity } from "../../types/activity";
import { showAlert } from "../../utils/alertUtils";
import { AlertService } from "@/services/AlertService";
import { useTheme } from "@/hooks/ThemeContext";

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
  const { colors } = useTheme();

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
      const token = await AsyncStorage.getItem("token");

      // Get current user ID
      const userResponse = await fetch(`${API_URL}/user/current_user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUserId(userData.id);
      }

      if (!activityId) {
        showAlert("Error", "Invalid activity ID");
        setLoading(false);
        return;
      }

      // Use the activityId in your fetch URL:
      const activityResponse = await fetch(
        `${API_URL}/activity/${activityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!activityResponse.ok) {
        throw new Error("Failed to fetch activity details");
      }

      const activityData = await activityResponse.json();
      setActivity(activityData);

      // Fetch details for pending requests
      if (activityData.joinRequests?.length > 0) {
        const requestsData = await Promise.all(
          activityData.joinRequests.map((userId: string) =>
            fetchUserDetails(userId, token)
          )
        );
        setPendingRequests(
          requestsData.filter((user) => user !== null) as Participant[]
        );
      } else {
        setPendingRequests([]);
      }

      // Fetch details for participants
      if (activityData.participants?.length > 0) {
        const participantsData = await Promise.all(
          activityData.participants.map((userId: string) =>
            fetchUserDetails(userId, token)
          )
        );
        setParticipants(
          participantsData.filter((user) => user !== null) as Participant[]
        );
      } else {
        setParticipants([]);
      }
    } catch (error) {
      showAlert("Error", "Failed to load activity data");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserDetails = async (
    userId: string,
    token: string | null
  ): Promise<Participant | null> => {
    try {
      const response = await fetch(`${API_URL}/user/public/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          id: userId,
          name:
            `${userData.firstName} ${userData.lastName}`.trim() ||
            userData.username,
          username: userData.username,
          profilePicUrl:
            userData.profilePicUrl ||
            "https://placehold.co/100/gray/white?text=User",
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error);
      return null;
    }
  };

  const handleApproveRequest = async (userId: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Call API to approve request
      const response = await fetch(
        `${API_URL}/activity/${activityId}/approve/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve request");
      }

      // Get the alert related to this join request so we can update its status
      const alertsResponse = await fetch(`${API_URL}/user/alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        // Find the join request alert for this user and activity
        const joinRequestAlert = alerts.find(
          (alert: any) =>
            alert.type === "join_request" &&
            alert.sender_id === userId &&
            alert.activity_id === activityId
        );

        // If we found the alert, update its status
        if (joinRequestAlert) {
          await AlertService.setResponseStatus(
            token,
            joinRequestAlert.id,
            "accepted"
          );
          await AlertService.markAsRead(token, joinRequestAlert.id);
        }
      }

      // Refresh the participants and requests lists
      fetchActivityData();
    } catch (error) {
      console.error("Error approving request:", error);
      showAlert("Error", "Failed to approve request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (userId: string) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Call API to reject request
      const response = await fetch(
        `${API_URL}/activity/${activityId}/reject/${userId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject request");
      }

      // Get the alert related to this join request so we can update its status
      const alertsResponse = await fetch(`${API_URL}/user/alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (alertsResponse.ok) {
        const alerts = await alertsResponse.json();
        // Find the join request alert for this user and activity
        const joinRequestAlert = alerts.find(
          (alert: any) =>
            alert.type === "join_request" &&
            alert.sender_id === userId &&
            alert.activity_id === activityId
        );

        // If we found the alert, update its status
        if (joinRequestAlert) {
          await AlertService.setResponseStatus(
            token,
            joinRequestAlert.id,
            "rejected"
          );
          await AlertService.markAsRead(token, joinRequestAlert.id);
        }
      }

      // Refresh the participants and requests lists
      fetchActivityData();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showAlert("Error", "Failed to reject request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    showAlert(
      "Remove Participant",
      "Are you sure you want to remove this participant?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const response = await fetch(
                `${API_URL}/activity/${activityId}/remove/${userId}`,
                {
                  method: "POST",
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (response.ok) {
                showAlert("Success", "Participant removed");
                // Refresh data
                fetchActivityData();
              } else {
                const errorData = await response.json();
                showAlert(
                  "Error",
                  errorData.detail || "Failed to remove participant"
                );
              }
            } catch (error) {
              showAlert(
                "Error",
                "An error occurred while removing the participant"
              );
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivityData();
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading participants...
        </Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: "red" }]}>
          Activity not found
        </Text>
        <TouchableOpacity
          style={[styles.errorBackButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Check if current user is the creator
  if (currentUserId !== activity.creator_id) {
    return (
      <View
        style={[styles.errorContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: "red" }]}>
          Only the activity creator can manage participants
        </Text>
        <TouchableOpacity
          style={[styles.errorBackButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      {/* Fixed header outside ScrollView */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {activity.activityName}
          </Text>
        </View>
      </View>

      {/* Scrollable content with RefreshControl */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Pending Requests Section */}
        {pendingRequests.length > 0 ? (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Pending Join Requests ({pendingRequests.length})
            </Text>
            {pendingRequests.map((user) => (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.userInfoContainer}
                  onPress={() => navigateToProfile(user.id)}
                >
                  <Image
                    source={{ uri: user.profilePicUrl }}
                    style={styles.userImage}
                  />
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>
                      {user.name}
                    </Text>
                    <Text
                      style={[styles.userUsername, { color: colors.smalltext }]}
                    >
                      @{user.username}
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Moved action buttons to be below the user info */}
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
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              No Pending Requests
            </Text>
            <Text style={[styles.emptyText, { color: colors.smalltext }]}>
              There are currently no pending join requests.
            </Text>
          </View>
        )}

        {/* Participants Section */}
        {participants.length > 0 ? (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Participants ({participants.length}/{activity.maxParticipants})
            </Text>
            {participants.map((user) => (
              <View
                key={user.id}
                style={[
                  styles.userCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.participantRowContainer}>
                  <TouchableOpacity
                    style={styles.userInfoContainer}
                    onPress={() => navigateToProfile(user.id)}
                  >
                    <Image
                      source={{ uri: user.profilePicUrl }}
                      style={styles.userImage}
                    />
                    <View style={styles.userInfo}>
                      <Text style={[styles.userName, { color: colors.text }]}>
                        {user.name}
                      </Text>
                      <Text
                        style={[
                          styles.userUsername,
                          { color: colors.smalltext },
                        ]}
                      >
                        @{user.username}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.sideActionButton, styles.removeButton]}
                    onPress={() => handleRemoveParticipant(user.id)}
                  >
                    <Ionicons name="trash" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              No Participants Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.smalltext }]}>
              There are currently no participants in this activity.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: -20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  errorBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  errorBackButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    marginTop: 10,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
  userCard: {
    flexDirection: "column",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
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
    fontWeight: "600",
  },
  userUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginTop: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 6,
    gap: 4,
    flex: 0.48,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  approveButton: {
    backgroundColor: "#28a745",
  },
  rejectButton: {
    backgroundColor: "#dc3545",
  },
  removeButton: {
    backgroundColor: "#dc3545",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginBottom: 0,
  },
  participantRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  sideActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
});

export default ManageParticipants;
