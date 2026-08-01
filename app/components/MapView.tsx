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

  const center = {
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

  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        marginTop: "30px",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId="DEMO_MAP_ID"
        >
          {validPlaces.map((place, index) => (
            <AdvancedMarker
              key={index}
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