"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from "@vis.gl/react-google-maps";

import { useState } from "react";
import en from "../messages/en";
import id from "../messages/id";

interface Place {
  displayName?: {
    text: string;
  };

  formattedAddress?: string;

  rating?: number;

  googleMapsUri?: string;

  location?: {
    latitude: number;
    longitude: number;
  };
}

interface MapViewProps {
  places: Place[];

  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  language: "id" | "en";
}

export default function MapView({ places, userLocation, language }: MapViewProps) {
  const t = language === "id" ? id : en;

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const validPlaces = places.filter(
    (place) =>
      place.location?.latitude !== undefined &&
      place.location?.longitude !== undefined,
  );

  if (validPlaces.length === 0) {
    return null;
  }

  const firstPlace = validPlaces[0];

  const initialCenter = {
    lat: firstPlace.location!.latitude,
    lng: firstPlace.location!.longitude,
  };

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <p>{t.mapsApiKeyMissing}</p>;
  }

  const mapKey = validPlaces
    .map((place) => `${place.location!.latitude},${place.location!.longitude}`)
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
              title={place.displayName?.text ?? t.mapLocation}
              clickable
              onClick={() => {
                setSelectedPlace(place);
              }}
            />
          ))}

          {selectedPlace?.location && (
            <InfoWindow
              position={{
                lat: selectedPlace.location.latitude,
                lng: selectedPlace.location.longitude,
              }}
              onCloseClick={() => {
                setSelectedPlace(null);
              }}
            >
              <div className="map-info-window">
                <h3>{selectedPlace.displayName?.text ?? t.noName}</h3>

                <p>
                  ⭐ {selectedPlace.rating ?? t.noRating}
                </p>

                <p>
                  📍 {selectedPlace.formattedAddress ?? t.noAddress}
                </p>

                {selectedPlace.googleMapsUri && (
                  <a
                    href={selectedPlace.googleMapsUri}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t.openInMaps}
                  </a>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
