import React, { useState, ReactNode, useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BannerPicker from "@/components/activity/BannerPicker";
import { pickImage, cancelUpload } from "@/utils/createactivityhelpers";
import { handleSubmitActivity } from "@/utils/uploadactivity";
import { useTheme } from "@/hooks/ThemeContext";
import { API_URL } from "../config.json";
import { uploadBanner } from "@/utils/uploadBanner";
import { showAlert } from "@/utils/alertUtils";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import Dropdown, { useSportsList, SKILL_LEVELS } from '@/components/activity/ActivityMenu';
import LocationPicker from "@/components/activity/LocationPicker";
import useFacilityLocations, { FacilityLocation } from '@/hooks/FacilityLocation';
import LoadingOverlay from "@/components/LoadingOverlay";

interface SectionProps {
  title: string;
  children: ReactNode;
  style?: object;
  zIndex?: number;
}

// Section component for better organization
const Section = ({ title, children, style = {}, zIndex = 1 }: SectionProps) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          zIndex: zIndex,
        },
        style,
      ]}
    >
      <View style={styles.sectionHeader}>
        <View
          style={[
            styles.sectionTitleAccent,
            { backgroundColor: colors.primary },
          ]}
        />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
};

interface Location {
  latitude: number;
  longitude: number;
}

interface ActivityPayload {
  activityName: string;
  description: string;
  sport: string;
  skillLevel: string;
  type: string;
  bannerImageUrl: string | null;
  dateTime: string;
  maxParticipants: number;
  price: number;
  placeName: string;
  location: Location;
}

