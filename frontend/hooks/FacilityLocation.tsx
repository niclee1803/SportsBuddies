import { useState, useEffect } from 'react';

export interface FacilityLocation {
  id: string;
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
  address?: string;
  postalCode?: string;
  facilities?: string;
}

const useFacilityLocations = (apiUrl: string) => {
  const [locations, setLocations] = useState<FacilityLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Parse GeoJSON data
        if (data && data.features && Array.isArray(data.features)) {
          const parsedLocations = data.features.map((feature: any) => {
            // Extract location name from SPORTS_CEN field in Description
            let name = '';
            let address = '';
            let postalCode = '';
            let facilities = '';
            
            if (feature.properties && feature.properties.Description) {
              const desc = feature.properties.Description;
              
              // Extract sports center name
              const sportsCenMatch = desc.match(/<th>SPORTS_CEN<\/th>\s*<td>([^<]+)<\/td>/);
              name = sportsCenMatch ? sportsCenMatch[1] : 'Unknown Location';
              
              // Extract road name
              const roadMatch = desc.match(/<th>ROAD_NAME<\/th>\s*<td>([^<]+)<\/td>/);
              address = roadMatch ? roadMatch[1] : '';
              
              // Extract postal code
              const postalMatch = desc.match(/<th>POSTAL_COD<\/th>\s*<td>([^<]+)<\/td>/);
              postalCode = postalMatch ? postalMatch[1] : '';
              
              // Extract facilities
              const facilitiesMatch = desc.match(/<th>FACILITIES<\/th>\s*<td>([^<]+)<\/td>/);
              facilities = facilitiesMatch ? facilitiesMatch[1] : '';
            }
            
            // Get center coordinates from first point of polygon or point geometry
            let coordinates: [number, number] = [0, 0];
            if (feature.geometry) {
              if (feature.geometry.type === 'Polygon' && 
                  feature.geometry.coordinates && 
                  feature.geometry.coordinates[0]) {
                // Use first coordinate of polygon
                coordinates = [
                  feature.geometry.coordinates[0][0][0], 
                  feature.geometry.coordinates[0][0][1]
                ];
              } else if (feature.geometry.type === 'Point' && 
                         feature.geometry.coordinates) {
                // Use point coordinates
                coordinates = [
                  feature.geometry.coordinates[0], 
                  feature.geometry.coordinates[1]
                ];
              }
            }
            
            return {
              id: feature.properties.Name || `location-${Math.random().toString(36).substr(2, 9)}`,
              name,
              coordinates,
              address,
              postalCode,
              facilities
            };
          });
          
          setLocations(parsedLocations);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch locations');
        console.error('Error fetching facility locations:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, [apiUrl]);
  
  return { locations, loading, error };
};

export default useFacilityLocations;