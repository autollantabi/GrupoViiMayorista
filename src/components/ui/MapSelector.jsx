import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styled from 'styled-components';

const MapContainer = styled.div`
  width: 100%;
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: 1rem;
  position: relative;
`;

const MapInstructions = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #333;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const MapSelector = ({ onLocationSelect, initialLocation = null }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const [lng, setLng] = useState(initialLocation?.lng || -79.0045); // Default to Cuenca, Ecuador
  const [lat, setLat] = useState(initialLocation?.lat || -2.9001);
  const [zoom, setZoom] = useState(initialLocation ? 15 : 12);

  useEffect(() => {
    const token = import.meta.env.VITE_API_MAPBOX;

    if (!token) {
      return;
    }

    mapboxgl.accessToken = token;

    if (!mapContainer.current) {
      return;
    }

    if (map.current) {
      return; // initialize map only once
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom
      });

      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Create marker
      marker.current = new mapboxgl.Marker({
        draggable: true,
        color: '#007bff'
      })
        .setLngLat([lng, lat])
        .addTo(map.current);

      // If we have an initial location, we notify the parent
      if (initialLocation) {
        onLocationSelect(initialLocation);
      }

      const reverseGeocode = async (longitude, latitude) => {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&language=es`
          );
          const data = await response.json();
          const feature = data.features[0];

          if (feature) {
            const context = feature.context || [];
            const province = context.find(c => c.id.startsWith('region'))?.text || '';
            const city = context.find(c => c.id.startsWith('place'))?.text || '';
            const address = feature.place_name || '';

            onLocationSelect({
              lng: longitude,
              lat: latitude,
              province,
              city,
              address
            });
          } else {
            onLocationSelect({ lng: longitude, lat: latitude });
          }
        } catch (error) {
          onLocationSelect({ lng: longitude, lat: latitude });
        }
      };

      // Handle marker drag
      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        setLng(lngLat.lng);
        setLat(lngLat.lat);
        reverseGeocode(lngLat.lng, lngLat.lat);
      });

      // Handle click on map to move marker
      map.current.on('click', (e) => {
        marker.current.setLngLat(e.lngLat);
        setLng(e.lngLat.lng);
        setLat(e.lngLat.lat);
        reverseGeocode(e.lngLat.lng, e.lngLat.lat);
      });

    } catch (err) {
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Effect to update map center if initialLocation changes externally (if needed)
  useEffect(() => {
    if (initialLocation && map.current && marker.current) {
      marker.current.setLngLat([initialLocation.lng, initialLocation.lat]);
      map.current.flyTo({
        center: [initialLocation.lng, initialLocation.lat],
        essential: true
      });
    }
  }, [initialLocation]);

  return (
    <MapContainer ref={mapContainer}>
      <MapInstructions>
        Haz clic en el mapa o arrastra el marcador para fijar la ubicación
      </MapInstructions>
    </MapContainer>
  );
};

export default MapSelector;
