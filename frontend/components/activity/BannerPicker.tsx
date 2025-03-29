import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

type Props = {
  bannerUri: string | null;
  pickImage: () => void;
  cancelUpload: () => void;
};

export default function BannerPicker({
  bannerUri,
  pickImage,
  cancelUpload,
}: Props) {
  return (
    <View>
      <TouchableOpacity style={styles.bannerContainer} onPress={pickImage}>
        <ThemedText type="defaultSemiBold" style={{ color: "#999" }}>
          Insert Event Banner
        </ThemedText>
        {bannerUri ? (
          <Text style={{ color: "#666" }}>
            Inserted: {bannerUri.split("/").pop()}
          </Text>
        ) : (
          <ThemedText type="default" style={{ color: "#999" }}>
            Tap to select a banner
          </ThemedText>
        )}
      </TouchableOpacity>

      {bannerUri && (
        <Image source={{ uri: bannerUri }} style={styles.image} />
      )}
      {bannerUri && (
        <TouchableOpacity onPress={cancelUpload}>
          <Text style={{ color: "#ff4444", textAlign: "center" }}>
            Cancel Upload
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 16,
  },
});
