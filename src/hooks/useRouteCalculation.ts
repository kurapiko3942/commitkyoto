// src/hooks/useRouteCalculation.ts

import { useState, useEffect } from 'react';
import { 
  RouteCalculationResult,
  TouristSpot,
  RouteInfo,
  AlternativeRoute,
  OccupancyLevel,
  RouteError,
  RouteStop
} from '../types/routeTypes';
import {
  findNearestStops,
  calculateTotalTime,
  createRouteStop,
  isWithinServiceHours,
  calculateDistance,
  calculateFare,
  timeToMinutes
} from '../utils/routeUtils';
import { shouldSuggestAlternative } from '../utils/occupancyUtils';
import { GTFSRealtimeVehicle, GTFSRoute, GTFSStop, GTFSStopTime } from '../types/gtfsTypes';

interface UseRouteCalculationProps {
  fromSpot: TouristSpot | null;
  toSpot: TouristSpot | null;
  hasTrunk: boolean;
  routes: GTFSRoute[];
  stops: GTFSStop[];
  stopTimes: GTFSStopTime[];
  vehicles: GTFSRealtimeVehicle[];
  fareRules: Array<{
    fare_id: string;
    route_id: number;
    origin_id?: string;
    destination_id?: string;
  }>;
  fareAttributes: Array<{
    fare_id: string;
    price: number;
    currency_type: string;
    payment_method: number;
    transfers: number;
  }>;
}

export function useRouteCalculation({
  fromSpot,
  toSpot,
  hasTrunk,
  routes,
  stops,
  stopTimes,
  vehicles,
  fareRules,
  fareAttributes
}: UseRouteCalculationProps) {
  const [result, setResult] = useState<RouteCalculationResult>({
    mainRoute: null,
    alternativeRoutes: [],
  });

  useEffect(() => {
    if (!fromSpot || !toSpot || !routes.length || !stops.length || !stopTimes.length) {
    
      return;
    }

    try {
      // 最寄りのバス停を探す
      const nearestFromStops = findNearestStops(fromSpot, stops);
      const nearestToStops = findNearestStops(toSpot, stops);

      if (!nearestFromStops.length || !nearestToStops.length) {
       
        setResult({
          mainRoute: null,
          alternativeRoutes: [],
          error: 'CALCULATION_ERROR'
        });
        return;
      }

     

      // 現在の時刻を取得
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // メインルートを計算
      const mainRoute = calculateMainRoute(
        nearestFromStops[0],
        nearestToStops[0],
        routes,
        stops,
        stopTimes,
        vehicles,
        fareRules,
        fareAttributes,
        currentTime
      );

      if (!mainRoute) {
       
        setResult({
          mainRoute: null,
          alternativeRoutes: [],
          error: 'CALCULATION_ERROR'
        });
        return;
      }

      // 代替ルートを計算
      const alternativeRoutes = calculateAlternativeRoutes(
        mainRoute,
        nearestFromStops,
        nearestToStops,
        routes,
        stops,
        stopTimes,
        vehicles,
        fareRules,
        fareAttributes,
        currentTime,
        hasTrunk
      );

      setResult({
        mainRoute,
        alternativeRoutes,
      });

    } catch (error) {
      console.error('Route calculation error:', error);
      setResult({
        mainRoute: null,
        alternativeRoutes: [],
        error: 'CALCULATION_ERROR'
      });
    }
  }, [fromSpot, toSpot, hasTrunk, routes, stops, stopTimes, vehicles, fareRules, fareAttributes]);

  return result;
}

