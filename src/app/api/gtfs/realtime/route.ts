//src/app/api/gtfs/realtime/route.ts
"use server";

import { NextResponse } from "next/server";
import * as protobuf from "protobufjs";
import path from "path";
import { error } from "console";
import axios from "axios";

export async function GET() {
  try {
    const realtimeUrl = process.env.NEXT_PUBLIC_GTFS_REALTIME_URL;

    if (!realtimeUrl) {
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    const response = await axios.get(realtimeUrl, {
      responseType: "arraybuffer",
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // バイナリデータとして取得
    const buffer = await response.data;
    console.log(buffer);
    // Protocol Buffers デコード
    const protoPath = path.join(
      process.cwd(),
      "src",
      "app",
      "api",
      "gtfs",
      "realtime",
      "gtfs-realtime.proto"
    );
    const root = await protobuf.load(protoPath);
    const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

    try {
      const message = FeedMessage.decode(new Uint8Array(buffer));
      const decodedData = FeedMessage.toObject(message, {
        longs: String,
        enums: String,
        bytes: String,
        defaults: true,
        arrays: true,
        objects: true,
        oneofs: true,
      });

      return NextResponse.json(decodedData);
    } catch (protoError) {
      if (protoError instanceof Error) {
        console.log("errorがおきました");
      }
      throw protoError;
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: "Failed to fetch realtime GTFS data", details: errorMessage },
      { status: 500 }
    );
  }
}
