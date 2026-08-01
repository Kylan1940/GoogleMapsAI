export async function searchPlaces(query: string) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_MAPS_API_KEY tidak ditemukan");
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,

        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.regularOpeningHours,places.location",
      },

      body: JSON.stringify({
        textQuery: query,
        languageCode: "id",
        regionCode: "ID",
      }),
    }
  );

  const data = await response.json();

  console.log(
    "Google Places response:",
    JSON.stringify(data, null, 2)
  );

  if (!response.ok) {
    throw new Error(
      data.error?.message ||
      "Google Places gagal"
    );
  }

  return data.places ?? [];
}