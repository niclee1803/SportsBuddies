import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Picker } from '@react-native-picker/picker';

const SPORTS = [
  "Select sport...", "Soccer", "Basketball", "Tennis", 
  "Running", "Cycling", "Swimming", "Volleyball", 
  "Baseball", "Golf", "Yoga", "Fitness", "Other"
];

const SKILL_LEVELS = ["Any Level", "Beginner", "Intermediate", "Advanced", "Professional"];

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
  
  // Date picker visibility
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);

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

  const handleDateChange = (event: any, selectedDate: Date | undefined, setter: React.Dispatch<React.SetStateAction<Date | null>>) => {
    const currentDate = selectedDate || new Date();
    setter(currentDate);
    
    if (Platform.OS === 'android') {
      setShowDateFromPicker(false);
      setShowDateToPicker(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Activities</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Sport</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={sport}
                  onValueChange={setSport}
                  style={styles.picker}
                >
                  {SPORTS.map((sportOption) => (
                    <Picker.Item 
                      key={sportOption} 
                      label={sportOption} 
                      value={sportOption === "Select sport..." ? "" : sportOption} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Skill Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={skillLevel}
                  onValueChange={setSkillLevel}
                  style={styles.picker}
                >
                  {SKILL_LEVELS.map((level) => (
                    <Picker.Item 
                      key={level} 
                      label={level} 
                      value={level === "Any Level" ? "" : level.toLowerCase()} 
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Activity Type</Text>
              <View style={styles.typeButtonContainer}>
                <TouchableOpacity 
                  style={[
                    styles.typeButton, 
                    styles.typeButtonLeft,
                    activityType === "event" && styles.activeTypeButton
                  ]}
                  onPress={() => setActivityType(activityType === "event" ? "" : "event")}
                >
                  <Text style={[
                    styles.typeButtonText,
                    activityType === "event" && styles.activeTypeButtonText
                  ]}>Events</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.typeButton,
                    styles.typeButtonRight,
                    activityType === "coaching" && styles.activeTypeButton
                  ]}
                  onPress={() => setActivityType(activityType === "coaching" ? "" : "coaching")}
                >
                  <Text style={[
                    styles.typeButtonText,
                    activityType === "coaching" && styles.activeTypeButtonText
                  ]}>Coaching</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Date Range</Text>
              <View style={styles.dateContainer}>
                <TouchableOpacity 
                  style={styles.dateButton} 
                  onPress={() => setShowDateFromPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color="#555" style={styles.dateIcon} />
                  <Text style={[styles.dateText, dateFrom ? styles.dateTextActive : {}]}>
                    {dateFrom ? format(dateFrom, 'MMM dd, yyyy') : 'From date'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowDateToPicker(true)}
                >
                  <Ionicons name="calendar-outline" size={18} color="#555" style={styles.dateIcon} />
                  <Text style={[styles.dateText, dateTo ? styles.dateTextActive : {}]}>
                    {dateTo ? format(dateTo, 'MMM dd, yyyy') : 'To date'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showDateFromPicker && (
                <DateTimePicker
                  value={dateFrom || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, setDateFrom)}
                  minimumDate={new Date()}
                />
              )}
              
              {showDateToPicker && (
                <DateTimePicker
                  value={dateTo || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'default'}
                  onChange={(event, date) => handleDateChange(event, date, setDateTo)}
                  minimumDate={dateFrom || new Date()}
                />
              )}
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <TextInput
                placeholder="City or venue name..."
                value={location}
                onChangeText={setLocation}
                style={styles.input}
                placeholderTextColor="#999"
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton}
              onPress={handleApply}
            >
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
    color: '#999',
  },
  dateTextActive: {
    color: '#333',
    fontWeight: '500',
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    color: '#333',
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
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default FilterModal;