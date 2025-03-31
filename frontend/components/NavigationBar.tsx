import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useTheme } from '@/hooks/ThemeContext';

// Define routes and their properties
type RouteKey = 'feed' | 'dashboard' | 'create' | 'profile' | 'settings';

interface RouteConfig {
  path: string;
  label: string;
  icon: JSX.Element;
}

const NavigationBar: React.FC = () => {
  const router = useRouter();
  const currentPath = usePathname();
  const { colors } = useTheme();
  
  // Define routes with their icons and paths
  const routes: Record<RouteKey, RouteConfig> = {
    dashboard: {
      path: '/Dashboard',
      label: 'Dashboard',
      icon: <MaterialIcons name="dashboard" size={24} color="black" />
    },
    feed: {
      path: '/Feed',
      label: 'Feed',
      icon: <FontAwesome5 name="stream" size={24} color="black" />
    },
    create: {
      path: '/Create',
      label: 'Create',
      icon: <Ionicons name="add-circle-outline" size={28} color="black" />
    },
    profile: {
      path: '/Profile',
      label: 'Profile',
      icon: <FontAwesome5 name="user-circle" size={24} color="black" />
    },
    settings: {
      path: '/Settings',
      label: 'Settings',
      icon: <Ionicons name="settings-outline" size={24} color="black" />
    }
  };

  // Check if route is active
  const isActive = (path: string): boolean => {
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {Object.entries(routes).map(([key, route]) => (
        <TouchableOpacity
          key={key}
          style={[styles.item, isActive(route.path) && styles.activeItem, { backgroundColor: colors.background }]}
          onPress={() => router.push(route.path as any)}
        >
          {/* Clone the icon element with the active color if route is active */}
          {React.cloneElement(route.icon, { 
            color: isActive(route.path) ? colors.primary : colors.text 
          })}
          <Text style={[
            styles.itemText, 
            isActive(route.path) && {color: colors.primary},
            !isActive(route.path) && {color: colors.text}
          ]}>
            {route.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 80,
    paddingBottom: 20, // Add bottom padding for home indicator on newer iPhones
    paddingTop: 10,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeItem: {
    // You can add special styling for active items if needed
  },
  itemText: {
    color: 'black',
    fontSize: 12,
    marginTop: 4,
  },
  activeText: {
    color: '#42c8f5',
    fontWeight: 'bold',
  }
});

export default NavigationBar;