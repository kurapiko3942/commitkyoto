import {
  GTFSStop,
  GTFSStopTime,
  GTFSRealtimeVehicle,
  GTFSTrip,
  GTFSRoute,
} from "../types/gtfsTypes";
/**
 *一つの停留所を指定するとその停留所に対応するルートを返す
 * @param stop 一つの停留所
 * @param stopTimes 静的データ
 * @param trips 静的データ
 * @param routes 静的データ
 * @returns　一つの停留所に対応する複数のルート
 */

export const getRouteFromStop = (
  stop: GTFSStop,
  stopTimes: GTFSStopTime[],
  trips: GTFSTrip[],
  routes: GTFSRoute[]
): GTFSRoute[] => {
  const stopTimeIds = stopTimes
    .filter((stopTime) => stopTime.stop_id == stop.stop_id)
    .map((st) => st.trip_id);

  const tripIds = trips
    .filter((trip) => stopTimeIds.includes(trip.trip_id))
    .map((t) => t.route_id);

  const uniqueRoutes = routes.filter((route) =>
    tripIds.includes(route.route_id)
  );

  return uniqueRoutes;
};
/**
 * 一つのルートを指定するとそのルートに対応する停留所を返す
 * @param route 一つのルート
 * @param stopTimes 静的データ
 * @param trips 静的データ
 * @param stops 静的データ
 * @returns 一つのルートに対応する複数の停留所
 */

export const getStopFromRoute = (
  route: GTFSRoute,
  stopTimes: GTFSStopTime[],
  trips: GTFSTrip[],
  stops: GTFSStop[]
): GTFSStop[] => {
  const tripIds = trips
    .filter((trip) => trip.route_id == route.route_id)
    .map((trip) => trip.trip_id);
  const stopIds = stopTimes
    .filter((stopTime) => tripIds.includes(stopTime.trip_id))
    .map((stopTime) => stopTime.stop_id);
  const uniqueStops = stops.filter((stop) => stopIds.includes(stop.stop_id));
  return uniqueStops;
};
interface StopTime {
  arrival_time: string;
  departure_time: string;
}
/**
 * 一つのtripIdと停留所を指定するとそのルートと停留所に対応する時刻を返す
 * @param route 一つのルート
 * @param stopTimes 静的データ
 * @param trips 動的なリアルタイムデータ
 * @param stop 一つの停留所
 * @returns 一つのルートと停留所に対応する時刻
 */
interface Trip {
  trip_id: string;
  routeId: number;
  direction_id: number;
  start_time: string;
  start_date: string;
  schedule_relationship: string;
}
export const getRoutenameFromRouteId = (
  routeId: number,
  routes: GTFSRoute[]
): string => {
  const route = routes.find((route) => route.route_id == routeId);
  return route ? route.route_long_name : "";
};
export const getStopTimeFromRouteAndStop = (
  stopId: string,
  stopTimes: GTFSStopTime[],
  trips: GTFSRealtimeVehicle[] | undefined
): StopTime => {
  if (!trips) return { arrival_time: "", departure_time: "" };
  const tripIds = trips.map((trip) => trip.vehicle?.trip?.tripId);
  console.log(tripIds);
  const stopTime = stopTimes.filter((stopTime) =>
    tripIds.includes(stopTime.trip_id)
  );
  const stopTime2 = stopTime.find((stopTime) => stopTime.stop_id == stopId);
  if (stopTime2)
    return {
      arrival_time: stopTime2.arrival_time,
      departure_time: stopTime2.departure_time,
    };
  return { arrival_time: "", departure_time: "" };
};
export const getStopIdfromStopName = (
  stopName: string,
  stops: GTFSStop[]
): string => {
  const stop = stops.find((stop) => stop.stop_name == stopName);
  return stop ? stop.stop_id : "";
};
