import { TouristSpot } from "../types/routeTypes";
import { GTFSStop } from "../types/gtfsTypes";
import { calculateDistance } from "./K5distance";

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
