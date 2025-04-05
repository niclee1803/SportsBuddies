import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.json";
import { showAlert } from "./alertUtils"; // Assuming alertUtils exists

interface UpdateActivityPayload {
  activityName?: string;
  bannerImageUrl?: string;
  type?: string;
  price?: number;
  sport?: string;
  skillLevel?: string;
  description?: string;
  maxParticipants?: number;
  dateTime?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  placeName?: string;
}

export const updateActivity = async (
  activityId: string,
  payload: UpdateActivityPayload
): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/activity/${activityId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Update failed:", errorData);
      throw new Error(errorData.detail || "Failed to update activity details.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating activity:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    showAlert("Update Error", errorMessage);
    throw error; // Re-throw after showing alert
  }
};

export const cancelActivity = async (activityId: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/activity/${activityId}/cancel`, {
      method: "POST", // Assuming POST method for cancellation based on previous context
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(
      `[cancelActivity] Response Status: ${
        response.status
      }, Response Text: ${await response.text()}`
    );

    if (!response.ok) {
      throw new Error("Failed to cancel activity.");
    }

    // Optionally handle success response if needed
  } catch (error) {
    console.error("Error cancelling activity:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    showAlert("Cancellation Error", errorMessage);
    throw error; // Re-throw after showing alert
  }
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_URL}/activity/${activityId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log(`[deleteActivity] Response Status: ${response.status}`);

    if (!response.ok) {
      // Attempt to parse error detail if available
      let errorDetail = "Failed to delete activity.";
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (parseError) {
        // If response is not JSON or empty, use default message
        console.log("Could not parse error response body as JSON.");
      }
      throw new Error(errorDetail);
    }

    // No need to parse response body for a successful DELETE usually
    console.log(
      `[deleteActivity] Activity ${activityId} deleted successfully.`
    );
  } catch (error) {
    console.error("Error deleting activity:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    showAlert("Deletion Error", errorMessage);
    throw error; // Re-throw after showing alert
  }
};
