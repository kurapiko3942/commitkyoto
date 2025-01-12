//APIエンドポイントやキーの定数

export const API_CONSTANTS = {
    GTFS_STATIC_URL: process.env.NEXT_PUBLIC_GTFS_STATIC_URL,
    GTFS_REALTIME_URL: process.env.NEXT_PUBLIC_GTFS_REALTIME_URL,
    ACCESS_TOKEN: process.env.NEXT_PUBLIC_ACCESS_TOKEN,
  } as const;