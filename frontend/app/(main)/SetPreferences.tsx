import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  FlatList,
  ActivityIndicator,
  SafeAreaView 
} from "react-native";
import { useRouter } from "expo-router";
import { fetchCurrentUser } from "@/utils/GetUser";
import { API_URL } from "@/config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SportsSkillsMenu, { SPORTS_LIST, SKILL_LEVELS, SportsSkill } from "@/components/preferences/SportsSkillsMenu";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@/hooks/ThemeContext';

export default function SetPreferences() {
  const { colors } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Initialize with default values from the exported constants
  const [sportsSkills, setSportsSkills] = useState<SportsSkill[]>([
    { sport: SPORTS_LIST[0], skill_level: SKILL_LEVELS[0] }
  ]);
  
  // Dropdown state management
  const [openDropdown, setOpenDropdown] = useState<{ type: 'sport' | 'skill', index: number } | null>(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch user data");
        router.replace("/Login");
      }
    };

    getUser();
  }, [router]);

  // Find the next available sport that hasn't been used yet
  const findNextAvailableSport = (): string => {
    const usedSports = sportsSkills.map(skill => skill.sport);
    const availableSport = SPORTS_LIST.find(sport => !usedSports.includes(sport));
    return availableSport || SPORTS_LIST[0]; // Fallback if all sports are used
  };

  const handleAddSport = () => {
    // Check if we've already used all available sports
    if (sportsSkills.length >= SPORTS_LIST.length) {
      Alert.alert("Maximum Reached", "You've already added all available sports.");
      return;
    }

    const nextSport = findNextAvailableSport();
    setSportsSkills([...sportsSkills, { sport: nextSport, skill_level: SKILL_LEVELS[0] }]);
  };

  const handleSportChange = (index: number, value: string) => {
    // Check if this sport is already selected in another entry
    const isDuplicate = sportsSkills.some((item, i) => i !== index && item.sport === value);
    
    if (isDuplicate) {
      Alert.alert("Duplicate Sport", "This sport is already selected. Please choose a different one.");
      return;
    }
    
    const newSportsSkills = [...sportsSkills];
    newSportsSkills[index].sport = value;
    setSportsSkills(newSportsSkills);
  };

  const handleSkillLevelChange = (index: number, value: string) => {
    const newSportsSkills = [...sportsSkills];
    newSportsSkills[index].skill_level = value;
    setSportsSkills(newSportsSkills);
  };

  const handleRemoveSport = (index: number) => {
    if (sportsSkills.length > 1) {
      const newSportsSkills = [...sportsSkills];
      newSportsSkills.splice(index, 1);
      setSportsSkills(newSportsSkills);
    } else {
      Alert.alert("Cannot Remove", "You must have at least one sport preference.");
    }
  };

  const isDropdownOpen = (type: 'sport' | 'skill', index: number) => {
    return openDropdown?.type === type && openDropdown?.index === index;
  };

  const toggleDropdown = (type: 'sport' | 'skill', index: number, isOpen: boolean) => {
    if (isOpen) {
      setOpenDropdown({ type, index });
    } else {
      setOpenDropdown(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Ensure the user is authenticated and has a valid token
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Error", "User authentication token not available. Please log in again.");
        router.replace("/Login");
        return;
      }
  
      // Validate that all fields are filled
      const emptyFields = sportsSkills.some((skill) => !skill.sport || !skill.skill_level);
      if (emptyFields) {
        Alert.alert("Error", "Please fill in all sport and skill level fields.");
        return;
      }
  
      // Prepare the request body
      const requestBody = {
        sports_skills: sportsSkills,
      };
      
      // Make the API call to the backend
      const response = await fetch(`${API_URL}/user/set_preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });
  
      const data = await response.json();
  
      // Handle the response
      if (response.ok) {
        Alert.alert("Success!", "Preferences set successfully!");
        router.replace("/Dashboard");
      } else {
        Alert.alert("Error", data.detail || "Failed to set preferences");
      }
    } catch (error: any) {
      console.error("Error setting preferences:", error);
      Alert.alert("Error", error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderSportItem = ({ item, index }: { item: SportsSkill, index: number }) => (
    <View style={[styles.sportItemContainer,, {backgroundColor: colors.background }]}>
      <SportsSkillsMenu
        item={item}
        index={index}
        isDropdownOpen={isDropdownOpen}
        toggleDropdown={toggleDropdown}
        handleSportChange={handleSportChange}
        handleSkillLevelChange={handleSkillLevelChange}
        handleRemoveSport={handleRemoveSport}
        // Filter out already selected sports except the current one
        sportsItems={SPORTS_LIST.map(sport => ({
          label: sport,
          value: sport,
          // Disable if the sport is already selected in another item
          disabled: sport !== item.sport && sportsSkills.some(s => s.sport === sport)
        }))}
        skillItems={SKILL_LEVELS.map(level => ({
          label: level,
          value: level
        }))}
      />
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={[styles.loadingContainer, {backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#42c8f5" />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading user data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>Sports Preferences</Text>
          <Text style={[styles.subHeading, { color: colors.smalltext }]}>
            Welcome, {user?.firstName || ""}!
            {"\n"}Select your favorite sports and skill levels:
          </Text>
        </View>
        
        <FlatList
          data={sportsSkills}
          renderItem={renderSportItem}
          keyExtractor={(_, index) => index.toString()}
          style={styles.flatList}
          contentContainerStyle={styles.listContent}
          nestedScrollEnabled={true}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.addButton, sportsSkills.length >= SPORTS_LIST.length && styles.disabledButton]} 
            onPress={handleAddSport}
            disabled={sportsSkills.length >= SPORTS_LIST.length}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color="black" />
            <Text style={styles.addButtonText}>Add Another Sport</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.disabledButton]} 
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Save Preferences</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    marginBottom: 24,
    alignItems: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subHeading: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  sportItemContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  flatList: {
    width: "100%",
  },
  listContent: {
    paddingBottom: 16,
  },
  buttonContainer: {
    marginTop: 8,
    paddingBottom: 24,
  },
  addButton: {
    backgroundColor: "#42c8f5",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  addButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  submitButton: {
    
    backgroundColor: "#42c8f5",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    paddingVertical: 10,
    paddingHorizontal: 20,
  
    
  },
  disabledButton: {
    backgroundColor: "#a0dcf5",
  },
  submitButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
});