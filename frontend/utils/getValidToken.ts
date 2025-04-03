import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";

/**
 * Retrieves a fresh ID token from Firebase Auth and stores it in AsyncStorage.
 * Returns null if user is not signed in.
 */
export const getValidToken = async (): Promise<string | null> => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.warn("No user is currently signed in.");
      return null;
    }

    const token = await user.getIdToken(true); // 🔥 force refresh
    await AsyncStorage.setItem("token", token);
    return token;
  } catch (err) {
    console.error("Failed to get valid Firebase token:", err);
    return null;
  }
};
