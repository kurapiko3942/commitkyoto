// src/app/api/places/[placeId]/route.ts
import { NextRequest } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ placeId: string }> }
) {
  try {
    if (!GOOGLE_MAPS_API_KEY) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    // URL から placeId を取得（パラメータの直接使用を避ける）
    const placeId = request.url.split("/").pop();
    if (!placeId) {
      return Response.json({ error: "Missing place ID" }, { status: 400 });
    }

    // Places API リクエストの構築
    const searchParams = new URLSearchParams({
      place_id: placeId,
      fields:
        "name,rating,user_ratings_total,formatted_address,opening_hours,photos",
      language: "ja",
      key: GOOGLE_MAPS_API_KEY,
    });

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${searchParams}`;
    const response = await fetch(detailsUrl);
    const data = await response.json();

    if (data.status !== "OK") {
      return Response.json(
        { error: data.error_message || "Failed to fetch place details" },
        { status: 400 }
      );
    }

    // 写真URLの生成
    const photoUrls =
      data.result.photos?.map(
        (photo: { photo_reference: any }) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
      ) || [];

    return Response.json({
      id: placeId,
      name: data.result.name,
      nameEn: data.result.name,
      photoUrls,
      iconUrl: photoUrls[0] || "/landmark-default.png",
      rating: data.result.rating,
      userRatingsTotal: data.result.user_ratings_total,
      address: data.result.formatted_address,
      openingHours: data.result.opening_hours?.weekday_text || [],
    });
  } catch (error) {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
