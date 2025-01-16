"use client";

import { useState, useEffect } from "react";
import {
  GTFSRoute,
  GTFSStop,
  GTFSTrip,
  GTFSRealtimeResponse,
  GTFSFareAttribute,
  GTFSFareRule,
  GTFSStopTime,
} from "@/types/gtfsTypes";

export function useGTFSData() {
  const [staticData, setStaticData] = useState<{
    routes: GTFSRoute[];
    stops: GTFSStop[];
    trips: GTFSTrip[];
    stopTimes: GTFSStopTime[];
    fareAttributes: GTFSFareAttribute[];
    fareRules: GTFSFareRule[];
  }>({
    routes: [],
    stops: [],
    trips: [],
    stopTimes: [],
    fareAttributes: [],
    fareRules: [],
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
          throw new Error(`Failed to fetch static data: ${response.status}`);
        }
        const data = await response.json();
        console.log('GTFS Static Data fetched:', data);
        setStaticData(data);
        setLoading(false);
      } catch (err) {
        console.error("Static data fetch error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setLoading(false);
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
          throw new Error(`Failed to fetch realtime data: ${response.status}`);
        }
        const data = await response.json();
        if (data.entity) {
          setVehicles(data.entity);
        }
      } catch (err) {
        console.error("Realtime data fetch error:", err);
      }
    };

    fetchRealtime();
    const interval = setInterval(fetchRealtime, 30000);
    return () => clearInterval(interval);
  }, []);

  console.log('useGTFSData returning:', {
    routesCount: staticData.routes.length,
    stopsCount: staticData.stops.length,
    vehiclesCount: vehicles.length,
    stopTimesCount: staticData.stopTimes.length,
    fareAttributesCount: staticData.fareAttributes.length,
    fareRulesCount: staticData.fareRules.length,
  });

  return {
    routes: staticData.routes,
    stops: staticData.stops,
    trips: staticData.trips,
    stopTimes: staticData.stopTimes,
    fareAttributes: staticData.fareAttributes,
    fareRules: staticData.fareRules,
    vehicles,
    loading,
    error,
  };
}