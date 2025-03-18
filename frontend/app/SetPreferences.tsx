import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { fetchCurrentUser } from "../utils/AuthUtils";

interface SportsSkill {
  sport: string;
  skill_level: string;
}

export default function SetPreferences() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sportsSkills, setSportsSkills] = useState<SportsSkill[]>([{ sport: "", skill_level: "" }]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (error: any) {
        Alert.alert("Error", error.message || "Failed to fetch user data", [
          { text: "OK", onPress: () => router.replace("/Login") },
        ]);
      }
    };

    getUser();
  }, [router]);

  const handleAddSport = () => {
    setSportsSkills([...sportsSkills, { sport: "", skill_level: "" }]);
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

  const handleSubmit = async () => {
    try {
      if (!user?.email) {
        Alert.alert("Error", "User email not available. Please log in again.");
        return;
      }

      const emptyFields = sportsSkills.some((skill) => !skill.sport || !skill.skill_level);
      if (emptyFields) {
        Alert.alert("Error", "Please fill in all sport and skill level fields.");
        return;
      }

      const requestBody = {
        email: user.email,
        sports_skills: sportsSkills,
      };

      const response = await fetch("http://127.0.0.1:8000/auth/set_preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success!", "Preferences set successfully!", [
          { text: "OK", onPress: () => router.replace("/Home") },
        ]);
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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Set Your Preferences</Text>
      <Text style={styles.emailLabel}>Setting preferences for: {user?.email || "Not logged in"}</Text>
      <FlatList
        data={sportsSkills}
        renderItem={({ item, index }) => (
          <View key={index} style={styles.sportContainer}>
            <TextInput
              style={styles.input}
              placeholder="Sport"
              value={item.sport}
              onChangeText={(value) => handleSportChange(index, value)}
            />
            <TextInput
              style={styles.input}
              placeholder="Skill Level"
              value={item.skill_level}
              onChangeText={(value) => handleSkillLevelChange(index, value)}
            />
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddSport}>
        <Text style={styles.addButtonText}>Add Sport</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  emailLabel: {
    fontSize: 16,
    marginBottom: 20,
    color: "#555",
  },
  input: {
    height: 40,
    width: "100%",
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
  },
  sportContainer: {
    width: "100%",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButton: {
    width: "100%",
    height: 40,
    backgroundColor: "#42c8f5",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});