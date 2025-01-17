// src/components/layouts/RouteDisplay/RouteContainer.tsx

import React from 'react';
import { RouteCalculationResult } from '@/types/routeTypes';
import RouteStop from './RouteStop';
import RouteSummary from './RouteSummary';
import RouteAlternatives from './RouteAlternatives';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface RouteContainerProps {
  result: RouteCalculationResult;
  loading?: boolean;
}

const RouteContainer: React.FC<RouteContainerProps> = ({
  result,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (result.error) {
    return (
      <Alert variant="destructive" className="bg-red-900 border-red-800">
        <AlertDescription>
          {result.error === 'FETCH_ERROR' && 'データ取得に失敗しました'}
          {result.error === 'CALCULATION_ERROR' && '経路探索に失敗しました'}
          {result.error === 'NO_SERVICE' && '現在の時間帯は運行していません'}
          {result.error === 'REALTIME_ERROR' && '混雑度情報の取得に失敗しました。時刻表の情報のみ表示します'}
        </AlertDescription>
      </Alert>
    );
  }

  const mainRoute = result.mainRoute;
  if (!mainRoute) {
    return null;
  }

  return (
    <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-200px)] p-4">
      {/* メインルート */}
      <div>
        <h3 className="text-white font-medium mb-4">推奨ルート</h3>
        
        {/* ルート概要 */}
        <RouteSummary
          departureName={mainRoute.departureStop.name}
          departureTime={mainRoute.departureStop.time}
          arrivalName={mainRoute.arrivalStop.name}
          arrivalTime={mainRoute.arrivalStop.time}
          fareAmount={mainRoute.fareAmount}
          totalTime={mainRoute.totalTime}
        />

        {/* バス停リスト */}
        <div className="mt-4 space-y-2">
          {mainRoute.stops.map((stop, index) => (
            <RouteStop
              key={`main-${stop.stop.stop_id}`}
              routeStop={stop}
              isFirst={index === 0}
              isLast={index === mainRoute.stops.length - 1}
            />
          ))}
        </div>
      </div>

      {/* 代替ルート */}
      {result.alternativeRoutes.length > 0 && (
        <RouteAlternatives routes={result.alternativeRoutes} />
      )}
    </div>
  );
};

export default RouteContainer;