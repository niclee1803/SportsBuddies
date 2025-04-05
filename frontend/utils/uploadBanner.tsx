import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { API_URL } from "../config.json";

export const uploadBanner = async (uri: string): Promise<string> => {
  try {
    console.log("Starting banner upload:", uri);
    
    // Get authentication token
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Create form data for file upload
    const formData = new FormData();
    
    // Get filename from URI
    const uriParts = uri.split('/');
    const fileName = uriParts[uriParts.length - 1];
    
    formData.append('file', {
      uri,
      name: fileName,
      type: 'image/jpeg',
    } as any);

    const response = await fetch(`${API_URL}/activity/upload-banner`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    // Check for successful response
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Upload failed with status:", response.status, errorText);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    // Parse the response to get the URL
    const data = await response.json();
    console.log("Upload successful:", data);
    
    if (!data.url) {
      throw new Error("No URL returned from server");
    }
    
    return data.url;
  } catch (error) {
    console.error("Banner upload error:", error);
    throw error;
  }
};