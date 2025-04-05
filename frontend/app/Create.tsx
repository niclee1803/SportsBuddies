import React, { useState, ReactNode } from "react";
import { useRouter } from "expo-router";
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
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import BannerPicker from "@/components/activity/BannerPicker";
import DateTimeInput from "@/components/activity/DateTimeInput";
import LocationPicker from "@/components/activity/LocationPicker";
import useFacilityLocations from "@/hooks/FacilityLocation";
import {
  DEFAULT_SPORTS_LIST,
  SKILL_LEVELS,
  TYPE,
} from "@/components/activity/ActivityMenu";
import { pickImage, cancelUpload } from "@/utils/createactivityhelpers";
import { handleSubmitActivity } from "@/utils/uploadactivity";
import { useTheme } from "@/hooks/ThemeContext";
import { API_URL } from "../config.json";
import { uploadBanner } from "@/utils/uploadBanner";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

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
  const [activityName, setActivityName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [skillLevel, setSkillLevel] = useState<string | null>(null);
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [maxParticipants, setMaxParticipants] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date());
  const [placeName, setPlaceName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const { locations, loading, error } = useFacilityLocations(
    `${API_URL}/utils/facilities_geojson`
  );
  const [sportOpen, setSportOpen] = useState(false);
  const [skillOpen, setSkillOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    activityName: "",
    sport: "",
    skillLevel: "",
    type: "",
    placeName: "",
  });
  const [formModified, setFormModified] = useState(false);

  const onSuccess = () => {
    Alert.alert("Success!", "Activity created successfully.");
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

    // Navigate to Profile screen after a short delay
    setTimeout(() => {
      router.push("/Profile");
    }, 1000);
  };

  const onError = (msg: string) => {
    Alert.alert("Error", msg);
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

  const handleLocationSelect = (location: FacilityLocation) => {
    setSelectedLocation({
      latitude: location.coordinates[1],
      longitude: location.coordinates[0],
    });
    setPlaceName(location.name);
    setLocationModalVisible(false);
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
      Alert.alert("Upload Error", errorMessage);
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
      Alert.alert("Submission Failed", errorMessage);
      setIsSubmitting(false);
    }
  };

  const handleBackPress = () => {
    if (formModified) {
      Alert.alert(
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
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
                  borderColor: colors.border,
                },
              ]}
              value={activityName}
              onChangeText={(text) => handleFormChange("activityName", text)}
              placeholder="e.g. Weekend Football"
              placeholderTextColor={colors.placeholder}
            />
            {errors.activityName ? (
              <Text style={[styles.errorText, { color: colors.notification }]}>
                {errors.activityName}
              </Text>
            ) : null}

            <DateTimeInput
              label="Date"
              mode="date"
              value={date}
              onChange={setDate}
            />
            <DateTimeInput
              label="Time"
              mode="time"
              value={date}
              onChange={setDate}
            />
          </Section>

          <Section title="Activity Banner">
            <BannerPicker
              bannerUri={bannerUri}
              pickImage={() => pickImage((uri: string) => setBannerUri(uri))}
              cancelUpload={() => cancelUpload(setBannerUri)}
            />
          </Section>

          <Section title="Activity Details" zIndex={4}>
            <View style={{ zIndex: 3000 }}>
              <DropDownPicker
                open={sportOpen}
                value={sport}
                items={DEFAULT_SPORTS_LIST.map((s) => ({ label: s, value: s }))}
                setOpen={setSportOpen}
                setValue={(value) => handleFormChange("sport", value)}
                placeholder="Select Sport"
                placeholderStyle={{ color: colors.placeholder }}
                style={[
                  styles.dropdown,
                  {
                    borderColor: colors.border,
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
                    borderColor: colors.border,
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
                    borderColor: colors.border,
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
              onChangeText={(text) => handleFormChange("maxParticipants", text)}
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
            <TouchableOpacity onPress={() => setLocationModalVisible(true)}>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text },
                  errors.placeName && styles.inputError,
                ]}
                value={placeName}
                placeholder="Tap to select location"
                placeholderTextColor={colors.smalltext}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {errors.placeName ? (
              <Text style={[styles.errorText, { color: colors.notification }]}>
                {errors.placeName}
              </Text>
            ) : null}
          </Section>

          <LocationPicker
            visible={locationModalVisible}
            onClose={() => setLocationModalVisible(false)}
            onSelectLocation={handleLocationSelect}
            locations={locations}
            loading={loading}
            error={error}
            selectedLocation={placeName}
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: colors.primary },
              isSubmitting && styles.submitBtnDisabled,
            ]}
            onPress={submitActivity}
            disabled={isSubmitting}
          >
            <Text style={[styles.submitBtnText, { color: colors.text }]}>
              {isSubmitting ? "Creating Activity..." : "Create Activity"}
            </Text>
          </TouchableOpacity>
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
    paddingTop: 50,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
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
  submitBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 24,
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
  },
  inputHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 3,
  },
});

export default CreateActivity;
