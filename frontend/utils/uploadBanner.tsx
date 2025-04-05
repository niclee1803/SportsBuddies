import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
import { API_URL } from "../config.json";

export const uploadBanner = async (bannerUri: string): Promise<string> => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const filename = bannerUri.split("/").pop()!;
  const match = /\.(\w+)$/.exec(filename);
  const fileType = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();

  if (Platform.OS === "web") {
    try {
      // For web, directly fetch the blob from the URI
      const response = await fetch(bannerUri);
      const blob = await response.blob();
      formData.append("file", blob, filename);
    } catch (error) {
      console.error("Error processing web image:", error);
      throw new Error("Failed to process image for upload");
    }
  } else {
    // For mobile platforms, use FileSystem
    const fileInfo = await FileSystem.getInfoAsync(bannerUri);
    if (!fileInfo.exists) {
      throw new Error("File does not exist at URI: " + bannerUri);
    }

    formData.append("file", {
      uri: fileInfo.uri,
      name: filename,
      type: fileType,
    } as any);
  }

  console.log(
    "[DEBUG] Uploading banner to:",
    `${API_URL}/activity/upload-banner/`
  );

  const response = await fetch(`${API_URL}/activity/upload-banner/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const text = await response.text();
  console.log("[UPLOAD] Response:", response.status, text);

  if (!response.ok) throw new Error(`Upload failed: ${text}`);

  const data = JSON.parse(text);
  return data.url;
};
