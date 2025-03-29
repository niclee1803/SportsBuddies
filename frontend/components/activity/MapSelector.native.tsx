import React, { useState, useEffect } from "react";
import { ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";

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
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: 1.3521,
        longitude: 103.8198,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }}
    >
      {facilities.map((facility) => (
        <Marker
          key={facility.id}
          coordinate={facility.coordinates}
          title={facility.name}
          onPress={() =>
            onSelect({
              name: facility.name,
              latitude: facility.coordinates.latitude,
              longitude: facility.coordinates.longitude,
            })
          }
        />
      ))}
    </MapView>
  );
};

export default MapSelector;
