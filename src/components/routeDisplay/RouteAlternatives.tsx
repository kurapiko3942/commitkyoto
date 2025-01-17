import React, { useState } from 'react';
import { AlternativeRoute } from '@/types/routeTypes';
import { getOccupancyColor, getOccupancyDescription } from '@/utils/occupancyUtils';
import RouteStop from './RouteStop';
import RouteSummary from './RouteSummary';
import { ChevronDown, ChevronRight, Bus } from 'lucide-react';

interface RouteAlternativesProps {
  routes: AlternativeRoute[];
  onSelect?: (route: AlternativeRoute) => void;
}

const RouteAlternatives: React.FC<RouteAlternativesProps> = ({
  routes,
  onSelect
}) => {
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  if (routes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium mb-2">別ルートの提案</h3>
      
      {routes.map((route, index) => {
        const isExpanded = expandedRouteId === route.id;
        const busColor = getOccupancyColor(route.occupancyLevel);

        return (
          <div 
            key={route.id}
            className="bg-neutral-800 rounded-lg overflow-hidden"
          >
            {/* ルートヘッダー */}
            <div
              className="p-4 cursor-pointer hover:bg-neutral-700"
              onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bus size={20} style={{ color: busColor }} />
                  <span className="text-white font-medium">
                    ルート {String.fromCharCode(65 + index)}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="text-white" size={20} />
                ) : (
                  <ChevronRight className="text-white" size={20} />
                )}
              </div>
              
              {/* 代替ルートの理由 */}
              <p className="text-gray-400 text-sm mt-1">
                {route.reason.description}
              </p>
              
              {/* 混雑度 */}
              <p className="text-gray-400 text-sm mt-1">
                混雑状況: {getOccupancyDescription(route.occupancyLevel)}
              </p>

              {/* 徒歩距離がある場合 */}
              {route.walkingDistance && (
                <p className="text-gray-400 text-sm mt-1">
                  徒歩: 
                  {route.walkingDistance.toFirstStop && route.walkingDistance.toFirstStop > 0 && 
                    ` 出発地から${route.walkingDistance.toFirstStop.toFixed(1)}km`}
                  {route.walkingDistance.fromLastStop && route.walkingDistance.fromLastStop > 0 && 
                    ` 目的地まで${route.walkingDistance.fromLastStop.toFixed(1)}km`}
                </p>
              )}
            </div>

            {/* 展開時の詳細表示 */}
            {isExpanded && (
              <div className="border-t border-neutral-700 p-4">
                {/* ルート概要 */}
                <RouteSummary
                  departureName={route.departureStop.name}
                  departureTime={route.departureStop.time}
                  arrivalName={route.arrivalStop.name}
                  arrivalTime={route.arrivalStop.time}
                  fareAmount={route.fareAmount}
                  totalTime={route.totalTime}
                />

                {/* バス停リスト */}
                <div className="mt-4 space-y-2">
                  {route.stops.map((stop, stopIndex) => (
                    <RouteStop
                      key={`${route.id}-${stop.stop.stop_id}`}
                      routeStop={stop}
                      isFirst={stopIndex === 0}
                      isLast={stopIndex === route.stops.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RouteAlternatives;