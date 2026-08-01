import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { searchPlaces } from "@/app/lib/googlePlaces";
import dotenv from "dotenv";
import { error } from "console";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // 1. Gemini memahami prompt
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `
Kamu adalah sistem pencarian tempat.

Tugas:
Ubah permintaan user menjadi JSON.

Jika permintaan TIDAK berhubungan dengan pencarian tempat
kembalikan:

{
  "valid": false,
  "reason": "Bukan pencarian tempat"
}

JIka permintaan lokasi TIDAK jelas, kembalikan:

{
  "valid": false,
  "reason": "Lokasi belum jelas"
}

Jika valid:

{
  "valid": true,
  "location": true,
  "placeType": "",
  "location": "",
  "priceLevel": "",
  "minimumRating": null,
  "openNow": null,
  "sortBy": ""
}

User:
"${prompt}"

Hanya kirim JSON.
`,
    });

    // console.log("Gemini Response:", response);

    const cleanJson = response
      .text!.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiResult = JSON.parse(cleanJson);

    if (!aiResult.valid) {
      return NextResponse.json(
        error({
          error: aiResult.reason,
        }),
      );
    }

    if (!aiResult.location) {
      return NextResponse.json(
        {
          error: aiResult.reason,
        },
        {
          status: 400,
        },
      );
    }

    // 2. Google Places mencari lokasi
    const searchQuery = aiResult.location
      ? `${aiResult.placeType} di ${aiResult.location}`
      : aiResult.placeType;

    console.log("Google Places query:", searchQuery);

    const places = await searchPlaces(searchQuery);

    console.log("Jumlah tempat:", places.length);

    // 3. Kirim hasil ke frontend
    return NextResponse.json({
      filters: aiResult,
      places,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Search gagal",
      },
      {
        status: 500,
      },
    );
  }
}
