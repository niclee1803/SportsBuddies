import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  TextInput,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/ThemeContext';
import { FacilityLocation } from '@/hooks/FacilityLocation';

interface LocationPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: FacilityLocation) => void;
  locations: FacilityLocation[];
  loading: boolean;
  error: string | null;
  selectedLocation: string | null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  visible,
  onClose,
  onSelectLocation,
  locations,
  loading,
  error,
  selectedLocation
}) => {
  const [locationSearch, setLocationSearch] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<FacilityLocation[]>([]);
  const { colors } = useTheme();

  // Filter locations based on search input
  useEffect(() => {
    if (locations && locations.length > 0) {
      const filtered = locations.filter(loc => 
        loc.name.toLowerCase().includes(locationSearch.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  }, [locationSearch, locations]);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={[styles.locationPickerModal, { backgroundColor: colors.card }]}>
          <View style={styles.locationPickerHeader}>
            <Text style={[styles.locationPickerTitle, {color: colors.text}]}>Select Location</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Search input for locations */}
          <View style={[styles.searchContainer, {backgroundColor: colors.background}]}>
            <Ionicons name="search" size={18} color={colors.smalltext} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, {color: colors.text}]}
              placeholder="Search locations..."
              placeholderTextColor={colors.smalltext}
              value={locationSearch}
              onChangeText={setLocationSearch}
            />
            {locationSearch !== '' && (
              <TouchableOpacity 
                onPress={() => setLocationSearch('')}
                style={styles.clearSearchButton}
              >
                <Ionicons name="close-circle" size={18} color={colors.smalltext} />
              </TouchableOpacity>
            )}
          </View>

          {/* Location list */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, {color: colors.text}]}>Loading locations...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color='red' />
              <Text style={[styles.errorText, {color: 'red'}]}>
                Failed to load locations
              </Text>
            </View>
          ) : filteredLocations.length === 0 ? (
            <View style={styles.errorContainer}>
              <Ionicons name="information-circle" size={24} color={colors.smalltext} />
              <Text style={[styles.loadingText, {color: colors.smalltext}]}>
                No locations found
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLocations}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.locationItem,
                    selectedLocation === item.name && [
                      styles.activeLocationItem, 
                      {backgroundColor: colors.primary + '20'} // 20 for opacity
                    ]
                  ]}
                  onPress={() => onSelectLocation(item)}
                >
                  <View style={styles.locationItemContent}>
                    <Text style={[
                      styles.locationItemText, 
                      selectedLocation === item.name ? 
                        {fontWeight: '600', color: colors.primary} : 
                        {color: colors.text}
                    ]}>
                      {item.name}
                    </Text>
                    {item.address && (
                      <Text style={[styles.locationItemSubText, {color: colors.smalltext}]}>
                        {item.address}{item.postalCode ? `, ${item.postalCode}` : ''}
                      </Text>
                    )}
                    {item.facilities && (
                      <Text style={[styles.locationItemFacilities, {color: colors.smalltext}]}>
                        {item.facilities}
                      </Text>
                    )}
                  </View>
                  {selectedLocation === item.name && (
                    <Ionicons name="checkmark" size={22} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={styles.locationList}
              contentContainerStyle={
                filteredLocations.length === 0 ? 
                  [styles.locationListContent, styles.emptyList] : 
                  styles.locationListContent
              }
              showsVerticalScrollIndicator={true}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  locationPickerModal: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: '#333',
  },
  clearSearchButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'red',
  },
  locationList: {
    flex: 1,
  },
  locationListContent: {
    padding: 10,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
  },
  activeLocationItem: {
    backgroundColor: 'rgba(66, 200, 245, 0.1)',
  },
  locationItemContent: {
    flex: 1,
    marginRight: 10,
  },
  locationItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  locationItemSubText: {
    fontSize: 14,
    color: '#666',
  },
  locationItemFacilities: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#888',
    marginTop: 2,
  },
});

export default LocationPicker;