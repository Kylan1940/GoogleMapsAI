import { GoogleGenAI } from "@google/genai";

import { searchPlaces } from "@/app/lib/googlePlaces";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    /*
     * Ambil prompt dan koordinat
     * dari page.tsx.
     */

    const { prompt, userLocation } = await request.json();

    //console.log("PROMPT:", prompt);
    //console.log("USER LOCATION:", userLocation);

    /*
     * Validasi prompt.
     */

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        {
          error: "Prompt tidak valid.",
        },

        {
          status: 400,
        },
      );
    }

    /*
     * Gemini mengubah bahasa
     * manusia menjadi JSON.
     */

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
  "reason": "Bukan pencarian tempat"
}

JIka permintaan lokasi TIDAK jelas seperti "di planet mars" atau "di rumah", kembalikan:

{
  "valid": false,
  "reason": "Lokasi belum jelas"
}

Gunakan format:

{
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

    /*
     * Ambil teks Gemini.
     */

    const responseText = geminiResponse.text;

    if (!responseText) {
      throw new Error("Gemini tidak mengembalikan respons.");
    }

    /*
     * Bersihkan markdown jika
     * Gemini masih bandel.
     */

    const cleanText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    /*
     * Ubah hasil Gemini menjadi
     * object JavaScript.
     */

    const aiResult = JSON.parse(cleanText);

    if (!aiResult.valid || (!aiResult.location && !aiResult.useUserLocation)) {
      return Response.json(
        {
          error: aiResult.reason || "Lokasi tidak dikenali.",
        },
        {
          status: 400,
        },
      );
    }

    //console.log("AI RESULT:", aiResult);

    /*
     * Prompt membutuhkan lokasi,
     * tetapi frontend belum
     * mengirim koordinat.
     *
     * API berhenti di sini agar
     * frontend menampilkan popup.
     */

    if (aiResult.useUserLocation === true && !userLocation) {
      //console.log("Lokasi belum tersedia.");

      return Response.json({
        requiresLocation: true,

        query: aiResult,
      });
    }

    /*
     * Kalau koordinat sudah ada,
     * lanjut ke Google Places.
     */

    //console.log("Memanggil Google Places...");

    const places = await searchPlaces({
      query: aiResult,

      userLocation: userLocation || null,
    });

    //console.log("JUMLAH TEMPAT:", places.length);

    /*
     * Kirim hasil ke page.tsx.
     */

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
            : "Terjadi kesalahan pada server.",
      },

      {
        status: 500,
      },
    );
  }
}
