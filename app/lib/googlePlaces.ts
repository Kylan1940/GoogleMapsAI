interface SearchQuery {
  placeType?: string | null;

  location?: string | null;

  useUserLocation?: boolean;

  priceLevel?: string | null;

  minimumRating?: number | null;

  openNow?: boolean | null;

  sortBy?: string | null;
}

interface UserLocation {
  latitude: number;

  longitude: number;
}

interface SearchPlacesOptions {
  query: SearchQuery;

  userLocation?: UserLocation | null;
}

interface SearchPlacesOptionsExtended extends SearchPlacesOptions {
  language?: "id" | "en";
}

export async function searchPlaces({
  query,
  userLocation,
  language,
}: SearchPlacesOptionsExtended) {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GOOGLE_MAPS_API_KEY belum ditemukan."
    );
  }

  /*
   * Buat teks pencarian.
   *
   * Contoh:
   * placeType: coffeeshop
   * location: Semarang Tengah
   *
   * Hasil:
   * coffeeshop di Semarang Tengah
   */

  let textQuery =
    query.placeType ||
    "tempat";

  if (
    query.location &&
    !query.useUserLocation
  ) {
    textQuery +=
      ` di ${query.location}`;
  }

  /*
   * Request ke Google Places API
   */

  const requestBody: Record<string, unknown> = {
    textQuery,

    languageCode: language === "en" ? "en" : "id",

    maxResultCount: 20,
  };

  /*
   * Jika user meminta:
   * "dekat saya"
   *
   * Google Places memakai
   * koordinat user sebagai bias.
   */

  if (
    query.useUserLocation &&
    userLocation
  ) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude:
            userLocation.latitude,

          longitude:
            userLocation.longitude,
        },

        /*
         * Radius 5 km.
         *
         * Bisa diganti:
         * 3000 = 3 km
         * 5000 = 5 km
         * 10000 = 10 km
         */
        radius: 5000,
      },
    };
  }

  /*
   * Filter rating minimum.
   */

  if (
    query.minimumRating
  ) {
    requestBody.minRating =
      query.minimumRating;
  }

  /*
   * Filter hanya tempat yang buka.
   */

  if (
    query.openNow === true
  ) {
    requestBody.openNow = true;
  }

  /*
   * Filter harga.
   *
   * Google Places memakai:
   * PRICE_LEVEL_INEXPENSIVE
   * PRICE_LEVEL_MODERATE
   * PRICE_LEVEL_EXPENSIVE
   * PRICE_LEVEL_VERY_EXPENSIVE
   */

  if (
    query.priceLevel === "LOW"
  ) {
    requestBody.priceLevels = [
      "PRICE_LEVEL_INEXPENSIVE",
    ];
  }

  if (
    query.priceLevel === "MEDIUM"
  ) {
    requestBody.priceLevels = [
      "PRICE_LEVEL_MODERATE",
    ];
  }

  if (
    query.priceLevel === "HIGH"
  ) {
    requestBody.priceLevels = [
      "PRICE_LEVEL_EXPENSIVE",
      "PRICE_LEVEL_VERY_EXPENSIVE",
    ];
  }

  console.log(
    "Google Places request:",
    JSON.stringify(
      requestBody,
      null,
      2
    )
  );

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "X-Goog-Api-Key":
          apiKey,

        /*
         * Field yang dikembalikan
         * Google Places.
         */
        "X-Goog-FieldMask": [
          "places.displayName",

          "places.formattedAddress",

          "places.rating",

          "places.userRatingCount",

          "places.priceRange",

          "places.regularOpeningHours",

          "places.location",

          "places.googleMapsUri",

          "places.nationalPhoneNumber",

          "places.internationalPhoneNumber",

          "places.websiteUri",
        ].join(","),
      },

      body: JSON.stringify(
        requestBody
      ),
    }
  );

  /*
   * Jika Google Places error,
   * tampilkan isi error asli.
   */

  if (!response.ok) {
    const errorText =
      await response.text();

    console.error(
      "Google Places error:",
      errorText
    );

    throw new Error(
      `Google Places gagal: ${errorText}`
    );
  }

  const data =
    await response.json();

  console.log(
    "Google Places response:",
    data
  );

  return (
    data.places || []
  );
}