"use client";

import { useState } from "react";
import MapView from "@/app/components/MapView";

interface Place {
  displayName?: {
    text: string;
  };

  formattedAddress?: string;

  rating?: number;

  priceLevel?: string;

  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };

  location?: {
    latitude: number;
    longitude: number;
  };

}

function formatPriceLevel(priceLevel?: string) {
  switch (priceLevel) {
    case "PRICE_LEVEL_INEXPENSIVE":
      return "$";

    case "PRICE_LEVEL_MODERATE":
      return "$$";

    case "PRICE_LEVEL_EXPENSIVE":
      return "$$$";

    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "$$$$";

    default:
      return "Belum ada info harga";
  }
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!prompt.trim()) return;

    setLoading(true);
    setPlaces([]);
    setError("");

    try {
      const response = await fetch("/api/search", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();

      console.log("API Response:", data);
      console.log("Places Result:", places);
      console.log("Jumlah tempat:", places.length);

      if (!response.ok) {
        throw new Error(data.error || "Search gagal");
      }

      setPlaces(data.places || []);
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Terjadi error");
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "800px",
        margin: "auto",
      }}
    >
      <h1>GoogleMaps AI</h1>

      <p>Cari tempat dengan bahasa natural</p>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Contoh: coffeeshop murah di Semarang Tengah"
          style={{
            flex: 1,
            padding: "10px",
          }}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <p
          style={{
            color: "red",
          }}
        >
          {error}
        </p>
      )}

      <div
        style={{
          marginTop: "30px",
        }}
      >
        {places.length === 0 && !loading && <p>Belum ada hasil.</p>}

        <MapView places={places} />

        {places.map((place, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
          >
            <h2>{place.displayName?.text || "Nama tidak tersedia"}</h2>

            <p>📍 {place.formattedAddress || "Alamat tidak tersedia"}</p>

            <p>⭐ {place.rating || "Belum ada rating"}</p>

            <p>
              💸{" "}
              {place.priceLevel !== undefined
                ? place.priceLevel
                : "Belum ada info harga"}
            </p>

            <p>
              🕒{formatPriceLevel(place.priceLevel)}
              {place.regularOpeningHours?.openNow === true
                ? "Buka sekarang"
                : place.regularOpeningHours?.openNow === false
                  ? "Tutup sekarang"
                  : "Belum ada info jam buka"}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
