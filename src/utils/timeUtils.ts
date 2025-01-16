import { GTFSRealtimeVehicle, GTFSStopTime } from "@/types/gtfsTypes";
import { RouteOption } from "@/types/routeTypes";

// utils/timeUtils.ts
export const timeUtils = {
    // HH:MM形式の時刻文字列をDate型に変換
    parseTime(timeStr: string): Date {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    },
  
    // Date型からHH:MM形式の文字列を生成
    formatTime(date: Date): string {
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    },
  
    // 現在時刻から次の出発時刻を計算
    getNextDepartureTime(stopTimes: GTFSStopTime[], currentTime: Date): GTFSStopTime | null {
      const currentTimeString = this.formatTime(currentTime);
      return stopTimes
        .filter(st => st.departure_time > currentTimeString)
        .sort((a, b) => a.departure_time.localeCompare(b.departure_time))[0] || null;
    },
  
    // 2つの時刻の差分を分単位で計算
    calculateTimeDifference(time1: string, time2: string): number {
      const t1 = this.parseTime(time1);
      const t2 = this.parseTime(time2);
      return Math.abs((t2.getTime() - t1.getTime()) / (1000 * 60));
    }
  };
  
  // utils/distanceUtils.ts
  export const distanceUtils = {
    // 2点間の距離をメートル単位で計算（ヘルシン公式）
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
      const R = 6371000; // 地球の半径（メートル）
      const φ1 = lat1 * Math.PI/180;
      const φ2 = lat2 * Math.PI/180;
      const Δφ = (lat2-lat1) * Math.PI/180;
      const Δλ = (lon2-lon1) * Math.PI/180;
  
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
      return R * c;
    },
  
    // 徒歩時間を計算（分単位）
    calculateWalkingTime(distance: number, speed: number = 80): number {
      return Math.ceil(distance / speed); // 80m/分として計算
    }
  };
  
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
  
  // utils/routeOptimizer.ts
  export const routeOptimizer = {
    // 代替ルートの評価
    evaluateRoute(route: RouteOption, vehicles: GTFSRealtimeVehicle[]): number {
      let score = 0;
      
      // 所要時間による評価（負の値）
      score -= route.totalTime;
      
      // 運賃による評価（負の値）
      score -= route.totalFare / 100;
      
      // 混雑度による評価
      const crowdingPenalty = this.calculateCrowdingPenalty(route, vehicles);
      score -= crowdingPenalty;
      
      return score;
    },
  
    // 混雑度によるペナルティを計算
    calculateCrowdingPenalty(route: RouteOption, vehicles: GTFSRealtimeVehicle[]): number {
      const busSteps = route.steps.filter(step => step.type === 'bus');
      let totalPenalty = 0;
  
      busSteps.forEach(step => {
        if (step.busDetails?.occupancyStatus) {
          const penalty = {
            'EMPTY': 0,
            'MANY_SEATS_AVAILABLE': 0,
            'FEW_SEATS_AVAILABLE': 2,
            'STANDING_ROOM_ONLY': 5,
            'CRUSHED_STANDING_ROOM_ONLY': 10,
            'FULL': 15
          }[step.busDetails.occupancyStatus] || 0;
          
          totalPenalty += penalty;
        }
      });
  
      return totalPenalty;
    }
  };