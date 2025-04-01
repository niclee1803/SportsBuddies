import React from 'react';
import { View, Image, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface MapProps {
  latitude: number;
  longitude: number;
  placeName: string;
}

const ConditionalMap = ({ latitude, longitude, placeName }: MapProps) => {
  // Using Wikimedia Maps API for static map image
  const mapUrl = `https://maps.wikimedia.org/img/osm-intl,${latitude},${longitude},15,600x200.png?lang=en`;
  
  console.log('Map URL:', mapUrl);
  
  // Add error handling for image loading
  const [imageError, setImageError] = React.useState(false);

  // URL for opening in maps app when clicked
  const getDirectionsUrl = () => {
    if (Platform.OS === 'ios') {
      return `maps:0,0?q=${encodeURIComponent(placeName)}@${latitude},${longitude}`;
    } else if (Platform.OS === 'android') {
      return `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(placeName)})`;
    } else {
      return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`;
    }
  };

  const handleOpenMaps = () => {
    Linking.openURL(getDirectionsUrl());
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOpenMaps} style={styles.mapContainer}>
        {!imageError ? (
          <Image 
            source={{ uri: mapUrl }} 
            style={styles.mapImage}
            resizeMode="cover"
            onError={(e) => {
              console.log('Map image loading error:', e.nativeEvent.error);
              setImageError(true);
            }}
            onLoad={() => console.log('Map image loaded successfully')}
          />
        ) : (
          <View style={styles.fallbackContainer}>
            <MaterialIcons name="map" size={48} color="#999" />
            <Text style={styles.fallbackText}>Map unavailable</Text>
          </View>
        )}
        
        {/* Custom marker overlay positioned in the center */}
        {!imageError && (
          <View style={styles.markerContainer}>
            <MaterialIcons name="location-pin" size={36} color="#e74c3c" />
            {/* Shadow effect for the pin */}
            <View style={styles.markerShadow} />
          </View>
        )}
        
        <View style={styles.overlay}>
          <Ionicons name="navigate" size={24} color="white" />
          <Text style={styles.overlayText}>Get directions</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.placeName}>{placeName}</Text>
      <Text style={styles.coordinates}>
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  mapContainer: {
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -18,
    marginTop: -36,  
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerShadow: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    height: 6,
    width: 6,
    borderRadius: 3,
  },
  overlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    marginLeft: 5,
    fontWeight: '500',
  },
  placeName: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  coordinates: {
    fontSize: 12,
    color: '#777',
  },
  fallbackContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    marginTop: 8,
    fontSize: 16,
    color: '#777',
  },
});

export default ConditionalMap;
