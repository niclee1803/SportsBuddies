import React, { useState, useEffect, ReactNode } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import DropDownPicker from "react-native-dropdown-picker";
import BannerPicker from "@/components/activity/BannerPicker";
import DateTimeInput from "@/components/activity/DateTimeInput";
import LocationPicker from "@/components/activity/LocationPicker";
import useFacilityLocations from "@/hooks/FacilityLocation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_SPORTS_LIST,
  SKILL_LEVELS,
  TYPE,
} from "@/components/activity/ActivityMenu";
import { pickImage, cancelUpload } from "@/utils/createactivityhelpers";
import {
  updateActivity,
  cancelActivity,
  deleteActivity,
} from "@/utils/updateActivity";
import { uploadBanner } from "@/utils/uploadBanner";
import { useTheme } from "@/hooks/ThemeContext";
import { API_URL } from "../config.json";
import { Ionicons } from "@expo/vector-icons";
import { showAlert } from "@/utils/alertUtils";
import { Activity } from "@/types/activity";

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

interface Location {
  latitude: number;
  longitude: number;
}

interface FacilityLocation {
  name: string;
  coordinates: number[];
}

const ManageActivity = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();

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

  // Dropdown states
  const [sportOpen, setSportOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);

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
        setActivityName(fetchedActivity.activityName);
        setDescription(fetchedActivity.description || "");
        setSport(fetchedActivity.sport);
        setSkillLevel(fetchedActivity.skillLevel);
        setType(fetchedActivity.type);
        // Use existingBannerUrl for the initial state, bannerUri for local changes
        setExistingBannerUrl(fetchedActivity.bannerImageUrl || null);
        setBannerUri(null); // Reset local banner URI on load
        setMaxParticipants(String(fetchedActivity.maxParticipants || ""));
        setPrice(String(fetchedActivity.price || ""));
        setDate(new Date(fetchedActivity.dateTime));
        setSelectedLocation(fetchedActivity.location);
        setPlaceName(fetchedActivity.placeName || "");
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

  const handleLocationSelect = (location: FacilityLocation) => {
    setSelectedLocation({
      latitude: location.coordinates[1],
      longitude: location.coordinates[0],
    });
    setPlaceName(location.name);
    setLocationModalVisible(false);
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
    console.log("[handleUpdate] Starting update...");
    setIsSubmitting(true);

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

    // --- Remove simple test alert ---
    // Alert.alert("Test Alert", "Does this basic alert show up?");

    // --- Use showAlert utility for confirmation ---
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
              // Use showAlert for success message as well (consistency)
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
              // Error alert is handled within cancelActivity utility
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

    // --- Use showAlert utility for confirmation ---
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
              // Use showAlert for success message
              showAlert(
                "Activity Deleted",
                "The activity has been permanently deleted.",
                [{ text: "OK", onPress: () => router.push("/Profile") }]
              );
            } catch (error) {
              console.error("[ERROR][handleDelete] Deletion failed:", error);
              // Error alert handled in deleteActivity utility
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
    if (validateForm()) {
      Alert.alert(
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
      router.back();
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
      <View style={[styles.header, { backgroundColor: colors.card }]}>
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <>
              <Section title="Basic Information">
                <Text style={[styles.inputHeader, { color: colors.text }]}>
                  Activity Name
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: errors.activityName
                        ? colors.notification
                        : colors.border,
                    },
                  ]}
                  value={activityName}
                  onChangeText={(text) =>
                    handleFormChange("activityName", text)
                  }
                  placeholder="e.g. Weekend Football"
                  placeholderTextColor={colors.placeholder}
                />
                {errors.activityName ? (
                  <Text
                    style={[styles.errorText, { color: colors.notification }]}
                  >
                    {errors.activityName}
                  </Text>
                ) : null}

                <DateTimeInput
                  label="Date"
                  mode="date"
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                    handleFormChange("date", newDate);
                  }}
                />
                <DateTimeInput
                  label="Time"
                  mode="time"
                  value={date}
                  onChange={(newDate) => {
                    setDate(newDate);
                    handleFormChange("time", newDate);
                  }}
                />
              </Section>

              <Section title="Activity Banner">
                <BannerPicker
                  bannerUri={bannerUri}
                  existingBannerUrl={existingBannerUrl}
                  pickImage={() =>
                    pickImage((uri: string) => {
                      setBannerUri(uri);
                      handleFormChange("bannerImageUrl", uri);
                    })
                  }
                  cancelUpload={() => cancelUpload(setBannerUri)}
                />
              </Section>

              <Section title="Activity Details" zIndex={4}>
                <View style={{ zIndex: 3000 }}>
                  <DropDownPicker
                    open={sportOpen}
                    value={sport}
                    items={DEFAULT_SPORTS_LIST.map((s) => ({
                      label: s,
                      value: s,
                    }))}
                    setOpen={setSportOpen}
                    setValue={(value) => handleFormChange("sport", value)}
                    placeholder="Select Sport"
                    placeholderStyle={{ color: colors.placeholder }}
                    style={[
                      styles.dropdown,
                      {
                        borderColor: errors.sport
                          ? colors.notification
                          : colors.border,
                        backgroundColor: colors.card,
                      },
                    ]}
                    textStyle={{
                      fontSize: 16,
                      color: colors.text,
                    }}
                    dropDownContainerStyle={{
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    }}
                    listItemContainerStyle={{
                      borderBottomColor: colors.border,
                    }}
                    selectedItemContainerStyle={{
                      backgroundColor: colors.primary + "20",
                    }}
                    selectedItemLabelStyle={{
                      color: colors.text,
                      fontWeight: "600",
                    }}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                    zIndex={3000}
                  />
                  {errors.sport ? (
                    <Text
                      style={[styles.errorText, { color: colors.notification }]}
                    >
                      {errors.sport}
                    </Text>
                  ) : null}
                </View>

                <View style={{ zIndex: 2000 }}>
                  <DropDownPicker
                    open={skillOpen}
                    value={skillLevel}
                    items={SKILL_LEVELS.map((s) => ({ label: s, value: s }))}
                    setOpen={setSkillOpen}
                    setValue={(value) => handleFormChange("skillLevel", value)}
                    placeholder="Select Skill Level"
                    placeholderStyle={{ color: colors.placeholder }}
                    style={[
                      styles.dropdown,
                      {
                        borderColor: errors.skillLevel
                          ? colors.notification
                          : colors.border,
                        backgroundColor: colors.card,
                      },
                    ]}
                    textStyle={{
                      fontSize: 16,
                      color: colors.text,
                    }}
                    dropDownContainerStyle={{
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    }}
                    listItemContainerStyle={{
                      borderBottomColor: colors.border,
                    }}
                    selectedItemContainerStyle={{
                      backgroundColor: colors.primary + "20",
                    }}
                    selectedItemLabelStyle={{
                      color: colors.text,
                      fontWeight: "600",
                    }}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                    zIndex={2000}
                  />
                  {errors.skillLevel ? (
                    <Text
                      style={[styles.errorText, { color: colors.notification }]}
                    >
                      {errors.skillLevel}
                    </Text>
                  ) : null}
                </View>

                <View style={{ zIndex: 1000 }}>
                  <DropDownPicker
                    open={typeOpen}
                    value={type}
                    items={TYPE.map((s) => ({ label: s, value: s }))}
                    setOpen={setTypeOpen}
                    setValue={(value) => handleFormChange("type", value)}
                    placeholder="Select Activity Type"
                    placeholderStyle={{ color: colors.placeholder }}
                    style={[
                      styles.dropdown,
                      {
                        borderColor: errors.type
                          ? colors.notification
                          : colors.border,
                        backgroundColor: colors.card,
                      },
                    ]}
                    textStyle={{
                      fontSize: 16,
                      color: colors.text,
                    }}
                    dropDownContainerStyle={{
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    }}
                    listItemContainerStyle={{
                      borderBottomColor: colors.border,
                    }}
                    selectedItemContainerStyle={{
                      backgroundColor: colors.primary + "20",
                    }}
                    selectedItemLabelStyle={{
                      color: colors.text,
                      fontWeight: "600",
                    }}
                    listMode="SCROLLVIEW"
                    scrollViewProps={{
                      nestedScrollEnabled: true,
                    }}
                    zIndex={1000}
                  />
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
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, color: colors.text },
                  ]}
                  value={description}
                  onChangeText={(text) => handleFormChange("description", text)}
                  multiline
                  numberOfLines={3}
                  placeholder="Activity Description..."
                  placeholderTextColor={colors.smalltext}
                />

                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.background, color: colors.text },
                  ]}
                  value={maxParticipants}
                  onChangeText={(text) =>
                    handleFormChange("maxParticipants", text)
                  }
                  keyboardType="numeric"
                  placeholder="Max Participants (e.g. 10)"
                  placeholderTextColor={colors.smalltext}
                />

                <Text style={[styles.inputHeader, { color: colors.text }]}>
                  Price (SGD)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.card, color: colors.text },
                  ]}
                  value={price}
                  onChangeText={(text) => handleFormChange("price", text)}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colors.placeholder}
                />
              </Section>

              <Section title="Location">
                <TouchableOpacity
                  onPress={() => setLocationModalVisible(true)}
                  disabled={locationsLoading}
                >
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.card,
                        color: colors.text,
                      },
                      errors.placeName && { borderColor: colors.notification },
                      !errors.placeName && { borderColor: colors.border },
                    ]}
                    value={
                      placeName ||
                      (locationsLoading
                        ? "Loading locations..."
                        : "Tap to select location")
                    }
                    placeholder="Tap to select location"
                    placeholderTextColor={colors.placeholder}
                    editable={false}
                    pointerEvents="none"
                  />
                </TouchableOpacity>
                {errors.placeName ? (
                  <Text style={styles.errorText}>{errors.placeName}</Text>
                ) : null}
                {locationsError ? (
                  <Text style={styles.errorText}>Error loading locations.</Text>
                ) : null}
              </Section>

              <LocationPicker
                visible={locationModalVisible}
                onClose={() => setLocationModalVisible(false)}
                onSelectLocation={handleLocationSelect}
                locations={locations}
                loading={locationsLoading}
                error={locationsError}
                selectedLocation={placeName}
              />

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
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {isSubmitting ? "Updating..." : "Update Activity"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.cancelButton,
                    { backgroundColor: "#FFA500" },
                    (isSubmitting || isCancelling || isDeleting) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleCancel}
                  disabled={isSubmitting || isCancelling || isDeleting}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {isCancelling ? "Cancelling..." : "Cancel Activity"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.deleteButton,
                    { backgroundColor: colors.notification },
                    (isSubmitting || isCancelling || isDeleting) &&
                      styles.buttonDisabled,
                  ]}
                  onPress={handleDelete}
                  disabled={isSubmitting || isCancelling || isDeleting}
                >
                  <Text style={[styles.buttonText, { color: colors.text }]}>
                    {isDeleting ? "Deleting..." : "Delete Activity"}
                  </Text>
                </TouchableOpacity>
              </Section>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "ios" ? 50 : 40,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  backButtonAlone: {
    marginTop: 20,
    padding: 10,
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 2,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: -12,
    marginBottom: 12,
  },
  dropdown: {
    marginVertical: 8,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    // Specific styles if needed
  },
  deleteButton: {
    // Specific styles if needed
  },
  inputHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});

export default ManageActivity;
