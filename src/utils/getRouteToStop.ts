import {
  GTFSStop,
  GTFSStopTime,
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
  console.log("route", uniqueRoutes);
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
