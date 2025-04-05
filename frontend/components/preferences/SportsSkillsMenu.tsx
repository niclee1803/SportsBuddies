import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { API_URL } from "../../config.json";
import { useTheme } from "@/hooks/ThemeContext";

export interface SportsSkill {
  sport: string;
  skill_level: string;
}

// Fallback list if API fails
const FALLBACK_SPORTS = [
  "Basketball", "Football", "Soccer", "Tennis", 
  "Volleyball", "Swimming", "Golf", "Baseball"
];

// Predefined skill levels
const SKILL_LEVELS = [
  "Beginner", "Intermediate", "Advanced", "Professional"
];

// Initialize sports list that will be populated from API
export let SPORTS_LIST: string[] = [];
// Export the predefined skill levels
export { SKILL_LEVELS };

interface SportContainerProps {
  item: SportsSkill;
  index: number;
  sportsItems?: Array<{label: string; value: string}>; // Optional - will use default if not provided
  skillItems?: Array<{label: string; value: string}>; // Optional - will use default if not provided
  isDropdownOpen: (type: 'sport' | 'skill', index: number) => boolean;
  toggleDropdown: (type: 'sport' | 'skill', index: number, isOpen: boolean) => void;
  handleSportChange: (index: number, value: string) => void;
  handleSkillLevelChange: (index: number, value: string) => void;
  handleRemoveSport: (index: number) => void;
}

const SportsSkillsMenu = ({ 
  item, 
  index, 
  sportsItems: propSportsItems, 
  skillItems: propSkillItems, 
  isDropdownOpen, 
  toggleDropdown, 
  handleSportChange,
  handleSkillLevelChange,
  handleRemoveSport 
}: SportContainerProps) => {
  // Local state for API-fetched sports list
  const [sportsList, setSportsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();


  

  useEffect(() => {
    // Function to fetch sports list
    const fetchSportsList = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/utils/sports_list`);
        if (response.ok) {
          const data = await response.json();
          setSportsList(data);
          // Update exported variable for use outside component
          SPORTS_LIST = data;
        } else {
          console.warn("Failed to fetch sports list, using fallback");
          setSportsList(FALLBACK_SPORTS);
          SPORTS_LIST = FALLBACK_SPORTS;
        }
      } catch (error) {
        console.error("Error fetching sports list:", error);
        setSportsList(FALLBACK_SPORTS);
        SPORTS_LIST = FALLBACK_SPORTS;
      } finally {
        setLoading(false);
      }
    };

    fetchSportsList();
  }, []);

  // Format sports for dropdown - use props if provided, else use API data, fallback to empty
  const sportsItems = propSportsItems || 
                     (sportsList.length > 0 ? 
                      sportsList.map(sport => ({ label: sport, value: sport })) : 
                      []);

  // Format skill levels for dropdown - use props if provided, else use predefined SKILL_LEVELS
  const skillItems = propSkillItems || 
                    SKILL_LEVELS.map(skill => ({ label: skill, value: skill }));

  return (
    <View style={[styles.sportContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.labelText, { color: colors.text }]}>Sport:</Text>
      <DropDownPicker
        open={isDropdownOpen('sport', index)}
        value={item.sport}
        items={sportsItems}
        setOpen={(isOpen) => toggleDropdown('sport', index, !!isOpen)}
        setValue={(callback) => {
          handleSportChange(index, callback(item.sport));
        }}
        style={[styles.dropdownPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
        dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
        textStyle={{ color: colors.text }}
        labelStyle={{ color: colors.text }}
        zIndex={5000 - (index * 20)} // Higher base z-index for sports
        zIndexInverse={1000 + (index * 20)}
        listMode={Platform.OS === "ios" ? "SCROLLVIEW" : "FLATLIST"}
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        loading={loading}
        placeholder={loading ? "Loading sports..." : "Select a sport"}
      />
      
      <Text style={[styles.labelText, { marginTop: 15 }, { color: colors.text }]}>Skill Level:</Text>
      <DropDownPicker
        open={isDropdownOpen('skill', index)}
        value={item.skill_level}
        items={skillItems}
        setOpen={(isOpen) => toggleDropdown('skill', index, !!isOpen)}
        setValue={(callback) => {
          handleSkillLevelChange(index, callback(item.skill_level));
        }}
        style={[styles.dropdownPicker,{ backgroundColor: colors.card, borderColor: colors.border }]}
        dropDownContainerStyle={[styles.dropdownContainer, { backgroundColor: colors.card, borderColor: colors.border }]}
        textStyle={{ color: colors.text }}
        labelStyle={{ color: colors.text }}
  
        zIndex={4000 - (index * 20)} // Lower base z-index for skills
        zIndexInverse={2000 + (index * 20)}
        listMode={Platform.OS === "ios" ? "SCROLLVIEW" : "FLATLIST"}
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        placeholder="Select a skill level"
      />
      
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemoveSport(index)}
      >
        <Text style={[styles.removeButtonText]}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sportContainer: {
    width: "100%",
    marginBottom: 10,
    padding: 5,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  labelText: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "500",
  },
  dropdownPicker: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 5,
  },
  dropdownContainer: {
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  removeButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: "flex-end",
    marginTop: 5,
  },
  removeButtonText: {
    color: "black",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SportsSkillsMenu;