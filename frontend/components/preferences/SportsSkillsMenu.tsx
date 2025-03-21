import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

export interface SportsSkill {
  sport: string;
  skill_level: string;
}

// Predefined list of sports
export const SPORTS_LIST = [
  "Basketball",
  "Football",
  "Soccer",
  "Tennis",
  "Volleyball",
  "Swimming",
  "Golf",
  "Baseball",
  "Cycling",
  "Running",
  "Hiking",
  "Yoga",
  "Boxing",
  "Martial Arts",
  "Skiing",
  "Snowboarding",
  "Surfing"
];

// Skill level options
export const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
  "Professional"
];

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
  // Use provided items or create from default lists
  const sportsItems = propSportsItems || SPORTS_LIST.map(sport => ({ label: sport, value: sport }));
  const skillItems = propSkillItems || SKILL_LEVELS.map(skill => ({ label: skill, value: skill }));

  return (
    <View style={styles.sportContainer}>
      <Text style={styles.labelText}>Sport:</Text>
      <DropDownPicker
        open={isDropdownOpen('sport', index)}
        value={item.sport}
        items={sportsItems}
        setOpen={(isOpen) => toggleDropdown('sport', index, !!isOpen)}
        setValue={(callback) => {
          handleSportChange(index, callback(item.sport));
        }}
        style={styles.dropdownPicker}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={3000 - (index * 10)}
        zIndexInverse={1000 + (index * 10)}
        listMode={Platform.OS === "ios" ? "SCROLLVIEW" : "FLATLIST"}
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
      />
      
      <Text style={[styles.labelText, { marginTop: 15 }]}>Skill Level:</Text>
      <DropDownPicker
        open={isDropdownOpen('skill', index)}
        value={item.skill_level}
        items={skillItems}
        setOpen={(isOpen) => toggleDropdown('skill', index, !!isOpen)}
        setValue={(callback) => {
          handleSkillLevelChange(index, callback(item.skill_level));
        }}
        style={styles.dropdownPicker}
        dropDownContainerStyle={styles.dropdownContainer}
        zIndex={2000 - (index * 10)}
        zIndexInverse={2000 + (index * 10)}
        listMode={Platform.OS === "ios" ? "SCROLLVIEW" : "FLATLIST"}
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
      />
      
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => handleRemoveSport(index)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
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
    backgroundColor: "#dc3545",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignSelf: "flex-end",
    marginTop: 5,
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SportsSkillsMenu;