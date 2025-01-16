//コンポーネントのProps型定義
import { 
    GTFSRoute, 
    GTFSStop, 
    GTFSRealtimeVehicle, 
    GTFSFareAttribute, 
    GTFSFareRule,
    GTFSStopTime 
  } from './gtfsTypes';
import { RouteOption } from './routeTypes';
  
  export interface RouteResultProps {
    fromSpot: {
      id: string;
      name: string;
      position: [number, number];
    };
    toSpot: {
      id: string;
      name: string;
      position: [number, number];
    };
    stops: GTFSStop[];
    vehicles: GTFSRealtimeVehicle[];
    routes: GTFSRoute[];
    fareAttributes: GTFSFareAttribute[];
    fareRules: GTFSFareRule[];
    stopTimes: GTFSStopTime[];
    sortBy: 'time' | 'fare' | 'transfers';
  }
  
  export interface RouteDisplayProps {
    route: RouteOption;
    isExpanded: boolean;
    onToggle: () => void;
    type: 'fastest' | 'comfortable';
  }