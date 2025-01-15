// src/utils/occupancyStatus.ts
export const getOccupancyStatusText = (status: string): string => {
    switch (status) {
      case 'EMPTY':
        return '空席あり（ガラガラ）';
      case 'MANY_SEATS_AVAILABLE':
        return '空席多数';
      case 'FEW_SEATS_AVAILABLE':
        return '残り座席わずか';
      case 'STANDING_ROOM_ONLY':
        return '立ち乗りのみ';
      case 'CRUSHED_STANDING_ROOM_ONLY':
        return '混雑（立ち乗り）';
      case 'FULL':
        return '満員';
      case 'NOT_ACCEPTING_PASSENGERS':
        return '乗車不可';
      case 'NO_DATA_AVAILABLE':
      case 'UNKNOWN_CONGESTION_LEVEL':
      default:
        return '混雑状況不明';
    }
  };
  
  export const getOccupancyStatusColor = (status: string): string => {
    switch (status) {
      case 'EMPTY':
      case 'MANY_SEATS_AVAILABLE':
        return 'text-green-600';
      case 'FEW_SEATS_AVAILABLE':
        return 'text-yellow-600';
      case 'STANDING_ROOM_ONLY':
      case 'CRUSHED_STANDING_ROOM_ONLY':
        return 'text-orange-600';
      case 'FULL':
      case 'NOT_ACCEPTING_PASSENGERS':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };