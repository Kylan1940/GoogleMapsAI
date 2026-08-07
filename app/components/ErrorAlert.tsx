import { AlertTriangle } from "lucide-react";
import en from "../messages/en";
import id from "../messages/id";

interface ErrorAlertProps {
  message: string;
  language: "id" | "en";
}

const translations = {
  id,
  en,
} as const;

function getLocalizedMessage(message: string, language: "id" | "en") {
  const t = translations[language];

  const messageMap: Record<string, string> = {
    "Search failed": t.searchFailed,
    "An error occurred": t.genericError,
    "This browser does not support location features.": t.browserLocationUnsupported,
    "Location permission was denied through the browser.": t.locationPermissionDenied,
    "Location could not be found.": t.locationNotFound,
    "This feature requires location permission.": t.locationPermissionRequired,
    "Invalid prompt.": t.invalidPrompt,
    "This is not a place search. Use keywords such as 'place', 'cafe', 'restaurant', 'warung', 'shop', 'hotel', 'hospital', 'school', etc.": t.notPlaceSearch,
    "The location is unclear. Use the nearest area, city, district, regency, province, or a clearer location.": t.unclearLocation,
    "Location not recognized.": t.locationUnknown,
    "A server error occurred.": t.serverError,
    "Gemini did not return a response.": t.geminiNoResponse,
  };

  return messageMap[message] || message;
}

export default function ErrorAlert({ message, language }: ErrorAlertProps) {
  const displayMessage = getLocalizedMessage(message, language);

  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-red-700"
    >
      <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p className="text-sm leading-relaxed">{displayMessage}</p>
    </div>
  );
}