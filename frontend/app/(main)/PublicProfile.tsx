import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/config.json";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/ThemeContext";
import ActivityCard from "@/components/activity/ActivityCard";

export default function PublicProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  // Check if this is the current user's profile
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          router.push("/Login");
          return;
        }

        // Fetch current user
        const userResponse = await fetch(`${API_URL}/user/current_user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) throw new Error("Failed to fetch current user");

        const userData = await userResponse.json();
        setCurrentUserId(userData.id);
        
        // Fetch the user's public profile
        await fetchUserProfile(token);
      } catch (err: any) {
        console.error("Error checking current user:", err);
        setError(err.message || "Failed to verify user");
        setLoading(false);
      }
    };

    checkCurrentUser();
  }, [id, router]);

  // Log userProfile data for debugging
  useEffect(() => {
    if (userProfile) {
      console.log('User profile data:', JSON.stringify(userProfile, null, 2));
      
      if (userProfile.preferences?.sports_skills) {
        console.log('Sports skills:', JSON.stringify(userProfile.preferences.sports_skills, null, 2));
      } else {
        console.log('No sports_skills found in preferences');
      }
    }
  }, [userProfile]);

  // Fetch user profile data
  const fetchUserProfile = async (token: string) => {
    try {
      setLoading(true);
      
      const profileResponse = await fetch(`${API_URL}/user/public/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!profileResponse.ok) throw new Error("Failed to fetch user profile");

      const profileData = await profileResponse.json();
      setUserProfile(profileData);
      
      // After profile is loaded, fetch user's activities
      fetchUserActivities(token);
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities created by this user
  const fetchUserActivities = async (token: string) => {
    try {
      setActivitiesLoading(true);
      
      // Fixed API endpoint - should be /activity/user/{id}/created
      const activitiesResponse = await fetch(`${API_URL}/activity/${id}/created`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!activitiesResponse.ok) throw new Error("Failed to fetch user activities");
  
      const activitiesData = await activitiesResponse.json();
      console.log('User activities found:', activitiesData.length);
      
      setUserActivities(activitiesData);
    } catch (err: any) {
      console.error("Error fetching user activities:", err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Render sport skill item with robust property handling and color coding
const renderSportSkill = (sportSkill: any) => {
    // Skip invalid entries
    if (!sportSkill || !sportSkill.sport) {
      console.log('Invalid sport skill entry:', sportSkill);
      return null;
    }
    
    // Try different property names that might contain the skill level
    const skillLevel = sportSkill.level || 
                      sportSkill.skillLevel || 
                      sportSkill.skill_level || 
                      "Beginner"; // Default fallback
  
    // Determine badge color based on skill level
    let badgeColor = "#42c8f5"; // Default color (blue)
    
    if (skillLevel.toLowerCase() === "beginner") {
      badgeColor = "#5cb85c"; // Green for beginners
    } else if (skillLevel.toLowerCase() === "intermediate") {
      badgeColor = "#f0ad4e"; // Orange for intermediate
    } else if (skillLevel.toLowerCase() === "advanced") {
      badgeColor = "#d9534f"; // Red for advanced
    } else if (skillLevel.toLowerCase() === "professional") {
      badgeColor = "#9370DB"; // Purple for professional
    }
  
    return (
      <View 
        key={sportSkill.sport} 
        style={[styles.sportSkillItem, {backgroundColor: colors.card, borderColor: colors.border}]}
      >
        <Text style={[styles.sportName, {color: colors.text}]}>{sportSkill.sport}</Text>
        <View style={[styles.skillLevelBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.skillLevelText}>{skillLevel}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, {color: colors.text}]}>Loading profile...</Text>
      </View>
    );
  }

  if (error || !userProfile) {
    return (
      <View style={[styles.errorContainer, {backgroundColor: colors.background}]}>
        <Text style={styles.errorText}>{error || "User profile not found"}</Text>
        <TouchableOpacity 
          style={[styles.backButton, {backgroundColor: colors.primary}]} 
          onPress={handleBack}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backIconButton} onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <Image 
          source={{ 
            uri: userProfile.profilePicUrl || "https://placehold.co/200/gray/white?text=User" 
          }} 
          style={styles.profileImage} 
        />
        <Text style={[styles.name, {color: colors.text}]}>
          {userProfile.firstName} {userProfile.lastName}
        </Text>
        <Text style={[styles.username, {color: colors.secondary}]}>
          @{userProfile.username}
        </Text>
      </View>
      
      {/* Sports & Skills Section */}
      <View style={[styles.section, {borderTopColor: colors.border}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Sports & Skills</Text>
        
        {userProfile.preferences?.sports_skills && 
         Array.isArray(userProfile.preferences.sports_skills) && 
         userProfile.preferences.sports_skills.length > 0 ? (
          <View style={styles.sportSkillsContainer}>
            {userProfile.preferences.sports_skills.map(renderSportSkill)}
          </View>
        ) : (
          <Text style={[styles.emptyText, {color: colors.smalltext}]}>
            No sports or skills listed
          </Text>
        )}
      </View>
      
      {/* Activities Section */}
      <View style={[styles.section, {borderTopColor: colors.border}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>Activities Created</Text>
        
        {activitiesLoading ? (
          <ActivityIndicator style={styles.activitiesLoading} size="small" color={colors.primary} />
        ) : userActivities.length > 0 ? (
          <View style={styles.activitiesContainer}>
            {userActivities.map(activity => (
              <TouchableOpacity 
                key={activity.id}
                style={styles.activityCardWrapper}
                onPress={() => router.push(`/ActivityDetail?id=${activity.id}`)}
              >
                <ActivityCard activity={activity} />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={[styles.emptyText, {color: colors.smalltext}]}>
            No activities created
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
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
    color: "#d9534f",
    textAlign: "center",
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
  },
  backIconButton: {
    position: "absolute",
    top: 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 80,
    paddingBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#42c8f5",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  sportSkillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  sportSkillItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  sportName: {
    fontSize: 14,
    fontWeight: "500",
    marginRight: 8,
  },
  skillLevelBadge: {
    backgroundColor: "#42c8f5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    width: 100,
    alignItems: "center",
  },
  skillLevelText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  activitiesContainer: {
    marginTop: 8,
  },
  activitiesLoading: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    fontStyle: "italic",
    padding: 16,
  },
  activityCardWrapper: {
    marginBottom: 12,
    width: "100%",
  },
});