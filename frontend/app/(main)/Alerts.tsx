import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AuthLayout from "@/components/AuthLayout";
import { AlertService } from "@/services/AlertService";
import { Alert as AlertType } from "@/types/alert";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/ThemeContext";
import { API_URL } from "@/config.json";
import LoadingOverlay from "@/components/LoadingOverlay";
import AlertCard from "@/components/alert/AlertCard";
import { showAlert } from "@/utils/alertUtils";
import { Gesture, GestureHandlerRootView } from "react-native-gesture-handler";

const Alerts = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingAlertId, setProcessingAlertId] = useState<string | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseStatusMap, setResponseStatusMap] = useState<
    Record<string, "accepted" | "rejected">
  >({});

  // Fetch alerts from the API
  const fetchAlerts = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.push("/Login");
          return;
        }

        const alertsData = await AlertService.getAlerts(token);
        console.log("Fetched alerts:", alertsData);
        setAlerts(alertsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching alerts:", err);
        setError("Failed to load notifications. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  // Load alerts when component mounts
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    if (alerts.length) {
      // Extract response statuses from alerts
      const initialStatusMap: Record<string, "accepted" | "rejected"> = {};

      alerts.forEach((alert) => {
        if (alert.response_status) {
          initialStatusMap[alert.id] = alert.response_status as
            | "accepted"
            | "rejected";
        }
      });

      setResponseStatusMap(initialStatusMap);
    }
  }, [alerts]);

  // Handle back button press
  const handleBack = () => {
    router.back();
  };

  // Mark an alert as read and navigate to relevant screen
  const handleAlertPress = async (alert: AlertType) => {
    
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
  
      // Mark as read in the background
      AlertService.markAsRead(token, alert.id);
  
      // Update UI immediately
      setAlerts((currentAlerts) =>
        currentAlerts.map((a) => (a.id === alert.id ? { ...a, read: true } : a))
      );
  
      if (alert.activity_id) {
        if (alert.type && alert.type.toLowerCase() === "new_message") {
          router.push(`/ActivityThread?id=${alert.activity_id}`);
        } else {
          router.push(`/ActivityDetail?id=${alert.activity_id}`);
        }
      }
    } catch (err) {
      console.error("Error handling alert press:", err);
    }
  };

  // Handle marking all alerts as read
  const handleMarkAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const success = await AlertService.markAllAsRead(token);
      if (success) {
        // Update UI
        setAlerts((currentAlerts) =>
          currentAlerts.map((a) => ({ ...a, read: true }))
        );
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Handle clearing all alerts
  const handleClearAllAlerts = async () => {
    showAlert(
      "Clear All Alerts",
      "Are you sure you want to delete all your alerts? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            setIsProcessing(true);
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) return;

              await AlertService.deleteAllAlerts(token);
              setAlerts([]);
            } catch (err) {
              console.error("Error deleting all alerts:", err);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAlert = async (alert: AlertType) => {
    // Show confirmation dialog
    showAlert("Delete Alert", "Are you sure you want to delete this alert?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsProcessing(true);
          try {
            const token = await AsyncStorage.getItem("token");
            if (!token) return;

            // Delete the alert from the database
            await AlertService.deleteAlert(token, alert.id);

            // Remove the alert from the UI
            setAlerts((currentAlerts) =>
              currentAlerts.filter((a) => a.id !== alert.id)
            );
          } catch (err) {
            console.error("Error deleting alert:", err);
          } finally {
            setIsProcessing(false);
          }
        },
      },
    ]);
  };

  const handleAcceptRequest = async (alert: AlertType) => {
    if (!alert.activity_id || !alert.sender_id) return;

    setProcessingAlertId(alert.id);
    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Call the API to approve the join request
      const response = await fetch(
        `${API_URL}/activity/${alert.activity_id}/approve/${alert.sender_id}`,
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

      // Update the alert response status in the database
      await AlertService.setResponseStatus(token, alert.id, "accepted");

      // Mark the alert as read
      await AlertService.markAsRead(token, alert.id);

      // Update local state
      setResponseStatusMap((prev) => ({
        ...prev,
        [alert.id]: "accepted",
      }));

      // Update all alerts to mark this one as read
      setAlerts((currentAlerts) =>
        currentAlerts.map((a) =>
          a.id === alert.id
            ? { ...a, read: true, response_status: "accepted" }
            : a
        )
      );
    } catch (error) {
      console.error("Error approving join request:", error);
    } finally {
      setProcessingAlertId(null);
      setIsProcessing(false);
    }
  };

  const handleRejectRequest = async (alert: AlertType) => {
    if (!alert.activity_id || !alert.sender_id) return;

    setProcessingAlertId(alert.id);
    setIsProcessing(true);

    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Call the API to reject the join request
      const response = await fetch(
        `${API_URL}/activity/${alert.activity_id}/reject/${alert.sender_id}`,
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

      // Update the alert response status in the database
      await AlertService.setResponseStatus(token, alert.id, "rejected");

      // Mark the alert as read
      await AlertService.markAsRead(token, alert.id);

      // Instead of removing the alert, mark it as responded
      setResponseStatusMap((prev) => ({
        ...prev,
        [alert.id]: "rejected",
      }));

      // Update all alerts to mark this one as read
      setAlerts((currentAlerts) =>
        currentAlerts.map((a) =>
          a.id === alert.id
            ? { ...a, read: true, response_status: "rejected" }
            : a
        )
      );
    } catch (error) {
      console.error("Error rejecting join request:", error);
    } finally {
      setProcessingAlertId(null);
      setIsProcessing(false);
    }
  };

  // Calculate unread alerts count
  const unreadAlertsCount = alerts.filter((alert) => !alert.read).length;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthLayout>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          {/* Global loading overlay */}
          <LoadingOverlay visible={isProcessing} />

          {/* Header with back button */}
          <View style={styles.headerWithBack}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                Alerts {unreadAlertsCount > 0 ? `(${unreadAlertsCount})` : ""}
              </Text>
            </View>

            <View style={styles.headerActions}>
              {alerts.some((alert) => !alert.read) && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleMarkAllAsRead}
                >
                  <Text style={styles.actionButtonText}>Mark all read</Text>
                </TouchableOpacity>
              )}

              {alerts.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.clearAllButton,
                    { borderColor: colors.border },
                  ]}
                  onPress={handleClearAllAlerts}
                >
                  <Ionicons name="trash-outline" size={20} color="red" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#42c8f5" />
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
              <Text style={[styles.errorText, { color: colors.text }]}>
                {error}
              </Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchAlerts()}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.notificationsContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchAlerts(true)}
                  colors={["#42c8f5"]}
                  tintColor="#42c8f5"
                />
              }
            >
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onPress={handleAlertPress}
                    onAccept={handleAcceptRequest}
                    onReject={handleRejectRequest}
                    onDelete={handleDeleteAlert}
                    isProcessing={isProcessing}
                    processingAlertId={processingAlertId}
                    responseStatusMap={responseStatusMap}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="notifications-off-outline"
                    size={64}
                    color="#ccc"
                  />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    You have no notifications
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </AuthLayout>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  headerWithBack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#42c8f5",
    marginRight: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 12,
  },
  clearAllButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  notificationsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#42c8f5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
});

export default Alerts;
