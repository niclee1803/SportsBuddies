import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import { API_URL } from "../config.json";

export const uploadBanner = async (bannerUri: string): Promise<string> => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No auth token found");

  const filename = bannerUri.split("/").pop()!;
  const match = /\.(\w+)$/.exec(filename);
  const fileType = match ? `image/${match[1]}` : "image/jpeg";

  const fileInfo = await FileSystem.getInfoAsync(bannerUri);
  if (!fileInfo.exists) {
    throw new Error("File does not exist at URI: " + bannerUri);
  }

  const formData = new FormData();

  formData.append("file", {
    uri: fileInfo.uri,
    name: filename,
    type: fileType,
  } as any); // `as any` still needed to override React Native type mismatch

  const response = await fetch(`${API_URL}/activity/upload-banner`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // ❌ DO NOT set Content-Type manually
    },
    body: formData,
  });

  const text = await response.text();
  console.log("[UPLOAD] Response:", response.status, text);

  if (!response.ok) throw new Error(`Upload failed: ${text}`);

  const data = JSON.parse(text);
  return data.url;
};
