import { StatusBar } from 'expo-status-bar';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/ThemeContext';

export default function BlurTabBarBackground() {
  const { isDarkMode, colors } = useTheme();
  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <BlurView
        // System chrome material automatically adapts to the system's theme
        // and matches the native tab bar appearance on iOS.
        tint="systemChromeMaterial"
        intensity={100}
        style={[StyleSheet.absoluteFill,
         { backgroundColor: colors.background}]
        }
      />
    </>
  );
}


export function useBottomTabOverflow() {
  const tabHeight = useBottomTabBarHeight();
  const { bottom } = useSafeAreaInsets();
  return tabHeight - bottom;
}
