"use client";

import { useState } from "react";
import MapView from "@/app/components/MapView";
import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import SearchBar from "@/app/components/SearchBar";
import EmptyState from "@/app/components/EmptyState";
import SkeletonList from "@/app/components/SkeletonCard";
import ErrorAlert from "@/app/components/ErrorAlert";
import ResultsHeader from "@/app/components/ResultsHeader";
import PlaceCard from "@/app/components/PlaceCard";

interface Place {
  displayName?: {
    text: string;
  };

  formattedAddress?: string;

  rating?: number;

  priceRange?: {
    startPrice?: {
      currencyCode?: string;
      units?: string;
      nanos?: number;
    };
    endPrice?: {
      currencyCode?: string;
      units?: string;
      nanos?: number;
    };
  };

  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };

  location?: {
    latitude: number;
    longitude: number;
  };

  googleMapsUri?: string;

  userRatingCount?: number;

  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;

  websiteUri?: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [sortBy, setSortBy] = useState("relevance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showLocationPopup, setShowLocationPopup] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [pendingSearch, setPendingSearch] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [pendingDistanceSort, setPendingDistanceSort] = useState(false);

  function formatPriceRange(priceRange?: {
    startPrice?: {
      currencyCode?: string;
      units?: string;
      nanos?: number;
    };
    endPrice?: {
      currencyCode?: string;
      units?: string;
      nanos?: number;
    };
  }) {
    if (!priceRange) return "Belum ada info harga";

    const start = priceRange.startPrice;
    const end = priceRange.endPrice;

    const formatAmount = (value?: {
      currencyCode?: string;
      units?: string;
      nanos?: number;
    }) => {
      if (!value) return null;

      const units = value.units ?? "";
      const nanos = value.nanos ?? 0;
      const currencyCode = value.currencyCode;

      const amount = `${units}${nanos ? `.${nanos.toString().padStart(9, "0")}` : ""}`;

      if (currencyCode === "IDR") {
        return `Rp ${Number(amount).toLocaleString("id-ID")}`;
      }

      return `${currencyCode} ${Number(amount).toLocaleString("id-ID")}`;
    };

    const startText = formatAmount(start);
    const endText = formatAmount(end);

    if (startText && endText) {
      return `${startText} - ${endText}`;
    }

    if (startText) return startText;
    if (endText) return endText;

    return "Belum ada info harga";
  }

  async function handleSearch(
    location: {
      latitude: number;
      longitude: number;
    } | null = userLocation,
  ) {
    const currentLocation = location ?? userLocation;

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
          userLocation: currentLocation,
        }),
      });

      const data = await response.json();

      // Gemini mendeteksi bahwa prompt
      // membutuhkan lokasi pengguna
      if (data.requiresLocation && !currentLocation) {
        setPendingSearch(true);
        setShowLocationPopup(true);

        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Search gagal");
      }

      setPlaces(data.places || []);

      // Gemini bisa menentukan sorting
      // dari prompt, misalnya:
      // "coffeeshop terdekat"
      if (data.query?.sortBy) {
        setSortBy(data.query.sortBy);
      }
    } catch (err) {
      console.error(err);

      setError(err instanceof Error ? err.message : "Terjadi error");
    } finally {
      setLoading(false);
    }
  }

  function handleAllowLocation() {
    if (!navigator.geolocation) {
      setLocationError("Browser ini tidak mendukung fitur lokasi.");

      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,

          longitude: position.coords.longitude,
        };

        setUserLocation(location);

        setLocationLoading(false);

        setShowLocationPopup(false);

        // Jika popup muncul karena
        // sort "Terdekat dari saya"
        if (pendingDistanceSort) {
          setSortBy("distance");

          setPendingDistanceSort(false);
        }

        // Jika popup muncul karena
        // Gemini mendeteksi "near me"
        if (pendingSearch) {
          setPendingSearch(false);

          handleSearch(location);
        }
      },

      (geoError) => {
        console.error("Geolocation error:", geoError);

        setLocationLoading(false);

        if (geoError.code === geoError.PERMISSION_DENIED) {
          setLocationError("Izin lokasi ditolak melalui browser.");
        } else {
          setLocationError("Lokasi tidak dapat ditemukan.");
        }
      },

      {
        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 60000,
      },
    );
  }

  function handleRejectLocation() {
    setShowLocationPopup(false);

    setPendingSearch(false);

    setPendingDistanceSort(false);

    setLocationError("");

    setError("Fitur ini membutuhkan izin lokasi.");
  }

  const sortedPlaces = [...places].sort((a, b) => {
    // Urutan asli Google Places
    if (sortBy === "relevance") {
      return 0;
    }

    // Tempat terdekat dari lokasi pengguna
    if (sortBy === "distance") {
      if (!userLocation) {
        return 0;
      }

      const calculateDistance = (latitude: number, longitude: number) => {
        const earthRadius = 6371;

        const toRadians = (value: number) => {
          return (value * Math.PI) / 180;
        };

        const latitudeDifference = toRadians(latitude - userLocation.latitude);

        const longitudeDifference = toRadians(
          longitude - userLocation.longitude,
        );

        const aValue =
          Math.sin(latitudeDifference / 2) ** 2 +
          Math.cos(toRadians(userLocation.latitude)) *
            Math.cos(toRadians(latitude)) *
            Math.sin(longitudeDifference / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(aValue), Math.sqrt(1 - aValue));

        return earthRadius * c;
      };

      const distanceA = a.location
        ? calculateDistance(a.location.latitude, a.location.longitude)
        : Number.MAX_SAFE_INTEGER;

      const distanceB = b.location
        ? calculateDistance(b.location.latitude, b.location.longitude)
        : Number.MAX_SAFE_INTEGER;

      return distanceA - distanceB;
    }

    // Harga termurah
    if (sortBy === "price") {
      const getPriceValue = (priceRange?: Place["priceRange"]) => {
        const startPrice = priceRange?.startPrice;

        if (!startPrice) {
          return Number.MAX_SAFE_INTEGER;
        }

        const units = Number(startPrice.units ?? 0);

        const nanos = (startPrice.nanos ?? 0) / 1_000_000_000;

        return units + nanos;
      };

      const priceA = getPriceValue(a.priceRange);

      const priceB = getPriceValue(b.priceRange);

      return priceA - priceB;
    }

    // Rating tertinggi
    if (sortBy === "rating") {
      const ratingA = a.rating ?? 0;
      const ratingB = b.rating ?? 0;

      // Rating beda
      if (ratingA !== ratingB) {
        return ratingB - ratingA;
      }

      // Rating sama:
      // jumlah ulasan lebih banyak dulu
      const countA = a.userRatingCount ?? 0;

      const countB = b.userRatingCount ?? 0;

      return countB - countA;
    }

    return 0;
  });

  function handleRequestLocationClick() {
    setLocationError("");
    setShowLocationPopup(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F4FADC] via-[#F7FCE8] to-white">
      <Header />

      <div className="animate-fade-in">
        <Hero />

        <SearchBar
          prompt={prompt}
          onPromptChange={setPrompt}
          onSearch={handleSearch}
          loading={loading}
        />
      </div>

      <section className="mx-auto max-w-[1280px] px-5 py-12 md:px-8 md:py-16">
        {error && (
          <div className="mb-8">
            <ErrorAlert message={error} />
          </div>
        )}

        {loading && (
          <div className="mb-10">
            <SkeletonList />
          </div>
        )}

        {!loading && places.length === 0 && !error && <EmptyState />}

        {places.length > 0 && (
          <>
            <ResultsHeader
              count={sortedPlaces.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
              userLocation={userLocation}
              locationLoading={locationLoading}
              locationError={locationError}
              onUseLocation={handleRequestLocationClick}
            />

            <div className="mt-8 overflow-hidden rounded-[22px] border border-black/5 shadow-[0_8px_30px_rgba(14,74,52,0.08)]">
              <p className="border-b border-black/5 bg-white/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#0E4A34]">
                Peta Lokasi
              </p>
              <div className="h-[350px] md:h-[500px]">
                <MapView places={sortedPlaces} userLocation={userLocation} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {sortedPlaces.map((place, index) => (
                <PlaceCard
                  key={index}
                  place={place}
                  index={index}
                  formattedPrice={formatPriceRange(place.priceRange)}
                  userLocation={userLocation}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {showLocationPopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-black/5 bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5D2] text-2xl">
              📍
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#123524]">
              Gunakan lokasi Anda?
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#607065]">
              Fitur ini membutuhkan lokasi untuk menemukan tempat di sekitar
              Anda.
            </p>

            <p className="mt-2 text-xs leading-5 text-[#4D8A57]">
              Lokasi hanya digunakan untuk pencarian ini dan tidak disimpan oleh
              aplikasi.
            </p>

            {locationError && (
              <p className="mt-4 text-sm text-red-600">{locationError}</p>
            )}

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={handleRejectLocation}
                disabled={locationLoading}
                className="flex-1 rounded-xl border border-[#D5DDD2] px-4 py-3 text-sm font-semibold text-[#3D5144] transition hover:bg-[#F4F7F2] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tolak
              </button>

              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={locationLoading}
                className="flex-1 rounded-xl bg-[#0E4A34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123E2D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locationLoading ? "Mengambil lokasi..." : "Lanjut"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
