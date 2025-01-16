"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,  
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useGTFSData } from "@/hooks/useGTFSData";
import { GTFSRealtimeVehicle, GTFSRoute, GTFSStop } from "@/types/gtfsTypes";
import { RouteResult } from "./routeResult";
import { useRoute } from "@/context/routeContext";

// 観光地の一覧
const TOURIST_SPOTS = [
  {
    id: "kinkakuji",
    name: "金閣寺",
    position: [35.0394, 135.7292] as [number, number]
  },
  {
    id: "ginkakuji", 
    name: "銀閣寺",
    position: [35.0271, 135.7982] as [number, number]
  },
  {
    id: "kiyomizu",
    name: "清水寺", 
    position: [34.9948, 135.7847] as [number, number]
  },
  {
    id: "shijo",
    name: "四条河原町",
    position: [35.0038, 135.7682] as [number, number]
  },
  {
    id: "kyotostation",
    name: "京都駅",
    position: [34.9858, 135.7588] as [number, number]
  }
];

interface TouristSpot {
  id: string;
  name: string;
  position: [number, number];
}

export default function SideBar() {
  const { routes, stops, vehicles, fareAttributes, fareRules } = useGTFSData();
  const [fromSpot, setFromSpot] = useState<TouristSpot | null>(null);
  const [toSpot, setToSpot] = useState<TouristSpot | null>(null);
  const [sortBy, setSortBy] = useState<'time' | 'fare' | 'transfers'>('time');
  const { selectedRoute, setSelectedRoute } = useRoute();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="fixed right-4 top-4 z-10 bg-white hover:bg-gray-100"
        >
          観光地間ルート検索
        </Button>
      </SheetTrigger>
      <SheetContent 
        className="bg-neutral-900 overflow-y-auto w-[400px]" 
        onPointerDownOutside={(e) => e.preventDefault()} 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader>
          <div className="flex justify-between items-center">
            <SheetTitle className="text-white mt-5">観光地間のルート案内</SheetTitle>
            {selectedRoute && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFromSpot(null);
                  setToSpot(null);
                  setSelectedRoute(null);
                }}
                className="text-white border-white hover:bg-neutral-800"
              >
                経路選択を解除
              </Button>
            )}
          </div>
          <SheetDescription className="space-y-4">
            {/* 出発地選択 */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <label className="block text-white mb-2">出発地</label>
              <select
                className="w-full bg-neutral-700 text-white p-2 rounded"
                onChange={(e) => {
                  const spot = TOURIST_SPOTS.find(s => s.id === e.target.value);
                  setFromSpot(spot || null);
                }}
                value={fromSpot?.id || ""}
              >
                <option value="">出発地を選択</option>
                {TOURIST_SPOTS.map(spot => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 目的地選択 */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <label className="block text-white mb-2">目的地</label>
              <select
                className="w-full bg-neutral-700 text-white p-2 rounded"
                onChange={(e) => {
                  const spot = TOURIST_SPOTS.find(s => s.id === e.target.value);
                  setToSpot(spot || null);
                }}
                value={toSpot?.id || ""}
              >
                <option value="">目的地を選択</option>
                {TOURIST_SPOTS.map(spot => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ソート選択 */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <label className="block text-white mb-2">ルートの並び替え</label>
              <select
                className="w-full bg-neutral-700 text-white p-2 rounded"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'time' | 'fare' | 'transfers')}
              >
                <option value="time">所要時間が短い順</option>
                <option value="fare">運賃が安い順</option>
                <option value="transfers">乗換回数が少ない順</option>
              </select>
            </div>

            {/* ルート検索結果 */}
            {fromSpot && toSpot && (
              <RouteResult
                fromSpot={fromSpot}
                toSpot={toSpot}
                stops={stops}
                vehicles={vehicles}
                routes={routes}
                fareAttributes={fareAttributes}
                fareRules={fareRules}
                sortBy={sortBy} stopTimes={[]}              />
            )}
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}