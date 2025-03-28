import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../config.json";
import Template from "../components/Template";
import { fetchCurrentUser } from "@/utils/GetUser";
import { validateUsername, validateEmail, validatePhone } from "@/components/signup/ValidationUtils";
import SportsSkillsMenu, { SportsSkill, SKILL_LEVELS } from "../components/preferences/SportsSkillsMenu";

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Separate states for current and original preferences
  const [originalPreferences, setOriginalPreferences] = useState<SportsSkill[]>([]);
  const [currentPreferences, setCurrentPreferences] = useState<SportsSkill[]>([]);

  // For dropdown management
  const [dropdownOpen, setDropdownOpen] = useState({
    sport: -1,
    skill: -1
  });
  
  // Validation error states
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
    preferences: "",
  });

  // User data states
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    profilePicUrl: "",
  });

  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    profilePicUrl: "",
  });

  // Load user data and preferences when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch basic user data
        const userData = await fetchCurrentUser();
        console.log("User data from API:", userData);
        
        const userDataValues = {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          username: userData.username || "",
          phone: userData.phone || "",
          email: userData.email || "",
          profilePicUrl: userData.profilePicUrl || "https://placehold.co/150",
        };
        
        setUserData(userDataValues);
        setOriginalData(userDataValues);
        
        // Fetch preferences separately
        const response = await fetch(`${API_URL}/user/get_preferences`, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
          },
        });
        
        const preferencesData = await response.json();
        console.log("Preferences data from API:", preferencesData);
        
        let sportsSkills: SportsSkill[] = [];
        
        // Handle both array and object formats for compatibility
        if (preferencesData.preferences && preferencesData.preferences.sports_skills) {
          if (Array.isArray(preferencesData.preferences.sports_skills)) {
            // Handle array format from new OOP backend
            sportsSkills = preferencesData.preferences.sports_skills;
          } else if (typeof preferencesData.preferences.sports_skills === 'object') {
            // Handle object format from previous backend
            sportsSkills = Object.entries(preferencesData.preferences.sports_skills).map(
              ([sport, skill_level]) => ({
                sport,
                skill_level: skill_level as string,
              })
            );
          }
        }
        
        console.log("Processed sports skills:", sportsSkills);
        
        // Set both original and current preferences
        setOriginalPreferences([...sportsSkills]);
        setCurrentPreferences([...sportsSkills]);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        Alert.alert("Error", "Failed to load profile data and preferences.");
        
        // If there's an auth error, redirect to login
        if (error instanceof Error && error.message.includes("token")) {
          router.replace("/Login");
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Compare current values with original to detect changes
  useEffect(() => {
    const checkForChanges = () => {
      // Check profile data changes
      const hasUserDataChanged = 
        userData.firstName !== originalData.firstName ||
        userData.lastName !== originalData.lastName ||
        userData.username !== originalData.username ||
        userData.phone !== originalData.phone ||
        userData.email !== originalData.email;
      
      // Check preferences changes - deep compare arrays
      const hasPreferencesChanged = JSON.stringify(currentPreferences) !== JSON.stringify(originalPreferences);
      
      setHasChanges(hasUserDataChanged || hasPreferencesChanged);
    };
    
    checkForChanges();
  }, [userData, originalData, currentPreferences, originalPreferences]);

  // Dropdown handlers
  const isDropdownOpen = (type: 'sport' | 'skill', index: number) => {
    return dropdownOpen[type] === index;
  };

  const toggleDropdown = (type: 'sport' | 'skill', index: number, isOpen: boolean) => {
    setDropdownOpen({
      ...dropdownOpen,
      [type]: isOpen ? index : -1
    });
  };

  // Profile field validation
  const validateUsernameField = async () => {
    if (userData.username === originalData.username) {
      setErrors(prev => ({ ...prev, username: "" }));
      return true;
    }
    return await validateUsername(
      userData.username, 
      (error) => setErrors(prev => ({ ...prev, username: error }))
    );
  };

  const validateEmailField = async () => {
    if (userData.email === originalData.email) {
      setErrors(prev => ({ ...prev, email: "" }));
      return true;
    }
    return await validateEmail(
      userData.email, 
      (error) => setErrors(prev => ({ ...prev, email: error }))
    );
  };

  const validatePhoneField = async () => {
    if (userData.phone === originalData.phone) {
      setErrors(prev => ({ ...prev, phone: "" }));
      return true;
    }
    return await validatePhone(
      userData.phone, 
      (error) => setErrors(prev => ({ ...prev, phone: error }))
    );
  };
  
  // Validate sports preferences
  const validateSportsPreferences = (): boolean => {
    // Skip validation if no changes
    if (JSON.stringify(currentPreferences) === JSON.stringify(originalPreferences)) {
      setErrors(prev => ({ ...prev, preferences: "" }));
      return true;
    }
    
    // Check for empty fields
    const hasEmptyFields = currentPreferences.some(
      pref => !pref.sport || !pref.skill_level
    );
    
    if (hasEmptyFields) {
      setErrors(prev => ({
        ...prev, 
        preferences: "Please complete all sport and skill level selections."
      }));
      return false;
    }
    
    // Check for duplicates
    const sportNames = currentPreferences.map(pref => pref.sport);
    const uniqueSports = new Set(sportNames);
    
    if (sportNames.length !== uniqueSports.size) {
      setErrors(prev => ({
        ...prev, 
        preferences: "You've selected the same sport multiple times."
      }));
      return false;
    }
    
    setErrors(prev => ({ ...prev, preferences: "" }));
    return true;
  };

  // Validate all fields at once
  const validateAllFields = async () => {
    const usernameValid = await validateUsernameField();
    const emailValid = await validateEmailField();
    const phoneValid = await validatePhoneField();
    const preferencesValid = validateSportsPreferences();
    
    return usernameValid && emailValid && phoneValid && preferencesValid;
  };

  // Handlers for user data changes
  const handleInputChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  // Handlers for sports preferences
  const handleSportChange = (index: number, value: string) => {
    // Check if this sport is already selected in another entry
    const isDuplicate = currentPreferences.some(
      (pref, i) => i !== index && pref.sport === value
    );
    
    if (isDuplicate) {
      Alert.alert(
        "Duplicate Sport",
        "This sport is already in your preferences. Please choose a different one."
      );
      return;
    }
    
    const updatedPreferences = currentPreferences.map((pref, i) => 
      i === index 
        ? { ...pref, sport: value }
        : pref
    );
    
    setCurrentPreferences(updatedPreferences);
    
    // Clear any previous validation errors
    if (errors.preferences) {
      setErrors(prev => ({ ...prev, preferences: "" }));
    }
  };

  const handleSkillLevelChange = (index: number, value: string) => {
    const updatedPreferences = currentPreferences.map((pref, i) => 
      i === index 
        ? { ...pref, skill_level: value }  // Create new object with updated skill
        : pref
    );
    
    setCurrentPreferences(updatedPreferences);
    
    // Clear any previous validation errors
    if (errors.preferences) {
      setErrors(prev => ({ ...prev, preferences: "" }));
    }
  };

  const handleAddSport = () => {
    setCurrentPreferences([...currentPreferences, { sport: "", skill_level: "" }]);
  };

  const handleRemoveSport = (index: number) => {
    const sportToRemove = currentPreferences[index].sport;
    const updatedPreferences = currentPreferences.filter((_, i) => i !== index);
    setCurrentPreferences(updatedPreferences);
    
    // Clear any previous validation errors
    if (errors.preferences) {
      setErrors(prev => ({ ...prev, preferences: "" }));
    }
  };

  // Main save function
  const handleSave = async () => {
    // First validate all fields
    const isValid = await validateAllFields();
    if (!isValid) {
      Alert.alert(
        "Validation Error", 
        "Please fix the highlighted fields before saving."
      );
      return;
    }
  
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Error",
          "User authentication token not available. Please log in again."
        );
        router.replace("/Login");
        return;
      }
  
      // Save user profile data
      const profileResponse = await fetch(`${API_URL}/user/update_profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: userData.firstName,
          last_name: userData.lastName,
          username: userData.username,
          phone: userData.phone,
          email: userData.email,
        }),
      });
  
      // Save preferences data
      const preferencesResponse = await fetch(`${API_URL}/user/set_preferences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sports_skills: currentPreferences
        }),
      });
      
      // Handle responses
      if (!profileResponse.ok) {
        const profileData = await profileResponse.json();
        throw new Error(profileData.detail || "Failed to update profile");
      }
      
      if (!preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        throw new Error(preferencesData.detail || "Failed to update preferences");
      }
  
      // Update was successful
      Alert.alert("Profile Updated", "Your profile and preferences have been saved.");
      
      // Update original data to match current data
      setOriginalData({ ...userData });
      setOriginalPreferences([...currentPreferences]);
      setHasChanges(false);
      
      // Navigate back
      router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // Profile picture update function
  const handleProfilePictureUpdate = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Please allow access to select a photo."
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      
      const imageUri = result.assets[0].uri;

      // Convert the image URI to a Blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Get the token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "Error",
          "User authentication token not available. Please log in again."
        );
        router.replace("/Login");
        return;
      }

      // Create form data for upload
      const formData = new FormData();
      if (Platform.OS === "web") {
        formData.append("file", blob, "profile_picture.jpg");
      } else {
        formData.append("file", {
          uri: imageUri,
          name: "profile_picture.jpg",
          type: "image/jpeg",
        } as any);
      }

      // Upload the image
      const uploadResponse = await fetch(
        `${API_URL}/user/upload_profile_picture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await uploadResponse.json();

      if (uploadResponse.ok) {
        Alert.alert("Success", "Profile picture updated successfully.");
        setUserData(prev => ({
          ...prev,
          profilePicUrl: data.profilePicUrl,
        }));
      } else {
        throw new Error(data.detail || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to update profile picture."
      );
    }
  };

  // Account deletion function
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) {
                Alert.alert(
                  "Error",
                  "User authentication token not available. Please log in again."
                );
                router.replace("/Login");
                return;
              }

              const response = await fetch(`${API_URL}/user/delete_account`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert(
                  "Account Deleted",
                  "Your account has been deleted."
                );
                await AsyncStorage.clear();
                router.replace("/Login");
              } else {
                throw new Error(data.detail || "Failed to delete account");
              }
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete account."
              );
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <Template>
        <View style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#42c8f5" />
          <Text style={styles.loadingText}>Loading profile data...</Text>
        </View>
      </Template>
    );
  }

  // Enable save button only if there are changes and no validation errors
  const isFormValid = hasChanges && 
    !errors.username && 
    !errors.email && 
    !errors.phone && 
    !errors.preferences;

  // Render component
  return (
    <Template>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Picture Section */}
        <TouchableOpacity
          onPress={handleProfilePictureUpdate}
          style={styles.profileContainer}
        >
          <Image
            source={{
              uri: userData.profilePicUrl || "https://placehold.co/150",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.changePicText}>Change Picture</Text>
        </TouchableOpacity>

        {/* Profile Information Section */}
        <View style={styles.inputGroup}>
          {/* Name Fields */}
          <View style={styles.nameRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={userData.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
                placeholder="Enter first name"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={userData.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
                placeholder="Enter last name"
              />
            </View>
          </View>

          {/* Username Field */}
          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={[styles.input, errors.username ? styles.inputError : null]}
              value={userData.username}
              onChangeText={(text) => handleInputChange("username", text)}
              onBlur={validateUsernameField}
              placeholder="Enter username"
            />
            {errors.username ? (
              <Text style={styles.errorText}>{errors.username}</Text>
            ) : null}
          </View>

          {/* Phone Number Field */}
          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={[styles.input, errors.phone ? styles.inputError : null]}
              keyboardType="phone-pad"
              value={userData.phone}
              onChangeText={(text) => handleInputChange("phone", text)}
              onBlur={validatePhoneField}
              placeholder="Enter mobile number"
            />
            {errors.phone ? (
              <Text style={styles.errorText}>{errors.phone}</Text>
            ) : null}
          </View>

          {/* Email Field */}
          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              value={userData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              onBlur={validateEmailField}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>
         
          {/* Sports Preferences Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sports Preferences</Text>
            
            {currentPreferences.length === 0 ? (
              <Text style={styles.emptyMessage}>No sports added yet. Add your favorite sports below.</Text>
            ) : (
              currentPreferences.map((item, index) => (
                <SportsSkillsMenu
                  key={index}
                  item={item}
                  index={index}
                  isDropdownOpen={isDropdownOpen}
                  toggleDropdown={toggleDropdown}
                  handleSportChange={handleSportChange}
                  handleSkillLevelChange={handleSkillLevelChange}
                  handleRemoveSport={() => handleRemoveSport(index)}
                />
              ))
            )}
            
            {errors.preferences ? (
              <Text style={styles.errorText}>{errors.preferences}</Text>
            ) : null}
            
            <TouchableOpacity onPress={handleAddSport} style={styles.addButton}>
              <Text style={styles.addButtonText}>Add Sport</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid || saving) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!isFormValid || saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </Template>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
    width: "100%",
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderColor: "#42c8f5",
    borderWidth: 3,
  },
  changePicText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#42c8f5",
  },
  inputGroup: {
    width: "90%",
    paddingHorizontal: 20,
    gap: 20,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  inputWrapper: {
    width: "48%",
    marginBottom: 10,
  },
  fullInputWrapper: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    marginBottom: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    alignSelf: "flex-start",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
  },
  inputError: {
    borderColor: "red",
    borderWidth: 1,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  sectionContainer: {
    width: "100%",
    marginVertical: 10,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  emptyMessage: {
    color: "#888",
    fontStyle: "italic",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#42c8f5",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 15,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  addButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#42c8f5",
    borderRadius: 8,
    paddingVertical: 14,
    width: "90%",
    marginTop: 30,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a0e0f7",
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 14,
    width: "90%",
    marginTop: 15,
    marginBottom: 30,
    alignItems: "center",
  },
});

export default ProfileSettings;