const CreateActivity = () => {
  const router = useRouter();
  const { colors } = useTheme();
  
  // Form field references for better keyboard navigation
  const activityNameRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const maxParticipantsRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);
  
  // Form state
  const [activityName, setActivityName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date()); // Default to tomorrow for better UX
  const [placeName, setPlaceName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  
  // Loading states and data
  const { locations, loading: locationsLoading, error: locationsError } = useFacilityLocations(`${API_URL}/utils/facilities_geojson`);
  const { sportsList, loading: sportsLoading } = useSportsList();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form validation
  const [errors, setErrors] = useState({
    activityName: "",
    sport: "",
    skillLevel: "",
    type: "",
    placeName: "",
  });
  const [formModified, setFormModified] = useState(false);
  
  // Date and time picker states
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    setDate(tomorrow);
  }, []);

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const onSuccess = () => {
    showAlert("Success!", "Activity created successfully.", [
      { 
        text: "OK", 
        onPress: () => {
          // Navigate to Profile screen
          router.push("/Profile");
        }
      }
    ]);
    setIsSubmitting(false);

    // Reset form fields
    setActivityName("");
    setDescription("");
    setType(null);
    setSport(null);
    setSkillLevel(null);
    setBannerUri(null);
    setMaxParticipants("");
    setPrice("");
    setDate(new Date());
    setPlaceName("");
    setSelectedLocation(null);
  };

  const onError = (msg: string) => {
    showAlert("Error", msg);
    setIsSubmitting(false);
  };

  const validateForm = () => {
    const newErrors = {
      activityName: !activityName ? "Activity name is required" : "",
      sport: !sport ? "Sport is required" : "",
      skillLevel: !skillLevel ? "Skill level is required" : "",
      type: !type ? "Activity type is required" : "",
      placeName: !placeName ? "Location is required" : "",
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleFormChange = (field: string, value: any) => {
    setFormModified(true);
    switch (field) {
      case "activityName":
        setActivityName(value);
        setErrors((prev) => ({ ...prev, activityName: "" }));
        break;
      case "description":
        setDescription(value);
        break;
      case "sport":
        setSport(value);
        setErrors((prev) => ({ ...prev, sport: "" }));
        break;
      case "skillLevel":
        setSkillLevel(value);
        setErrors((prev) => ({ ...prev, skillLevel: "" }));
        break;
      case "type":
        setType(value);
        setErrors((prev) => ({ ...prev, type: "" }));
        break;
      case "maxParticipants":
        setMaxParticipants(value);
        break;
      case "price":
        setPrice(value);
        break;
      case "placeName":
        setPlaceName(value);
        setErrors((prev) => ({ ...prev, placeName: "" }));
        break;
    }
  };

  const validateFutureDate = (selectedDate: Date): boolean => {
    const now = new Date();
    return selectedDate > now;
  };
  
  const handleDateConfirm = (selectedDate: Date) => {
    // Check if the selected date is in the past
    if (!validateFutureDate(selectedDate)) {
      showAlert(
        "Invalid Date",
        "You cannot create activities with dates in the past. Please select a future date.",
        [{ text: "OK" }]
      );
      return;
    }
  
    const currentTime = date;
    selectedDate.setHours(
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds()
    );
    setDate(selectedDate);
    setDatePickerVisible(false);
  };
  
  const handleTimeConfirm = (selectedTime: Date) => {
    const newDate = new Date(date);
    newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
    
    // Check if the new datetime is in the past
    if (newDate < new Date()) {
      showAlert(
        "Invalid Time",
        "You cannot create activities with times in the past. Please select a future time.",
        [{ text: "OK" }]
      );
      return;
    }
    
    setDate(newDate);
    setTimePickerVisible(false);
  };

  const handleLocationSelect = (location: FacilityLocation) => {
    setSelectedLocation({
      latitude: location.coordinates[1],
      longitude: location.coordinates[0],
    });
    setPlaceName(location.name);
    setLocationModalVisible(false);
    setErrors((prev) => ({ ...prev, placeName: "" }));
  };

  const submitActivity = async () => {
    if (
      !validateForm() ||
      !sport ||
      !skillLevel ||
      !type ||
      !selectedLocation
    ) {
      return;
    }

    if (date < new Date()) {
      showAlert(
        "Invalid Date",
        "You cannot create activities with dates in the past. Please select a future date and time.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    console.log("[DEBUG] Submitting activity...");

    let uploadedUrl = null;
    try {
      if (bannerUri) {
        console.log("[DEBUG] Uploading banner:", bannerUri);
        uploadedUrl = await uploadBanner(bannerUri);
        console.log("[DEBUG] Banner uploaded:", uploadedUrl);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("[ERROR] Banner upload failed:", error);
      showAlert("Upload Error", errorMessage);
      setIsSubmitting(false);
      return;
    }

    const payload: ActivityPayload = {
      activityName,
      description,
      sport,
      skillLevel: skillLevel.toLowerCase(),
      type: type.toLowerCase(),
      bannerImageUrl: uploadedUrl,
      dateTime: date.toISOString(),
      maxParticipants: Number(maxParticipants),
      price: Number(price),
      placeName,
      location: selectedLocation,
    };

    console.log("[DEBUG] Submitting payload:", payload);

    try {
      await handleSubmitActivity(payload, onSuccess, onError);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("[ERROR] Submission failed:", error);
      showAlert("Submission Failed", errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    if (formModified) {
      showAlert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          {
            text: "Stay",
            style: "cancel",
          },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Loading overlay */}
      <LoadingOverlay visible={isSubmitting} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Create Activity
        </Text>
      </View>
  
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === "ios" ? 120 : 150 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            keyboardDismissMode="interactive"
          >
            <Section title="Basic Information">
              <Text style={[styles.inputHeader, { color: colors.text }]}>
                Activity Name <Text style={{ color: colors.notification }}>*</Text>
              </Text>
              <TextInput
                ref={activityNameRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: errors.activityName ? colors.notification : colors.border,
                  }
                ]}
                value={activityName}
                onChangeText={(text) => handleFormChange("activityName", text)}
                placeholder="e.g. Weekend Football"
                placeholderTextColor={colors.smalltext}
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => descriptionRef.current?.focus()}
              />
              {errors.activityName ? (
                <Text style={[styles.errorText, { color: colors.notification }]}>
                  {errors.activityName}
                </Text>
              ) : null}

              {/* Date Picker - Updated style similar to FilterModal */}
              <Text style={[styles.inputHeader, { color: colors.text, marginTop: 8 }]}>
                Date & Time <Text style={{ color: colors.notification }}>*</Text>
              </Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    { backgroundColor: colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => setDatePickerVisible(true)}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={18} 
                    color={colors.smalltext} 
                    style={styles.dateTimeIcon} 
                  />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {format(date, 'MMM dd, yyyy')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dateTimeButton, 
                    { backgroundColor: colors.background, borderColor: colors.border }
                  ]}
                  onPress={() => setTimePickerVisible(true)}
                >
                  <Ionicons 
                    name="time-outline" 
                    size={18} 
                    color={colors.smalltext} 
                    style={styles.dateTimeIcon} 
                  />
                  <Text style={[styles.dateTimeText, { color: colors.text }]}>
                    {format(date, 'h:mm a')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Section>

            <Section title="Activity Banner">
              <BannerPicker
                bannerUri={bannerUri}
                pickImage={() => pickImage((uri: string) => setBannerUri(uri))}
                cancelUpload={() => cancelUpload(setBannerUri)}
              />
            </Section>

            <Section title="Activity Details" zIndex={4}>
              <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
                <Text style={[styles.inputHeader, { color: colors.text }]}>
                  Sport <Text style={{ color: colors.notification }}>*</Text>
                </Text>
                {sportsLoading ? (
                  <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.smalltext }]}>
                      Loading sports...
                    </Text>
                  </View>
                ) : (
                  <Dropdown
                    items={sportsList.map(sportItem => ({
                      label: sportItem,
                      value: sportItem,
                    }))}
                    value={sport || ''}
                    onChangeItem={(item) => handleFormChange("sport", item.value)}
                    placeholder="Select sport..."
                    searchable={true}
                    searchablePlaceholder="Search sport..."
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                )}
                {errors.sport ? (
                  <Text style={[styles.errorText, { color: colors.notification }]}>
                    {errors.sport}
                  </Text>
                ) : null}
              </View>

              <View style={[styles.dropdownContainer, { zIndex: 2000, marginTop: 16 }]}>
                <Text style={[styles.inputHeader, { color: colors.text }]}>
                  Skill Level <Text style={{ color: colors.notification }}>*</Text>
                </Text>
                <Dropdown
                  items={[
                    { label: "Beginner", value: "Beginner" },
                    { label: "Intermediate", value: "Intermediate" },
                    { label: "Advanced", value: "Advanced" },
                    { label: "Professional", value: "Professional" }
                  ]}
                  value={skillLevel || ''}
                  onChangeItem={(item) => handleFormChange("skillLevel", item.value)}
                  placeholder="Select skill level..."
                  zIndex={2000}
                  zIndexInverse={2000}
                />
                {errors.skillLevel ? (
                  <Text style={[styles.errorText, { color: colors.notification }]}>
                    {errors.skillLevel}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginTop: 16 }}>
                <Text style={[styles.inputHeader, { color: colors.text, marginBottom: 12 }]}>
                  Activity Type <Text style={{ color: colors.notification }}>*</Text>
                </Text>
                <View style={styles.typeButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      styles.typeButtonLeft,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      type === "Event" && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleFormChange("type", "Event")}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: type === "Event" ? "#fff" : colors.text }
                    ]}>
                      Event
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      styles.typeButtonRight,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      type === "Coaching Session" && { backgroundColor: colors.primary }
                    ]}
                    onPress={() => handleFormChange("type", "Coaching Session")}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      { color: type === "Coaching Session" ? "#fff" : colors.text }
                    ]}>
                      Coaching Session
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.type ? (
                  <Text style={[styles.errorText, { color: colors.notification }]}>
                    {errors.type}
                  </Text>
                ) : null}
              </View>
            </Section>

            <Section title="Additional Information">
              <Text style={[styles.inputHeader, { color: colors.text }]}>
                Description
              </Text>
              <TextInput
                ref={descriptionRef}
                style={[
                  styles.descriptionInput,
                  { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }
                ]}
                value={description}
                onChangeText={(text) => handleFormChange("description", text)}
                multiline
                numberOfLines={Platform.OS === 'ios' ? 0 : 4}
                textAlignVertical="top"
                placeholder="Add details about your activity, what to bring, what to expect, etc."
                placeholderTextColor={colors.smalltext}
                returnKeyType="next"
                blurOnSubmit={true}
                onSubmitEditing={() => maxParticipantsRef.current?.focus()}
              />

              <View style={styles.rowContainer}>
                <View style={styles.halfColumn}>
                  <Text style={[styles.inputHeader, { color: colors.text }]}>
                    Max Participants <Text style={{ color: colors.notification }}>*</Text>
                  </Text>
                  <TextInput
                    ref={maxParticipantsRef}
                    style={[
                      styles.input,
                      { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }
                    ]}
                    value={maxParticipants}
                    onChangeText={(text) => handleFormChange("maxParticipants", text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    placeholder="e.g. 10"
                    placeholderTextColor={colors.smalltext}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onSubmitEditing={() => priceRef.current?.focus()}
                  />
                </View>

                <View style={styles.halfColumn}>
                  <Text style={[styles.inputHeader, { color: colors.text }]}>
                    Price (SGD)
                  </Text>
                  <TextInput
                    ref={priceRef}
                    style={[
                      styles.input,
                      { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }
                    ]}
                    value={price}
                    onChangeText={(text) => handleFormChange("price", text.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={colors.smalltext}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    onSubmitEditing={dismissKeyboard}
                  />
                </View>
              </View>
            </Section>

            <Section title="Location">
            <Text style={{ color: colors.notification }}>*</Text>
              <TouchableOpacity
                style={[
                  styles.locationPickerButton,
                  { backgroundColor: colors.background, borderColor: errors.placeName ? colors.notification : colors.border }
                ]}
                onPress={() => setLocationModalVisible(true)}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons name="location-outline" size={20} color={colors.smalltext} />
                </View>
                <Text
                  style={[
                    styles.locationButtonText,
                    placeName ? { color: colors.text } : { color: colors.smalltext }
                  ]}
                >
                  {placeName || "Tap to select location"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.smalltext} />
              </TouchableOpacity>
              {errors.placeName ? (
                <Text style={[styles.errorText, { color: colors.notification }]}>
                  {errors.placeName}
                </Text>
              ) : null}
            </Section>

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              date={date}
              onConfirm={handleDateConfirm}
              onCancel={() => setDatePickerVisible(false)}
              minimumDate={new Date()}
              confirmTextIOS="Confirm"
              cancelTextIOS="Cancel"
            />

            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              date={date}
              onConfirm={handleTimeConfirm}
              onCancel={() => setTimePickerVisible(false)}
              confirmTextIOS="Confirm"
              cancelTextIOS="Cancel"
            />

            <LocationPicker
              visible={locationModalVisible}
              onClose={() => setLocationModalVisible(false)}
              onSelectLocation={handleLocationSelect}
              locations={locations}
              loading={locationsLoading}
              error={locationsError}
              selectedLocation={placeName}
            />
            
            <View style={{ height: 50 }}></View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
      
      {/* Fixed Submit Button */}
      <View style={[
        styles.submitButtonContainer,
        { backgroundColor: colors.card, borderTopColor: colors.border }
      ]}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            isSubmitting ? styles.submitBtnDisabled : {},
            { backgroundColor: colors.primary }
          ]}
          onPress={submitActivity}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>Create Activity</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonText: {
    marginLeft: 4,
    fontSize: 16,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitleAccent: {
    width: 4,
    height: 24,
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  input: {
    padding: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  descriptionInput: {
    padding: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    flex: 0.48,
  },
  dateTimeIcon: {
    marginRight: 8,
  },
  dateTimeText: {
    fontSize: 16,
  },
  submitButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10,
    zIndex: 1000,
  },
  submitBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  submitBtnContentLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  inputHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  typeButtonContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderWidth: 1,
  },
  typeButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
  },
  typeButtonText: {
    fontWeight: '500',
    fontSize: 16,
  },
  locationPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  locationIconContainer: {
    marginRight: 8,
  },
  locationButtonText: {
    flex: 1,
    fontSize: 16,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfColumn: {
    width: '48%',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  dropdownContainer: {
    marginBottom: 8,
  }
});

export default CreateActivity;