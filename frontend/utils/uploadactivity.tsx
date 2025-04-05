import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.json";

interface ActivityPayload {
  activityName: string;
  dateTime: string;
  sport: string;
  skillLevel: string;
  type: string;
  description: string;
  bannerImageUrl: string | null;
  maxParticipants: number;
  price: number;
  location: {
    latitude: number;
    longitude: number;
  };
  placeName: string;
}

export const handleSubmitActivity = async (
  payload: ActivityPayload,
  onSuccess: () => void,
  onError: (msg: string) => void
) => {
  console.log("[DEBUG] Entered handleSubmitActivity");
  console.log("[DEBUG] Payload being sent:", JSON.stringify(payload, null, 2));

  try {
    const token = await AsyncStorage.getItem("token");
    console.log("[DEBUG] Retrieved token:", token);

    const response = await fetch(`${API_URL}/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text(); // safer than directly calling `.json()`
    console.log("[DEBUG] Raw response text:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseErr) {
      console.error("[DEBUG] Failed to parse response JSON:", parseErr);
      throw new Error("Server returned non-JSON response");
    }

    console.log("[DEBUG] Parsed response data:", data);

    if (response.ok) {
      console.log("[DEBUG] Activity creation success!");
      onSuccess();
    } else {
      console.warn("[DEBUG] Activity creation failed:", data);
      onError(data?.detail || "Failed to create activity.");
    }

  } catch (err: any) {
    console.error("[DEBUG] Submission error:", err);
    onError(err.message || "Unexpected error occurred.");
  }
};
