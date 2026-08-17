import { GoogleGenAI } from "@google/genai";

import { searchPlaces } from "@/app/lib/googlePlaces";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getLocalizedMessage(language: string | undefined, key: "invalidPrompt" | "notPlaceSearch" | "unclearLocation" | "locationUnknown" | "serverError" | "geminiNoResponse") {
  const isEnglish = language === "en";

  const messages = {
    id: {
      invalidPrompt: "Prompt tidak valid.",
      notPlaceSearch: "Bukan pencarian tempat. Gunakan kata kunci seperti 'tempat', 'cafe', 'restoran', 'warung', 'toko', 'hotel', 'rumah sakit', 'sekolah', dll.",
      unclearLocation: "Lokasi belum jelas. Gunakan terdekat, nama kota, kecamatan, kabupaten, provinsi, atau lokasi yang jelas.",
      locationUnknown: "Lokasi tidak dikenali.",
      serverError: "Terjadi kesalahan pada server.",
      geminiNoResponse: "Gemini tidak mengembalikan respons.",
    },
    en: {
      invalidPrompt: "Invalid prompt.",
      notPlaceSearch: "This is not a place search. Use keywords such as 'place', 'cafe', 'restaurant', 'market', 'shop', 'hotel', 'hospital', 'school', etc.",
      unclearLocation: "The location is unclear. Use the nearest area, city, district, regency, province, or a clearer location.",
      locationUnknown: "Location not recognized.",
      serverError: "A server error occurred.",
      geminiNoResponse: "Gemini did not return a response.",
    },
  } as const;

  return messages[isEnglish ? "en" : "id"][key];
}

function getLocalizedReason(reason: string | undefined, language: string | undefined) {
  const isEnglish = language === "en";

  if (reason?.includes("Bukan pencarian tempat") || reason?.includes("This is not a place search")) {
    return getLocalizedMessage(language, "notPlaceSearch");
  }

  if (reason?.includes("Lokasi belum jelas") || reason?.includes("The location is unclear")) {
    return getLocalizedMessage(language, "unclearLocation");
  }

  if (reason?.includes("Lokasi tidak dikenali") || reason?.includes("Location not recognized")) {
    return getLocalizedMessage(language, "locationUnknown");
  }

  if (reason) {
    return reason;
  }

  return getLocalizedMessage(language, "locationUnknown");
}

export async function POST(request: Request) {
  let selectedLanguage: string | undefined;

  try {

    const { prompt, userLocation, language } = await request.json();
    selectedLanguage = typeof language === "string" ? language : undefined;

    //console.log("PROMPT:", prompt);
    //console.log("USER LOCATION:", userLocation);

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        {
          error: getLocalizedMessage(selectedLanguage, "invalidPrompt"),
        },

        {
          status: 400,
        },
      );
    }

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",

      contents: `
Ubah permintaan pencarian tempat
menjadi JSON.

Balas HANYA dengan JSON valid.

Jangan gunakan markdown.

Jangan gunakan:
\`\`\`json

Jangan tambahkan penjelasan.

Jika permintaan TIDAK berhubungan dengan pencarian tempat
kembalikan:

{
  "valid": false,
  "reason": "Bukan pencarian tempat. Gunakan kata kunci seperti 'tempat', 'cafe', 'restoran', 'warung', 'toko', 'hotel', 'rumah sakit', 'sekolah', dll."
}

JIka permintaan lokasi TIDAK jelas seperti "di planet mars" atau "di rumah", kembalikan:

{
  "valid": false,
  "reason": "Lokasi belum jelas. Gunakan terdekat, nama kota, kecamatan, kabupaten, provinsi, atau lokasi yang jelas."
}

Gunakan format:

  "valid": boolean,
  "placeType": string | null,
  "location": string | null,
  "useUserLocation": boolean,
  "priceLevel":
    "LOW" |
    "MEDIUM" |
    "HIGH" |
    null,
  "minimumRating":
    number | null,
  "openNow":
    boolean | null,
  "sortBy":
    "relevance" |
    "price" |
    "rating" |
    "distance"
}

ATURAN:

- useUserLocation bernilai true
  jika pengguna meminta tempat
  dekat lokasi saat ini.

- Pahami makna, jangan hanya
  mencocokkan kata.

- Contoh yang membutuhkan
  lokasi pengguna:
  "dekat saya"
  "di sekitar saya"
  "di sekitar me"
  "near me"
  "nearby"
  "dekat sini"
  "sekitar sini"
  "yang paling dekat"

- Jika useUserLocation bernilai
  true:
  location harus null.

- Jika pengguna menyebut lokasi
  seperti kota, kecamatan,
  kabupaten, atau provinsi:
  gunakan lokasi tersebut pada
  field location.
  useUserLocation harus false.

- sortBy:

  "distance"
  jika meminta tempat terdekat.

  "price"
  jika meminta yang termurah.

  "rating"
  jika meminta rating tertinggi
  atau terbaik.

  "relevance"
  jika tidak meminta urutan khusus.

PROMPT USER:

"${prompt}"
`,
    });

    const responseText = geminiResponse.text;

    if (!responseText) {
      throw new Error(getLocalizedMessage(selectedLanguage, "geminiNoResponse"));
    }


    const cleanText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const aiResult = JSON.parse(cleanText);

    if (!aiResult.valid || (!aiResult.location && !aiResult.useUserLocation)) {
      return Response.json(
        {
          error: getLocalizedReason(aiResult.reason, selectedLanguage),
        },
        {
          status: 400,
        },
      );
    }

    //console.log("AI RESULT:", aiResult);

    if (aiResult.useUserLocation === true && !userLocation) {
      //console.log("Lokasi belum tersedia.");

      return Response.json({
        requiresLocation: true,

        query: aiResult,
      });
    }

    //console.log("Memanggil Google Places...");

    const places = await searchPlaces({
      query: aiResult,

      userLocation: userLocation || null,
      language: selectedLanguage as "id" | "en",
    });

    //console.log("JUMLAH TEMPAT:", places.length);

    return Response.json({
      requiresLocation: false,

      query: aiResult,

      places,
    });
  } catch (error) {
    console.error("SEARCH API ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : getLocalizedMessage(selectedLanguage, "serverError"),
      },

      {
        status: 500,
      },
    );
  }
}
