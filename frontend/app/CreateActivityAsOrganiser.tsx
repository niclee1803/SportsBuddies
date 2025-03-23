import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import { SPORTS_LIST, SKILL_LEVELS, Visibility} from "../components/preferences/ActivityMenu";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.json";
import DateTimePicker from "@react-native-community/datetimepicker"


export const handleUploadActivity = async (requestBody: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    console.log("🧪 Firebase token:", token);
    const response = await fetch(`${API_URL}/activity/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error("Error uploading activity: " + error.message);
  }
};

export default function CreateActivityAsOrganiser() {
  const router = useRouter();
  
  // State management for the input fields
  const [activityName, setActivityName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [activityDescription, setActivityDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [maxParticipants, setMaxParticipants] = useState<string>("");
  const [sport, setSport] = useState<string>(SPORTS_LIST[0]);
  const [sportDropdownOpen, setSportDropdownOpen]=useState(false);
  const [sportItems, setSportItems]= useState(SPORTS_LIST.map(sport => ( {label: sport, value: sport})));
  const [skillLevel, setSkillLevel] = useState<string>(SKILL_LEVELS[0]);
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [skillItems, setSkillItems] = useState(SKILL_LEVELS.map(skill => ({ label: skill, value: skill })));
  const [visibility, setVisibility] = useState<string>(Visibility[0]);
  const [visibilityDropdownOpen, setVisibilityDropdownOpen] = useState(false);
  const [visibilityItems, setVisibilityItems] = useState(Visibility.map(visibility => ({ label: visibility, value: visibility })));
  //Date-time-picker
  const [date, setDate] = useState(new Date()); //set current value of data to today's date
  const [time, setTime] = useState<string>("00:00");
  const [showPicker, setShowPicker]=useState(false); //set state of picker: show or hide
  
  const handleSubmit = async () => {
    try {
      const requestBody = {
        activityName,
        date,
        time,
        location,
        sport,
        skillLevel,
        visibility,
        activityDescription,
        tags,
        maxParticipants,
      };
      console.log("Sending activity data to backend:", requestBody); //troublshoot
      const response = await handleUploadActivity(requestBody); // Helper function to make the API call
      console.log("Response from backend:", response); // 👈 Add this

      if (response.success) {
        console.log("If block works")
        Alert.alert("Success!", "Activity uploaded successfully.");
        //router.replace("/Home");
      } else {
        Alert.alert("Error", response.message || "Failed to upload activity.");
      }
    } catch (error: any) {
      console.log("Upload Error:", error); 
      Alert.alert("Error", error.message || "An error occurred while uploading the activity.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Activity as Organiser</Text>
      
      <TextInput
        style={styles.inputField}
        placeholder="Activity Name"
        value={activityName}
        onChangeText={setActivityName}
      />

      {showPicker && (
        <DateTimePicker
        mode="date"
        display="spinner" //calendar: date mode //clock:time mode
        value={date}
      />
      )}
        
      
      
      <TextInput
        style={styles.inputField}
        placeholder="Time"
        value={time}
        onChangeText={setTime}
      />
      
      <TextInput
        style={styles.inputField}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      
      <DropDownPicker
        open={sportDropdownOpen} //what the user sees 
        value={sport} //what the user chose 
        items={sportItems} //what the dropdown populates 
        setOpen={setSportDropdownOpen}
        setValue={(callback) => {const newValue = callback(sport); setSport(newValue);}}
        setItems={setSportItems}
        style={styles.dropdownPicker}
        placeholder="Select Sport"
        zIndex={3000}
        zIndexInverse={1000}
      />
      
      <DropDownPicker
        open={skillDropdownOpen}
        value={skillLevel}
        items={skillItems}
        setOpen={setSkillDropdownOpen}
        setValue={(callback) => {const newValue = callback(skillLevel);setSkillLevel(newValue);}}
        setItems={setSkillItems}
        style={styles.dropdownPicker}
        placeholder="Select Skill Level"
        zIndex={2000}
        zIndexInverse={2000}
      />
      
      <DropDownPicker
        open={visibilityDropdownOpen}
        value={visibility}
        items={visibilityItems}
        setOpen={setVisibilityDropdownOpen}
        setValue={(callback) => {const newValue = callback(visibility);setVisibility(newValue);}}
        setItems={setVisibilityItems}
        style={styles.dropdownPicker}
        placeholder="Select Skill Level"
        zIndex={1000}
        zIndexInverse={3000}
      />
      
      <TextInput
        style={styles.textarea}
        placeholder="Activity Description"
        value={activityDescription}
        onChangeText={setActivityDescription}
        multiline
      />
      
      <TextInput
        style={styles.inputField}
        placeholder="Tags"
        value={tags}
        onChangeText={setTags}
      />
      
      <TextInput
        style={styles.inputField}
        placeholder="Max Participants"
        value={maxParticipants}
        onChangeText={(setMaxParticipants)}
      />
      
      <TouchableOpacity style={styles.uploadButton} onPress={handleSubmit}>
        <Text style={styles.uploadButtonText}>Upload Activity</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputField: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
  },
  textarea: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingLeft: 10,
    textAlignVertical: "top",
  },
  dropdownPicker: {
    marginBottom: 15,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderRadius: 5,
  },
  uploadButton: {
    backgroundColor: "#42c8f5",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
