import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { format } from 'date-fns';
// Import your custom Dropdown and predefined lists from ActivityMenu
import Dropdown, { SPORTS_LIST, SKILL_LEVELS } from '@/components/activity/ActivityMenu';
import { useTheme } from '@/hooks/ThemeContext';



export const LOCATIONS_LIST = [
  "AMK Swimming Complex",
  "Bishan Sports Centre",
  "Bukit Batok Swimming Complex",
  "Bukit Gombak Sports Centre",
  "Clementi Stadium",
  "Delta Sports Centre",
  "Enabling Village Gym",
  "Farrer Park Field and Tennis Centre",
  "Geylang East Swimming Complex",
  "Geylang Field",
  "Heartbeat@Bedok",
  "Hougang Sports Centre",
  "Jalan Besar Sports Centre",
  "Jurong East Sports Centre",
  "Jurong Stadium",
  "Jurong West Sports Centre",
  "Kallang Basin Swimming Complex",
  "Kallang Sports Centre",
  "Katong Swimming Complex",
  "Our Tampines Hub - Community Auditorium",
  "Pasir Ris Sports Centre",
  "Queenstown Sports Centre",
  "Sengkang Sports Centre",
  "Serangoon Sports Centre",
  "St Wilfrid Sports Centre",
  "Toa Payoh Sports Centre",
  "Woodlands Sports Centre",
  "Yio Chu Kang Sports Centre",
  "Yishun Sports Centre",
  "Yishun Swimming Complex"
];

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
  // Filter state
  const [sport, setSport] = useState(initialFilters.sport);
  const [skillLevel, setSkillLevel] = useState(initialFilters.skillLevel);
  const [activityType, setActivityType] = useState(initialFilters.activityType);
  const [dateFrom, setDateFrom] = useState<Date | null>(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState<Date | null>(initialFilters.dateTo);
  const [location, setLocation] = useState(initialFilters.location);

  // Date picker visibility state
  const [isDateFromPickerVisible, setDateFromPickerVisible] = useState(false);
  const [isDateToPickerVisible, setDateToPickerVisible] = useState(false);

  // Reset filters when modal is opened with initialFilters
  useEffect(() => {
    if (visible) {
      setSport(initialFilters.sport);
      setSkillLevel(initialFilters.skillLevel);
      setActivityType(initialFilters.activityType);
      setDateFrom(initialFilters.dateFrom);
      setDateTo(initialFilters.dateTo);
      setLocation(initialFilters.location);
    }
  }, [visible, initialFilters]);

  const handleApply = () => {
    onApply({
      sport,
      skillLevel,
      activityType,
      dateFrom,
      dateTo,
      location
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
  };

  // Handlers for the modal date pickers
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

  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, {color:colors.text}]}>Filter Activities</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
            {/* Sport Dropdown with higher zIndex */}
            <View style={[styles.filterSection, styles.sportSection]}>
              <Text style={[styles.sectionTitle, {color:colors.text}]}>Sport</Text>
              <Dropdown
                items={SPORTS_LIST.map(sportItem => ({
                  label: sportItem,
                  value: sportItem.toLowerCase(),
                }))}
                value={sport}
                onChangeItem={(item) => setSport(item.value)}
                placeholder="Select sport..."
                searchable={true}
                searchablePlaceholder="Search sport..."
              
      
              />
            </View>

            {/* Skill Level Dropdown with lower zIndex */}
            <View style={[styles.filterSection, styles.skillLevelSection]}>
              <Text style={[styles.sectionTitle, {color:colors.text}]}>Skill Level</Text>
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
              />
            </View>

            {/* Activity Type - using buttons */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, {color:colors.text}]}>Activity Type</Text>
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
                    activityType === "event" && styles.activeTypeButtonText, {color: colors.text}
                  ]}>Events</Text>
                </TouchableOpacity>
                <TouchableOpacity
                 style={[
                  styles.typeButton,
                  styles.typeButtonRight,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  activityType === "coaching" && [styles.activeTypeButton, { backgroundColor: colors.primary }]
                ]}
                  onPress={() => setActivityType(activityType === "coaching" ? "" : "coaching")}
                >
                  <Text style={[
                    styles.typeButtonText,
                    activityType === "coaching" && styles.activeTypeButtonText,  {color: colors.text}
                  ]}>Coaching</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Range */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, {color:colors.text}]}>Date Range</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: colors.card, 
                    borderColor: colors.border 
                  }]}
                  onPress={() => setDateFromPickerVisible(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color={colors.smalltext} style={styles.dateIcon} />
                  <Text style={[styles.dateText, dateFrom ? styles.dateTextActive : {}, , {color: colors.smalltext}]}>
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
            </View>

            {/* Location Dropdown */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, {color:colors.text}]}>Location</Text>
              <Dropdown
                items={LOCATIONS_LIST.map(loc => ({
                  label: loc,
                  value: loc,
                }))}
                value={location}
                onChangeItem={(item) => setLocation(item.value)}
                placeholder="Select location..."
                searchable={true}
                searchablePlaceholder="Search location..."
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={[styles.clearButtonText, {color:colors.smalltext}]}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
    maxHeight: '70%',
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
    color: '#333',
    fontSize: 16,
  },
  dateTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  // Added styles for Activity Type buttons
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.48,
  },
  clearButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#42c8f5',
    borderRadius: 8,
    alignItems: 'center',
    flex: 0.48,
  },
  applyButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FilterModal;
