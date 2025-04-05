import React, { useState, useEffect, ReactNode, useRef } from "react";
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
  Keyboard,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import BannerPicker from "@/components/activity/BannerPicker";
import LocationPicker from "@/components/activity/LocationPicker";
import useFacilityLocations from "@/hooks/FacilityLocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { format } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { pickImage, cancelUpload } from "@/utils/createactivityhelpers";
import {
  updateActivity,
  cancelActivity,
  deleteActivity,
} from "@/utils/updateActivity";
import { uploadBanner } from "@/utils/uploadBanner";
import { useTheme } from "@/hooks/ThemeContext";
import { API_URL } from "../config.json";
import { showAlert } from "@/utils/alertUtils";
import { Activity, Location } from "@/types/activity";
import Dropdown, {
  useSportsList,
  SKILL_LEVELS,
} from "@/components/activity/ActivityMenu";

// Section component props type
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

interface FacilityLocation {
  name: string;
  coordinates: number[];
}

// Define a type for the initial form data snapshot
interface InitialFormData {
  activityName: string;
  description: string;
  sport: string | null;
  skillLevel: string | null;
  type: string | null;
  bannerUri: string | null;
  existingBannerUrl: string | null;
  maxParticipants: string;
  price: string;
  date: Date;
  selectedLocation: Location | null;
  placeName: string;
}

