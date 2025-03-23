import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { fetchCurrentUser } from "../utils/GetUser";
import { API_URL } from "../config.json";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SportsSkillsMenu, { SPORTS_LIST, SKILL_LEVELS, SportsSkill } from "../components/preferences/SportsSkillsMenu";

export default function SetPreferences() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
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

  const handleAddSport = () => {
    setSportsSkills([...sportsSkills, { sport: SPORTS_LIST[0], skill_level: SKILL_LEVELS[0] }]);
  };

  const handleSportChange = (index: number, value: string) => {
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
        router.replace("/Home");
      } else {
        Alert.alert("Error", data.detail || "Failed to set preferences");
      }
    } catch (error: any) {
      console.error("Error setting preferences:", error);
      Alert.alert("Error", error.message || "An error occurred");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  const renderSportItem = ({ item, index }: { item: SportsSkill, index: number }) => (
    <SportsSkillsMenu
      item={item}
      index={index}
      isDropdownOpen={isDropdownOpen}
      toggleDropdown={toggleDropdown}
      handleSportChange={handleSportChange}
      handleSkillLevelChange={handleSkillLevelChange}
      handleRemoveSport={handleRemoveSport}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Set Your Preferences</Text>
      <Text style={styles.subHeading}>
        Welcome, {user?.firstName || "Error! Please restart the app"}!
        {"\n"}Tell us what you like:
      </Text>
      
      <FlatList
        data={sportsSkills}
        renderItem={renderSportItem}
        keyExtractor={(_, index) => index.toString()}
        style={styles.flatList}
        contentContainerStyle={styles.listContent}
        nestedScrollEnabled={true}
        ListFooterComponent={() => (
          <>
            <TouchableOpacity style={styles.addButton} onPress={handleAddSport}>
              <Text style={styles.addButtonText}>Add Sport</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 80,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subHeading: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
    textAlign: "center",
  },
  flatList: {
    width: "100%",
  },
  listContent: {
    paddingBottom: 50,
  },
  addButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginVertical: 15,
    alignSelf: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    marginBottom: 50,
    width: 200,
    height: 45,
    backgroundColor: "#42c8f5",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});