// components/ComponentsOnSheet/OptimalRouteCard.tsx

import { getOccupancyStatusText } from "@/utils/occupancyStatus";
import {
  GTFSRealtimeVehicle,
  GTFSRoute,
  GTFSStop,
  GTFSFareAttribute,
  GTFSFareRule,
  GTFSStopTime,
} from "@/types/gtfsTypes";
import { calculateDistance } from "@/utils/distance";

interface OptimalRouteCardProps {
  destination: {
    id: string;
    name: string;
    position: [number, number];
  };
  origin: {
    id: string;
    name: string;
    position: [number, number];
  };
  stops: GTFSStop[];
  vehicles: GTFSRealtimeVehicle[];
  routes: GTFSRoute[];
  fareAttributes: GTFSFareAttribute[];
  fareRules: GTFSFareRule[];
  stopTimes: GTFSStopTime[];
  sortBy: "time" | "fare" | "transfers";
}

interface RouteOption {
  startStop: GTFSStop;
  endStop: GTFSStop;
  bus: GTFSRealtimeVehicle;
  route: GTFSRoute;
  walkDistanceToStart: number;
  walkDistanceFromEnd: number;
  totalDistance: number;
  estimatedTime: number;
  transfers: number;
  fare: number;
}

export function OptimalRouteCard({
  destination,
  origin,
  stops,
  vehicles,
  routes,
  fareAttributes,
  fareRules,
  stopTimes,
  sortBy,
}: OptimalRouteCardProps) {
  const WALK_SPEED = 80; // 分速80m
  const MAX_WALKING_DISTANCE = 1000; // 最大徒歩距離 1km

  const findRouteOptions = (): RouteOption[] => {
    const options: RouteOption[] = [];

    // 1. 出発地から徒歩圏内のバス停を探す
    const nearbyStartStops = stops.filter((stop) => {
      const distance = calculateDistance(
        origin.position[0],
        origin.position[1],
        stop.stop_lat,
        stop.stop_lon
      );
      return distance <= MAX_WALKING_DISTANCE;
    });

    // 2. 目的地から徒歩圏内のバス停を探す
    const nearbyEndStops = stops.filter((stop) => {
      const distance = calculateDistance(
        destination.position[0],
        destination.position[1],
        stop.stop_lat,
        stop.stop_lon
      );
      return distance <= MAX_WALKING_DISTANCE;
    });

    // 3. 各バス停の組み合わせでルートを探索
    nearbyStartStops.forEach((startStop) => {
      nearbyEndStops.forEach((endStop) => {
        // 利用可能なバスを探す
        const availableBuses = vehicles.filter((vehicle) => {
          const routeInfo = routes.find(
            (r) => r.route_id === vehicle.vehicle?.trip?.routeId
          );
          if (!routeInfo) return false;

          // このバスルートが開始バス停と終了バス停を通るか確認
          const relevantStopTimes = stopTimes.filter(
            (st) => st.trip_id === vehicle.vehicle?.trip?.tripId
          );
          const stopsOnRoute = relevantStopTimes.map((st) => st.stop_id);

          return (
            stopsOnRoute.includes(startStop.stop_id) &&
            stopsOnRoute.includes(endStop.stop_id)
          );
        });

        availableBuses.forEach((bus) => {
          const routeInfo = routes.find(
            (r) => r.route_id === bus.vehicle?.trip?.routeId
          );
          if (!routeInfo) return;

          const walkDistanceToStart = calculateDistance(
            origin.position[0],
            origin.position[1],
            startStop.stop_lat,
            startStop.stop_lon
          );

          const walkDistanceFromEnd = calculateDistance(
            destination.position[0],
            destination.position[1],
            endStop.stop_lat,
            endStop.stop_lon
          );

          // 運賃計算
          const fareRule = fareRules.find(
            (rule) => rule.route_id === routeInfo.route_id
          );
          const fareAttribute = fareRule
            ? fareAttributes.find((attr) => attr.fare_id === fareRule.fare_id)
            : null;
          const fare = fareAttribute ? fareAttribute.price : 0;

          const totalDistance = walkDistanceToStart + walkDistanceFromEnd;
          const walkingTime =
            (walkDistanceToStart + walkDistanceFromEnd) / WALK_SPEED;

          // バスでの所要時間を計算
          const relevantStopTimes = stopTimes
            .filter((st) => st.trip_id === bus.vehicle?.trip?.tripId)
            .sort((a, b) => a.stop_sequence - b.stop_sequence);

          const startStopTime = relevantStopTimes.find(
            (st) => st.stop_id === startStop.stop_id
          );
          const endStopTime = relevantStopTimes.find(
            (st) => st.stop_id === endStop.stop_id
          );

          const busTime =
            startStopTime && endStopTime
              ? calculateTimeDifference(
                  startStopTime.arrival_time,
                  endStopTime.arrival_time
                )
              : 20; // デフォルト値

          options.push({
            startStop,
            endStop,
            bus,
            route: routeInfo,
            walkDistanceToStart,
            walkDistanceFromEnd,
            totalDistance,
            estimatedTime: walkingTime + busTime,
            transfers: 0,
            fare,
          });
        });
      });
    });

    // ソート
    return sortRoutes(options, sortBy);
  };

  const calculateTimeDifference = (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);
    return Math.abs(h2 * 60 + m2 - (h1 * 60 + m1));
  };

  const sortRoutes = (
    routes: RouteOption[],
    sortBy: "time" | "fare" | "transfers"
  ): RouteOption[] => {
    return [...routes].sort((a, b) => {
      switch (sortBy) {
        case "time":
          return a.estimatedTime - b.estimatedTime;
        case "fare":
          return a.fare - b.fare;
        case "transfers":
          return a.transfers - b.transfers;
        default:
          return 0;
      }
    });
  };

  const routeOptions = findRouteOptions();
  const bestRoute = routeOptions[0];

  if (!bestRoute) {
    return (
      <div className="bg-neutral-800 p-4 rounded-lg text-white">
        <h3 className="font-bold text-lg mb-2">ルートが見つかりませんでした</h3>
        <p className="text-sm text-gray-400">
          現在利用可能なバスがないか、経路が見つかりません。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 p-4 rounded-lg text-white">
      <h3 className="font-bold text-lg mb-2">
        {origin.name}から{destination.name}までの推奨ルート
      </h3>
      <div className="space-y-4">
        {/* 徒歩区間1 */}
        <div className="border-l-2 border-blue-500 pl-3">
          <p className="text-sm text-gray-300">1. 最寄りバス停まで徒歩</p>
          <p className="font-medium">{bestRoute.startStop.stop_name}</p>
          <p className="text-sm text-gray-400">
            {Math.round(bestRoute.walkDistanceToStart)}m （約
            {Math.round(bestRoute.walkDistanceToStart / WALK_SPEED)}分）
          </p>
        </div>

        {/* バス乗車区間 */}
        <div className="border-l-2 border-green-500 pl-3">
          <p className="text-sm text-gray-300">2. バス乗車</p>
          <p className="font-medium">{bestRoute.route.route_short_name}</p>
          <div className="text-sm text-gray-400">
            <p>
              混雑状況:{" "}
              {getOccupancyStatusText(
                bestRoute.bus.vehicle?.occupancyStatus || ""
              )}
            </p>
            <p>運賃: {bestRoute.fare}円</p>
            {bestRoute.bus.vehicle?.position?.speed !== undefined && (
              <p>
                現在速度:{" "}
                {Math.round(bestRoute.bus.vehicle.position.speed * 3.6)}km/h
              </p>
            )}
          </div>
        </div>

        {/* 徒歩区間2 */}
        <div className="border-l-2 border-blue-500 pl-3">
          <p className="text-sm text-gray-300">3. 目的地まで徒歩</p>
          <p className="font-medium">
            {bestRoute.endStop.stop_name}から{destination.name}
          </p>
          <p className="text-sm text-gray-400">
            {Math.round(bestRoute.walkDistanceFromEnd)}m （約
            {Math.round(bestRoute.walkDistanceFromEnd / WALK_SPEED)}分）
          </p>
        </div>

        {/* 合計時間と運賃 */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="font-bold">
            合計: 約{Math.round(bestRoute.estimatedTime)}分 / {bestRoute.fare}円
          </p>
        </div>
      </div>
    </div>
  );
}
