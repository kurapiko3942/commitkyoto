// src/components/RouteDetails/RouteTimeline.tsx
import React from "react";
import { RouteStep } from "@/types/routeTypes";
import { CrowdingIndicator } from "./CrowdingIndicator";

interface RouteTimelineProps {
  steps: RouteStep[];
  fare: number;
}

export function RouteTimeline({ steps, fare }: RouteTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 text-sm text-white">
        運賃: {fare}円
      </div>

      <div className="space-y-6 relative">
        <div className="absolute left-[7.5rem] top-8 bottom-8 w-0.5 bg-gray-600" />

        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="w-28 text-gray-400 text-sm pt-1">
              {step.time}
            </div>

            <div className="relative z-10">
              <div className={`w-3 h-3 rounded-full ${
                step.type === 'start' ? 'bg-green-500' :
                step.type === 'end' ? 'bg-red-500' :
                'bg-blue-500'
              }`} />
            </div>

            <div className="ml-4 flex-1">
              <div className="text-white">{step.location}</div>
              {(step.duration || step.distance || step.busDetails) && (
                <div className="text-sm text-gray-400 mt-1">
                  {step.type === 'walk' && (
                    <>
                      徒歩 {step.duration}分
                      {step.distance && ` (${Math.round(step.distance)}m)`}
                    </>
                  )}
                  {step.type === 'bus' && step.busDetails && (
                    <div className="space-y-1">
                      <div>路線: {step.busDetails.routeName}</div>
                      <CrowdingIndicator status={step.busDetails.occupancyStatus} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}