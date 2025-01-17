// src/utils/routeUtils.ts

import { GTFSStop, GTFSRoute, GTFSStopTime } from '../types/gtfsTypes';
import { RouteInfo, TouristSpot, RouteStop, OccupancyLevel } from '../types/routeTypes';

// 2点間の距離を計算 (ヘイバーサイン公式)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // 地球の半径(km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// 観光地から最寄りのバス停を見つける
export const findNearestStops = (
  spot: TouristSpot,
  stops: GTFSStop[],
  maxDistance: number = 1 // デフォルト1km
): GTFSStop[] => {
  return stops
    .map(stop => ({
      stop,
      distance: calculateDistance(
        spot.position[0],
        spot.position[1],
        stop.stop_lat,
        stop.stop_lon
      )
    }))
    .filter(item => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .map(item => item.stop);
};

// 時刻文字列を分に変換
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 分を時刻文字列に変換
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// 現在時刻に基づいてバスの位置を判定
export const calculateBusPosition = (
  currentTime: string,
  departureTime: string,
  arrivalTime: string
): { isAtStop: boolean; progress: number } => {
  const current = timeToMinutes(currentTime);
  const departure = timeToMinutes(departureTime);
  const arrival = timeToMinutes(arrivalTime);

  // バスがまだ出発していない、または既に到着している場合
  if (current <= departure) return { isAtStop: true, progress: 0 };
  if (current >= arrival) return { isAtStop: true, progress: 1 };

  // バス停間の移動中
  const totalTime = arrival - departure;
  const elapsedTime = current - departure;
  const progress = elapsedTime / totalTime;

  return { isAtStop: false, progress };
};

// 運賃を計算
export const calculateFare = (
  route: { route_id: number },
  fromStop: { stop_id: string },
  toStop: { stop_id: string },
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
  }>
): number => {
  // 1. ルートに対応する運賃ルールを探す
  const routeFareRules = fareRules.filter(rule => 
    rule.route_id === route.route_id &&
    (!rule.origin_id || rule.origin_id === fromStop.stop_id) &&
    (!rule.destination_id || rule.destination_id === toStop.stop_id)
  );

  if (routeFareRules.length === 0) {
    return 0; // デフォルトの運賃ルールが見つからない場合
  }

  // 2. 最適な運賃ルールを選択（この実装では最初のルールを使用）
  const selectedRule = routeFareRules[0];

  // 3. 運賃属性から価格を取得
  const fareAttribute = fareAttributes.find(attr => 
    attr.fare_id === selectedRule.fare_id
  );

  return fareAttribute ? fareAttribute.price : 0;
};

// 総所要時間を計算
export const calculateTotalTime = (
  firstDeparture: string,
  lastArrival: string
): string => {
  const startMinutes = timeToMinutes(firstDeparture);
  const endMinutes = timeToMinutes(lastArrival);
  const totalMinutes = endMinutes - startMinutes;
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
};

// バス停情報を生成
export const createRouteStop = (
  stop: GTFSStop,
  stopTime: GTFSStopTime,
  currentTime: string,
  occupancyLevel: OccupancyLevel
): RouteStop => {
  const { isAtStop, progress } = calculateBusPosition(
    currentTime,
    stopTime.departure_time,
    stopTime.arrival_time
  );

  return {
    stop,
    arrivalTime: stopTime.arrival_time,
    departureTime: stopTime.departure_time,
    isCurrentLocation: !isAtStop && progress > 0 && progress < 1,
    isBusAtStop: isAtStop,
    occupancyLevel
  };
};

// 現在の運行時間内かチェック
export const isWithinServiceHours = (
  currentTime: string,
  serviceStartTime: string,
  serviceEndTime: string
): boolean => {
  const current = timeToMinutes(currentTime);
  const start = timeToMinutes(serviceStartTime);
  const end = timeToMinutes(serviceEndTime);
  return current >= start && current <= end;
};