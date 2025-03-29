import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import AuthLayout from "@/components/AuthLayout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.json";
import ActivityCard from "@/components/activity/ActivityCard";
import { Activity } from "@/types/activity"; // Ensure your Activity type matches what your ActivityCard expects

export default function Feed() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch activities from the /activity/search endpoint
  const fetchActivities = async (searchValue: string) => {
    setLoading(true);
    setError(null);
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Error", "No token found. Please log in.");
        setLoading(false);
        return;
      }

      // Build query parameters if a search value is provided
      const params = new URLSearchParams();
      if (searchValue) {
        params.append("sport", searchValue);
      }

      // Construct the final URL using API_URL
      const baseUrl = `${API_URL}/activity/search`;
      const queryString = params.toString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      // Make the GET request with fetch
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      // Assume the backend returns an array of Activity objects that match your Activity type.
      setActivities(data);
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities("");
  }, []);

  const handleSearch = () => {
    fetchActivities(searchTerm);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <ActivityCard activity={item} />
  );

  return (
    <AuthLayout>
      <View style={styles.container}>
        <Text style={styles.feedTitle}>Suggested for you</Text>

        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search by sport..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#42c8f5" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id || item.activityName || String(Math.random())}
            renderItem={renderActivityItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: "#42c8f5",
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: "red",
    marginTop: 20,
  },
  listContent: {
    paddingBottom: 80,
  },
});
