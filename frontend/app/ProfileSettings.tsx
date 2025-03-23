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

const ProfileSettings: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Validation error states
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    phone: "",
  });

  // Current user data
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    profilePicUrl: "",
  });

  // Original user data for comparison to detect changes
  const [originalData, setOriginalData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    profilePicUrl: "",
  });

  // Function to fetch user data from the API
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Use the imported utility function
      const data = await fetchCurrentUser();
      console.log("User data from API:", data);
      
      const userDataValues = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        phone: data.phone || "",
        email: data.email || "",
        profilePicUrl: data.profilePicUrl || "https://placehold.co/150",
      };
      
      // Update the user data state with values from the API
      setUserData(userDataValues);
      // Save original data for change detection
      setOriginalData(userDataValues);
      // Reset error and change states
      setErrors({ username: "", email: "", phone: "" });
      setHasChanges(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to load profile data."
      );
      
      // If there's an auth error, redirect to login
      if (error instanceof Error && error.message.includes("token")) {
        router.replace("/Login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load user data when component mounts
  useEffect(() => {
    fetchUserData();
  }, []);

  // Compare current values with original to detect changes
  useEffect(() => {
    const checkForChanges = () => {
      const hasUserDataChanged = 
        userData.firstName !== originalData.firstName ||
        userData.lastName !== originalData.lastName ||
        userData.username !== originalData.username ||
        userData.phone !== originalData.phone ||
        userData.email !== originalData.email;
      
      setHasChanges(hasUserDataChanged);
    };
    
    checkForChanges();
  }, [userData, originalData]);

  // Handle input change with validation
  const handleInputChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  // Validation functions that use ValidationUtils
  const validateUsernameField = async () => {
    // Skip validation if unchanged
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
    // Skip validation if unchanged
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
    // Skip validation if unchanged
    if (userData.phone === originalData.phone) {
      setErrors(prev => ({ ...prev, phone: "" }));
      return true;
    }
    return await validatePhone(
      userData.phone, 
      (error) => setErrors(prev => ({ ...prev, phone: error }))
    );
  };

  // Validate all fields at once
  const validateAllFields = async () => {
    const usernameValid = await validateUsernameField();
    const emailValid = await validateEmailField();
    const phoneValid = await validatePhoneField();
    
    return usernameValid && emailValid && phoneValid;
  };

  const handleSave = async () => {
    // First validate all fields
    const isValid = await validateAllFields();
    
    if (!isValid) {
      Alert.alert("Validation Error", "Please fix the highlighted fields before saving.");
      return;
    }
    
    if (!hasChanges) {
      Alert.alert("No Changes", "You haven't made any changes to your profile.");
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

      const response = await fetch(`${API_URL}/user/update_profile`, {
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

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Profile Updated", "Your changes have been saved.");
        // Update original data to match current data
        setOriginalData({ ...userData });
        setHasChanges(false);
        router.back(); // Go back after saving
      } else {
        throw new Error(data.detail || "Failed to update profile");
      }
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

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
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
                await AsyncStorage.clear(); // Clear local storage
                router.replace("/Login"); // Redirect to login screen
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

  const handleProfilePictureUpdate = async () => {
    try {
      // Request media library permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissions required",
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

      if (!result.canceled && result.assets.length > 0) {
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

        // Upload the image to the backend
        const formData = new FormData();
        if (Platform.OS === "web")
          formData.append("file", blob, "profile_picture.jpg");
        else {
          formData.append("file", {
            uri: imageUri,
            name: "profile_picture.jpg",
            type: "image/jpeg",
          } as any);
        }

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
          setUserData((prev) => ({
            ...prev,
            profilePicUrl: data.profilePicUrl,
          }));
        } else {
          throw new Error(data.detail || "Failed to update profile picture");
        }
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
  const isFormValid = hasChanges && !errors.username && !errors.email && !errors.phone;

  return (
    <Template>
      <ScrollView contentContainerStyle={styles.container}>
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
          <Text style={styles.changePicText}>Change Pic</Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
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
        </View>

        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!isFormValid || saving) && styles.disabledButton
          ]} 
          onPress={handleSave}
          disabled={!isFormValid || saving}
        >
          <Text style={styles.ButtonText}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.delAccButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.ButtonText}>Delete Account</Text>
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
    backgroundColor: "#D3D3D3",
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
    borderRadius: 200,
    borderColor: "black",
    borderWidth: 1,
  },
  changePicText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "blue",
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
  saveButton: {
    backgroundColor: "#42c8f5",
    borderRadius: 5,
    paddingVertical: 12,
    width: "90%",
    marginTop: 30,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#a0e0f7",
    opacity: 0.7,
  },
  ButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  delAccButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 5,
    paddingVertical: 12,
    width: "90%",
    marginTop: 15,
    marginBottom: 30,
    alignItems: "center",
  },
});

export default ProfileSettings;