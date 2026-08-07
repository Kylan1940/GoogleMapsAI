"use client";

import { useEffect, useState } from "react";
import MapView from "@/app/components/MapView";
import Header from "@/app/components/Header";
import Hero from "@/app/components/Hero";
import SearchBar from "@/app/components/SearchBar";
import EmptyState from "@/app/components/EmptyState";
import SkeletonList from "@/app/components/SkeletonCard";
import ErrorAlert from "@/app/components/ErrorAlert";
import ResultsHeader from "@/app/components/ResultsHeader";
import FilterBar, { PlaceFilters } from "@/app/components/FilterBar";
import PlaceCard from "@/app/components/PlaceCard";
import en from "./messages/en";
import id from "./messages/id";

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
  const [filters, setFilters] = useState<PlaceFilters>({
    openNow: false,
    hasPhone: false,
    hasWebsite: false,
  });
  const [language, setLanguage] = useState<"id" | "en">("en");
  const t = language === "id"
    ? id
    : en;

  function toggleFilter(key: keyof PlaceFilters) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function resetFilters() {
    setFilters({ openNow: false, hasPhone: false, hasWebsite: false });
  }

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
    if (!priceRange) return t.noPriceInfo;

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

    return t.noPriceInfo;
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
    setFilters({ openNow: false, hasPhone: false, hasWebsite: false });

    try {
      const response = await fetch("/api/search", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          prompt,
          userLocation: currentLocation,
          language,
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
        throw new Error(data.error || t.searchFailed);
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

      setError(err instanceof Error ? err.message : t.genericError);
    } finally {
      setLoading(false);
    }
  }

  function handleAllowLocation() {
    if (!navigator.geolocation) {
      setLocationError(t.browserLocationUnsupported);

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
          setLocationError(t.locationPermissionDenied);
        } else {
          setLocationError(t.locationNotFound);
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

    setError(t.locationPermissionRequired);
  }

  function handleRequestLocationClick() {
    setLocationError("");
    setShowLocationPopup(true);
  }

  // PENTING: hook harus di top-level komponen,
  // BUKAN di dalam callback .sort() di bawah.
  // Efek ini memicu popup lokasi begitu user
  // memilih sort "distance" tapi lokasi belum ada.
  useEffect(() => {
    if (sortBy === "distance" && !userLocation) {
      setPendingDistanceSort(true);
      setShowLocationPopup(true);
    }
  }, [sortBy, userLocation]);

  const filteredPlaces = places.filter((place) => {
    if (filters.openNow && place.regularOpeningHours?.openNow !== true) {
      return false;
    }

    if (
      filters.hasPhone &&
      !(place.nationalPhoneNumber || place.internationalPhoneNumber)
    ) {
      return false;
    }

    if (filters.hasWebsite && !place.websiteUri) {
      return false;
    }

    return true;
  });

  const sortedPlaces = [...filteredPlaces].sort((a, b) => {
    // Urutan asli Google Places
    if (sortBy === "relevance") {
      return 0;
    }

    // Tempat terdekat dari lokasi pengguna
    if (sortBy === "distance") {
      // Comparator harus murni: TIDAK BOLEH
      // ada setState di sini. Kalau lokasi
      // belum ada, cukup return 0 (urutan
      // asli) — popup-nya sudah ditangani
      // oleh useEffect di atas.
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

  return (
    
    <main className="min-h-screen bg-linear-to-b from-[#F4FADC] via-[#F7FCE8] to-white">
      <Header language={language} onLanguageChange={setLanguage} />

      <div className="animate-fade-in">
        <Hero language={language} />

        <SearchBar
          prompt={prompt}
          onPromptChange={setPrompt}
          onSearch={handleSearch}
          loading={loading}
          language={language}
        />
      </div>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        {error && (
          <div className="mb-8">
            <ErrorAlert message={error} language={language} />
          </div>
        )}

        {loading && (
          <div className="mb-10">
            <SkeletonList />
          </div>
        )}

        {!loading && places.length === 0 && !error && <EmptyState language={language} />}

        {places.length > 0 && (
          <>
            <ResultsHeader
              count={places.length}
              sortBy={sortBy}
              onSortChange={setSortBy}
              userLocation={userLocation}
              locationLoading={locationLoading}
              locationError={locationError}
              onUseLocation={handleRequestLocationClick}
              language={language}
            />

            <FilterBar
              filters={filters}
              onToggle={toggleFilter}
              onReset={resetFilters}
              resultCount={sortedPlaces.length}
              totalCount={places.length}
              language={language}
            />

            {sortedPlaces.length === 0 ? (
              <div className="mt-8 flex flex-col items-center justify-center rounded-[22px] border border-dashed border-[#0E4A34]/20 bg-white/50 px-6 py-14 text-center">
                <p className="font-display text-base font-semibold text-[#12291F]">
                  {t.noResultsTitle}
                </p>
                <p className="mt-1.5 max-w-85 text-sm text-[#3F5147]">
                  {t.noResultsDescription}
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 rounded-xl bg-[#0E4A34] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#123F2B]"
                >
                  {t.resetFilter}
                </button>
              </div>
            ) : (
              <>
                <div className="mt-8 overflow-hidden rounded-[22px] border border-black/5 shadow-[0_8px_30px_rgba(14,74,52,0.08)]">
                  <p className="border-b border-black/5 bg-white/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#0E4A34]">
                    {t.mapLocation}
                  </p>
                  <div className="h-87.5 md:h-125">
                    <MapView
                      places={sortedPlaces}
                      userLocation={userLocation}
                    />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 items-start gap-5 md:grid-cols-2">
                  {sortedPlaces.map((place, index) => (
                    <PlaceCard
                      key={index}
                      place={place}
                      index={index}
                      formattedPrice={formatPriceRange(place.priceRange)}
                      userLocation={userLocation}
                      language={language}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {showLocationPopup && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 px-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-black/5 bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8F5D2] text-2xl">
              📍
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#123524]">
              {t.locationPopupTitle}
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#607065]">
              {t.locationPopupDescription}
            </p>

            <p className="mt-2 text-xs leading-5 text-[#4D8A57]">
              {t.locationPopupNotice}
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
                {t.reject}
              </button>

              <button
                type="button"
                onClick={handleAllowLocation}
                disabled={locationLoading}
                className="flex-1 rounded-xl bg-[#0E4A34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123E2D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {locationLoading ? t.loadingLocation : t.continue}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
