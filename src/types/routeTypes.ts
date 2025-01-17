// src/types/routeTypes.ts

import { GTFSStop, GTFSRoute } from './gtfsTypes';

// 観光地の型定義
export interface TouristSpot {
  id: string;
  name: string;
  position: [number, number];
}

// 混雑度レベルの定義
export enum OccupancyLevel {
  EMPTY = 0,               // 緑
  MANY_SEATS_AVAILABLE = 1, // 黄緑
  FEW_SEATS_AVAILABLE = 2,  // 黄色
  STANDING_ROOM_ONLY = 3,   // オレンジ
  CRUSHED_STANDING_ROOM = 4, // 赤
  FULL = 5,                // 濃い赤
  NOT_ACCEPTING = 6         // 紫
}

// バス停情報の型定義
export interface RouteStop {
  stop: GTFSStop;
  arrivalTime: string;
  departureTime: string;
  isCurrentLocation: boolean;
  isBusAtStop: boolean;
  occupancyLevel: OccupancyLevel;
}

// ルート情報の型定義
export interface RouteInfo {
  id: string;
  route: GTFSRoute;
  stops: RouteStop[];
  fareAmount: number;
  totalTime: string;
  departureStop: {
    name: string;
    time: string;
  };
  arrivalStop: {
    name: string;
    time: string;
  };
  walkingDistance?: {
    toFirstStop?: number;
    fromLastStop?: number;
  };
  occupancyLevel: OccupancyLevel;
}

// 代替ルートの理由
export interface AlternativeReason {
  type: 'OCCUPANCY' | 'FASTER' | 'LESS_WALKING';
  description: string;
}

// 代替ルート情報
export interface AlternativeRoute extends RouteInfo {
  reason: AlternativeReason;
}

// エラー状態の型定義
export type RouteError = 
  | 'FETCH_ERROR'
  | 'CALCULATION_ERROR'
  | 'NO_SERVICE'
  | 'REALTIME_ERROR';

// ルート計算の結果
export interface RouteCalculationResult {
  mainRoute: RouteInfo | null;
  alternativeRoutes: AlternativeRoute[];
  error?: RouteError;
}

// 混雑度の閾値設定
export interface OccupancyThreshold {
  withTrunk: OccupancyLevel;
  withoutTrunk: OccupancyLevel;
}

export const DEFAULT_OCCUPANCY_THRESHOLDS: OccupancyThreshold = {
  withTrunk: OccupancyLevel.MANY_SEATS_AVAILABLE,  // 黄緑まで
  withoutTrunk: OccupancyLevel.STANDING_ROOM_ONLY  // オレンジまで
};