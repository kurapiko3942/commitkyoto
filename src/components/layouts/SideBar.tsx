//src/components/layouts/SideBar.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BusStopsToTo } from "@/utils/K5IsBusToTo";
import { useState } from "react";
import { useGTFSData } from "@/hooks/useGTFSData";
import { TouristSpot } from "@/types/routeTypes";
import { StartToStopDistance } from "@/utils/K5distance";
import { ArrowLeftRight, Search } from "lucide-react";

// 観光地の一覧
const TOURIST_SPOTS = [
  {
    id: "kinkakuji",
    name: "金閣寺",
    position: [35.0394, 135.7292] as [number, number],
  },
  {
    id: "ginkakuji",
    name: "銀閣寺",
    position: [35.0271, 135.7982] as [number, number],
  },
  {
    id: "kiyomizu",
    name: "清水寺",
    position: [34.9948, 135.7847] as [number, number],
  },
  {
    id: "shijo",
    name: "四条河原町",
    position: [35.0038, 135.7682] as [number, number],
  },
  {
    id: "kyotostation",
    name: "京都駅",
    position: [34.9858, 135.7588] as [number, number],
  },
];

export default function SideBar() {
  // GTFS データの取得
  const {
    routes,
    stops,
    stopTimes,
    vehicles,
    fareAttributes,
    fareRules,
    loading: gtfsLoading,
    error: gtfsError,
  } = useGTFSData();

  console.log("routes", routes[0]);
  console.log("stops", stops[0]);
  console.log("stopTimes", stopTimes[0]);
  console.log("vehicles", vehicles[0]);
  console.log("fareAttributes", fareAttributes[0]);
  console.log("fareRules", fareRules[0]);

  // 状態管理
  const [fromSpot, setFromSpot] = useState<TouristSpot | null>(null);
  const [toSpot, setToSpot] = useState<TouristSpot | null>(null);

  const [isReverse, setIsReverse] = useState(false);

  // ルート計算

  // 検索開始
  const handleSearch = () => {
    if (!fromSpot || !toSpot || gtfsLoading) return;

    console.log("一番近いやつ", StartToStopDistance(fromSpot, stops));
    console.log("目的地一キロ以内のバス停", BusStopsToTo(toSpot, stops, 1));
  };

  // 方向を反転
  const handleReverseDirection = () => {
    setIsReverse(!isReverse);
    // 検索状態をリセット
  };

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
          <SheetTitle className="text-white mt-5">
            観光地間のルート案内
          </SheetTitle>

          {/* 出発地・目的地の選択 */}
          <div className="space-y-4 mt-4">
            {/* 出発地選択 */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <Label className="block text-white mb-2">
                {isReverse ? "到着地" : "出発地"}
              </Label>
              <select
                className="w-full bg-neutral-700 text-white p-2 rounded"
                onChange={(e) => {
                  const spot = TOURIST_SPOTS.find(
                    (s) => s.id === e.target.value
                  );
                  setFromSpot(spot || null);
                }}
                value={fromSpot?.id || ""}
              >
                <option value="">選択してください</option>
                {TOURIST_SPOTS.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 方向転換ボタン */}
            <Button
              variant="ghost"
              className="w-full text-white hover:bg-neutral-800"
              onClick={handleReverseDirection}
            >
              <ArrowLeftRight className="mr-2" />
              方向を変更
            </Button>

            {/* 目的地選択 */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <Label className="block text-white mb-2">
                {isReverse ? "出発地" : "到着地"}
              </Label>
              <select
                className="w-full bg-neutral-700 text-white p-2 rounded"
                onChange={(e) => {
                  const spot = TOURIST_SPOTS.find(
                    (s) => s.id === e.target.value
                  );
                  setToSpot(spot || null);
                }}
                value={toSpot?.id || ""}
              >
                <option value="">選択してください</option>
                {TOURIST_SPOTS.map((spot) => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSearch}
              disabled={!fromSpot || !toSpot || gtfsLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              経路を検索
            </Button>

            {/* データ確認用の表示領域 */}
          </div>
          {/* ルート表示 */}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
