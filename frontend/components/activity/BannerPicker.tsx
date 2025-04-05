import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/ThemeContext";

type Props = {
  bannerUri: string | null;
  existingBannerUrl?: string | null;
  pickImage: () => void;
  cancelUpload: () => void;
};

export default function BannerPicker({
  bannerUri,
  existingBannerUrl,
  pickImage,
  cancelUpload,
}: Props) {
  const { colors } = useTheme();
  const displayUri = bannerUri || existingBannerUrl;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.bannerContainer,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
        onPress={pickImage}
      >
        <Ionicons
          name="image-outline"
          size={24}
          color={colors.text}
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={[styles.placeholderText, { color: colors.smalltext }]}>
            {displayUri ? "Change Banner" : "Select Banner Image"}
          </Text>
          {displayUri && (
            <Text
              style={[styles.fileNameText, { color: colors.text }]}
              numberOfLines={1}
            >
              Current: {displayUri.split("/").pop()}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {displayUri && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: displayUri }}
            style={styles.image}
            resizeMode="cover"
          />
          {bannerUri && (
            <TouchableOpacity
              onPress={cancelUpload}
              style={styles.cancelButton}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={colors.notification}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  bannerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: "500",
  },
  fileNameText: {
    fontSize: 14,
    marginTop: 4,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: "relative",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  cancelButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    padding: 2,
  },
});
