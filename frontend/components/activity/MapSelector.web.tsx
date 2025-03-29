import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from "react-native";

type Props = {
  onSelect: (data: { name: string; latitude: number; longitude: number }) => void;
};

const MapSelector: React.FC<Props> = ({ onSelect }) => {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch("http://localhost:8000/facilities_geojson");
        const geojson = await response.json();

        const features = geojson.features.map((feature: any) => ({
          id: feature.id,
          name: feature.properties.Name,
          coordinates: {
            latitude: feature.geometry.coordinates[1],
            longitude: feature.geometry.coordinates[0],
          },
        }));

        setFacilities(features);
      } catch (error) {
        console.error("Error loading facilities", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View>
      <Text style={styles.title}>Select a location:</Text>
      {facilities.map((facility) => (
        <Pressable
          key={facility.id}
          onPress={() =>
            onSelect({
              name: facility.name,
              latitude: facility.coordinates.latitude,
              longitude: facility.coordinates.longitude,
            })
          }
        >
          <Text style={styles.option}>{facility.name}</Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  option: {
    paddingVertical: 6,
    fontSize: 14,
    color: "blue",
    textDecorationLine: "underline",
  },
});

export default MapSelector;
