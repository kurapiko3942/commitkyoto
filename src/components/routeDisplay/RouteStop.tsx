import React from 'react';
import { RouteStop as RouteStopType } from '@/types/routeTypes';
import { getOccupancyColor } from '@/utils/occupancyUtils';
import { Bus, CircleDot } from 'lucide-react';

interface RouteStopProps {
  routeStop: RouteStopType;
  isFirst: boolean;
  isLast: boolean;
}

const RouteStop: React.FC<RouteStopProps> = ({
  routeStop,
  isFirst,
  isLast
}) => {
  const {
    stop,
    arrivalTime,
    isBusAtStop,
    isCurrentLocation,
    occupancyLevel
  } = routeStop;

  const busColor = getOccupancyColor(occupancyLevel);

  return (
    <div className="relative flex items-center gap-4 py-2">
      {/* 垂直の線（最初と最後以外） */}
      {!isFirst && !isLast && (
        <div className="absolute left-2 h-full w-0.5 -translate-x-1/2 bg-gray-300" />
      )}

      {/* バス停アイコンまたはバス位置 */}
      <div className="relative z-10">
        {isBusAtStop && (
          <Bus
            className="absolute -left-4 -translate-y-1/2"
            style={{ color: busColor }}
            size={24}
          />
        )}
        <CircleDot className="text-gray-600" size={20} />
      </div>

      {/* バス停情報 */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{stop.stop_name}</span>
          <span className="text-sm text-gray-600">{arrivalTime}</span>
        </div>
      </div>

      {/* バスが停車地点間にいる場合 */}
      {isCurrentLocation && !isBusAtStop && (
        <Bus
          className="absolute left-2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ color: busColor }}
          size={24}
        />
      )}
    </div>
  );
};

export default RouteStop;