const ManageActivity = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();

  // Form field references
  const activityNameRef = useRef<TextInput>(null);
  const descriptionRef = useRef<TextInput>(null);
  const maxParticipantsRef = useRef<TextInput>(null);
  const priceRef = useRef<TextInput>(null);

  // State variables
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityName, setActivityName] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [existingBannerUrl, setExistingBannerUrl] = useState<string | null>(
    null
  );
  const [maxParticipants, setMaxParticipants] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [placeName, setPlaceName] = useState("");
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const { sportsList, loading: sportsLoading } = useSportsList();

  // State to store initial form data for change detection
  const [initialActivityData, setInitialActivityData] =
    useState<InitialFormData | null>(null);

  // Date and time picker states
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  // Form validation
  const [errors, setErrors] = useState({
    activityName: "",
    sport: "",
    skillLevel: "",
    type: "",
    placeName: "",
  });

  const {
    locations,
    loading: locationsLoading,
    error: locationsError,
  } = useFacilityLocations(`${API_URL}/utils/facilities_geojson`);

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch existing activity data
  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true);
      try {
        // Fetch activity data directly using fetch API
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }
        const response = await fetch(`${API_URL}/activity/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(
            `Failed to fetch activity: ${response.status} - ${errorData}`
          );
        }

        const fetchedActivity: Activity = await response.json();

        // --- Set state based on fetched data ---
        setActivity(fetchedActivity);
        const currentActivityName = fetchedActivity.activityName;
        const currentDescription = fetchedActivity.description || "";
        const currentSport = fetchedActivity.sport;

        // Ensure skillLevel is one of the valid options
        const validSkillLevels = [
          "Beginner",
          "Intermediate",
          "Advanced",
          "Professional",
        ];
        const backendSkillLevel = fetchedActivity.skillLevel;
        const frontendSkillLevel =
          validSkillLevels.find(
            (level) => level.toLowerCase() === backendSkillLevel?.toLowerCase()
          ) || null;

        // Map backend type to frontend type
        const backendType = fetchedActivity.type;
        const typeMap: { [key: string]: string } = {
          event: "Event",
          "coaching session": "Coaching Session",
        };
        const frontendType = backendType
          ? typeMap[backendType.toLowerCase()] || null
          : null;

        const currentExistingBannerUrl = fetchedActivity.bannerImageUrl || null;
        const currentBannerUri = null; // Reset local banner URI on load
        const currentMaxParticipants = String(
          fetchedActivity.maxParticipants || ""
        );
        const currentPrice = String(fetchedActivity.price || "");
        const currentDate = new Date(fetchedActivity.dateTime);
        const currentSelectedLocation = fetchedActivity.location;
        const currentPlaceName = fetchedActivity.placeName || "";

        setActivityName(currentActivityName);
        setDescription(currentDescription);
        setSport(currentSport);
        setSkillLevel(frontendSkillLevel);
        setType(frontendType);
        setExistingBannerUrl(currentExistingBannerUrl);
        setBannerUri(currentBannerUri);
        setMaxParticipants(currentMaxParticipants);
        setPrice(currentPrice);
        setDate(currentDate);
        setSelectedLocation(currentSelectedLocation);
        setPlaceName(currentPlaceName);

        // Store initial data for change detection using the defined type
        setInitialActivityData({
          activityName: currentActivityName,
          description: currentDescription,
          sport: currentSport,
          skillLevel: frontendSkillLevel,
          type: frontendType,
          bannerUri: currentBannerUri,
          existingBannerUrl: currentExistingBannerUrl,
          maxParticipants: currentMaxParticipants,
          price: currentPrice,
          date: currentDate,
          selectedLocation: currentSelectedLocation,
          placeName: currentPlaceName,
        });

        // --- End set state ---
      } catch (error) {
        console.error("Error fetching activity:", error);
        showAlert(
          "Error",
          error instanceof Error
            ? error.message
            : "Failed to load activity details.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadActivity();
    }
  }, [id]); // Depend on id

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Function to check if form data has changed from initial state
  const hasFormChanged = () => {
    if (!initialActivityData) return false; // No initial data loaded yet

    const dateChanged =
      date.toISOString() !== initialActivityData.date?.toISOString();

    // Compare locations carefully
    const locationChanged =
      selectedLocation?.latitude !==
        initialActivityData.selectedLocation?.latitude ||
      selectedLocation?.longitude !==
        initialActivityData.selectedLocation?.longitude;

    // Check if banner has changed (new local URI selected OR existing banner removed)
    const bannerChanged = bannerUri !== initialActivityData.bannerUri; // Check if a new local banner URI was set

    // Compare other fields
    return (
      activityName !== initialActivityData.activityName ||
      description !== initialActivityData.description ||
      sport !== initialActivityData.sport ||
      skillLevel !== initialActivityData.skillLevel ||
      type !== initialActivityData.type ||
      maxParticipants !== initialActivityData.maxParticipants || // Compare as strings
      price !== initialActivityData.price || // Compare as strings
      placeName !== initialActivityData.placeName ||
      dateChanged ||
      locationChanged ||
      bannerChanged
    );
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
        setMaxParticipants(value.replace(/[^0-9]/g, ""));
        break;
      case "price":
        setPrice(value.replace(/[^0-9.]/g, ""));
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
        "You cannot schedule activities with dates in the past. Please select a future date.",
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
        "You cannot schedule activities with times in the past. Please select a future time.",
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

  const handleUpdate = async () => {
    if (
      !validateForm() ||
      !sport ||
      !skillLevel ||
      !type ||
      !selectedLocation ||
      !activity
    )
      return;

    if (date < new Date()) {
      showAlert(
        "Invalid Date",
        "You cannot schedule activities with dates in the past. Please select a future date and time.",
        [{ text: "OK" }]
      );
      return;
    }

    setIsSubmitting(true);
    console.log("[handleUpdate] Starting update...");

    try {
      let uploadedUrl = existingBannerUrl;
      if (bannerUri) {
        console.log("[handleUpdate] Uploading new banner:", bannerUri);
        uploadedUrl = await uploadBanner(bannerUri);
        console.log("[handleUpdate] Banner uploaded:", uploadedUrl);
      }

      const payload = {
        activityName,
        description,
        sport,
        skillLevel: skillLevel.toLowerCase(),
        type: type.toLowerCase(),
        bannerImageUrl: uploadedUrl || undefined,
        dateTime: date.toISOString(),
        maxParticipants: Number(maxParticipants) || undefined,
        price: Number(price) || undefined,
        placeName,
        location: selectedLocation,
      };

      console.log("[handleUpdate] Submitting update payload:", payload);
      await updateActivity(activity.id, payload);
      showAlert("Success", "Activity updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("[ERROR][handleUpdate] Update failed:", error);
    } finally {
      console.log("[handleUpdate] Finished update.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!activity) return;
    console.log(
      "[handleCancel] Cancel button pressed for activity:",
      activity.id
    );

    showAlert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this activity? This cannot be undone.",
      [
        {
          text: "Keep Activity",
          style: "cancel",
          onPress: () =>
            console.log("[handleCancel] Cancellation aborted by user."),
        },
        {
          text: "Yes, Cancel It",
          style: "destructive",
          onPress: async () => {
            console.log("[handleCancel] User confirmed cancellation.");
            setIsCancelling(true);
            try {
              console.log("[handleCancel] Calling cancelActivity API...");
              await cancelActivity(activity.id);
              console.log("[handleCancel] cancelActivity API call successful.");
              showAlert(
                "Activity Cancelled",
                "The activity has been marked as cancelled.",
                [{ text: "OK", onPress: () => router.back() }]
              );
            } catch (error) {
              console.error(
                "[ERROR][handleCancel] Cancellation failed:",
                error
              );
            } finally {
              console.log("[handleCancel] Finished cancellation attempt.");
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!activity) return;
    console.log(
      "[handleDelete] Delete button pressed for activity:",
      activity.id
    );

    showAlert(
      "Confirm Deletion",
      "Are you sure you want to permanently delete this activity? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () =>
            console.log("[handleDelete] Deletion aborted by user."),
        },
        {
          text: "Yes, Delete It",
          style: "destructive",
          onPress: async () => {
            console.log("[handleDelete] User confirmed deletion.");
            setIsDeleting(true);
            try {
              console.log("[handleDelete] Calling deleteActivity API...");
              await deleteActivity(activity.id);
              console.log("[handleDelete] deleteActivity API call successful.");
              showAlert(
                "Activity Deleted",
                "The activity has been permanently deleted.",
                [{ text: "OK", onPress: () => router.push("/Profile") }]
              );
            } catch (error) {
              console.error("[ERROR][handleDelete] Deletion failed:", error);
            } finally {
              console.log("[handleDelete] Finished deletion attempt.");
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleBackPress = () => {
    if (hasFormChanged()) {
      showAlert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Stay", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back(); // Navigate back directly if no changes detected
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 10 }}>
          Loading Activity...
        </Text>
      </View>
    );
  }

  if (!activity) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <Text style={{ color: colors.text }}>Activity not found.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonAlone}
        >
          <Text style={{ color: colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
          <Text style={[styles.backButtonText, { color: colors.primary }]}>
            Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Manage Activity
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={dismissKeyboard}>
          <ScrollView
            contentContainerStyle={{
              padding: 16,
              paddingBottom: Platform.OS === "ios" ? 120 : 150,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            keyboardDismissMode="interactive"
          >
            <Section title="Basic Information">
              <Text style={[styles.inputHeader, { color: colors.text }]}>
                Activity Name{" "}
                <Text style={{ color: colors.notification }}>*</Text>
              </Text>
              <TextInput
                ref={activityNameRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: errors.activityName
                      ? colors.notification
                      : colors.border,
                  },
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
                <Text
                  style={[styles.errorText, { color: colors.notification }]}
                >
                  {errors.activityName}
                </Text>
              ) : null}

              {/* Date Picker */}
              <Text
                style={[
                  styles.inputHeader,
                  { color: colors.text, marginTop: 8 },
                ]}
              >
                Date & Time{" "}
                <Text style={{ color: colors.notification }}>*</Text>
              </Text>
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
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
                    {format(date, "MMM dd, yyyy")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dateTimeButton,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
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
                    {format(date, "h:mm a")}
                  </Text>
                </TouchableOpacity>
              </View>
            </Section>

            <Section title="Activity Banner">
              <BannerPicker
                bannerUri={bannerUri}
                existingBannerUrl={existingBannerUrl}
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
                  <View
                    style={[
                      styles.loadingContainer,
                      {
                        backgroundColor: colors.card,
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                      },
                    ]}
                  >
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={{ color: colors.smalltext, marginLeft: 8 }}>
                      Loading sports...
                    </Text>
                  </View>
                ) : (
                  <Dropdown
                    items={sportsList.map((sportItem) => ({
                      label: sportItem,
                      value: sportItem,
                    }))}
                    value={sport || ""}
                    onChangeItem={(item) =>
                      handleFormChange("sport", item.value)
                    }
                    placeholder="Select sport..."
                    searchable={true}
                    searchablePlaceholder="Search sport..."
                    zIndex={3000}
                    zIndexInverse={1000}
                  />
                )}
                {errors.sport ? (
                  <Text
                    style={[styles.errorText, { color: colors.notification }]}
                  >
                    {errors.sport}
                  </Text>
                ) : null}
              </View>

              <View
                style={[
                  styles.dropdownContainer,
                  { zIndex: 2000, marginTop: 16 },
                ]}
              >
                <Text style={[styles.inputHeader, { color: colors.text }]}>
                  Skill Level{" "}
                  <Text style={{ color: colors.notification }}>*</Text>
                </Text>
                <Dropdown
                  items={[
                    { label: "Beginner", value: "Beginner" },
                    { label: "Intermediate", value: "Intermediate" },
                    { label: "Advanced", value: "Advanced" },
                    { label: "Professional", value: "Professional" },
                  ]}
                  value={skillLevel || ""}
                  onChangeItem={(item) =>
                    handleFormChange("skillLevel", item.value)
                  }
                  placeholder="Select skill level..."
                  zIndex={2000}
                  zIndexInverse={2000}
                />
                {errors.skillLevel ? (
                  <Text
                    style={[styles.errorText, { color: colors.notification }]}
                  >
                    {errors.skillLevel}
                  </Text>
                ) : null}
              </View>

              <View style={{ marginTop: 16 }}>
                <Text
                  style={[
                    styles.inputHeader,
                    { color: colors.text, marginBottom: 12 },
                  ]}
                >
                  Activity Type{" "}
                  <Text style={{ color: colors.notification }}>*</Text>
                </Text>
                <View style={styles.typeButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      styles.typeButtonLeft,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                      type === "Event" && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => handleFormChange("type", "Event")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        { color: type === "Event" ? "#fff" : colors.text },
                      ]}
                    >
                      Event
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      styles.typeButtonRight,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                      type === "Coaching Session" && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleFormChange("type", "Coaching Session")}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        {
                          color:
                            type === "Coaching Session" ? "#fff" : colors.text,
                        },
                      ]}
                    >
                      Coaching Session
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.type ? (
                  <Text
                    style={[styles.errorText, { color: colors.notification }]}
                  >
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
                  {
                    backgroundColor: colors.background,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                value={description}
                onChangeText={(text) => handleFormChange("description", text)}
                multiline
                numberOfLines={Platform.OS === "ios" ? 0 : 4}
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
                    Max Participants{" "}
                    <Text style={{ color: colors.notification }}>*</Text>
                  </Text>
                  <TextInput
                    ref={maxParticipantsRef}
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={maxParticipants}
                    onChangeText={(text) =>
                      handleFormChange("maxParticipants", text)
                    }
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
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    value={price}
                    onChangeText={(text) => handleFormChange("price", text)}
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
              <Text style={[styles.inputHeader, { color: colors.text }]}>
                Location <Text style={{ color: colors.notification }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.locationPickerButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: errors.placeName
                      ? colors.notification
                      : colors.border,
                  },
                ]}
                onPress={() => setLocationModalVisible(true)}
              >
                <View style={styles.locationIconContainer}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors.smalltext}
                  />
                </View>
                <Text
                  style={[
                    styles.locationButtonText,
                    placeName
                      ? { color: colors.text }
                      : { color: colors.smalltext },
                  ]}
                >
                  {placeName || "Tap to select location"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.smalltext}
                />
              </TouchableOpacity>
              {errors.placeName ? (
                <Text
                  style={[styles.errorText, { color: colors.notification }]}
                >
                  {errors.placeName}
                </Text>
              ) : null}
            </Section>

            <Section title="Actions">
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: colors.primary },
                  (isSubmitting || isCancelling || isDeleting) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleUpdate}
                disabled={isSubmitting || isCancelling || isDeleting}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  {isSubmitting ? "Updating..." : "Update Activity"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: "#FFA500" },
                  (isSubmitting || isCancelling || isDeleting) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleCancel}
                disabled={isSubmitting || isCancelling || isDeleting}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  {isCancelling ? "Cancelling..." : "Cancel Activity"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.deleteBtn,
                  { backgroundColor: colors.notification },
                  (isSubmitting || isCancelling || isDeleting) &&
                    styles.buttonDisabled,
                ]}
                onPress={handleDelete}
                disabled={isSubmitting || isCancelling || isDeleting}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  {isDeleting ? "Deleting..." : "Delete Activity"}
                </Text>
              </TouchableOpacity>
            </Section>

            {/* Date/Time Pickers */}
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
  backButtonAlone: {
    marginTop: 20,
    padding: 10,
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
    padding: Platform.OS === "ios" ? 14 : 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  descriptionInput: {
    padding: Platform.OS === "ios" ? 14 : 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
    height: 120,
    textAlignVertical: "top",
  },
  errorText: {
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateTimeButton: {
    flexDirection: "row",
    alignItems: "center",
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
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  deleteBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  typeButtonContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "500",
    fontSize: 16,
  },
  locationPickerButton: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfColumn: {
    width: "48%",
  },
  dropdownContainer: {
    marginBottom: 8,
  },
});

export default ManageActivity;
