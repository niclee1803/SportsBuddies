import React,{ useState } from 'react';
import { View,Text,TextInput,TouchableOpacity,Alert,StyleSheet,ScrollView,Platform } from 'react-native';
//import BackButton from '../components/backarrow'; 
import { HeaderBackButton } from '../node_modules/@react-navigation/elements';
import { useRouter, useFocusEffect } from 'expo-router';
import AuthLayout from '@/components/AuthLayout';
import DropDownPicker from "react-native-dropdown-picker";
import {SPORTS_LIST,SKILL_LEVELS,ROLE,} from "../components/activity/ActivityMenu";
import DateTimeInput from "@/components/activity/DateTimeInput";
import BannerPicker from "@/components/activity/BannerPicker";
import {handleUploadActivity,pickImage,cancelUpload,handleSubmitActivity,} from "../utils/createactivityhelpers";
import MapSelector from "@/components/activity/MapSelector";



const Create = () => {
  const router = useRouter();
  const [activityName, setActivityName] = useState("");
  const [location, setLocation] = useState("");
  const [activityDescription, setActivityDescription] = useState("");
  const [tags, setTags] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [sport, setSport] = useState("");
  const [sportDropdownOpen, setSportDropdownOpen] = useState(false);
  const [sportItems, setSportItems] = useState(
    SPORTS_LIST.map((sport) => ({ label: sport, value: sport }))
  );
  const [skillLevel, setSkillLevel] = useState("");
  const [skillDropdownOpen, setSkillDropdownOpen] = useState(false);
  const [skillItems, setSkillItems] = useState(
    SKILL_LEVELS.map((skill) => ({ label: skill, value: skill }))
  );
  const [role, setRole] = useState("");
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [roleItems, setRoleItems] = useState(
    ROLE.map((role) => ({ label: role, value: role }))
  );
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null); 

  const onSuccess = () => {
    Alert.alert('Success!', 'Activity uploaded successfully.');
    // Optionally, you can navigate or reset form here
  };

  const onError = (msg: string) => {
    Alert.alert('Error', msg);
  };

  const handleFormSubmit = () => {
    handleSubmitActivity(
      {
        activityName,
        date,
        sport,
        skillLevel,
        role,
        activityDescription,
        maxParticipants,
        bannerUri,
        selectedCoords,
        location,
        placeName
      },
      onSuccess,
      onError
    );
  };


  return(
    <AuthLayout>
       <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>

              
              <Text style={styles.title}>Create Activity</Text>

              <View style={styles.formWrapper}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Activity Name"
                  placeholderTextColor={styles.placeholder.color}
                  value={activityName}
                  onChangeText={setActivityName}
                />

                <DateTimeInput
                  label="Date"
                  mode="date"
                  value={date}
                  onChange={setDate}
                />

                <DateTimeInput
                  label="Time"
                  mode="time"
                  value={date}
                  onChange={setDate}
                />

                <BannerPicker
                  bannerUri={bannerUri}
                  pickImage={() => pickImage(setBannerUri)} 
                  cancelUpload={() => cancelUpload(setBannerUri)} 
                />

                <DropDownPicker
                  open={sportDropdownOpen}
                  value={sport}
                  items={sportItems}
                  setOpen={setSportDropdownOpen}
                  setValue={(callback) => {
                    const newValue = callback(sport);
                    setSport(newValue);
                  }}
                  setItems={setSportItems}
                  style={styles.dropdownPicker}
                  placeholder="Select Sport"
                  placeholderStyle={{ color: "#999" }}
                  zIndex={3000}
                  zIndexInverse={1000}
                />

                <DropDownPicker
                  open={skillDropdownOpen}
                  value={skillLevel}
                  items={skillItems}
                  setOpen={setSkillDropdownOpen}
                  setValue={(callback) => {
                    const newValue = callback(skillLevel);
                    setSkillLevel(newValue);
                  }}
                  setItems={setSkillItems}
                  style={styles.dropdownPicker}
                  placeholder="Select Skill Level"
                  placeholderStyle={{ color: "#999" }}
                  zIndex={2000}
                  zIndexInverse={2000}
                />

                <DropDownPicker
                  open={roleDropdownOpen}
                  value={role}
                  items={roleItems}
                  setOpen={setRoleDropdownOpen}
                  setValue={(callback) => {
                    const newValue = callback(role);
                    setRole(newValue);
                  }}
                  setItems={setRoleItems}
                  style={styles.dropdownPicker}
                  placeholder="Select Role"
                  placeholderStyle={{ color: "#999" }}
                  zIndex={1000}
                  zIndexInverse={3000}
                />

                <TextInput
                  style={styles.textarea}
                  placeholder="Activity Description"
                  placeholderTextColor={styles.placeholder.color}
                  value={activityDescription}
                  onChangeText={setActivityDescription}
                  multiline
                />
                <TextInput
                  style={styles.inputField}
                  placeholder="Max Participants"
                  placeholderTextColor={styles.placeholder.color}
                  value={maxParticipants}
                  onChangeText={setMaxParticipants}
                />

                  <MapSelector
                    onSelect={({ name, latitude, longitude }) => {
                      setLocation(name);
                      setSelectedCoords({ latitude, longitude });
                    }}
                  />

                <TextInput
                  style={styles.inputField}
                  placeholder="Place Name"
                  placeholderTextColor={styles.placeholder.color}
                  value={placeName}
                  onChangeText={setPlaceName}
                />


                {/* <TextInput
                  style={styles.inputField}
                  placeholder="Location"
                  placeholderTextColor={styles.placeholder.color}
                  value={location}
                  onChangeText={setLocation}
                /> */}

                <TouchableOpacity style={styles.uploadButton} onPress={handleFormSubmit}>
                  <Text style={styles.uploadButtonText}>Upload Activity</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
    </AuthLayout>
  )

};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10, 
    marginBottom: 8,
    color: '#333',
    textAlign: "center",
  },
  formWrapper: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 12,
  },
  placeholder: {
    color: "#999", // 👈 Placeholder color here
  },
  inputField: {
    height: 30,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    justifyContent: "center",
  },
  textarea: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
    textAlignVertical: "top",
  },
  dropdownPicker: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderRadius: 8,
  },
  bannerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: "#42c8f5",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  iosPicker: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginVertical: 10,
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
});




export default Create;
