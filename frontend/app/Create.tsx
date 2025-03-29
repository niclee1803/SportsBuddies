import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { HeaderBackButton } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config.json';
import { showAlert } from '@/utils/alertUtils';
import AuthLayout from '@/components/AuthLayout';

// Constants for dropdowns
const ACTIVITY_TYPES = [
  { label: 'Event', value: 'event' },
  { label: 'Coaching Session', value: 'coaching session' }
];

const SKILL_LEVELS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Professional', value: 'professional' }
];

const CreateActivity = () => {
  const router = useRouter();
  const navigation = useNavigation();
  
  // Set default date to one week from now
  const getOneWeekFromNow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  };
  
  // Form state
  const [activityName, setActivityName] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [price, setPrice] = useState('0');
  const [description, setDescription] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('10');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Date/time state
  const [date, setDate] = useState(getOneWeekFromNow());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Dropdown states
  const [activityTypeOpen, setActivityTypeOpen] = useState(false);
  const [sportOpen, setSportOpen] = useState(false);
  const [skillLevelOpen, setSkillLevelOpen] = useState(false);
  
  const [activityType, setActivityType] = useState('event');
  const [sport, setSport] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  
  // Sports list from API
  const [sportsList, setSportsList] = useState<Array<{label: string, value: string}>>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [sportsError, setSportsError] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Close other dropdowns when one is opened
  useEffect(() => {
    if (activityTypeOpen) {
      setSportOpen(false);
      setSkillLevelOpen(false);
    }
  }, [activityTypeOpen]);

  useEffect(() => {
    if (sportOpen) {
      setActivityTypeOpen(false);
      setSkillLevelOpen(false);
    }
  }, [sportOpen]);

  useEffect(() => {
    if (skillLevelOpen) {
      setActivityTypeOpen(false);
      setSportOpen(false);
    }
  }, [skillLevelOpen]);

  // Fetch sports list from API
  useEffect(() => {
    const fetchSports = async () => {
      try {
        setSportsLoading(true);
        const token = await AsyncStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not available');
        }
        
        const response = await fetch(`${API_URL}/utils/sports_list`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch sports list');
        }
        
        const data = await response.json();
        // Format the sports list as items for DropDownPicker
        const formattedSports = data.map((sportName: string) => ({
          label: sportName,
          value: sportName
        }));
        
        setSportsList(formattedSports);
      } catch (error) {
        console.error('Error fetching sports:', error);
        setSportsError('Failed to load sports. Please try again.');
      } finally {
        setSportsLoading(false);
      }
    };
    
    fetchSports();
  }, []);

  // Safe formatting functions that return strings, not components
  const formatDateToString = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTimeToString = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  // Date/time picker handlers
  const onDateChange = (_: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDate(newDate);
    }
  };
  
  const onTimeChange = (_: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!activityName.trim()) newErrors.activityName = 'Activity name is required';
    if (!sport) newErrors.sport = 'Sport is required';
    if (!skillLevel) newErrors.skillLevel = 'Skill level is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    
    // Validate price is a number
    if (isNaN(Number(price))) {
      newErrors.price = 'Price must be a number';
    }
    
    // Validate max participants is a number
    if (isNaN(Number(maxParticipants)) || Number(maxParticipants) <= 0) {
      newErrors.maxParticipants = 'Max participants must be a positive number';
    }
    
    // Validate location
    if (!latitude.trim() || !longitude.trim()) {
      newErrors.location = 'Both latitude and longitude are required';
    } else if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      newErrors.location = 'Latitude and longitude must be valid numbers';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const DEFAULT_IMAGE = "https://firebasestorage.googleapis.com/v0/b/sportbuddies-1bf9e.appspot.com/o/default%2Factivity-placeholder.jpg?alt=media";
      
      const activityData = {
        activityName: activityName.trim(),
        bannerImageUrl: bannerImageUrl.trim() || DEFAULT_IMAGE,
        type: activityType, 
        price: Number(price), 
        sport: sport, 
        skillLevel: skillLevel,
        description: description.trim(),
        maxParticipants: Number(maxParticipants),
        dateTime: date.toISOString(),
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      };
      
      // Get auth token
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Authentication Error', 'Please log in again.');
        router.replace('/Login');
        return;
      }
      
      // Log the exact payload for debugging
      console.log('Submitting activity data:', JSON.stringify(activityData, null, 2));
      
      // Ensure proper auth header format - note the space after Bearer
      const response = await fetch(`${API_URL}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityData)
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok) {
        showAlert(
          'Success!', 
          'Your activity has been created.',
          [{ 
            text: 'OK', 
            onPress: () => router.push('/Feed'),
            style: 'default'
          }]
        );
      } else {
        showAlert(
          'Error', 
          data.detail || 'Failed to create activity. Please try again.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error creating activity:', error);
      showAlert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Properly handle date/time selection display
  const renderDateTimeSelector = () => {
    return (
      <View style={styles.dateTimeContainer}>
        <Pressable 
          style={styles.dateTimeButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text style={styles.dateTimeText}>{formatDateToString(date)}</Text>
        </Pressable>
        
        <Pressable 
          style={styles.dateTimeButton}
          onPress={() => setShowTimePicker(true)}
        >
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.dateTimeText}>{formatTimeToString(date)}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <AuthLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={{paddingBottom: 80}}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!activityTypeOpen && !sportOpen && !skillLevelOpen}
        >
          <View style={styles.header}>
            <HeaderBackButton onPress={() => navigation.goBack()} />
            <Text style={styles.title}>Create Activity</Text>
            <View style={{ width: 40 }} />
          </View>
          
          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Activity Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Name*</Text>
              <TextInput 
                style={[styles.input, errors.activityName && styles.inputError]}
                value={activityName}
                onChangeText={setActivityName}
                placeholder="Enter activity name"
              />
              {errors.activityName ? (
                <Text style={styles.errorText}>{errors.activityName}</Text>
              ) : null}
            </View>
            
            {/* Banner Image URL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Banner Image URL</Text>
              <TextInput 
                style={styles.input}
                value={bannerImageUrl}
                onChangeText={setBannerImageUrl}
                placeholder="https://example.com/image.jpg"
              />
            </View>
            
            {/* Activity Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Activity Type*</Text>
              <DropDownPicker
                open={activityTypeOpen}
                value={activityType}
                items={ACTIVITY_TYPES}
                setOpen={setActivityTypeOpen}
                setValue={setActivityType}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={3000}
                zIndexInverse={1000}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
            </View>
            
            {/* Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Price ($)*</Text>
              <TextInput 
                style={[styles.input, errors.price && styles.inputError]}
                value={price}
                onChangeText={setPrice}
                placeholder="0"
                keyboardType="numeric"
              />
              {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
            </View>
            
            {/* Sport */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sport*</Text>
              {sportsLoading ? (
                <View style={[styles.dropdown, styles.loadingContainer]}>
                  <ActivityIndicator size="small" color="#42c8f5" />
                  <Text style={styles.loadingText}>Loading sports...</Text>
                </View>
              ) : sportsError ? (
                <View style={[styles.dropdown, styles.errorContainer]}>
                  <Text style={styles.errorText}>{sportsError}</Text>
                  <TouchableOpacity 
                    style={styles.retryButton}
                    onPress={() => {
                      setSportsLoading(true);
                      setSportsError('');
                      setSportsList([]);
                    }}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <DropDownPicker
                  open={sportOpen}
                  value={sport}
                  items={sportsList}
                  setOpen={setSportOpen}
                  setValue={setSport}
                  style={[styles.dropdown, errors.sport && styles.inputError]}
                  dropDownContainerStyle={styles.dropdownContainer}
                  zIndex={2000}
                  zIndexInverse={2000}
                  placeholder="Select a sport"
                  placeholderStyle={{color: "#999"}}
                  searchable={true}
                  listMode="SCROLLVIEW"
                  scrollViewProps={{
                    nestedScrollEnabled: true,
                  }}
                />
              )}
              {errors.sport ? <Text style={styles.errorText}>{errors.sport}</Text> : null}
            </View>
            
            {/* Skill Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Skill Level*</Text>
              <DropDownPicker
                open={skillLevelOpen}
                value={skillLevel}
                items={SKILL_LEVELS}
                setOpen={setSkillLevelOpen}
                setValue={setSkillLevel}
                style={[styles.dropdown, errors.skillLevel && styles.inputError]}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={1000}
                zIndexInverse={3000}
                placeholder="Select skill level"
                placeholderStyle={{color: "#999"}}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
              {errors.skillLevel ? <Text style={styles.errorText}>{errors.skillLevel}</Text> : null}
            </View>
            
            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description*</Text>
              <TextInput 
                style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your activity..."
                multiline={true}
                numberOfLines={4}
              />
              {errors.description ? <Text style={styles.errorText}>{errors.description}</Text> : null}
            </View>
            
            {/* Max Participants */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Maximum Participants*</Text>
              <TextInput 
                style={[styles.input, errors.maxParticipants && styles.inputError]}
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                placeholder="10"
                keyboardType="numeric"
              />
              {errors.maxParticipants ? <Text style={styles.errorText}>{errors.maxParticipants}</Text> : null}
            </View>
            
            {/* Date and Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date and Time*</Text>
              
              {renderDateTimeSelector()}
              
              {/* Date Picker */}
              {showDatePicker && (
                <View>
                  <DateTimePicker
                    testID="datePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                  />
                </View>
              )}
              
              {/* Time Picker */}
              {showTimePicker && (
                <View>
                  <DateTimePicker
                    testID="timePicker"
                    value={date}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onTimeChange}
                  />
                </View>
              )}
            </View>
            
            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location*</Text>
              <View style={styles.locationContainer}>
                <TextInput 
                  style={[
                    styles.input, 
                    styles.locationInput, 
                    errors.location && styles.inputError
                  ]}
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="Latitude (e.g. 48.8566)"
                  keyboardType="numeric"
                />
                <TextInput 
                  style={[
                    styles.input, 
                    styles.locationInput, 
                    errors.location && styles.inputError
                  ]}
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="Longitude (e.g. 2.3522)"
                  keyboardType="numeric"
                />
              </View>
              {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.disabledButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Create Activity</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 50,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    maxHeight: 200,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInput: {
    flex: 0.48,
  },
  submitButton: {
    backgroundColor: '#42c8f5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#a0d0e6',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    height: 50,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 12,
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 8,
    padding: 6,
    backgroundColor: '#42c8f5',
    borderRadius: 4,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
  }
});

export default CreateActivity;