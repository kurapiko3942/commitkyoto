// components/layouts/RouteResult.tsx
import { calculateDistance } from '@/utils/distance';
import { getOccupancyStatusText } from '@/utils/occupancyStatus';
import { GTFSRealtimeVehicle, GTFSRoute, GTFSStop } from "@/types/gtfsTypes";

interface RouteResultProps {
  fromSpot: {
    id: string;
    name: string;
    position: [number, number];
  };
  toSpot: {
    id: string;
    name: string;
    position: [number, number];
  };
  stops: GTFSStop[];
  vehicles: GTFSRealtimeVehicle[];
  routes: GTFSRoute[];
}

export function RouteResult({ fromSpot, toSpot, stops, vehicles, routes }: RouteResultProps) {
  const WALK_SPEED = 80; // 分速80m

  // 最寄りのバス停を見つける関数
  const findNearestStop = (position: [number, number], maxDistance: number = 1000) => {
    return stops.reduce<{ stop: GTFSStop; distance: number } | null>((nearest, stop) => {
      const distance = calculateDistance(
        position[0],
        position[1],
        stop.stop_lat,
        stop.stop_lon
      );
      if (distance > maxDistance) return nearest;
      return (!nearest || distance < nearest.distance) 
        ? { stop, distance } 
        : nearest;
    }, null);
  };

  // 2地点間の最適なバスルートを見つける
  const findBestRoute = () => {
    const fromNearestStop = findNearestStop(fromSpot.position);
    const toNearestStop = findNearestStop(toSpot.position);

    if (!fromNearestStop || !toNearestStop) return null;

    // この2つのバス停を通る路線を探す
    const availableRoutes = routes.filter(route => {
      // ここでルートの判定ロジックを実装
      // 実際のGTFSデータ構造に応じて調整が必要
      return true;
    });

    if (availableRoutes.length === 0) return null;

    // 各ルートで現在運行中のバスを探す
    const routeOptions = availableRoutes.map(route => {
      const busesOnRoute = vehicles.filter(v => 
        v.vehicle?.trip?.routeId === route.route_id
      );

      return {
        route,
        buses: busesOnRoute,
        fromStop: fromNearestStop,
        toStop: toNearestStop
      };
    });

    // 最適なルートを選択（バスの位置、混雑度などを考慮）
    return routeOptions[0];
  };

  const bestRoute = findBestRoute();

  if (!bestRoute) {
    return (
      <div className="bg-neutral-800 p-4 rounded-lg text-white">
        <p>直接のバスルートが見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-800 p-4 rounded-lg text-white">
      <h3 className="font-bold mb-4">{fromSpot.name} から {toSpot.name} へのルート</h3>
      
      <div className="space-y-4">
        {/* 出発地からバス停まで */}
        <div className="border-l-2 border-blue-500 pl-3">
          <p>1. バス停まで徒歩</p>
          <p className="text-sm text-gray-400">
            {bestRoute.fromStop.stop.stop_name}まで
            {Math.round(bestRoute.fromStop.distance)}m
            （約{Math.round(bestRoute.fromStop.distance / WALK_SPEED)}分）
          </p>
        </div>

        {/* バス乗車区間 */}
        <div className="border-l-2 border-green-500 pl-3">
          <p>2. バス乗車</p>
          <p className="text-sm text-gray-400">
            路線: {bestRoute.route.route_short_name}
            {bestRoute.buses[0] && (
              <span className="ml-2">
                （{getOccupancyStatusText(bestRoute.buses[0].vehicle?.occupancyStatus || "")}）
              </span>
            )}
          </p>
        </div>

        {/* バス停から目的地まで */}
        <div className="border-l-2 border-blue-500 pl-3">
          <p>3. 目的地まで徒歩</p>
          <p className="text-sm text-gray-400">
            {bestRoute.toStop.stop.stop_name}から
            {Math.round(bestRoute.toStop.distance)}m
            （約{Math.round(bestRoute.toStop.distance / WALK_SPEED)}分）
          </p>
        </div>
      </div>
    </div>
  );
}