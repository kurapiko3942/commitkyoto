//src/components/layouts/SideBar.tsx
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getRoutenameFromRouteId } from "@/utils/getRouteToStop";
import { getStopTimeFromRouteAndStop } from "@/utils/getRouteToStop";
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
// 観光地の一覧
import { Input } from "@/components/ui/input";
import { GTFSStop, GTFSRealtimeVehicle } from "@/types/gtfsTypes";
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
  const [busRouteName, setBusRouteName] = useState<string | null>(null);
  const [routesList, setRoutesList] = useState<
    {
      matchedStopName: string | null;
      fromSpot: string;
      id: number;
    }[]
  >([]);

  // ルート計算

  // 検索開始
  const handleSearch = () => {
    if (!fromSpot || !toSpot || gtfsLoading) return;
    // 出発地から最寄りのバス停を取得
    setRoutesList([]);
    const fromStop = StartToStopMinimumDistanceStop(
      fromSpot,
      stops,
      Number(fromDistance)
    );
    // 目的地から1km圏内最寄りのバス停を取得
    // 目的地から1km圏内最寄りのバス停を取得
    const toStops = BusStopsToTo(toSpot, stops, Number(toDistance));
    if (fromStop) {
      fromStop.forEach((fromStop) => {
        // 出発地に対応するルートを取得
        const allRoutes = getRouteFromStop(fromStop, stopTimes, trips, routes);
        // ルートに対応する停留所を取得
        const StopssAndId = allRoutes.map((route) => ({
          id: route.route_id,
          stopss: getStopFromRoute(route, stopTimes, trips, stops),
        }));
        //取得したルートに目的地が含まれているかをルートそれぞれのstopsを確認することにより確認
        //このroutesが目的地に到達するルートのリスト
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
        setBus(matchedVehicles);

        setRoutesList((prevRoutesList) => {
          const newRoutesList = [...prevRoutesList, ...fitAllRoutes];
          const uniqueRoutesList = newRoutesList.filter(
            (route, index, self) =>
              index === self.findIndex((r) => r.id === route.id)
          );
          return [...uniqueRoutesList];
        });
        //ルートにマッチするリアルタイムバスを表示
      });
    }
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
              disabled={!fromSpot || !toSpot || gtfsLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              経路を検索
            </Button>
            {routesList.map((route, index) => {
              const matchedRoute = routes.find((r) => r.route_id === route.id);

              const matchedBus = bus?.filter(
                (vehicle) => vehicle.vehicle?.trip?.routeId == route.id
              );
              console.log("ma", matchedBus);
              const routeName =
                matchedRoute?.route_long_name ||
                getRoutenameFromRouteId(route.id, routes);
              return (
                <div className="bg-neutral-800 p-4 rounded-lg" key={index}>
                  <Label className="block text-white mb-2">
                    {matchedRoute?.route_long_name}
                  </Label>
                  <Label className="block text-white mb-2">
                    出発駅:{route.fromSpot}
                  </Label>
                  <Label className="block text-white mb-2">
                    到着駅:{route.matchedStopName}
                  </Label>
                  <Label className="block text-white mb-2">
                    バスID:
                    {matchedBus &&
                      matchedBus.map((vehicle) => vehicle.vehicle?.vehicle?.id)}
                  </Label>
                  <Label className="block text-white mb-2">
                    混雑度:
                    {matchedBus &&
                      matchedBus.map(
                        (vehicle) => vehicle.vehicle?.occupancyStatus
                      )}
                  </Label>
                </div>
              );
            })}

            {/* データ確認用の表示領域 */}
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
