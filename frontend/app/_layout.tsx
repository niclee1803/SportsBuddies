import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "@/hooks/ThemeContext";
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function RootLayout() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = await AsyncStorage.getItem("token");
      setIsSignedIn(!!token); // If token exists, user is signed in
    };

    checkAuthStatus();
  }, []);

  if (isSignedIn === null) {
    // Show a loading screen while checking auth status
    return  (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
      </View>
    );
  };
  

  return (
    <ThemeProvider>
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      {isSignedIn ? <AppStack /> : <AuthStack />}
    </View>
    </ThemeProvider>
  );
}

function AuthStack() {
  const { isDarkMode, colors } = useTheme();
  return (
    
    <Stack
      screenOptions={{
        //headerShown: false,
        header: () => null,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
      
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="Login" />
      <Stack.Screen name="SignUp" />
      <Stack.Screen name="ForgetPassword" />
    </Stack>
    
  );
}

function AppStack() {
  const { isDarkMode, colors } = useTheme();
  return (
  
    <Stack
      screenOptions={{
        //headerShown: false,
        header: () => null,
        gestureEnabled: false, // Disable swipe-back gesture
        contentStyle: { backgroundColor: colors.background }, //remove white bars in darkmode
      }}
    >
      <Stack.Screen
        name="SetPreferences"
        options={{
          title: "Set Preferences",
        }}
      />
      <Stack.Screen name="Settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="ProfileSettings" options={{ title: 'Profile Settings' }} />
      <Stack.Screen name="Profile" options={{ title: 'Profile' }} />
      <Stack.Screen name="Create" options={{ title: 'Create' }} />
      <Stack.Screen name="Groups" options={{ title: 'Groups' }} />
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
    </Stack>
 
  );
}