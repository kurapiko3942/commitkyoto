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
/**
 * GTFSデータを取得するためのカスタムフック
 *
 *
 *
 * @returns {Object} GTFSデータとリアルタイムの車両データを含むオブジェクト。
 * @returns {GTFSRoute[]} return.routes 静的なルートデータの配列。
 * @returns {GTFSStop[]} return.stops 静的な停留所データの配列。こいつ重要
 * @returns {GTFSTrip[]} return.trips 静的なトリップデータの配列。
 * @returns {GTFSStopTime[]} return.stopTimes 静的な停留所の時刻データの配列。
 * @returns {GTFSFareAttribute[]} return.fareAttributes 静的な運賃属性データの配列。
 * @returns {GTFSFareRule[]} return.fareRules 静的な運賃ルールデータの配列。
 * @returns {GTFSRealtimeResponse["entity"][]} return.vehicles リアルタイムの車両データの配列。これでリアルタイムにバスを表示
 * @returns {boolean} return.loading データが読み込み中かどうかを示すフラグ。
 * @returns {Error | null} return.error データ取得時に発生したエラー情報。
 * @throws {Error} データ取得に失敗した場合にエラーをスローします。
 *
 */
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
        console.log("GTFS Static Data fetched:", data);
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

  return {
    routes: staticData.routes,
    stops: staticData.stops,
    trips: staticData.trips,
    stopTimes: staticData.stopTimes,
    fareAttributes: staticData.fareAttributes,
    fareRules: staticData.fareRules,
    vehicles: [
      {
        id: "vehicle1",
        is_deleted: false,
        vehicle: {
          trip: {
            trip_id: "trip1",
            routeId: 10032,
            direction_id: 0,
            start_time: "08:00:00",
            start_date: "20231010",
            schedule_relationship: "SCHEDULED",
          },
          position: {
            latitude: 35.6895,
            longitude: 139.6917,
            bearing: 90,
            odometer: 10000,
            speed: 50,
          },
          current_stop_sequence: 5,
          current_status: "IN_TRANSIT_TO",
          timestamp: "2023-10-10T08:05:00Z",
          congestion_level: "MODERATE",
          stop_id: "stop1",
          vehicle: {
            id: "vehicle1",
            label: "Bus 1",
            license_plate: "ABC-123",
          },
          occupancyStatus: "MANY_SEATS_AVAILABLE",
        },
      },
      {
        id: "vehicle2",
        is_deleted: false,
        vehicle: {
          trip: {
            trip_id: "trip2",
            routeId: 2,
            direction_id: 1,
            start_time: "09:00:00",
            start_date: "20231010",
            schedule_relationship: "SCHEDULED",
          },
          position: {
            latitude: 35.6897,
            longitude: 139.692,
            bearing: 180,
            odometer: 20000,
            speed: 40,
          },
          current_stop_sequence: 10,
          current_status: "STOPPED_AT",
          timestamp: "2023-10-10T09:10:00Z",
          congestion_level: "HEAVY",
          stop_id: "stop2",
          vehicle: {
            id: "vehicle2",
            label: "Bus 2",
            license_plate: "DEF-456",
          },
          occupancyStatus: "STANDING_ROOM_ONLY",
        },
      },
    ],

    loading,
    error,
  };
}
