import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { API_URL } from "../../config.json";
import { Activity } from "../../types/activity";

import { useTheme } from "@/hooks/ThemeContext";

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [creatorInfo, setCreatorInfo] = useState({
    name: "Loading...",
    profilePicUrl: "https://placehold.co/36",
  });

  useEffect(() => {
    const fetchCreatorInfo = async () => {
      if (activity.creator_id && !activity.creator) {
        try {
          const token = await AsyncStorage.getItem("token");

          const response = await fetch(
            `${API_URL}/user/public/${activity.creator_id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.ok) {
            const userData = await response.json();
            setCreatorInfo({
              name:
                `${userData.firstName} ${userData.lastName}`.trim() ||
                userData.username ||
                "User",
              profilePicUrl:
                userData.profilePicUrl || "https://placehold.co/36",
            });
          }
        } catch (error) {
          console.error("Failed to fetch creator info:", error);
        }
      }
    };

    fetchCreatorInfo();
  }, [activity.creator_id]);

  // Format the date for display
  const formattedDate = new Date(activity.dateTime);
  const dateString = formattedDate.toLocaleDateString();
  const timeString = formattedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleActivityPress = () => {
    router.push(`/ActivityDetail?id=${activity.id}`);
  };

  // Determine activity status based on status field and date
  const getActivityStatus = () => {
    // Check status field first
    if (activity.status === "cancelled") {
      return {
        label: "Cancelled",
        color: "#FF3B30",
        icon: "close-circle",
        style: {
          opacity: 0.7,
          backgroundColor: "#FFE5E5",
        },
      };
    }

    const now = new Date();
    const activityDate = new Date(activity.dateTime);

    // If status is not cancelled, check date to determine if completed or upcoming
    if (activityDate < now) {
      return {
        label: "Past",
        color: "#8E8E93",
        icon: "checkmark-done-circle",
        style: {},
      };
    }

    // Handle other status values
    switch (activity.status?.toLowerCase()) {
      case "pending":
        return {
          label: "Pending",
          color: "#FF9500",
          icon: "hourglass",
          style: {},
        };
      case "full":
        return {
          label: "Full",
          color: "#5856D6",
          icon: "people",
          style: {},
        };
      default:
        // Default to upcoming for active/created status
        return {
          label: "Upcoming",
          color: "#34C759",
          icon: "time",
          style: {},
        };
    }
  };

  const status = getActivityStatus();

  // Get participant count
  const participantCount = activity.participants?.length || 0;
  const maxParticipants = activity.maxParticipants || "∞";

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }, status.style]}
      onPress={handleActivityPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        {/* Left column: Creator info and activity name */}
        <View style={styles.leftColumn}>
          <View style={styles.creatorInfo}>
            <Image
              source={{
                uri:
                  activity.creator?.profilePicUrl || creatorInfo.profilePicUrl,
              }}
              style={styles.creatorImage}
            />
            <Text
              style={[styles.creatorName, { color: colors.text }]}
              numberOfLines={1}
            >
              {activity.creator?.name || creatorInfo.name}
            </Text>
          </View>

          {/* Activity name right below creator */}
          <Text
            style={[styles.activityName, { color: colors.text }]}
            numberOfLines={2}
          >
            {activity.activityName}
          </Text>
        </View>

        {/* Right column: Type badge and participant count */}
        <View style={styles.badgesContainer}>
          {/* Activity type badge */}
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor:
                  activity.type === "coaching session" ? "#FFC107" : "#4CAF50",
              },
            ]}
          >
            <Text style={[styles.typeBadgeText, { color: colors.background }]}>
              {activity.type === "coaching session" ? "Coaching" : "Event"}
            </Text>
          </View>

          {/* Participants count */}
          <View
            style={[
              styles.participantsContainer,
              { backgroundColor: colors.border },
            ]}
          >
            <FontAwesome5 name="users" size={14} color={colors.smalltext} />
            <Text style={[styles.participantsText, { color: colors.text }]}>
              {participantCount}/{maxParticipants}
            </Text>
          </View>
        </View>
      </View>

      {/* Status indicator */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusContainer,
            { backgroundColor: status.color + "20" },
          ]}
        >
          <Ionicons name={status.icon as any} size={16} color={status.color} />
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>
      </View>

      {/* Activity details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={colors.smalltext}
          />
          <Text
            style={[styles.detailText, { color: colors.smalltext }]}
            numberOfLines={1}
          >
            {dateString} • {timeString}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={colors.smalltext}
          />
          <Text
            style={[styles.detailText, { color: colors.smalltext }]}
            numberOfLines={1}
          >
            {activity.placeName || "Location not set"}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <FontAwesome5 name="running" size={14} color={colors.smalltext} />
          <Text
            style={[styles.detailText, { color: colors.smalltext }]}
            numberOfLines={1}
          >
            {activity.sport} • {activity.skillLevel}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  creatorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  creatorImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: "600",
  },
  activityName: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 2,
  },
  badgesContainer: {
    alignItems: "flex-end",
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  participantsContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  participantsText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
  },
  statusRow: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  detailsContainer: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#555",
  },
});

export default ActivityCard;
