import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import SportsSkillsMenu, { SportsSkill, SKILL_LEVELS } from "./SportsSkillsMenu";

interface SportsSkillsSelectorProps {
    onSave: (skills: SportsSkill[]) => void;
    initialPreferences?: SportsSkill[];
  }

  const SportsSkillsSelector: React.FC<SportsSkillsSelectorProps> = ({ 
    onSave, 
    initialPreferences = [] 
  }) => {
    const [sportsSkills, setSportsSkills] = useState<SportsSkill[]>(
      initialPreferences.length > 0 
        ? initialPreferences 
        : [{ sport: "", skill_level: "" }]
    );
  
  const [dropdownOpen, setDropdownOpen] = useState({
    sport: -1,
    skill: -1
  });
  
  const isDropdownOpen = (type: 'sport' | 'skill', index: number) => {
    return dropdownOpen[type] === index;
  };
  
  const toggleDropdown = (type: 'sport' | 'skill', index: number, isOpen: boolean) => {
    setDropdownOpen({
      ...dropdownOpen,
      [type]: isOpen ? index : -1
    });
  };
  
  const handleSportChange = (index: number, value: string) => {
    const updatedSkills = [...sportsSkills];
    updatedSkills[index].sport = value;
    setSportsSkills(updatedSkills);
  };
  
  const handleSkillLevelChange = (index: number, value: string) => {
    const updatedSkills = [...sportsSkills];
    updatedSkills[index].skill_level = value;
    setSportsSkills(updatedSkills);
  };
  
  const handleRemoveSport = (index: number) => {
    const updatedSkills = sportsSkills.filter((_, i) => i !== index);
    setSportsSkills(updatedSkills);
  };
  
  const handleAddSport = () => {
    setSportsSkills([...sportsSkills, { sport: "", skill_level: "" }]);
  };
  
  const handleSaveAll = async () => {
    // Filter out any incomplete entries
    const validSkills = sportsSkills.filter(item => item.sport && item.skill_level);
    
    if (validSkills.length > 0) {
      onSave(validSkills);
    }
  };
  
  return (
    <View style={styles.container}>
      {sportsSkills.map((item, index) => (
        <SportsSkillsMenu
          key={index}
          item={item}
          index={index}
          isDropdownOpen={isDropdownOpen}
          toggleDropdown={toggleDropdown}
          handleSportChange={handleSportChange}
          handleSkillLevelChange={handleSkillLevelChange}
          handleRemoveSport={handleRemoveSport}
        />
      ))}
      
      <View style={styles.buttonContainer}>
        <Button title="Add Another Sport" onPress={handleAddSport} />
        <Button title="Save Preferences" onPress={handleSaveAll} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 0,
  }
});

export default SportsSkillsSelector;
