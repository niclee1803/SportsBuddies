import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/ThemeContext";

export function MainLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        header: () => null,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="SetPreferences"
        options={{
          title: "Set Preferences",
        }}
      />
      <Stack.Screen name="Settings" options={{ title: "Settings" }} />
      <Stack.Screen
        name="ProfileSettings"
        options={{ title: "Profile Settings" }}
      />
      <Stack.Screen name="Profile" options={{ title: "Profile" }} />
      <Stack.Screen
        name="Dashboard"
        options={{
          title: "Dashboard",
        }}
      />
      <Stack.Screen
        name="Feed"
        options={{
          title: "Feed",
        }}
      />
      <Stack.Screen
        name="Alerts"
        options={{
          title: "Alerts",
        }}
      />
      <Stack.Screen
        name="UserThreads"
        options={{
          title: "User Threads",
        }}
      />
      <Stack.Screen
        name="PublicProfile"
        options={{
          title: "Public Profile",
        }}
      />
    </Stack>

  );
}
