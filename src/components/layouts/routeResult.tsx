// src/utils/routeCalculator.ts
import { 
    GTFSRoute, 
    GTFSStop, 
    GTFSRealtimeVehicle, 
    GTFSFareAttribute, 
    GTFSFareRule,
    GTFSStopTime 
   } from '@/types/gtfsTypes';
   import { RouteOption, RouteStep } from '@/types/routeTypes';
import { calculateDistance } from '@/utils/distance';
  
   
   interface CalculateRoutesParams {
    fromSpot: { position: [number, number]; name: string; };
    toSpot: { position: [number, number]; name: string; };
    stops: GTFSStop[];
    vehicles: GTFSRealtimeVehicle[];
    routes: GTFSRoute[];
    stopTimes: GTFSStopTime[];
    fareAttributes: GTFSFareAttribute[];
    fareRules: GTFSFareRule[];
   }
   
   interface RouteCalculationResult {
    fastest: RouteOption;
    comfortable?: RouteOption;
   }
   
   const WALK_SPEED = 80; // 分速80m
   const MAX_WALKING_DISTANCE = 1000; // 最大徒歩距離 1km
   
   function findNearbyStops(
    position: [number, number],
    stops: GTFSStop[],
    maxDistance: number = MAX_WALKING_DISTANCE
   ): GTFSStop[] {
    return stops.filter(stop => {
      const distance = calculateDistance(
        position[0],
        position[1],
        stop.stop_lat,
        stop.stop_lon
      );
      return distance <= maxDistance;
    });
   }
   
   function calculateTimeDifference(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return Math.abs((h2 * 60 + m2) - (h1 * 60 + m1));
   }
   
   function calculateRoutesFromStop({
    startStop,
    toSpot,
    vehicles,
    routes,
    stopTimes,
    fareRules,
    fareAttributes,
    currentTime,
    allStops
   }: {
    startStop: GTFSStop;
    toSpot: { position: [number, number]; name: string; };
    vehicles: GTFSRealtimeVehicle[];
    routes: GTFSRoute[];
    stopTimes: GTFSStopTime[];
    fareRules: GTFSFareRule[];
    fareAttributes: GTFSFareAttribute[];
    currentTime: string;
    allStops: GTFSStop[];
   }): RouteOption[] {
    const possibleRoutes: RouteOption[] = [];
    const endStops = findNearbyStops([toSpot.position[0], toSpot.position[1]], allStops);
   
    for (const endStop of endStops) {
      const availableBuses = vehicles.filter(vehicle => {
        const routeInfo = routes.find(r => r.route_id === vehicle.vehicle?.trip?.routeId);
        if (!routeInfo) return false;
   
        const relevantStopTimes = stopTimes.filter(st => 
          st.trip_id === vehicle.vehicle?.trip?.trip_id
        );
        const stopsOnRoute = relevantStopTimes.map(st => st.stop_id);
        
        return stopsOnRoute.includes(startStop.stop_id) && 
               stopsOnRoute.includes(endStop.stop_id);
      });
   
      for (const bus of availableBuses) {
        const routeInfo = routes.find(r => r.route_id === bus.vehicle?.trip?.routeId);
        if (!routeInfo) continue;
   
        const steps: RouteStep[] = [];
        let totalTime = 0;
   
        // 初期徒歩区間
        const walkToStartDistance = calculateDistance(
          startStop.stop_lat,
          startStop.stop_lon,
          Number(toSpot.position[0]),
          Number(toSpot.position[1])
        );
        const walkToStartTime = Math.ceil(walkToStartDistance / WALK_SPEED);
        totalTime += walkToStartTime;
   
        // バス乗車区間
        const relevantStopTimes = stopTimes
          .filter(st => st.trip_id === bus.vehicle?.trip?.trip_id)
          .sort((a, b) => a.stop_sequence - b.stop_sequence);
        
        const startStopTime = relevantStopTimes.find(st => st.stop_id === startStop.stop_id);
        const endStopTime = relevantStopTimes.find(st => st.stop_id === endStop.stop_id);
        
        if (startStopTime && endStopTime) {
          const busTime = calculateTimeDifference(startStopTime.arrival_time, endStopTime.arrival_time);
          totalTime += busTime;
   
          // 運賃計算
          const fareRule = fareRules.find(rule => rule.route_id === routeInfo.route_id);
          const fareAttribute = fareRule ? 
            fareAttributes.find(attr => attr.fare_id === fareRule.fare_id) :
            null;
          const fare = fareAttribute ? fareAttribute.price : 0;
   
          // 最終徒歩区間
          const walkToDestDistance = calculateDistance(
            endStop.stop_lat,
            endStop.stop_lon,
            Number(toSpot.position[0]),
            Number(toSpot.position[1])
          );
          const walkToDestTime = Math.ceil(walkToDestDistance / WALK_SPEED);
          totalTime += walkToDestTime;
   
          steps.push(
            {
              type: 'start',
              time: currentTime,
              location: startStop.stop_name,
              duration: 0
            },
            {
              type: 'walk',
              time: startStopTime.departure_time,
              location: startStop.stop_name,
              duration: walkToStartTime,
              distance: walkToStartDistance
            },
            {
              type: 'bus',
              time: endStopTime.arrival_time,
              location: endStop.stop_name,
              duration: busTime,
              busDetails: {
                routeId: routeInfo.route_id,
                routeName: routeInfo.route_short_name,
                occupancyStatus: bus.vehicle?.occupancyStatus || 'UNKNOWN'
              }
            },
            {
              type: 'walk',
              time: endStopTime.arrival_time,
              location: toSpot.name,
              duration: walkToDestTime,
              distance: walkToDestDistance
            }
          );
   
          possibleRoutes.push({
            type: 'fastest',
            totalTime,
            totalFare: fare,
            steps,
            crowdLevel: bus.vehicle?.occupancyStatus
          });
        }
      }
    }
   
    return possibleRoutes;
   }
   
   function selectFastestRoute(routes: RouteOption[]): RouteOption | undefined {
    return routes.length > 0 
      ? routes.sort((a, b) => a.totalTime - b.totalTime)[0]
      : undefined;
   }
   
   function findComfortableAlternative(
    routes: RouteOption[],
    vehicles: GTFSRealtimeVehicle[]
   ): RouteOption | undefined {
    return routes.find(route => {
      const busStep = route.steps.find(step => step.type === 'bus');
      if (!busStep?.busDetails) return false;
   
      const vehicle = vehicles.find(v => 
        v.vehicle?.trip?.routeId === busStep.busDetails?.routeId
      );
      
      return vehicle?.vehicle?.occupancyStatus === 'MANY_SEATS_AVAILABLE' ||
             vehicle?.vehicle?.occupancyStatus === 'EMPTY';
    });
   }
   
   export function calculateRoutes(params: CalculateRoutesParams): RouteCalculationResult {
    const now = new Date();
    const currentTime = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
   
    const nearbyStops = findNearbyStops(params.fromSpot.position, params.stops);
    let allRoutes: RouteOption[] = [];
   
    for (const startStop of nearbyStops) {
      const routes = calculateRoutesFromStop({
        startStop,
        toSpot: params.toSpot,
        vehicles: params.vehicles,
        routes: params.routes,
        stopTimes: params.stopTimes,
        fareRules: params.fareRules,
        fareAttributes: params.fareAttributes,
        currentTime,
        allStops: params.stops
      });
      allRoutes = [...allRoutes, ...routes];
    }
   
    const fastestRoute = selectFastestRoute(allRoutes);
    if (!fastestRoute) {
      return {
        fastest: {
          type: 'fastest',
          totalTime: 0,
          totalFare: 0,
          steps: [],
          crowdLevel: undefined
        },
        comfortable: undefined
      };
    }
   
    const comfortableRoute = findComfortableAlternative(allRoutes, params.vehicles);
   
    return {
      fastest: fastestRoute,
      comfortable: comfortableRoute
    };
   }