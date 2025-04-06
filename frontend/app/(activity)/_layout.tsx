import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/ThemeContext";

export default function ActivityLayout() {
  const { colors } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        header: () => null,
        contentStyle: { backgroundColor: colors.background },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Create" options={{ title: "Create Activity" }} />
      <Stack.Screen name="ActivityDetail" options={{ title: "Activity Details" }} />
      <Stack.Screen name="ManageActivity" options={{ title: "Manage Activity" }} />
      <Stack.Screen name="ManageParticipants" options={{ title: "Participants" }} />
    </Stack>
  );
}
