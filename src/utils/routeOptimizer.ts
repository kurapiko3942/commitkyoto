import { GTFSRealtimeVehicle } from "@/types/gtfsTypes";
import { RouteOption } from "@/types/routeTypes";

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