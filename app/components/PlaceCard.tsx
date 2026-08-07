"use client";

import { useState } from "react";
import {
  MapPin,
  Navigation,
  Star,
  Banknote,
  Clock,
  Phone,
  Globe,
  Map,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import en from "../messages/en";
import id from "../messages/id";

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

interface PlaceCardProps {
  place: Place;
  formattedPrice: string;
  index: number;
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  language: "id" | "en";
}

export default function PlaceCard({
  place,
  formattedPrice,
  index,
  userLocation,
  language,
}: PlaceCardProps) {
  const [showHours, setShowHours] = useState(false);
  const t = language === "id" ? id : en;

  const phone = place.nationalPhoneNumber || place.internationalPhoneNumber;
  const hasHours = !!place.regularOpeningHours?.weekdayDescriptions?.length;
  const openNow = place.regularOpeningHours?.openNow;
  const placeName = place.displayName?.text || (language === "id" ? "tempat ini" : "this place");

  const calculateDistance = (
    latitude1: number,
    longitude1: number,
    latitude2: number,
    longitude2: number,
  ) => {
    const earthRadius = 6371;

    const toRadians = (degree: number) => {
      return (degree * Math.PI) / 180;
    };

    const latitudeDifference = toRadians(latitude2 - latitude1);

    const longitudeDifference = toRadians(longitude2 - longitude1);

    const a =
      Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
      Math.cos(toRadians(latitude1)) *
        Math.cos(toRadians(latitude2)) *
        Math.sin(longitudeDifference / 2) *
        Math.sin(longitudeDifference / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  };

  const distance =
    userLocation && place.location
      ? calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          place.location.latitude,
          place.location.longitude,
        )
      : null;

  const formattedDistance =
    distance !== null
      ? distance < 1
        ? `${Math.round(distance * 1000).toLocaleString("id-ID")} m `
        : `${distance.toFixed(1).replace(".", ",")} km `
      : null;

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
      className="animate-fade-up group h-fit self-start rounded-[20px] border border-black/5 bg-white p-5 shadow-[0_2px_10px_rgba(18,41,31,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(18,41,31,0.12)]"
    >
      <h3 className="font-display text-lg font-semibold leading-snug text-[#12291F]">
        {place.displayName?.text || t.noName}
      </h3>

      <p className="mt-1.5 flex items-start gap-1.5 text-sm text-[#3F5147]">
        <MapPin
          size={16}
          className="mt-0.5 shrink-0 text-[#0E4A34]/70"
          aria-hidden="true"
        />
        {place.formattedAddress || t.noAddress}
      </p>

      <div className="mt-2">
        {formattedDistance ? (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C8E85A]/35 px-2.5 py-1 text-xs font-semibold text-[#0E4A34]">
            <Navigation size={13} aria-hidden="true" />
            {formattedDistance}
            {t.distanceFromYou}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/4 px-2.5 py-1 text-xs text-[#3F5147]/70">
            <Navigation size={13} aria-hidden="true" />
            {t.allowLocationToSeeDistance}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-[#12291F] px-2.5 py-1 text-xs font-semibold text-white">
          <Star
            size={13}
            className="fill-[#C8E85A] text-[#C8E85A]"
            aria-hidden="true"
          />
          {place.rating ? place.rating.toFixed(1) : t.noRating}
        </span>
        <span className="text-xs text-[#3F5147]">
          {place.userRatingCount
            ? `${place.userRatingCount.toLocaleString("id-ID")} ${language === "id" ? "ulasan" : "reviews"}`
            : t.noReviews}
        </span>

        {openNow !== undefined && (
          <span
            className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
              openNow
                ? "bg-[#C8E85A]/40 text-[#0E4A34]"
                : "bg-black/5 text-[#3F5147]"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                openNow ? "bg-[#0E4A34]" : "bg-[#3F5147]/50"
              }`}
              aria-hidden="true"
            />
            {openNow ? t.openNow : t.closedNow}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-[#F4FADC] px-3 py-2 text-sm font-medium text-[#12291F]">
        <Banknote
          size={16}
          className="shrink-0 text-[#0E4A34]/70"
          aria-hidden="true"
        />
        <span className="font-mono text-[13px]">{formattedPrice}</span>
      </div>

      {hasHours ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowHours((prev) => !prev)}
            aria-expanded={showHours}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm font-medium text-[#12291F] transition-colors hover:bg-black/3"
          >
            <span className="flex items-center gap-1.5">
              <Clock
                size={16}
                className="text-[#0E4A34]/70"
                aria-hidden="true"
              />
              {t.fullHours}
            </span>
            {showHours ? (
              <ChevronUp size={16} aria-hidden="true" />
            ) : (
              <ChevronDown size={16} aria-hidden="true" />
            )}
          </button>

          <div
            className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
              showHours
                ? "mt-2 grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <ul className="min-h-0 space-y-1 rounded-xl bg-black/2 px-3 py-2 text-xs text-[#3F5147]">
              {place.regularOpeningHours?.weekdayDescriptions?.map((day, i) => (
                <li key={i}>{day}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-[#3F5147]">
          <Clock size={14} className="text-[#0E4A34]/60" aria-hidden="true" />
          {t.noHours}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {phone ? (
          <a
            href={`tel:${phone}`}
            aria-label={`${language === "id" ? "Telepon" : "Call"} ${placeName}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-medium text-[#12291F] transition-colors hover:bg-black/3"
          >
            <Phone size={14} aria-hidden="true" />
            {phone}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-black/5 px-3 py-2 text-xs text-[#3F5147]/60">
            <Phone size={14} aria-hidden="true" />
            {t.noPhone}
          </span>
        )}

        {place.websiteUri ? (
          <a
            href={place.websiteUri}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${language === "id" ? "Buka website resmi" : "Open official website"} ${placeName}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 px-3 py-2 text-xs font-medium text-[#12291F] transition-colors hover:bg-black/3"
          >
            <Globe size={14} aria-hidden="true" />
            {t.website}
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-black/5 px-3 py-2 text-xs text-[#3F5147]/60">
            <Globe size={14} aria-hidden="true" />
            {t.noWebsite}
          </span>
        )}

        {place.googleMapsUri && (
          <a
            href={place.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${language === "id" ? "Buka" : "Open"} ${placeName} ${language === "id" ? "di Google Maps" : "in Google Maps"}`}
            className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-[#0E4A34] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#123F2B]"
          >
            <Map size={14} aria-hidden="true" />
            {t.openInMaps}
          </a>
        )}
      </div>
    </article>
  );
}
