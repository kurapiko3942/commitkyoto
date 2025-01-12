// GTFS Realtime のエンティティ型定義

export interface GTFSRealtimeVehicle {
    id: string;
    is_deleted?: boolean;
    vehicle?: {
      trip?: {
        trip_id?: string;
        route_id?: string;
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
      occupancy_status?: string;
    };
  }
  
  // 静的GTFS データの型定義
  export interface GTFSRoute {
    route_id: string;
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