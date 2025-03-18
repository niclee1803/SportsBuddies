import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsSignedIn(!!token); // If token exists, user is signed in
    };

    checkAuthStatus();
  }, []);

  if (isSignedIn === null) {
    // Show a loading screen while checking auth status
    return null;
  }

  return isSignedIn ? <AppStack /> : <AuthStack />;
}

function AuthStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="Login" />
      <Stack.Screen name="SignUp" />
    </Stack>
  );
}

function AppStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Disable swipe-back gesture
      }}
    >
      <Stack.Screen
        name="SetPreferences"
        options={{
          title: "Set Preferences",
        }}
      />
      <Stack.Screen
        name="Home"
        options={{
          title: "Home",
        }}
      />
    </Stack>
  );
}