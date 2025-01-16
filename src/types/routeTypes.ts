// types/routeTypes.ts
export interface RouteStep {
    time: string;
    location: string;
    type: 'start' | 'walk' | 'bus' | 'end';
    duration?: number;
    distance?: number;
    busDetails?: {
      routeId: number;
      routeName: string;
      occupancyStatus: string;
    };
  }
  
  export interface RouteOption {
    type: 'fastest' | 'comfortable';
    totalTime: number;
    totalFare: number;
    steps: RouteStep[];
    crowdLevel?: string;
  }
  
  // 共通の型定義を追加
  export type RouteType = 'fastest' | 'comfortable';
  export type StepType = 'start' | 'walk' | 'bus' | 'end';