function calculateMainRoute(
  fromStop: GTFSStop,
  toStop: GTFSStop,
  routes: GTFSRoute[],
  stops: GTFSStop[],
  stopTimes: GTFSStopTime[],
  vehicles: GTFSRealtimeVehicle[],
  fareRules: Array<{
    fare_id: string;
    route_id: number;
    origin_id?: string;
    destination_id?: string;
  }>,
  fareAttributes: Array<{
    fare_id: string;
    price: number;
    currency_type: string;
    payment_method: number;
    transfers: number;
  }>,
  currentTime: string
): RouteInfo | null {
  try {
   

    // 1. 目的地のバス停を通るルートを見つける
    const destinationStopTimes = stopTimes.filter(st => st.stop_id === toStop.stop_id);
   
    // ルートIDを抽出（trip_idの最初の部分がroute_id）
    const possibleRouteIds = new Set(
      destinationStopTimes.map(st => {
        const routeId = parseInt(st.trip_id.split('_')[0]);
        return routeId;
      })
    );
  

    // 2. それらのルートの中から、出発地点に最も近いバス停を持つルートを探す
    const validRoutes: {
      route: GTFSRoute;
      fromStopTime: GTFSStopTime;
      toStopTime: GTFSStopTime;
      tripId: string;
    }[] = [];

    for (const routeId of possibleRouteIds) {
      const route = routes.find(r => r.route_id === routeId);
      if (!route) continue;

      // このルートの全てのtrip_idを取得
      const tripIds = new Set(
        stopTimes
          .filter(st => st.trip_id.startsWith(String(routeId)))
          .map(st => st.trip_id)
      );

      for (const tripId of tripIds) {
        // このtripの全停車バス停を時系列順に取得
        const tripStopTimes = stopTimes
          .filter(st => st.trip_id === tripId)
          .sort((a, b) => a.stop_sequence - b.stop_sequence);

        // 目的地のバス停を含むか確認
        const toStopTimeIndex = tripStopTimes.findIndex(st => st.stop_id === toStop.stop_id);
        if (toStopTimeIndex === -1) continue;

        // 出発地に最も近いバス停を探す
        for (let i = 0; i < toStopTimeIndex; i++) {
          const potentialFromStop = stops.find(s => s.stop_id === tripStopTimes[i].stop_id);
          if (!potentialFromStop) continue;

          const distance = calculateDistance(
            fromStop.stop_lat,
            fromStop.stop_lon,
            potentialFromStop.stop_lat,
            potentialFromStop.stop_lon
          );

          // 1km以内のバス停を候補とする
          if (distance <= 1) {
            validRoutes.push({
              route,
              fromStopTime: tripStopTimes[i],
              toStopTime: tripStopTimes[toStopTimeIndex],
              tripId,
            });
            break;  // このtripでは最初に見つかった近いバス停を使用
          }
        }
      }
    }

  

    if (validRoutes.length === 0) {
     
      return null;
    }

    // 3. 最適なルートを選択（ここでは最初に見つかったものを使用）
    const selectedRoute = validRoutes[0];
  

    // 4. ルート情報を構築
    const tripStopTimes = stopTimes
      .filter(st => st.trip_id === selectedRoute.tripId)
      .sort((a, b) => a.stop_sequence - b.stop_sequence);

    const fromStopIndex = tripStopTimes.findIndex(st => st.stop_id === selectedRoute.fromStopTime.stop_id);
    const toStopIndex = tripStopTimes.findIndex(st => st.stop_id === selectedRoute.toStopTime.stop_id);
    
    const relevantStops = tripStopTimes.slice(fromStopIndex, toStopIndex + 1);

    // 5. 混雑度の取得
    const currentVehicle = vehicles.find(v => v.vehicle?.trip?.trip_id === selectedRoute.tripId);
    const occupancyLevel = currentVehicle?.vehicle?.occupancyStatus 
      ? Number(currentVehicle.vehicle.occupancyStatus) as OccupancyLevel
      : OccupancyLevel.EMPTY;

    // 6. RouteStopの配列を作成
    const stopsMap = new Map(stops.map(s => [s.stop_id, s]));
    const routeStops: RouteStop[] = relevantStops.map(stopTime => {
      const stop = stopsMap.get(stopTime.stop_id);
      if (!stop) throw new Error(`Stop not found: ${stopTime.stop_id}`);
      return createRouteStop(stop, stopTime, currentTime, occupancyLevel);
    });

    // 7. 運賃を計算
    const fareAmount = calculateFare(
      selectedRoute.route,
      fromStop,
      toStop,
      fareRules,
      fareAttributes
    );

    return {
      id: `route-${selectedRoute.route.route_id}-${selectedRoute.tripId}`,
      route: selectedRoute.route,
      stops: routeStops,
      fareAmount,
      totalTime: calculateTotalTime(
        relevantStops[0].departure_time,
        relevantStops[relevantStops.length - 1].arrival_time
      ),
      departureStop: {
        name: fromStop.stop_name,
        time: relevantStops[0].departure_time
      },
      arrivalStop: {
        name: toStop.stop_name,
        time: relevantStops[relevantStops.length - 1].arrival_time
      },
      occupancyLevel
    };

  } catch (error) {
    console.error('Error in calculateMainRoute:', error);
    return null;
  }
}

function calculateAlternativeRoutes(
  mainRoute: RouteInfo | null,
  fromStops: GTFSStop[],
  toStops: GTFSStop[],
  routes: GTFSRoute[],
  stops: GTFSStop[],
  stopTimes: GTFSStopTime[],
  vehicles: GTFSRealtimeVehicle[],
  fareRules: Array<{
    fare_id: string;
    route_id: number;
    origin_id?: string;
    destination_id?: string;
  }>,
  fareAttributes: Array<{
    fare_id: string;
    price: number;
    currency_type: string;
    payment_method: number;
    transfers: number;
  }>,
  currentTime: string,
  hasTrunk: boolean
): AlternativeRoute[] {
  if (!mainRoute) return [];

 
  const alternatives: AlternativeRoute[] = [];

  try {
    const threshold = hasTrunk ? OccupancyLevel.MANY_SEATS_AVAILABLE : OccupancyLevel.STANDING_ROOM_ONLY;

    // メインルートが混んでいる場合、同じルートの次の便を探す
    if (mainRoute.occupancyLevel > threshold) {
     
      // 目的地のバス停を通る他の便を探す
      const destinationStopTimes = stopTimes.filter(st => 
        st.stop_id === mainRoute.arrivalStop.name &&
        timeToMinutes(st.arrival_time) > timeToMinutes(mainRoute.arrivalStop.time)
      );

      if (destinationStopTimes.length > 0) {
        const nextTrip = destinationStopTimes[0];
        const alternativeRoute = calculateMainRoute(
          fromStops[0],
          toStops[0],
          [mainRoute.route],
          stops,
          [nextTrip],
          vehicles,
          fareRules,
          fareAttributes,
          currentTime
        );

        if (alternativeRoute) {
          alternatives.push({
            ...alternativeRoute,
            reason: {
              type: 'OCCUPANCY',
              description: '混雑を避けるため、次の便をお勧めします'
            }
          });
        }
      }
    }

    // 他のルートを探す
    const otherRoutes = routes.filter(route => route.route_id !== mainRoute.route.route_id);
    for (const route of otherRoutes) {
      const alternativeRoute = calculateMainRoute(
        fromStops[0],
        toStops[0],
        [route],
        stops,
        stopTimes,
        vehicles,
        fareRules,
        fareAttributes,
        currentTime
      );

      if (alternativeRoute && alternativeRoute.occupancyLevel <= threshold) {
        alternatives.push({
          ...alternativeRoute,
          reason: {
            type: 'LESS_WALKING',
            description: '少し歩きますが、混雑の少ない経路があります'
          }
        });
      }
    }

   
    return alternatives;

  } catch (error) {
    console.error('Error in calculateAlternativeRoutes:', error);
    return [];
  }
}