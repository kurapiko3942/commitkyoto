import { TouristSpot } from "../types/routeTypes";
import { GTFSStop } from "../types/gtfsTypes";
/**
 * 出発地から最短のバス停の位置を返す
 * @param spot 出発地
 * @param stops 静的なバス停データ
 * @returns 出発地からの最短のバス停を返す
 */
export const StartToStopMinimumDistanceStop = (
  spot: TouristSpot,
  stops: GTFSStop[]
): GTFSStop | null => {
  if (stops.length === 0) return null;

  const nearestStop = stops
    .map((stop) => ({
      stop,
      distance: calculateDistance(
        spot.position[0],
        spot.position[1],
        stop.stop_lat,
        stop.stop_lon
      ),
    }))
    .sort((a, b) => a.distance - b.distance)[0];

  return nearestStop ? nearestStop.stop : null;
};

/**
 * 2つの座標間の距離を計算する関数（Haversine formulaを使用）
 * @param lat1 出発地の緯度
 * @param lon1 出発地の経度
 * @param lat2 バス停の緯度
 * @param lon2 バス停の経度
 * @returns 距離（キロメートル）
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // 地球の半径（キロメートル）
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};
/**
 * 目的地から1キロ以内のバス停を返す
 * @param spot 目的地
 * @param stops 静的なバス停データ
 * @param max 最大距離（キロメートル）
 * @returns 目的地から1キロ以内のバス停のリスト
 */
export const BusStopsToTo = (
  spot: TouristSpot,
  stops: GTFSStop[],
  max: number = 1
): GTFSStop[] => {
  if (stops.length === 0) {
    return [];
  }

  const stopsWithDistance = stops.map((stop) => {
    // 緯度と経度をログに出力して確認
    const distance = calculateDistance(
      spot.position[0],
      spot.position[1],
      stop.stop_lat,
      stop.stop_lon
    );
    return { stop, distance };
  });

  const filteredStops = stopsWithDistance.filter(
    (item) => item.distance <= max
  );

  return filteredStops.map((item) => item.stop);
};
