import React from "react";
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/hooks/ThemeContext";

interface DateTimeInputProps {
  label: string;
  mode: "date" | "time";
  value: Date;
  onChange: (date: Date) => void;
}

export default function DateTimeInput({
  label,
  mode,
  value,
  onChange,
}: DateTimeInputProps) {
  const { colors } = useTheme();
  const [show, setShow] = React.useState(false);

  const formatDate = (date: Date) => {
    if (mode === "date") {
      return date.toLocaleDateString();
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (Platform.OS === "web") {
    // Web implementation using native input
    return (
      <View style={styles.container}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <input
          type={mode}
          value={
            mode === "date"
              ? value.toISOString().split("T")[0]
              : value.toTimeString().split(" ")[0].slice(0, 5)
          }
          onChange={(e) => {
            const newDate = new Date(value);
            if (mode === "date") {
              const [year, month, day] = e.target.value.split("-");
              newDate.setFullYear(parseInt(year));
              newDate.setMonth(parseInt(month) - 1);
              newDate.setDate(parseInt(day));
            } else {
              const [hours, minutes] = e.target.value.split(":");
              newDate.setHours(parseInt(hours));
              newDate.setMinutes(parseInt(minutes));
            }
            onChange(newDate);
          }}
          style={{
            fontSize: 16,
            padding: 12,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
            color: colors.text,
            width: "100%",
            marginBottom: 16,
            borderStyle: "solid", // Add this for web
            outline: "none", // Remove default focus outline
          }}
        />
      </View>
    );
  }

  // Mobile implementation using DateTimePicker
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        onPress={() => setShow(true)}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.inputText, { color: colors.text }]}>
          {formatDate(value)}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode={mode}
          is24Hour={true}
          onChange={(event, selectedDate) => {
            setShow(false);
            if (selectedDate) {
              onChange(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  inputText: {
    fontSize: 16,
  },
});
