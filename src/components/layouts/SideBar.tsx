"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getRoutenameFromRouteId } from "@/utils/getRouteToStop";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useGTFSData } from "@/hooks/useGTFSData";
import { TouristSpot } from "@/types/routeTypes";
import {
  StartToStopMinimumDistanceStop,
  BusStopsToTo,
} from "@/utils/StartToStopMinimumDistanceStop";
import { ArrowLeftRight, Search } from "lucide-react";
import { getRouteFromStop, getStopFromRoute } from "@/utils/getRouteToStop";
import { IsStopsInTo } from "@/utils/IsStopsInTo";
import { Input } from "@/components/ui/input";
import { GTFSStop, GTFSRealtimeVehicle } from "@/types/gtfsTypes";

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

// 占有状況に対応するバスアイコンのマッピング
const OCCUPANCY_ICONS: { [key: string]: string } = {
  EMPTY: "/bus-icon-1.svg",
  MANY_SEATS_AVAILABLE: "/bus-icon-2.svg",
  FEW_SEATS_AVAILABLE: "/bus-icon-3.svg",
  STANDING_ROOM_ONLY: "/bus-icon-4.svg",
  CRUSHED_STANDING_ROOM: "/bus-icon-6.svg",
  FULL: "/bus-icon-6.svg",
  NOT_ACCEPTING: "/bus-icon-7.svg",
  UNKNOWN: "/bus-icon-5.svg", // デフォルトアイコン
};

// 混雑度の日本語変換マップ
const OCCUPANCY_STATUS_LABELS: { [key: string]: string } = {
  EMPTY: "空席多数",
  MANY_SEATS_AVAILABLE: "空席あり",
  FEW_SEATS_AVAILABLE: "空席わずか",
  STANDING_ROOM_ONLY: "立ち席のみ",
  CRUSHED_STANDING_ROOM: "非常に混雑",
  FULL: "満席",
  NOT_ACCEPTING: "乗車不可",
  UNKNOWN: "不明",
};

// 占有状況に応じたアイコンを取得する関数
const getOccupancyIcon = (occupancyStatus?: string) => {
  return (
    OCCUPANCY_ICONS[occupancyStatus || "UNKNOWN"] || OCCUPANCY_ICONS["UNKNOWN"]
  );
};

