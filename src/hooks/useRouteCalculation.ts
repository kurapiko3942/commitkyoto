// src/hooks/useRouteCalculation.ts

import { useState, useEffect } from "react";
import {
  RouteCalculationResult,
  TouristSpot,
  RouteInfo,
  AlternativeRoute,
  OccupancyLevel,
  RouteError,
  RouteStop,
} from "../types/routeTypes";
import {
  findNearestStops,
  calculateTotalTime,
  createRouteStop,
  isWithinServiceHours,
  calculateDistance,
  calculateFare,
  timeToMinutes,
} from "../utils/routeUtils";
import { shouldSuggestAlternative } from "../utils/occupancyUtils";
import {
  GTFSRealtimeVehicle,
  GTFSRoute,
  GTFSStop,
  GTFSStopTime,
} from "../types/gtfsTypes";

interface UseRouteCalculationProps {
  fromSpot: TouristSpot | null;
  toSpot: TouristSpot | null;
  hasTrunk: boolean;
  routes: GTFSRoute[];
  stops: GTFSStop[];
  stopTimes: GTFSStopTime[];
  vehicles: GTFSRealtimeVehicle[];
  fareRules: Array<{
    fare_id: string;
    route_id: number;
    origin_id?: string;
    destination_id?: string;
  }>;
  fareAttributes: Array<{
    fare_id: string;
    price: number;
    currency_type: string;
    payment_method: number;
    transfers: number;
  }>;
}

export function useRouteCalculation({
  fromSpot,
  toSpot,
  hasTrunk,
  routes,
  stops,
  stopTimes,
  vehicles,
  fareRules,
  fareAttributes,
}: UseRouteCalculationProps) {
  const [result, setResult] = useState<RouteCalculationResult>({
    mainRoute: null,
    alternativeRoutes: [],
  });

  useEffect(() => {
    console.log("useRouteCalculation triggered with:", {
      fromSpot,
      toSpot,
      routesCount: routes.length,
      stopsCount: stops.length,
    });

    if (
      !fromSpot ||
      !toSpot ||
      !routes.length ||
      !stops.length ||
      !stopTimes.length
    ) {
      console.warn("Missing required data:", {
        hasFromSpot: !!fromSpot,
        hasToSpot: !!toSpot,
        routesCount: routes.length,
        stopsCount: stops.length,
        stopTimesCount: stopTimes.length,
      });
      return;
    }

    try {
      // 最寄りのバス停を探す
      console.log("Finding nearest stops for:", {
        from: fromSpot.name,
        to: toSpot.name,
      });
      const nearestFromStops = findNearestStops(fromSpot, stops);
      const nearestToStops = findNearestStops(toSpot, stops);

      console.log("Found nearest stops:", {
        fromStops: nearestFromStops.map((s) => s.stop_name),
        toStops: nearestToStops.map((s) => s.stop_name),
      });

      if (!nearestFromStops.length || !nearestToStops.length) {
        console.warn("No nearby stops found");
        setResult({
          mainRoute: null,
          alternativeRoutes: [],
          error: "CALCULATION_ERROR",
        });
        return;
      }

      // 現在の時刻を取得
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;

      // メインルートを計算
      console.log("Calculating main route...");
      const mainRoute = calculateMainRoute(
        nearestFromStops[0],
        nearestToStops[0],
        routes,
        stops,
        stopTimes,
        vehicles,
        fareRules,
        fareAttributes,
        currentTime
      );

      console.log(
        "Main route calculation result:",
        mainRoute ? "success" : "failed"
      );

      // 代替ルートを計算
      const alternativeRoutes = calculateAlternativeRoutes(
        mainRoute,
        nearestFromStops,
        nearestToStops,
        routes,
        stops,
        stopTimes,
        vehicles,
        fareRules,
        fareAttributes,
        currentTime,
        hasTrunk
      );

      setResult({
        mainRoute,
        alternativeRoutes,
        error: mainRoute ? undefined : "CALCULATION_ERROR",
      });
    } catch (error) {
      console.error("Route calculation error:", error);
      setResult({
        mainRoute: null,
        alternativeRoutes: [],
        error: "CALCULATION_ERROR",
      });
    }
  }, [
    fromSpot,
    toSpot,
    hasTrunk,
    routes,
    stops,
    stopTimes,
    vehicles,
    fareRules,
    fareAttributes,
  ]);

  return result;
}

