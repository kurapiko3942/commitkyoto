// GTFS Realtime のエンティティ型定義
import { Icon, IconOptions } from "leaflet";

export interface GTFSRealtimeVehicle {
  id: string;
  is_deleted?: boolean;
  vehicle?: {
    trip?: {
      trip_id?: string;
      routeId?: string;
      direction_id?: number;
      start_time?: string;
      start_date?: string;
      schedule_relationship?: string;
    };
    position?: {
      latitude: number;
      longitude: number;
      bearing?: number;
      odometer?: number;
      speed?: number;
    };
    current_stop_sequence?: number;
    current_status?: string;
    timestamp?: string;
    congestion_level?: string;
    stop_id?: string;
    vehicle?: {
      id: string;
      label?: string;
      license_plate?: string;
    };
    occupancyStatus?: string; // この行を追加
  };
}
// 静的GTFS データの型定義
export interface GTFSRoute {
  route_id: number;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
}
export interface GTFSStop {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  location_type?: number;
  parent_station?: string;
  wheelchair_boarding?: number;
}
export interface GTFSTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign: string;
  direction_id: string;
}

// APIレスポンスの型定義
export interface GTFSRealtimeResponse {
  header: {
    gtfs_realtime_version: string;
    timestamp: string;
    incrementality: string;
  };
  entity: GTFSRealtimeVehicle[];
}

// マーカーアイコンの設定用interface
export interface GTFSMapIcons {
  busIcon: Icon;
  stopIcon: Icon;
}

// アイコン設定のための定数
export const MAP_ICONS: GTFSMapIcons = {
  busIcon: new Icon({
    iconUrl: "/bus-icon.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  }),
  stopIcon: new Icon({
    iconUrl: "/bus-stop.svg",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  }),
};
