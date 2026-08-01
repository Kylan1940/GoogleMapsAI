"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";

interface Place {
  displayName?: {
    text: string;
  };

  location?: {
    latitude: number;
    longitude: number;
  };
}

interface MapViewProps {
  places: Place[];
}

export default function MapView({
  places,
}: MapViewProps) {
  const validPlaces = places.filter(
    (place) =>
      place.location?.latitude !== undefined &&
      place.location?.longitude !== undefined
  );

  if (validPlaces.length === 0) {
    return null;
  }

  const firstPlace = validPlaces[0];

  const initialCenter = {
    lat: firstPlace.location!.latitude,
    lng: firstPlace.location!.longitude,
  };

  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <p>
        Google Maps API key belum ditemukan.
      </p>
    );
  }

  // Key berubah hanya jika hasil pencarian berubah
  const mapKey = validPlaces
    .map(
      (place) =>
        `${place.location!.latitude},${place.location!.longitude}`
    )
    .join("|");

  return (
    <div className="map-container">
      <APIProvider apiKey={apiKey}>
        <Map
          key={mapKey}
          defaultCenter={initialCenter}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
          gestureHandling="greedy"
          clickableIcons={false}
        >
          {validPlaces.map((place, index) => (
            <AdvancedMarker
              key={`${place.displayName?.text}-${index}`}
              position={{
                lat: place.location!.latitude,
                lng: place.location!.longitude,
              }}
              title={
                place.displayName?.text ??
                "Lokasi"
              }
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}