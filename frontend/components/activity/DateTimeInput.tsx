import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Platform,
  StyleSheet,
  Modal,
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type DateTimeInputProps = {
  mode: "date" | "time";
  value: Date;
  onChange: (date: Date) => void;
  label: string;
};

export default function DateTimeInput({
  mode,
  value,
  onChange,
  label,
}: DateTimeInputProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value); // temp state for iOS

  const handleConfirm = () => {
    setShowPicker(false);
    onChange(tempDate);
  };

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate); // iOS → don't call onChange yet
    }
  };

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={styles.inputField}
        onPress={() => setShowPicker(true)}
      >
        <Text>
          {mode === "date"
            ? value.toDateString()
            : value.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
        </Text>
      </Pressable>

      {/* iOS - Show in Modal with Done */}
      {Platform.OS === "ios" && showPicker && (
        <Modal transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={tempDate}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                textColor="black" // ✅ works only on iOS
              />
              <Button title="Done" onPress={handleConfirm} />
            </View>
          </View>
        </Modal>
      )}

      {/* Android - Inline */}
      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  inputField: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