function calculateMainRoute(
  fromStop: GTFSStop,
  toStop: GTFSStop,
  routes: GTFSRoute[],
  stops: GTFSStop[],
  stopTimes: GTFSStopTime[],
  vehicles: GTFSRealtimeVehicle[],
  fareRules: Array<{
    fare_id: string;
    route_id: number;
    origin_id?: string;
    destination_id?: string;
  }>,
  fareAttributes: Array<{
    fare_id: string;
    price: number;
    currency_type: string;
    payment_method: number;
    transfers: number;
  }>,
  currentTime: string
): RouteInfo | null {
  try {
    console.log("calculateMainRoute input:", {
      fromStop: fromStop.stop_name,
      toStop: toStop.stop_name,
      routesCount: routes.length,
    });

    // 1. 両方のバス停を通る路線を探す
    const availableRoutes = routes.filter((route) => {
      const routeStopTimes = stopTimes.filter((st) =>
        st.trip_id.startsWith(String(route.route_id))
      );
      const hasFromStop = routeStopTimes.some(
        (st) => st.stop_id === fromStop.stop_id
      );
      const hasToStop = routeStopTimes.some(
        (st) => st.stop_id === toStop.stop_id
      );
      return hasFromStop && hasToStop;
    });

    console.log("Available routes found:", availableRoutes.length);
    if (!availableRoutes.length) return null;

    // 2. 最適な路線を選択（この実装では最初の路線を使用）
    const selectedRoute = availableRoutes[0];

    // 3. 選択した路線の停車バス停と時刻を取得
    const routeStopTimes = stopTimes
      .filter((st) => st.trip_id.startsWith(String(selectedRoute.route_id)))
      .sort(
        (a, b) => timeToMinutes(a.arrival_time) - timeToMinutes(b.arrival_time)
      );

    // 4. 現在時刻以降の最適な便を見つける
    const currentMinutes = timeToMinutes(currentTime);
    console.log("Finding next departures after:", currentTime);

    const nextDepartures = routeStopTimes.filter(
      (st) =>
        st.stop_id === fromStop.stop_id &&
        timeToMinutes(st.departure_time) >= currentMinutes
    );

    console.log("Next departures found:", nextDepartures.length);
    if (!nextDepartures.length) return null;

    const selectedDeparture = nextDepartures[0];
    const tripId = selectedDeparture.trip_id;

    // 5. 選択した便の全停車バス停を取得
    const tripStops = routeStopTimes
      .filter((st) => st.trip_id === tripId)
      .sort((a, b) => a.stop_sequence - b.stop_sequence);

    // 6. 出発から到着までのバス停を抽出
    const fromStopIndex = tripStops.findIndex(
      (st) => st.stop_id === fromStop.stop_id
    );
    const toStopIndex = tripStops.findIndex(
      (st) => st.stop_id === toStop.stop_id
    );

    console.log("Stop indices:", { fromStopIndex, toStopIndex });
    if (fromStopIndex === -1 || toStopIndex === -1) return null;

    const startIndex = Math.min(fromStopIndex, toStopIndex);
    const endIndex = Math.max(fromStopIndex, toStopIndex);
    const relevantStops = tripStops.slice(startIndex, endIndex + 1);

    // 7. 現在の混雑度を取得
    const currentVehicle = vehicles.find(
      (v) => v.vehicle?.trip?.trip_id === tripId
    );
    const occupancyLevel = currentVehicle?.vehicle?.occupancyStatus
      ? (Number(currentVehicle.vehicle.occupancyStatus) as OccupancyLevel)
      : OccupancyLevel.EMPTY;

    // 8. RouteStopの配列を作成
    const stopsMap = new Map(stops.map((s) => [s.stop_id, s]));
    const routeStops: RouteStop[] = relevantStops.map((stopTime) => {
      const stop = stopsMap.get(stopTime.stop_id);
      if (!stop) throw new Error(`Stop not found: ${stopTime.stop_id}`);
      return createRouteStop(stop, stopTime, currentTime, occupancyLevel);
    });

    // 9. 運賃を計算
    const fareAmount = calculateFare(
      selectedRoute,
      fromStop,
      toStop,
      fareRules,
      fareAttributes
    );

    return {
      id: `route-${selectedRoute.route_id}-${tripId}`,
      route: selectedRoute,
      stops: routeStops,
      fareAmount,
      totalTime: calculateTotalTime(
        relevantStops[0].departure_time,
        relevantStops[relevantStops.length - 1].arrival_time
      ),
      departureStop: {
        name: fromStop.stop_name,
        time: relevantStops[0].departure_time,
      },
      arrivalStop: {
        name: toStop.stop_name,
        time: relevantStops[relevantStops.length - 1].arrival_time,
      },
      occupancyLevel,
    };
  } catch (error) {
    console.error("Error in calculateMainRoute:", error);
    return null;
  }
}
function calculateAlternativeRoutes(
  mainRoute: RouteInfo | null,
  fromStops: GTFSStop[],
  toStops: GTFSStop[],
  routes: GTFSRoute[],
  stops: GTFSStop[],
  stopTimes: GTFSStopTime[],
  vehicles: GTFSRealtimeVehicle[],
  fareRules: Array<{
    fare_id: string;
    route_id: number;
    origin_id?: string;
    destination_id?: string;
  }>,
  fareAttributes: Array<{
    fare_id: string;
    price: number;
    currency_type: string;
    payment_method: number;
    transfers: number;
  }>,
  currentTime: string,
  hasTrunk: boolean
): AlternativeRoute[] {
  if (!mainRoute) return [];

  console.log("Calculating alternative routes...");
  const alternatives: AlternativeRoute[] = [];

  try {
    const threshold = hasTrunk
      ? OccupancyLevel.MANY_SEATS_AVAILABLE
      : OccupancyLevel.STANDING_ROOM_ONLY;

    // 1. 同じ路線の次の便を探す
    if (mainRoute.occupancyLevel > threshold) {
      console.log(
        "Looking for next trip due to occupancy level:",
        mainRoute.occupancyLevel
      );
      const nextTrip = findNextTrip(mainRoute, stopTimes, currentTime);
      if (nextTrip) {
        const nextTripRoute = calculateMainRoute(
          fromStops[0],
          toStops[0],
          [mainRoute.route],
          stops,
          nextTrip,
          vehicles,
          fareRules,
          fareAttributes,
          currentTime
        );

        if (nextTripRoute) {
          alternatives.push({
            ...nextTripRoute,
            reason: {
              type: "OCCUPANCY",
              description: "混雑を避けるため、次の便をお勧めします",
            },
          });
        }
      }
    }
    // 2. 異なる路線での代替ルートを探す
    const alternativeRoutes = routes.filter(
      (route) => route.route_id !== mainRoute.route.route_id
    );

    console.log("Searching alternative routes:", alternativeRoutes.length);

    for (const route of alternativeRoutes) {
      // 徒歩距離を含めた別路線でのルートを計算
      const alternativeRoute = calculateRouteWithWalking(
        fromStops,
        toStops,
        route,
        stops,
        stopTimes,
        vehicles,
        fareRules,
        fareAttributes,
        currentTime
      );

      if (alternativeRoute && alternativeRoute.occupancyLevel <= threshold) {
        alternatives.push({
          ...alternativeRoute,
          reason: {
            type: "LESS_WALKING",
            description: "少し歩きますが、混雑の少ない経路があります",
          },
        });
      }
    }

    return alternatives;
  } catch (error) {
    console.error("Error in calculateAlternativeRoutes:", error);
    return [];
  }
}

