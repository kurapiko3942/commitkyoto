"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import { useGTFSData } from "@/hooks/useGTFSData";
import SideBar from "@/components/layouts/Bar";
import { GTFSStop, MAP_ICONS } from "@/types/gtfsTypes";
// 京都市の中心座標
const KYOTO_CENTER = { lat: 35.0116, lng: 135.7681 };

// バスのマーカーアイコンを設定
const busIcon = new Icon({
    iconUrl: "/bus-icon.svg",  // publicフォルダ内のbus-icon.svg
    iconSize: [32, 32],  // SVGのサイズに合わせて調整
    iconAnchor: [16, 16],  // アイコンの中心を基準点に
    popupAnchor: [0, -16]  // ポップアップの位置を調整
  });

export default function Map() {
  const { routes, stops, vehicles, loading, error } = useGTFSData();

  useEffect(() => {}, [vehicles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="w-full h-screen relative z-0">
      <div className="absolute right-0 z-10">
        <SideBar />
      </div>
      <MapContainer
        center={[KYOTO_CENTER.lat, KYOTO_CENTER.lng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="relative z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* バス停のマーカー */}
        {stops && stops.map((stop: GTFSStop) => (  // 明示的な型付け
      <Marker
        key={stop.stop_id}
        position={[stop.stop_lat, stop.stop_lon]}
        icon={MAP_ICONS.stopIcon}
      >
        <Popup>
          <div className="text-sm">
            <h3 className="font-bold mb-1">バス停: {stop.stop_name}</h3>
            <p>ID: {stop.stop_id}</p>
          </div>
        </Popup>
      </Marker>
    ))}
        {vehicles &&
          vehicles.map((vehicle) => {
            if (!vehicle.vehicle?.position) return null;

            const routeInfo = routes.find((r) => {
              return r.route_id === vehicle.vehicle?.trip?.routeId;
            });
            return (
              <Marker
                key={vehicle.id}
                position={[
                  vehicle.vehicle.position.latitude,
                  vehicle.vehicle.position.longitude,
                ]}
                icon={busIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold mb-1">バス ID: {vehicle.id}</h3>
                    <p>
                      路線:
                      {`${routeInfo?.route_short_name}${routeInfo?.route_long_name}` ||
                        "不明"}
                    </p>
                    {vehicle.vehicle.position.speed !== undefined && (
                      <p>
                        速度: {Math.round(vehicle.vehicle.position.speed)} m/s
                      </p>
                    )}
                    {vehicle.vehicle.timestamp && (
                      <p>
                        更新:{" "}
                        {new Date(
                          parseInt(vehicle.vehicle.timestamp) * 1000
                        ).toLocaleString("ja-JP")}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}
