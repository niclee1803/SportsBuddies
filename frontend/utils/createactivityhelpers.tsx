import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.json";

// Upload activity to backend
export const handleUploadActivity = async (formData: FormData) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await fetch(`${API_URL}/activity/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    throw new Error("Error uploading activity: " + error.message);
  }
};

// Pick image for banner
export const pickImage = async (setBannerUri: (uri: string) => void) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.granted) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setBannerUri(result.assets[0].uri);
    }
  } else {
    Alert.alert(
      "Permission Denied",
      "You need to grant access to your media library to select an event banner.",
      [{ text: "OK" }]
    );
  }
};

// Cancel image upload
export const cancelUpload = (setBannerUri: (uri: null) => void) => {
  setBannerUri(null);
};


interface ActivityFormData {
    activityName: string;
    date: Date;
    sport: string;
    skillLevel: string;
    role: string;
    activityDescription: string;
    maxParticipants: string;
    bannerUri: string | null;
    selectedCoords: { latitude: number; longitude: number } | null;
    location: string;
    placeName:string;
  }
  
  export const handleSubmitActivity = async (
    formValues: ActivityFormData,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    const {
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
    } = formValues;
  
    try {
      const formData = new FormData();
  
      formData.append("activityName", activityName);
      formData.append("date", date.toISOString());
      formData.append("time", date.toLocaleTimeString());
      formData.append("sport", sport);
      formData.append("skillLevel", skillLevel);
      formData.append("role", role);
      formData.append("activityDescription", activityDescription);
      formData.append("maxParticipants", maxParticipants);
      formData.append("location", location);
      formData.append("placeName", placeName);

  
      if (bannerUri) {
        const filename = bannerUri.split("/").pop()!;
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
  
        formData.append("banner", {
          uri: bannerUri,
          name: filename,
          type,
        } as any);
      }
  
      if (selectedCoords) {
        formData.append("latitude", selectedCoords.latitude.toString());
        formData.append("longitude", selectedCoords.longitude.toString());
      }
  
      const response = await handleUploadActivity(formData);
      console.log("Response from backend:", response);
  
      if (response.success) {
        onSuccess();
      } else {
        onError(response.message || "Failed to upload activity.");
      }
    } catch (error: any) {
      console.log("Upload Error:", error);
      onError(error.message || "An error occurred while uploading the activity.");
    }
  };
  