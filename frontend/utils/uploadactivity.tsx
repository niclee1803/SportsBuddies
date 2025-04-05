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
  console.log("[DEBUG] Payload validation:", {
    hasActivityName: Boolean(payload.activityName),
    hasDateTime: Boolean(payload.dateTime),
    hasSport: Boolean(payload.sport),
    hasSkillLevel: Boolean(payload.skillLevel),
    hasType: Boolean(payload.type),
    hasLocation: Boolean(payload.location),
    hasPlaceName: Boolean(payload.placeName),
  });
  console.log("[DEBUG] Full payload:", JSON.stringify(payload, null, 2));

  try {
    const token = await AsyncStorage.getItem("token");
    console.log(
      "[DEBUG] Token retrieved:",
      token ? "Yes (length: " + token.length + ")" : "No"
    );

    if (!token) {
      throw new Error("No authentication token found");
    }

    const apiUrl = `${API_URL}/activity/`;
    console.log("[DEBUG] Making request to:", apiUrl);

    const requestConfig = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    };

    console.log("[DEBUG] Request config:", {
      url: apiUrl,
      method: requestConfig.method,
      headers: requestConfig.headers,
      bodyLength: requestConfig.body.length,
    });

    try {
      console.log("[DEBUG] Starting fetch request...");
      const response = await fetch(apiUrl, requestConfig);
      console.log("[DEBUG] Fetch completed");

      console.log("[DEBUG] Response details:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok,
      });

      const text = await response.text();
      console.log("[DEBUG] Raw response text:", text);

      let data;
      try {
        data = JSON.parse(text);
        console.log("[DEBUG] Parsed response data:", data);
      } catch (parseErr) {
        console.error("[DEBUG] JSON parse error:", parseErr);
        console.error("[DEBUG] Raw text that failed to parse:", text);
        throw new Error("Server returned invalid JSON response");
      }

      if (response.ok) {
        console.log("[DEBUG] Activity creation successful!");
        onSuccess();
      } else {
        console.warn("[DEBUG] Activity creation failed:", {
          status: response.status,
          data: data,
        });
        onError(data?.detail || "Failed to create activity");
      }
    } catch (fetchErr) {
      if (fetchErr instanceof Error) {
        console.error("[DEBUG] Fetch error details:", {
          name: fetchErr.name,
          message: fetchErr.message,
          stack: fetchErr.stack,
        });
      } else {
        console.error("[DEBUG] Fetch error details: Unknown error", fetchErr);
      }
      throw fetchErr;
    }
  } catch (err: any) {
    console.error("[DEBUG] Final error handler:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    onError(err.message || "Unexpected error occurred");
  }
};
