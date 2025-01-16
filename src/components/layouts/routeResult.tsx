import { 
    GTFSRoute, 
    GTFSStop, 
    GTFSRealtimeVehicle, 
    GTFSFareAttribute, 
    GTFSFareRule,
    GTFSStopTime
  } from "@/types/gtfsTypes";
  import { OptimalRouteCard } from "@/components/ComponentsOnSheet/OptimalRouteCard";
  
  interface RouteResultProps {
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
  
  export function RouteResult({
    fromSpot,
    toSpot,
    stops,
    vehicles,
    routes,
    fareAttributes,
    fareRules,
    stopTimes,
    sortBy
  }: RouteResultProps) {
    console.log('RouteResult received:', {
      fromSpot,
      toSpot,
      stopsCount: stops?.length,
      vehiclesCount: vehicles?.length,
      routesCount: routes?.length,
      fareAttributesCount: fareAttributes?.length,
      fareRulesCount: fareRules?.length,
      stopTimesCount: stopTimes?.length,
    });
  
    if (!stops?.length || !vehicles?.length || !routes?.length) {
      return (
        <div className="bg-neutral-800 p-4 rounded-lg text-white">
          <p>データを読み込み中...</p>
        </div>
      );
    }
  
    return (
      <div className="space-y-4">
        <OptimalRouteCard
          destination={toSpot}
          origin={fromSpot}
          stops={stops}
          vehicles={vehicles}
          routes={routes}
          fareAttributes={fareAttributes}
          fareRules={fareRules}
          stopTimes={stopTimes}
          sortBy={sortBy}
        />
      </div>
    );
  }