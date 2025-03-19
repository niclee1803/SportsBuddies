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
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { API_URL } from "../config.json";
import Template from "../components/Template";

const ProfileSettings: React.FC = () => {
  const router = useRouter();

  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    profilePicUrl: "",
  });

  const fetchUserData = async () => {
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

      const response = await fetch(`${API_URL}/user/current_user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to fetch user data");
      }

      const data = await response.json();
      setUserData({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        username: data.username || "",
        phone: data.phone || "",
        email: data.email || "",
        profilePicUrl: data.profilePicUrl || "https://placehold.co/150",
      });
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  };

  const handleSave = async () => {
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

  useEffect(() => {
    fetchUserData();
  }, []);

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
                onChangeText={(text) =>
                  setUserData({ ...userData, firstName: text })
                }
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={userData.lastName}
                onChangeText={(text) =>
                  setUserData({ ...userData, lastName: text })
                }
              />
            </View>
          </View>

          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={userData.username}
              onChangeText={(text) =>
                setUserData({ ...userData, username: text })
              }
            />
          </View>

          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={userData.phone}
              onChangeText={(text) => setUserData({ ...userData, phone: text })}
            />
          </View>

          <View style={styles.fullInputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.ButtonText}>Save</Text>
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
  saveButton: {
    backgroundColor: "#42c8f5",
    borderRadius: 5,
    paddingVertical: 12,
    width: "90%",
    marginTop: 30,
    alignItems: "center",
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
