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
  // ソート

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
