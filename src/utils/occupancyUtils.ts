// src/utils/occupancyUtils.ts

import { OccupancyLevel, OccupancyThreshold } from '../types/routeTypes';

// 混雑度に応じた色を返す
export const getOccupancyColor = (level: OccupancyLevel): string => {
  switch (level) {
    case OccupancyLevel.EMPTY:
      return '#4ade80'; // 緑
    case OccupancyLevel.MANY_SEATS_AVAILABLE:
      return '#84cc16'; // 黄緑
    case OccupancyLevel.FEW_SEATS_AVAILABLE:
      return '#facc15'; // 黄色
    case OccupancyLevel.STANDING_ROOM_ONLY:
      return '#f97316'; // オレンジ
    case OccupancyLevel.CRUSHED_STANDING_ROOM:
      return '#ef4444'; // 赤
    case OccupancyLevel.FULL:
      return '#dc2626'; // 濃い赤
    case OccupancyLevel.NOT_ACCEPTING:
      return '#a855f7'; // 紫
    default:
      return '#4ade80'; // デフォルトは緑
  }
};

// 混雑度が閾値を超えているかチェック
export const shouldSuggestAlternative = (
  currentOccupancy: OccupancyLevel,
  hasTrunk: boolean,
  threshold: OccupancyThreshold
): boolean => {
  const relevantThreshold = hasTrunk ? threshold.withTrunk : threshold.withoutTrunk;
  return currentOccupancy > relevantThreshold;
};

// 混雑度の説明文を返す
export const getOccupancyDescription = (level: OccupancyLevel): string => {
  switch (level) {
    case OccupancyLevel.EMPTY:
      return 'ほとんど空いています';
    case OccupancyLevel.MANY_SEATS_AVAILABLE:
      return '座席に余裕があります';
    case OccupancyLevel.FEW_SEATS_AVAILABLE:
      return '座席が少し残っています';
    case OccupancyLevel.STANDING_ROOM_ONLY:
      return '立ち乗りのみ可能です';
    case OccupancyLevel.CRUSHED_STANDING_ROOM:
      return '混雑しています';
    case OccupancyLevel.FULL:
      return '非常に混雑しています';
    case OccupancyLevel.NOT_ACCEPTING:
      return '乗車できない可能性があります';
    default:
      return '混雑状況不明';
  }
};

// エラーメッセージを取得
export const getOccupancyErrorMessage = (hasTrunk: boolean): string => {
  return hasTrunk
    ? 'トランクがあるため、より空いている便をお勧めします'
    : '混雑のため、他の便をお勧めします';
};