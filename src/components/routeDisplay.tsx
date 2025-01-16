// src/components/RouteDisplay.tsx
import { RouteOption } from '@/types/routeTypes';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { RouteTimeline } from './RouteDetails/RouteTimeline';

// ComponentProps の定義を修正
export interface RouteDisplayProps {
  route: RouteOption;
  isExpanded: boolean;
  onToggle: () => void;
}

// type プロパティを削除し、route.type を使用するように修正
export function RouteDisplay({
  route,
  isExpanded,
  onToggle
}: RouteDisplayProps) {
  return (
    <div className="bg-neutral-800 rounded-lg overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-neutral-700 transition-colors"
        onClick={onToggle}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {route.type === 'fastest' ? '最短経路' : '快適ルート'}
            </h3>
            <div className="text-sm text-gray-400">
              所要時間: {Math.round(route.totalTime)}分
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-white">{route.totalFare}円</div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          <RouteTimeline 
            steps={route.steps}
            fare={route.totalFare}
          />
        </div>
      )}
    </div>
  );
}