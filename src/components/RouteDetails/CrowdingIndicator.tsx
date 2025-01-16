// src/components/RouteDetails/CrowdingIndicator.tsx
import React from 'react';

interface CrowdingIndicatorProps {
 status: string;
 size?: 'sm' | 'md' | 'lg';
 showLabel?: boolean;
}

const crowdingLevels = {
 'EMPTY': {
   label: '空いています',
   color: 'bg-green-500',
   textColor: 'text-green-500'
 },
 'MANY_SEATS_AVAILABLE': {
   label: '座席に余裕あり',
   color: 'bg-green-400',
   textColor: 'text-green-400'
 },
 'FEW_SEATS_AVAILABLE': {
   label: '座席わずか',
   color: 'bg-yellow-500',
   textColor: 'text-yellow-500'
 },
 'STANDING_ROOM_ONLY': {
   label: '立ち席のみ',
   color: 'bg-orange-500',
   textColor: 'text-orange-500'
 },
 'CRUSHED_STANDING_ROOM_ONLY': {
   label: '混雑',
   color: 'bg-red-500',
   textColor: 'text-red-500'
 },
 'FULL': {
   label: '満員',
   color: 'bg-red-600',
   textColor: 'text-red-600'
 },
 'NOT_ACCEPTING_PASSENGERS': {
   label: '乗車不可',
   color: 'bg-gray-500',
   textColor: 'text-gray-500'
 }
};

export function CrowdingIndicator({ 
 status, 
 size = 'md',
 showLabel = true 
}: CrowdingIndicatorProps) {
 const levelInfo = crowdingLevels[status as keyof typeof crowdingLevels] || {
   label: '不明',
   color: 'bg-gray-400',
   textColor: 'text-gray-400'
 };

 const sizeClasses = {
   sm: 'w-2 h-2',
   md: 'w-3 h-3',
   lg: 'w-4 h-4'
 };

 return (
   <div className="flex items-center space-x-2">
     <div className={`${sizeClasses[size]} ${levelInfo.color} rounded-full`} />
     {showLabel && (
       <span className={`text-sm ${levelInfo.textColor}`}>
         {levelInfo.label}
       </span>
     )}
   </div>
 );
}

// バッジスタイルのバリエーション
export function CrowdingBadge({ status }: { status: string }) {
 const levelInfo = crowdingLevels[status as keyof typeof crowdingLevels] || {
   label: '不明',
   color: 'bg-gray-400',
   textColor: 'text-gray-400'
 };

 return (
   <div className={`
     inline-flex items-center px-2 py-1 rounded-full
     ${levelInfo.color} bg-opacity-20
     ${levelInfo.textColor}
     text-xs font-medium
   `}>
     <div className={`w-1.5 h-1.5 ${levelInfo.color} rounded-full mr-1`} />
     {levelInfo.label}
   </div>
 );
}