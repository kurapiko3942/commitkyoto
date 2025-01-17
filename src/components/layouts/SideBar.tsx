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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useGTFSData } from "@/hooks/useGTFSData";
import { TouristSpot } from '@/types/routeTypes';
import { GTFSRoute, GTFSStop, GTFSStopTime } from '@/types/gtfsTypes';
import { useRouteCalculation } from "@/hooks/useRouteCalculation";

import { ArrowLeftRight, Search } from "lucide-react";
import { findNearestStops } from '@/utils/routeUtils';
import RouteContainer from "../routeDisplay/RouteContainer";

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
    error: gtfsError 
  } = useGTFSData();

  // 状態管理
  const [fromSpot, setFromSpot] = useState<TouristSpot | null>(null);
  const [toSpot, setToSpot] = useState<TouristSpot | null>(null);
  const [hasTrunk, setHasTrunk] = useState(false);
  const [isReverse, setIsReverse] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [nearestFromStops, setNearestFromStops] = useState<GTFSStop[]>([]);
  const [nearestToStops, setNearestToStops] = useState<GTFSStop[]>([]);

  // データの型アサーション
  const typedRoutes = routes as GTFSRoute[];
  const typedStops = stops as GTFSStop[];
  const typedStopTimes = stopTimes as GTFSStopTime[];

  // 最寄りバス停の計算
  const findNearestStopsResult = (spot: TouristSpot | null) => {
    if (!spot || !stops.length) return [];
    return findNearestStops(spot, typedStops);
  };

  // ルート計算
  const routeResult = useRouteCalculation({
    fromSpot: isReverse ? toSpot : fromSpot,
    toSpot: isReverse ? fromSpot : toSpot,
    hasTrunk,
    routes: typedRoutes,
    stops: typedStops,
    stopTimes: typedStopTimes,
    vehicles,
    fareAttributes,
    fareRules
  });

  // 検索開始
  const handleSearch = () => {
    if (!fromSpot || !toSpot || gtfsLoading) return;
    const fromStops = findNearestStopsResult(fromSpot);
    const toStops = findNearestStopsResult(toSpot);
    setNearestFromStops(fromStops);
    setNearestToStops(toStops);
    setShowDebug(true);
    setIsSearching(true);
  };

  // 方向を反転
  const handleReverseDirection = () => {
    setIsReverse(!isReverse);
    setIsSearching(false);  // 検索状態をリセット
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
          <SheetTitle className="text-white mt-5">観光地間のルート案内</SheetTitle>

          {/* 出発地・目的地の選択 */}
          <div className="space-y-4 mt-4">
            {/* 出発地選択 */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <Label className="block text-white mb-2">
                {isReverse ? '到着地' : '出発地'}
              </Label>
              <select
                className="w-full bg-neutral-700 text-white p-2 rounded"
                onChange={(e) => {
                  const spot = TOURIST_SPOTS.find(s => s.id === e.target.value);
                  setFromSpot(spot || null);
                  setIsSearching(false);  // 選択変更時に検索状態をリセット
                  setShowDebug(false);  // デバッグ情報をリセット
                }}
                value={fromSpot?.id || ""}
              >
                <option value="">選択してください</option>
                {TOURIST_SPOTS.map(spot => (
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
                {isReverse ? '出発地' : '到着地'}
              </Label>
              <select
                className="w-full bg-neutral-700 text-white p-2 rounded"
                onChange={(e) => {
                  const spot = TOURIST_SPOTS.find(s => s.id === e.target.value);
                  setToSpot(spot || null);
                  setIsSearching(false);  // 選択変更時に検索状態をリセット
                  setShowDebug(false);  // デバッグ情報をリセット
                }}
                value={toSpot?.id || ""}
              >
                <option value="">選択してください</option>
                {TOURIST_SPOTS.map(spot => (
                  <option key={spot.id} value={spot.id}>
                    {spot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* トランクチェック */}
            <div className="bg-neutral-800 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="trunk"
                  checked={hasTrunk}
                  onCheckedChange={(checked) => {
                    setHasTrunk(checked as boolean);
                    setIsSearching(false);  // チェック変更時に検索状態をリセット
                  }}
                />
                <Label
                  htmlFor="trunk"
                  className="text-white font-medium cursor-pointer"
                >
                  トランクの所持
                </Label>
              </div>
            </div>

            {/* 検索ボタン */}
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
            {showDebug && (
              <div className="mt-4 bg-neutral-800 p-4 rounded-lg overflow-auto max-h-[500px]">
                <h3 className="text-white font-medium mb-2">データ確認</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <div>
                    <p>GTFSデータのロード状態: {gtfsLoading ? 'ロード中' : 'ロード完了'}</p>
                    <p>エラー状態: {gtfsError ? 'エラーあり' : 'エラーなし'}</p>
                    <p>Routes: {routes.length}件</p>
                    <p>Stops: {stops.length}件</p>
                    <p>StopTimes: {stopTimes.length}件</p>
                  </div>

                  <div className="mt-4 border-t border-neutral-700 pt-4">
                    <p className="font-medium mb-2">選択された地点:</p>
                    <p>出発地: {fromSpot?.name} ({fromSpot?.position.join(', ')})</p>
                    <p>目的地: {toSpot?.name} ({toSpot?.position.join(', ')})</p>
                  </div>

                  <div className="mt-4 border-t border-neutral-700 pt-4">
                    <p className="font-medium mb-2">最寄りバス停:</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-white">出発地周辺:</p>
                        <ul className="ml-4 list-disc">
                          {nearestFromStops.map(stop => (
                            <li key={stop.stop_id}>
                              {stop.stop_name} ({stop.stop_lat}, {stop.stop_lon})
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-white">目的地周辺:</p>
                        <ul className="ml-4 list-disc">
                          {nearestToStops.map(stop => (
                            <li key={stop.stop_id}>
                              {stop.stop_name} ({stop.stop_lat}, {stop.stop_lon})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-neutral-700 pt-4">
                    <p className="font-medium mb-2">最初のRouteデータ:</p>
                    <pre className="whitespace-pre-wrap break-words bg-neutral-700 p-2 rounded">
                      {JSON.stringify(routes[0], null, 2)}
                    </pre>
                  </div>

                  <div className="mt-4 border-t border-neutral-700 pt-4">
                    <p className="font-medium mb-2">最初のStopデータ:</p>
                    <pre className="whitespace-pre-wrap break-words bg-neutral-700 p-2 rounded">
                      {JSON.stringify(stops[0], null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ルート表示 */}
          {(isSearching && !gtfsLoading && fromSpot && toSpot && routes.length > 0 && stops.length > 0 && stopTimes.length > 0) && (
            <RouteContainer
              result={routeResult}
              loading={gtfsLoading}
            />
          )}
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}