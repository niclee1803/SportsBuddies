import React from 'react';
import { View, Image, Text, StyleSheet, Linking, TouchableOpacity, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

interface MapProps {
  latitude: number;
  longitude: number;
  placeName: string;
}

const ConditionalMap = ({ latitude, longitude, placeName }: MapProps) => {
  // OpenStreetMap static image URL
  const mapUrl = `https://maps.wikimedia.org/img/osm-intl,15,${latitude},${longitude},600x200.png`;
  
  // URL for opening in maps app when clicked
  const getDirectionsUrl = () => {
    if (Platform.OS === 'ios') {
      return `maps:0,0?q=${placeName}@${latitude},${longitude}`;
    } else if (Platform.OS === 'android') {
      return `geo:0,0?q=${latitude},${longitude}(${encodeURI(placeName)})`;
    } else {
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    }
  };

  const handleOpenMaps = () => {
    Linking.openURL(getDirectionsUrl());
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleOpenMaps} style={styles.mapContainer}>
        <Image 
          source={{ uri: mapUrl }} 
          style={styles.mapImage}
          resizeMode="cover"
        />
        {/* Custom marker overlay positioned in the center */}
        <View style={styles.markerContainer}>
          <MaterialIcons name="location-pin" size={36} color="#e74c3c" />
          {/* Shadow effect for the pin */}
          <View style={styles.markerShadow} />
        </View>
        
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
    marginLeft: -18,  // Half the icon width
    marginTop: -36,   // Full icon height to align the pin bottom with location
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
});

export default ConditionalMap;