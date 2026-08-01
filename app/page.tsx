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

    const formatAmount = (value?: { currencyCode?: string; units?: string; nanos?: number }) => {
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

  const sortedPlaces = [...places].sort(
  (a, b) => {
    // Urutan asli Google Places
    if (sortBy === "relevance") {
      return 0;
    }

    // Harga termurah
    if (sortBy === "price") {
  const getPriceValue = (
    priceRange?: Place["priceRange"]
  ) => {
    const startPrice =
      priceRange?.startPrice;

    if (!startPrice) {
      return Number.MAX_SAFE_INTEGER;
    }

    const units = Number(
      startPrice.units ?? 0
    );

    const nanos =
      (startPrice.nanos ?? 0) / 1_000_000_000;

    return units + nanos;
  };

  const priceA = getPriceValue(
    a.priceRange
  );

  const priceB = getPriceValue(
    b.priceRange
  );

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
      const countA =
        a.userRatingCount ?? 0;

      const countB =
        b.userRatingCount ?? 0;

      return countB - countA;
    }

    return 0;
  }
);

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
            />

            <div className="mt-8 overflow-hidden rounded-[22px] border border-black/5 shadow-[0_8px_30px_rgba(14,74,52,0.08)]">
              <p className="border-b border-black/5 bg-white/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#0E4A34]">
                Peta Lokasi
              </p>
              <div className="h-[350px] md:h-[500px]">
                <MapView places={sortedPlaces} />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {sortedPlaces.map((place, index) => (
                <PlaceCard
                  key={index}
                  place={place}
                  index={index}
                  formattedPrice={formatPriceRange(place.priceRange)}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}