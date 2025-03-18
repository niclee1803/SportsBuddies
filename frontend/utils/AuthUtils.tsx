import AsyncStorage from "@react-native-async-storage/async-storage";

export const fetchCurrentUser = async () => {
  try {
    // Retrieve the token from AsyncStorage
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      throw new Error("No token found. Please log in again.");
    }

    // Make the API request
    const response = await fetch("http://127.0.0.1:8000/auth/current_user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch user data");
    }

    const userData = await response.json();
    return userData;
  } catch (error: any) {
    console.error("Error fetching current user:", error.message);
    throw error;
  }
};