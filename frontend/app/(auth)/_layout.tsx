import React from "react";
import { Stack } from "expo-router";
import { useTheme } from "@/hooks/ThemeContext";

export default function AuthLayout() {
  const { colors } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        header: () => null,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Welcome" }} />
      <Stack.Screen name="Login" options={{ title: "Login" }} />
      <Stack.Screen name="SignUp" options={{ title: "Sign Up" }} />
      <Stack.Screen name="ForgetPassword" options={{ title: "Reset Password" }} />
    </Stack>
  );
}