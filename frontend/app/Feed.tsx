import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView
} from "react-native";
import AuthLayout from "@/components/AuthLayout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config.json";
import ActivityCard from "@/components/activity/ActivityCard";
import { Activity } from "@/types/activity";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { showAlert } from "@/utils/alertUtils";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import FilterModal, { FilterOptions } from "@/components/activity/FilterModal";

export default function Feed() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Search params
  const [searchTerm, setSearchTerm] = useState("");
  
  // Current active filters
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    sport: "",
    skillLevel: "",
    activityType: "",
    dateFrom: null,
    dateTo: null,
    location: ""
  });
  
  // Whether any filters are currently active
  const hasActiveFilters = () => {
    return (
      activeFilters.sport !== "" ||
      activeFilters.skillLevel !== "" ||
      activeFilters.activityType !== "" ||
      activeFilters.dateFrom !== null ||
      activeFilters.dateTo !== null ||
      activeFilters.location !== ""
    );
  };
  
  // Fetch activities from the /activity/search endpoint with applied filters
  const fetchActivities = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      // Retrieve the token from AsyncStorage
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        showAlert("Authentication Error", "No token found. Please log in.", [
          { text: "Log In", onPress: () => router.push("/Login") }
        ]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Build query parameters
      const params = new URLSearchParams();
      
      if (searchTerm) {
        params.append("query", searchTerm);
      }
      
      if (activeFilters.sport) {
        params.append("sport", activeFilters.sport);
      }
      
      if (activeFilters.skillLevel) {
        params.append("skillLevel", activeFilters.skillLevel);
      }
      
      if (activeFilters.dateFrom) {
        params.append("dateFrom", activeFilters.dateFrom.toISOString());
      }
      
      if (activeFilters.dateTo) {
        params.append("dateTo", activeFilters.dateTo.toISOString());
      }
      
      if (activeFilters.activityType) {
        params.append("activityType", activeFilters.activityType);
      }
      
      if (activeFilters.location) {
        params.append("placeName", activeFilters.location);
      }

      // Construct the final URL using API_URL
      const baseUrl = `${API_URL}/activity/search`;
      const queryString = params.toString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      console.log("Fetching activities from:", url);
      
      // Make the GET request with fetch
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("API Error:", errorData);
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`Found ${data.length} activities`);
      
      // Check if we have results
      setNoResults(data.length === 0);
      
      // Assume the backend returns an array of Activity objects that match your Activity type.
      setActivities(data);
    } catch (err: any) {
      console.error("Error fetching activities:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleSearch = () => {
    fetchActivities();
  };
  
  const handleRefresh = () => {
    fetchActivities(true);
  };
  
  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilters({
      sport: "",
      skillLevel: "",
      activityType: "",
      dateFrom: null,
      dateTo: null,
      location: ""
    });
    
    // Fetch activities without filters
    fetchActivities();
  };
  
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    
    // Fetch with new filters
    setTimeout(() => {
      fetchActivities();
    }, 100);
  };

  const renderActivityItem = ({ item }: { item: Activity }) => (
    <ActivityCard activity={item} />
  );
  
  const renderEmptyList = () => {
    if (loading && !refreshing) return null;
    
    return (
      <View style={styles.emptyContainer}>
        {noResults ? (
          <>
            <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No activities found matching your search.</Text>
            {(hasActiveFilters() || searchTerm) && (
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            <FontAwesome5 name="calendar-alt" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No activities available.</Text>
            <Text style={styles.emptySubText}>
              Be the first to create an activity!
            </Text>
            <TouchableOpacity 
              style={styles.createButton} 
              onPress={() => router.push("/Create")}
            >
              <Text style={styles.createButtonText}>Create Activity</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  // Count how many filters are active
  const activeFilterCount = () => {
    let count = 0;
    if (activeFilters.sport) count++;
    if (activeFilters.skillLevel) count++;
    if (activeFilters.activityType) count++;
    if (activeFilters.dateFrom || activeFilters.dateTo) count++;
    if (activeFilters.location) count++;
    return count;
  };

  return (
    <AuthLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.feedTitle}>Discover Activities</Text>
          <TouchableOpacity 
            style={styles.createActivityButton}
            onPress={() => router.push("/Create")}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
            <TextInput
              placeholder="Search activities..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              style={styles.searchInput}
              placeholderTextColor="#999"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchTerm ? (
              <TouchableOpacity 
                style={styles.clearSearchButton}
                onPress={() => {
                  setSearchTerm("");
                  // Only auto-search if there was a previous search term
                  fetchActivities();
                }}
              >
                <Ionicons name="close-circle" size={18} color="#aaa" />
              </TouchableOpacity>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.filterButton, 
              activeFilterCount() > 0 ? styles.activeFilterButton : {}
            ]} 
            onPress={() => setFilterModalVisible(true)}
          >
            <Ionicons name="options" size={22} color={activeFilterCount() > 0 ? "#fff" : "#555"} />
            {activeFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* Active Filters Pills Row */}
        {hasActiveFilters() && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersRow}
            contentContainerStyle={styles.filtersRowContent}
          >
            {activeFilters.sport && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>{activeFilters.sport}</Text>
              </View>
            )}
            
            {activeFilters.skillLevel && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>{activeFilters.skillLevel}</Text>
              </View>
            )}
            
            {activeFilters.activityType && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>
                  {activeFilters.activityType === "event" ? "Events" : "Coaching"}
                </Text>
              </View>
            )}
            
            {activeFilters.dateFrom && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>
                  From: {format(activeFilters.dateFrom, 'MMM d')}
                </Text>
              </View>
            )}
            
            {activeFilters.dateTo && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>
                  To: {format(activeFilters.dateTo, 'MMM d')}
                </Text>
              </View>
            )}
            
            {activeFilters.location && (
              <View style={styles.filterPill}>
                <Text style={styles.filterPillText}>
                  {activeFilters.location}
                </Text>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.filterPill, styles.clearFilterPill]}
              onPress={clearFilters}
            >
              <Text style={styles.clearFilterPillText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#42c8f5" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#ff5252" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleSearch}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item.id || String(Math.random())}
            renderItem={renderActivityItem}
            contentContainerStyle={[
              styles.listContent,
              activities.length === 0 && styles.emptyList
            ]}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={renderEmptyList}
          />
        )}
        
        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          onApply={handleApplyFilters}
          initialFilters={activeFilters}
        />
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  feedTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  createActivityButton: {
    backgroundColor: "#42c8f5",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 48,
    paddingVertical: 8,
  },
  clearSearchButton: {
    padding: 5,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  activeFilterButton: {
    backgroundColor: '#42c8f5',
    borderColor: '#42c8f5',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b6b',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filtersRow: {
    marginBottom: 12,
  },
  filtersRowContent: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  filterPill: {
    backgroundColor: '#e8f4fd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterPillText: {
    color: '#42c8f5',
    fontSize: 14,
    fontWeight: '500',
  },
  clearFilterPill: {
    backgroundColor: '#f0f0f0',
  },
  clearFilterPillText: {
    color: '#666',
  },
  loader: {
    marginTop: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  errorText: {
    color: "#ff5252",
    fontSize: 16,
    marginTop: 12,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#42c8f5",
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#42c8f5',
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  clearButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '500',
  },
});