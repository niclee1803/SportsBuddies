import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";


// Pick image for banner
export const pickImage = async (setBannerUri: (uri: string) => void) => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (permission.granted) {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setBannerUri(result.assets[0].uri);
    }
  } else {
    Alert.alert(
      "Permission Denied",
      "You need to grant access to your media library to select an event banner.",
      [{ text: "OK" }]
    );
  }
};

// Cancel image upload
export const cancelUpload = (setBannerUri: (uri: null) => void) => {
  setBannerUri(null);
};


interface ActivityFormData {
    activityName: string;
    date: Date;
    sport: string;
    skillLevel: string;
    type: string;
    activityDescription: string;
    maxParticipants: string;
    bannerUri: string | null;
    selectedCoords: { latitude: number; longitude: number } | null;
    location: string;
    placeName:string;
    price:number;
  }

  