// utils/crowdingUtils.ts
export const crowdingUtils = {
    // 混雑度の判定
    isCrowded(occupancyStatus: string): boolean {
      const crowdedStatuses = [
        'STANDING_ROOM_ONLY',
        'CRUSHED_STANDING_ROOM_ONLY',
        'FULL'
      ];
      return crowdedStatuses.includes(occupancyStatus);
    },
  
    // 混雑度レベルの取得（表示用）
    getCrowdingLevel(occupancyStatus: string): string {
      const levels: Record<string, string> = {
        'EMPTY': '空いています',
        'MANY_SEATS_AVAILABLE': '座席に余裕あり',
        'FEW_SEATS_AVAILABLE': '座席わずか',
        'STANDING_ROOM_ONLY': '立ち席のみ',
        'CRUSHED_STANDING_ROOM_ONLY': '混雑',
        'FULL': '満員',
        'NOT_ACCEPTING_PASSENGERS': '乗車不可'
      };
      return levels[occupancyStatus] || '不明';
    }
  };