// ローディングスケルトン
const RouteLoadingSkeleton = () => {
  return (
    <div className="bg-neutral-800 p-4 rounded-lg mb-2 animate-pulse">
      <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-neutral-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-neutral-700 rounded w-2/3 mb-2"></div>

      {/* バスローディングスケルトン */}
      <div className="flex items-center space-x-2 mt-2 bg-neutral-700 p-2 rounded">
        <div className="w-8 h-8 bg-neutral-600 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-neutral-600 rounded w-1/2"></div>
          <div className="h-3 bg-neutral-600 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default function SideBar() {
  // GTFS データの取得
  const {
    routes,
    stops,
    stopTimes,
    vehicles,
    trips,
    loading: gtfsLoading,
    error: gtfsError,
  } = useGTFSData();

  // 状態管理
  const [fromSpot, setFromSpot] = useState<TouristSpot | null>(null);
  const [toSpot, setToSpot] = useState<TouristSpot | null>(null);
  const [fromDistance, setFromDistance] = useState("0");
  const [toDistance, setToDistance] = useState("0");
  const [isReverse, setIsReverse] = useState(false);
  const [bus, setBus] = useState<GTFSRealtimeVehicle[]>();
  const [routesList, setRoutesList] = useState<
    {
      matchedStopName: string | null;
      fromSpot: string;
      id: number;
    }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  // 検索開始
  const handleSearch = async () => {
    if (!fromSpot || !toSpot) return;

    try {
      // 検索中フラグをON
      setIsSearching(true);
      setRoutesList([]);

      setBus(undefined);

      // 非同期処理をシミュレート（必要に応じて実際の処理に置き換え）
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 出発地から最寄りのバス停を取得
      const fromStop = StartToStopMinimumDistanceStop(
        fromSpot,
        stops,
        Number(fromDistance)
      );

      // 目的地から1km圏内最寄りのバス停を取得
      const toStops = BusStopsToTo(toSpot, stops, Number(toDistance));

      if (fromStop) {
        fromStop.forEach((fromStop) => {
          // 出発地に対応するルートを取得
          const allRoutes = getRouteFromStop(
            fromStop,
            stopTimes,
            trips,
            routes
          );

          // ルートに対応する停留所を取得
          const StopssAndId = allRoutes.map((route) => ({
            id: route.route_id,
            stopss: getStopFromRoute(route, stopTimes, trips, stops),
          }));

          // 取得したルートに目的地が含まれているかを確認
          const fitAllRoutes = StopssAndId.map((stops) => {
            const matchedStopName = IsStopsInTo(stops.stopss, toStops);
            return {
              ...stops,
              matchedStopName,
              fromSpot: fromStop.stop_name,
            };
          }).filter((stops) => {
            return typeof stops.matchedStopName === "string";
          });

          const matchedVehicles = vehicles.filter((vehicle) => {
            return fitAllRoutes.some(
              (route) => route.id == vehicle.vehicle?.trip?.routeId
            );
          });

          setBus((prevBus) => {
            return [...(prevBus || []), ...matchedVehicles];
          });

          setRoutesList((prevRoutesList) => {
            const newRoutesList = [...prevRoutesList, ...fitAllRoutes];
            const uniqueRoutesList = newRoutesList.filter(
              (route, index, self) =>
                index === self.findIndex((r) => r.id === route.id)
            );
            return [...uniqueRoutesList];
          });
        });
      }
    } catch (error) {
      console.error("検索中にエラーが発生しました", error);
    } finally {
      // 検索中フラグをOFF
      setIsSearching(false);
    }
  };

  // 方向を反転
  const handleReverseDirection = () => {
    setIsReverse(!isReverse);
    // 状態をリセット
    setFromSpot(null);
    setToSpot(null);
    setFromDistance("0");
    setToDistance("0");
    setRoutesList([]);
    setBus(undefined);
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
            <Input
              type="number"
              className="text-white"
              step="0.1"
              value={fromDistance}
              placeholder="出発地からバス停までの距離"
              onChange={(e) => {
                setFromDistance(e.target.value);
              }}
            />

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
            <Input
              className="text-white"
              type="number"
              step="0.1"
              placeholder="目的地からバス停までの距離"
              onChange={(e) => {
                setToDistance(e.target.value);
              }}
              value={toDistance}
            />
            <Button
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSearch}
              disabled={!fromSpot || !toSpot || isSearching}
            >
              <Search className="mr-2 h-4 w-4" />
              経路を検索
            </Button>

            {/* 検索結果表示 */}
            {isSearching ? (
              // 検索中のローディングスケルトンUI
              <>
                <RouteLoadingSkeleton />
                <RouteLoadingSkeleton />
                <RouteLoadingSkeleton />
              </>
            ) : // 検索結果の表示
            routesList.length > 0 ? (
              routesList.map((route, index) => {
                const matchedRoute = routes.find(
                  (r) => r.route_id === route.id
                );
                const matchedBus = bus?.filter(
                  (vehicle) => vehicle.vehicle?.trip?.routeId == route.id
                );
                const routeName =
                  matchedRoute?.route_long_name ||
                  getRoutenameFromRouteId(route.id, routes);
                return (
                  <div
                    className="bg-neutral-800 p-4 rounded-lg mb-2"
                    key={index}
                  >
                    <Label className="block text-white mb-2">{routeName}</Label>
                    <Label className="block text-white mb-2">
                      出発駅: {route.fromSpot}
                    </Label>
                    <Label className="block text-white mb-2">
                      到着駅: {route.matchedStopName}
                    </Label>
                    {/* バス情報 */}
                    {matchedBus &&
                      matchedBus.map((vehicle, busIndex) => {
                        const occupancyStatus =
                          vehicle.vehicle?.occupancyStatus;
                        const occupancyIcon = getOccupancyIcon(occupancyStatus);
                        const occupancyLabel =
                          OCCUPANCY_STATUS_LABELS[occupancyStatus || "UNKNOWN"];

                        return (
                          <div
                            key={busIndex}
                            className="flex items-center space-x-2 mt-2 bg-neutral-700 p-2 rounded"
                          >
                            <Image
                              src={occupancyIcon}
                              alt="バス混雑度アイコン"
                              width={32}
                              height={32}
                              className="w-8 h-8"
                            />
                            <div className="flex flex-col">
                              <Label className="text-white">
                                バスID: {vehicle.vehicle?.vehicle?.id}
                              </Label>
                              <div className="flex items-center space-x-2">
                                <Label className="text-white">混雑度:</Label>
                                <span className="text-white font-semibold">
                                  {occupancyLabel}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })
            ) : (
              // 検索結果がない場合のメッセージ
              <div className="text-center text-neutral-400 p-4">
                {fromSpot && toSpot
                  ? "検索条件に一致するルートが見つかりませんでした"
                  : "出発地と到着地を選択して経路を検索してください"}
              </div>
            )}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
