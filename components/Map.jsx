import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const Map = ({ visits }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      zoom={10}
      center={{ lat: 12.9716, lng: 77.5946 }} // Default to a central location
      mapContainerStyle={{ height: '400px', width: '100%' }}
    >
      {visits.map((visit, index) => (
        <Marker key={index} position={{ lat: visit.lat, lng: visit.lng }} />
      ))}
    </GoogleMap>
  );
};

export default Map;