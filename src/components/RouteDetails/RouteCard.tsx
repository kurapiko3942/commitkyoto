// src/components/RouteDetails/RouteCard.tsx
import React, { useState } from 'react';
import { RouteTimeline } from './RouteTimeline';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RouteCardProps {
  type: 'fastest' | 'comfortable';
  steps: Array<{
    time: string;
    location: string;
    type: 'start' | 'walk' | 'bus' | 'end';
    details?: {
      duration?: number;
      distance?: number;
      routeName?: string;
      crowdLevel?: string;
    };
  }>;
  totalTime: number;
  totalFare: number;
  crowdLevel?: string;
}

export function RouteCard({ type, steps, totalTime, totalFare, crowdLevel }: RouteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-neutral-800 rounded-lg overflow-hidden">
      {/* ヘッダー部分 - 常に表示 */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {type === 'fastest' ? '最短経路' : '快適ルート'}
            </h3>
            <p className="text-sm text-gray-400">
              {Math.round(totalTime)}分 / {totalFare}円
            </p>
          </div>
          <div className="flex items-center">
            {crowdLevel && (
              <span className="text-sm text-gray-400 mr-4">
                混雑度: {crowdLevel}
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* 詳細部分 - 展開時のみ表示 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-700">
          <RouteTimeline 
            steps={steps}
            fare={totalFare}
          />
        </div>
      )}
    </div>
  );
}