// 次の便を探す補助関数
function findNextTrip(
  currentRoute: RouteInfo,
  stopTimes: GTFSStopTime[],
  currentTime: string
): GTFSStopTime[] {
  const currentTripTime = timeToMinutes(currentRoute.departureStop.time);
  return stopTimes.filter(
    (st) =>
      st.trip_id.startsWith(String(currentRoute.route.route_id)) &&
      timeToMinutes(st.departure_time) > currentTripTime
  );
}

// 徒歩区間を含むルートを計算する補助関数
function calculateRouteWithWalking(
  fromStops: GTFSStop[],
  toStops: GTFSStop[],
  route: GTFSRoute,
  stops: GTFSStop[],
  stopTimes: GTFSStopTime[],
  vehicles: GTFSRealtimeVehicle[],
  fareRules: Array<{
    fare_id: string;
    route_id: number;
    origin_id?: string;
    destination_id?: string;
  }>,
  fareAttributes: Array<{
    fare_id: string;
    price: number;
    currency_type: string;
    payment_method: number;
    transfers: number;
  }>,
  currentTime: string
): RouteInfo | null {
  // 最寄りのバス停から順に試行
  for (const fromStop of fromStops) {
    for (const toStop of toStops) {
      const routeInfo = calculateMainRoute(
        fromStop,
        toStop,
        [route],
        stops,
        stopTimes,
        vehicles,
        fareRules,
        fareAttributes,
        currentTime
      );

      if (routeInfo) {
        // 徒歩距離を計算
        const walkingDistance = {
          toFirstStop: calculateDistance(
            fromStops[0].stop_lat,
            fromStops[0].stop_lon,
            fromStop.stop_lat,
            fromStop.stop_lon
          ),
          fromLastStop: calculateDistance(
            toStop.stop_lat,
            toStop.stop_lon,
            toStops[0].stop_lat,
            toStops[0].stop_lon
          ),
        };

        return {
          ...routeInfo,
          walkingDistance,
        };
      }
    }
  }

  return null;
}
