import React from 'react';
import { CircleOff, CircleDot, ArrowRight } from 'lucide-react';

interface RouteSummaryProps {
  departureName: string;
  departureTime: string;
  arrivalName: string;
  arrivalTime: string;
  fareAmount: number;
  totalTime: string;
}

const RouteSummary: React.FC<RouteSummaryProps> = ({
  departureName,
  departureTime,
  arrivalName,
  arrivalTime,
  fareAmount,
  totalTime
}) => {
  return (
    <div className="bg-neutral-800 p-4 rounded-lg">
      {/* 出発・到着情報 */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* 出発地 */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CircleOff className="text-white" size={16} />
            <span className="text-white font-medium">{departureName}</span>
          </div>
          <span className="text-sm text-gray-300">{departureTime}</span>
        </div>

        {/* 矢印 */}
        <ArrowRight className="text-white flex-shrink-0" size={24} />

        {/* 到着地 */}
        <div className="flex-1 text-right">
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-white font-medium">{arrivalName}</span>
            <CircleDot className="text-white" size={16} />
          </div>
          <span className="text-sm text-gray-300">{arrivalTime}</span>
        </div>
      </div>

      {/* 運賃と所要時間 */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">
          運賃: {fareAmount}円
        </span>
        <span className="text-gray-300">
          所要時間: {totalTime}
        </span>
      </div>
    </div>
  );
};

export default RouteSummary;