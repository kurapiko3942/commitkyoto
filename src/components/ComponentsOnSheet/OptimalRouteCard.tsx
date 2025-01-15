// components/ComponentsOnSheet/OptimalRouteCard.tsx
import { calculateDistance } from '@/utils/distance';
import { getOccupancyStatusText } from '@/utils/occupancyStatus';
import { GTFSRealtimeVehicle, GTFSRoute, GTFSStop } from "@/types/gtfsTypes";

interface OptimalRouteCardProps {
  destination: {
    id: string;
    name: string;
    position: [number, number];
  };
  stops: GTFSStop[];
  vehicles: GTFSRealtimeVehicle[];
  routes: GTFSRoute[];
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
}

export function OptimalRouteCard({ destination, stops, vehicles, routes }: OptimalRouteCardProps) {
  const WALK_SPEED = 80; // 分速80m
  const MAX_WALKING_DISTANCE = 1000; // 最大徒歩距離 1km

  const findRouteOptions = (): RouteOption[] => {
    const options: RouteOption[] = [];
    const currentPosition: [number, number] = [35.0116, 135.7681]; // 現在地（仮）

    // 1. 現在地から徒歩圏内のバス停を探す
    const nearbyStartStops = stops.filter(stop => {
      const distance = calculateDistance(
        currentPosition[0],
        currentPosition[1],
        stop.stop_lat,
        stop.stop_lon
      );
      return distance <= MAX_WALKING_DISTANCE;
    });

    // 2. 目的地から徒歩圏内のバス停を探す
    const nearbyEndStops = stops.filter(stop => {
      const distance = calculateDistance(
        destination.position[0],
        destination.position[1],
        stop.stop_lat,
        stop.stop_lon
      );
      return distance <= MAX_WALKING_DISTANCE;
    });

    // 3. 各バス停の組み合わせでルートを探索
    nearbyStartStops.forEach(startStop => {
      nearbyEndStops.forEach(endStop => {
        // 利用可能なバスを探す
        const availableBuses = vehicles.filter(vehicle => {
          const routeInfo = routes.find(r => r.route_id === vehicle.vehicle?.trip?.routeId);
          if (!routeInfo) return false;

          // このバスルートが開始バス停と終了バス停を通るか確認
          // Note: 実際のGTFSデータ構造に応じて、この判定ロジックは調整が必要です
          return true; // 仮の実装
        });

        availableBuses.forEach(bus => {
          const routeInfo = routes.find(r => r.route_id === bus.vehicle?.trip?.routeId);
          if (!routeInfo) return;

          const walkDistanceToStart = calculateDistance(
            currentPosition[0],
            currentPosition[1],
            startStop.stop_lat,
            startStop.stop_lon
          );

          const walkDistanceFromEnd = calculateDistance(
            destination.position[0],
            destination.position[1],
            endStop.stop_lat,
            endStop.stop_lon
          );

          const totalDistance = walkDistanceToStart + walkDistanceFromEnd;
          const walkingTime = (walkDistanceToStart + walkDistanceFromEnd) / WALK_SPEED;
          const busTime = 20; // 仮の値（実際には経路から計算）

          options.push({
            startStop,
            endStop,
            bus,
            route: routeInfo,
            walkDistanceToStart,
            walkDistanceFromEnd,
            totalDistance,
            estimatedTime: walkingTime + busTime,
            transfers: 0
          });
        });
      });
    });

    // ルートをスコアで並び替え
    return options.sort((a, b) => {
      // 乗り換え回数、総距離、バスの混雑度などを考慮したスコアリング
      const scoreA = calculateRouteScore(a);
      const scoreB = calculateRouteScore(b);
      return scoreB - scoreA;
    });
  };

  const calculateRouteScore = (route: RouteOption): number => {
    const walkingPenalty = route.totalDistance / 100;
    const transferPenalty = route.transfers * 10;
    const crowdingScore = route.bus.vehicle?.occupancyStatus === 'MANY_SEATS_AVAILABLE' ? 10 :
                         route.bus.vehicle?.occupancyStatus === 'FEW_SEATS_AVAILABLE' ? 5 : 0;

    return 100 - walkingPenalty - transferPenalty + crowdingScore;
  };

  const routeOptions = findRouteOptions();
  const bestRoute = routeOptions[0];

  if (!bestRoute) return null;

  return (
    <div className="bg-neutral-800 p-4 rounded-lg text-white">
      <h3 className="font-bold text-lg mb-2">{destination.name}までの推奨ルート</h3>
      <div className="space-y-4">
        {/* 徒歩区間1 */}
        <div className="border-l-2 border-blue-500 pl-3">
          <p className="text-sm text-gray-300">1. 最寄りバス停まで徒歩</p>
          <p className="font-medium">{bestRoute.startStop.stop_name}</p>
          <p className="text-sm text-gray-400">
            {Math.round(bestRoute.walkDistanceToStart)}m
            （約{Math.round(bestRoute.walkDistanceToStart / WALK_SPEED)}分）
          </p>
        </div>

        {/* バス乗車区間 */}
        <div className="border-l-2 border-green-500 pl-3">
          <p className="text-sm text-gray-300">2. バス乗車</p>
          <p className="font-medium">{bestRoute.route.route_short_name}</p>
          <div className="text-sm text-gray-400">
            <p>混雑状況: {getOccupancyStatusText(bestRoute.bus.vehicle?.occupancyStatus || "")}</p>
            <p>次のバス: 約{Math.round(Math.random() * 10 + 5)}分後</p>
          </div>
        </div>

        {/* 徒歩区間2 */}
        <div className="border-l-2 border-blue-500 pl-3">
          <p className="text-sm text-gray-300">3. 目的地まで徒歩</p>
          <p className="font-medium">{bestRoute.endStop.stop_name}から{destination.name}</p>
          <p className="text-sm text-gray-400">
            {Math.round(bestRoute.walkDistanceFromEnd)}m
            （約{Math.round(bestRoute.walkDistanceFromEnd / WALK_SPEED)}分）
          </p>
        </div>

        {/* 合計時間 */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="font-bold">
            合計: 約{Math.round(bestRoute.estimatedTime)}分
          </p>
        </div>
      </div>
    </div>
  );
}