"use client";

import { useState, useEffect } from "react";
import {
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSRealtimeResponse,
} from "@/types/gtfsTypes";

export function useGTFSData() {
  const [staticData, setStaticData] = useState<{
    routes: GTFSRoute[];
    stops: GTFSStop[];
    trips: GTFSTrip[];
  }>({
    routes: [],
    stops: [],
    trips: [],
  });

  const [vehicles, setVehicles] = useState<GTFSRealtimeResponse["entity"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 静的データの取得
  useEffect(() => {
    const fetchStatic = async () => {
      try {
        const response = await fetch("/api/gtfs");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Failed to fetch static data: ${response.status} ${errorText}`
          );
        }
        const data = await response.json();

        setStaticData(data);
      } catch (err) {
        console.error("Static data fetch error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    };

    fetchStatic();
  }, []);

  // リアルタイムデータの定期取得
  useEffect(() => {
    const fetchRealtime = async () => {
      try {
        const response = await fetch("/api/gtfs/realtime");

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Realtime API Error:", {
            status: response.status,
            statusText: response.statusText,
            body: errorText,
          });
          throw new Error(
            `Failed to fetch realtime data: ${response.status} ${errorText}`
          );
        }

        const data = await response.json();

        if (data.entity) {
          setVehicles(data.entity);
        } else {
          console.warn("No entity array in realtime data:", data);
        }
        setLoading(false);
      } catch (err) {
        console.error("Realtime data fetch error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
      }
    };

    // 初回取得
    fetchRealtime();

    // 30秒ごとに更新
    const interval = setInterval(fetchRealtime, 30000);

    return () => clearInterval(interval);
  }, []);
  console.log(staticData);
  return {
    routes: staticData.routes,
    vehicles,
    loading,
    error,
  };
}
