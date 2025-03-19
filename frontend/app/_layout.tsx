import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// // Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
//   });

//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [loaded]);

//   if (!loaded) {
//     return null;
//   }

//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }
export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="SignUp" options={{ title: 'Sign Up', headerShown: false }} />
      <Stack.Screen name="Login" options={{ title: 'Log In', headerShown: false }} />
      <Stack.Screen name="ForgetPassword" options={{ title: 'Forget Password', headerShown: false }} />
      <Stack.Screen name="Home" options={{ title: 'Home', headerShown: false }} />
      <Stack.Screen name="Settings" options={{ title: 'Settings', headerShown: false }} />
      <Stack.Screen name="ProfileSettings" options={{ title: 'Profile Settings', headerShown: true }} />
      <Stack.Screen name="Profile" options={{ title: 'Profile', headerShown: false }} />
      <Stack.Screen name="Create" options={{ title: 'Create', headerShown: false }} />
      <Stack.Screen name="CreateActivityAsOrganiser" options={{ title: 'Create', headerShown: false }}/>
      <Stack.Screen name="Groups" options={{ title: 'Groups', headerShown: false }} />
    </Stack>
  );
}