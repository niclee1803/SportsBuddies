import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
// Import updated components and hooks
import Dropdown, { useSportsList, SKILL_LEVELS } from '@/components/activity/ActivityMenu';
import LocationPicker from '@/components/activity/LocationPicker';
import { useTheme } from '@/hooks/ThemeContext';
import useFacilityLocations, { FacilityLocation } from '@/hooks/FacilityLocation';
import { API_URL } from "@/config.json";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

export interface FilterOptions {
  sport: string;
  skillLevel: string;
  activityType: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  location: string;
  locationCoordinates?: [number, number]; 
  locationDetails?: {
    address?: string;
    postalCode?: string;
    facilities?: string;
  };
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {
    sport: '',
    skillLevel: '',
    activityType: '',
    dateFrom: null,
    dateTo: null,
    location: ''
  }
}) => {
  // Get sports list from API
  const { sportsList, loading: sportsLoading } = useSportsList();
  
  // Fetch facility locations
  const { locations, loading: locationsLoading, error: locationsError } = 
    useFacilityLocations(`${API_URL}/utils/facilities_geojson`);

  // Filter state
  const [sport, setSport] = useState(initialFilters.sport);
  const [skillLevel, setSkillLevel] = useState(initialFilters.skillLevel);
  const [activityType, setActivityType] = useState(initialFilters.activityType);
  const [dateFrom, setDateFrom] = useState<Date | null>(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState<Date | null>(initialFilters.dateTo);
  const [location, setLocation] = useState(initialFilters.location);
  const [locationCoordinates, setLocationCoordinates] = useState<[number, number] | undefined>(
    initialFilters.locationCoordinates
  );
  const [locationDetails, setLocationDetails] = useState(initialFilters.locationDetails);

  // UI state
  const [isDateFromPickerVisible, setDateFromPickerVisible] = useState(false);
  const [isDateToPickerVisible, setDateToPickerVisible] = useState(false);
  const [isLocationPickerVisible, setLocationPickerVisible] = useState(false);

  // Reset filters when modal is opened with initialFilters
  useEffect(() => {
    if (visible) {
      setSport(initialFilters.sport);
      setSkillLevel(initialFilters.skillLevel);
      setActivityType(initialFilters.activityType);
      setDateFrom(initialFilters.dateFrom);
      setDateTo(initialFilters.dateTo);
      setLocation(initialFilters.location);
      setLocationCoordinates(initialFilters.locationCoordinates);
      setLocationDetails(initialFilters.locationDetails);
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    let formattedDateFrom = dateFrom;
    let formattedDateTo = dateTo;
    
    if (dateFrom) {
      formattedDateFrom = new Date(dateFrom);
      formattedDateFrom.setHours(0, 0, 0, 0);
    }
    
    if (dateTo) {
      formattedDateTo = new Date(dateTo);
      formattedDateTo.setHours(23, 59, 59, 999);
    }
    
    onApply({
      sport,
      skillLevel,
      activityType,
      dateFrom: formattedDateFrom,
      dateTo: formattedDateTo,
      location,
      locationCoordinates,
      locationDetails
    });
    onClose();
  };

  const handleClear = () => {
    setSport('');
    setSkillLevel('');
    setActivityType('');
    setDateFrom(null);
    setDateTo(null);
    setLocation('');
    setLocationCoordinates(undefined);
    setLocationDetails(undefined);
  };

  // Date picker handlers
  const handleConfirmDateFrom = (selectedDate: Date) => {
    setDateFrom(selectedDate);
    setDateFromPickerVisible(false);
  };

  const handleCancelDateFrom = () => {
    setDateFromPickerVisible(false);
  };

  const handleConfirmDateTo = (selectedDate: Date) => {
    setDateTo(selectedDate);
    setDateToPickerVisible(false);
  };

  const handleCancelDateTo = () => {
    setDateToPickerVisible(false);
  };

  // Location selection handler
  const handleSelectLocation = (selectedLocation: FacilityLocation) => {
    setLocation(selectedLocation.name);
    setLocationCoordinates(selectedLocation.coordinates);
    setLocationDetails({
      address: selectedLocation.address,
      postalCode: selectedLocation.postalCode,
      facilities: selectedLocation.facilities
    });
    setLocationPickerVisible(false);
  };

  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={[
          styles.modalContent, 
          { backgroundColor: colors.card, borderColor: colors.border }
        ]}>
          <View style={[
  styles.header, 
  { 
    backgroundColor: colors.background === '#121212' ? '#1E1E1E' : '#f9f9f9', // Darker in dark mode, lighter in light mode
    borderBottomColor: colors.border 
  }
]}>
  <Text style={[styles.title, {color: colors.text}]}>Filter Activities</Text>
  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
    <Ionicons name="close" size={24} color={colors.text} />
  </TouchableOpacity>
</View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollViewContent}
          >
            {/* Sport Dropdown */}
            <View style={[styles.filterSection, styles.sportSection]}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Sport</Text>
              <Dropdown
                items={sportsList.map(sportItem => ({
                  label: sportItem,
                  value: sportItem,
                }))}
                value={sport}
                onChangeItem={(item) => setSport(item.value)}
                placeholder={sportsLoading ? "Loading sports..." : "Select sport..."}
                searchable={true}
                searchablePlaceholder="Search sport..."
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            {/* Skill Level Dropdown */}
            <View style={[styles.filterSection, styles.skillLevelSection]}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Skill Level</Text>
              <Dropdown
                items={SKILL_LEVELS.map(level => ({
                  label: level,
                  value: level.toLowerCase(),
                }))}
                value={skillLevel}
                onChangeItem={(item) => setSkillLevel(item.value)}
                placeholder="Select skill level..."
                searchable={true}
                searchablePlaceholder="Search skill level..."
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>

            {/* Activity Type */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Activity Type</Text>
              <View style={styles.typeButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    styles.typeButtonLeft,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    activityType === "event" && [styles.activeTypeButton, { backgroundColor: colors.primary }]
                  ]}
                  onPress={() => setActivityType(activityType === "event" ? "" : "event")}
                >
                  <Text style={[
                    styles.typeButtonText,
                    activityType === "event" && styles.activeTypeButtonText, 
                    {color: colors.text}
                  ]}>Events</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    styles.typeButtonRight,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    activityType === "coaching session" && [styles.activeTypeButton, { backgroundColor: colors.primary }]
                  ]}
                  onPress={() => setActivityType(activityType === "coaching session" ? "" : "coaching session")}
                >
                  <Text style={[
                    styles.typeButtonText,
                    activityType === "coaching" && styles.activeTypeButtonText,  
                    {color: colors.text}
                  ]}>Coaching</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Date Range</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }]}
                  onPress={() => setDateFromPickerVisible(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.smalltext} style={styles.dateIcon} />
                  <Text style={[styles.dateText, dateFrom ? styles.dateTextActive : {}, {color: colors.smalltext}]}>
                    {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From date'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }]}
                  onPress={() => setDateToPickerVisible(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.smalltext} style={styles.dateIcon} />
                  <Text style={[styles.dateText, dateTo ? styles.dateTextActive : {}, {color: colors.smalltext}]}>
                    {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To date'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Location Button - Opens LocationPicker */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, {color: colors.text}]}>Location</Text>
              <TouchableOpacity
                style={[styles.locationButton, {
                  backgroundColor: colors.card,
                  borderColor: colors.border
                }]}
                onPress={() => setLocationPickerVisible(true)}
              >
                <Ionicons name="location-outline" size={18} color={colors.smalltext} style={styles.locationIcon} />
                <Text style={[
                  styles.locationButtonText, 
                  location ? styles.locationButtonTextActive : {}, 
                  {color: location ? colors.text : colors.smalltext}
                ]}>
                  {location || "Select location..."}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.smalltext} />
              </TouchableOpacity>
              
              {location && locationDetails?.address && (
                <Text style={[styles.locationDetails, {color: colors.smalltext}]}>
                  {locationDetails.address}
                  {locationDetails.postalCode ? `, ${locationDetails.postalCode}` : ''}
                </Text>
              )}
              
              {location && locationDetails?.facilities && (
                <Text style={[styles.locationFacilities, {color: colors.smalltext}]}>
                  {locationDetails.facilities}
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={[
  styles.footer,
  { 
    backgroundColor: colors.background === '#121212' ? '#1E1E1E' : '#f9f9f9', // Darker in dark mode, lighter in light mode
    borderTopColor: colors.border,
    borderTopWidth: 1
  }
]}>
  <TouchableOpacity 
    style={[styles.clearButton, {borderColor: colors.border}]} 
    onPress={handleClear}
  >
    <Text style={[styles.clearButtonText, {color: colors.smalltext}]}>Clear All</Text>
  </TouchableOpacity>
  <TouchableOpacity 
    style={styles.applyButton} 
    onPress={handleApply}
  >
    <Text style={styles.applyButtonText}>Apply Filters</Text>
  </TouchableOpacity>
</View>
        </View>

        {/* Date Picker Modals */}
        <DateTimePickerModal
          isVisible={isDateFromPickerVisible}
          mode="date"
          date={dateFrom || new Date()}
          onConfirm={handleConfirmDateFrom}
          onCancel={handleCancelDateFrom}
          confirmTextIOS="Confirm"
          cancelTextIOS="Cancel"
        />
        <DateTimePickerModal
          isVisible={isDateToPickerVisible}
          mode="date"
          date={dateTo || new Date()}
          onConfirm={handleConfirmDateTo}
          onCancel={handleCancelDateTo}
          confirmTextIOS="Confirm"
          cancelTextIOS="Cancel"
        />

        {/* Location Picker Modal - Now using the separate LocationPicker component */}
        <LocationPicker
          visible={isLocationPickerVisible}
          onClose={() => setLocationPickerVisible(false)}
          onSelectLocation={handleSelectLocation}
          locations={locations}
          loading={locationsLoading}
          error={locationsError}
          selectedLocation={location}
        />
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
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 20,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    maxHeight: '80%',
  },
  scrollViewContent: {
    paddingBottom: 10,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sportSection: {
    zIndex: 3000,
    elevation: 3000,
  },
  skillLevelSection: {
    zIndex: 2000,
    elevation: 2000,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: '48%',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    color: '#888',
    fontSize: 16,
  },
  dateTextActive: {
    color: '#000',
    fontWeight: '500',
  },
  typeButtonContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  typeButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  typeButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#e0e0e0',
  },
  activeTypeButton: {
    backgroundColor: '#42c8f5',
    borderColor: '#42c8f5',
  },
  typeButtonText: {
    fontWeight: '500',
    color: '#555',
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationIcon: {
    marginRight: 8,
  },
  locationButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#888',
  },
  locationButtonTextActive: {
    color: '#000',
    fontWeight: '500',
  },
  locationDetails: {
    fontSize: 14,
    marginTop: 8,
    color: '#888',
  },
  locationFacilities: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    zIndex: 1,
  },
  clearButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
    marginTop: 10
  },
  clearButtonText: {
    color: '#888',
    fontWeight: '600',
    fontSize: 14,
  },
  applyButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#42c8f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
    marginTop: 10,
  },
  applyButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  }
});

export default FilterModal;