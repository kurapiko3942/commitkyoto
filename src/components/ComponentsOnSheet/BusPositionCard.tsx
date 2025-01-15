// components/ComponentsOnSheet/BusPositionCard.tsx
import { GTFSRealtimeVehicle, GTFSRoute } from "@/types/gtfsTypes";
import { getOccupancyStatusText } from "@/utils/occupancyStatus";

interface BusPositionCardProps {
  vehicle: GTFSRealtimeVehicle;
  routes: GTFSRoute[];
}

export function BusPositionCard({ vehicle, routes }: BusPositionCardProps) {
  const routeInfo = routes.find((r) => 
    r.route_id === vehicle.vehicle?.trip?.routeId
  );

  return (
    <div className="bg-white rounded-lg p-4 mb-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {/* バスアイコンまたはナンバー */}
        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white">
          {vehicle.id}
        </div>
        
        {/* バス情報 */}
        <div>
          <p className="font-semibold">
            {routeInfo ? `${routeInfo.route_short_name || ''} ${routeInfo.route_long_name || ''}` : '不明'}
          </p>
          <div className="text-sm text-gray-500">
            <p>{`バスID: ${vehicle.id}`}</p>
          </div>
        </div>
      </div>

      {/* 運行状態 */}
      <div className="text-right">
        {vehicle.vehicle?.occupancyStatus && (
          <p className="text-sm text-gray-600">
            {getOccupancyStatusText(vehicle.vehicle.occupancyStatus)}
          </p>
        )}
        {vehicle.vehicle?.position?.speed !== undefined && (
          <p className="text-sm text-gray-600">
            {Math.round(vehicle.vehicle.position.speed)} m/s
          </p>
        )}
        {vehicle.vehicle?.timestamp && (
          <p className="text-xs text-gray-400">
            更新: {new Date(parseInt(vehicle.vehicle.timestamp) * 1000).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}