import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL, FALLBACK_API_URL } from "../config.json";
import { Platform } from "react-native";

export const fetchCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please log in again.");
    }

    // Try main URL first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for first try

      const response = await fetch(`${API_URL}/user/current_user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
    } catch (mainError) {
      console.log("Main URL failed, trying fallback...");
    }

    // If main URL fails, try fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for fallback

    const response = await fetch(`${FALLBACK_API_URL}/user/current_user`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch user data");
    }

    const userData = await response.json();
    return userData;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("All requests timed out");
      throw new Error(
        "Network request timed out. Please check your connection and try again."
      );
    }
    console.error("Error fetching current user:", error.message);
    throw error;
  }
};
