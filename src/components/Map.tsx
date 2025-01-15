"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngTuple } from "leaflet";
import { useGTFSData } from "@/hooks/useGTFSData";
import SideBar from "@/components/layouts/Bar";
import { GTFSStop, MAP_ICONS } from "@/types/gtfsTypes";
import { PhotoSlider } from "./PhotoSlider";
import { getOccupancyStatusColor, getOccupancyStatusText } from "@/utils/occupancyStatus";

// 京都市の中心座標
const KYOTO_CENTER: LatLngTuple = [35.0116, 135.7681];

// バスのマーカーアイコンを設定
const busIcon = new Icon({
  iconUrl: "/bus-icon.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

interface TouristLandmark {
  id: string;
  name: string;
  nameEn: string;
  position: LatLngTuple;
  placeId: string;
}

interface PlaceDetails {
  id: string;
  name: string;
  nameEn: string;
  photoUrls: string[];  // 複数の写真URL
  iconUrl: string;      // アイコン用の写真URL
  photoUrl: string;
  rating: number;
  userRatingsTotal: number;
  address: string;
  openingHours: string[];
  currentPopularity?: number;  // 追加
}

// 観光地の基本情報
const TOURIST_LANDMARKS: TouristLandmark[] = [
  {
    id: "kinkakuji",
    name: "金閣寺",
    nameEn: "Kinkakuji Temple",
    placeId: "ChIJvUbrwCCoAWARX2QiHCsn5A4",
    position: [35.0394, 135.7292] as LatLngTuple,
  },
  {
    id: "ginkakuji",
    name: "銀閣寺",
    nameEn: "Ginkakuji Temple",
    placeId: "ChIJ4W9CCwUJAWARyauI6BzKiiU",
    position: [35.0271, 135.7982] as LatLngTuple,
  },
  {
    id: "kiyomizu",
    name: "清水寺",
    nameEn: "Kiyomizu-dera",
    placeId: "ChIJB_vchdMIAWARujTEUIZlr2I",
    position: [34.9948, 135.7847] as LatLngTuple,
  },
  {
    id: "shijo",
    name: "四条河原町",
    nameEn: "Shijo Kawaramachi",
    placeId: "ChIJfSMkVQAJAWARTaaPhI0MBos",
    position: [35.0038, 135.7682] as LatLngTuple,
  },
  {
    id: "kyotostation",
    name: "京都駅",
    nameEn: "Kyoto Station",
    placeId: "ChIJ7wKLka4IAWARCByidG5EGrY",
    position: [34.9858, 135.7588] as LatLngTuple,
  }
];

export default function Map() {
  const { routes, stops, vehicles, loading, error } = useGTFSData();
  const [placeDetails, setPlaceDetails] = useState<Record<string, PlaceDetails>>({});
  const [landmarkIcons, setLandmarkIcons] = useState<Record<string, Icon>>({});

  // 観光地の写真とアイコンを生成する関数
  const createLandmarkIcon = (iconUrl: string) => {
    return new Icon({
      iconUrl,
      iconSize: [50, 50],
      iconAnchor: [25, 25],
      popupAnchor: [0, -25],
      className: 'rounded-full border-2 border-white shadow-lg hover:border-blue-500 transition-all'
    });
  };

  // 観光地の詳細情報を取得
  useEffect(() => {
    const fetchPlaceDetails = async () => {
      try {
        for (const landmark of TOURIST_LANDMARKS) {
          const response = await fetch(`/api/places/${landmark.placeId}`);
          if (!response.ok) continue;

          const details = await response.json();
          setPlaceDetails(prev => ({
            ...prev,
            [landmark.id]: details
          }));

          if (details.photoUrl) {
            setLandmarkIcons(prev => ({
              ...prev,
              [landmark.id]: createLandmarkIcon(details.photoUrl)
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching place details:', error);
      }
    };

    fetchPlaceDetails();
  }, []);

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
        center={KYOTO_CENTER}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="relative z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* 観光地のマーカー */}
        {TOURIST_LANDMARKS.map((landmark) => {
 const details = placeDetails[landmark.id];
 const icon = details?.iconUrl ? 
   createLandmarkIcon(details.iconUrl) : 
   createLandmarkIcon('/landmark-default.svg');

 // 混雑度を表示するヘルパー関数
 const getCrowdLevel = (popularity: number | undefined) => {
   if (popularity === undefined) return "データなし";
   if (popularity < 30) return "空いています";
   if (popularity < 60) return "やや混雑";
   if (popularity < 85) return "混雑";
   return "大変混雑";
 };

 // 混雑度に応じた色を返すヘルパー関数
 const getCrowdLevelColor = (popularity: number | undefined) => {
   if (popularity === undefined) return "text-gray-500";
   if (popularity < 30) return "text-green-600";
   if (popularity < 60) return "text-yellow-600";
   if (popularity < 85) return "text-orange-600";
   return "text-red-600";
 };

 return (
   <Marker
     key={landmark.id}
     position={landmark.position}
     icon={icon}
   >
     <Popup>
       <div className="text-sm max-w-xs">
         <h3 className="font-bold text-lg mb-1">{details?.name || landmark.name}</h3>
         <p className="text-gray-600 mb-2">{details?.nameEn || landmark.nameEn}</p>
         
         {/* 混雑度の表示を追加 */}
         {details?.currentPopularity !== undefined && (
           <p className={`mb-2 ${getCrowdLevelColor(details.currentPopularity)}`}>
             <span className="font-semibold">混雑状況: </span>
             {getCrowdLevel(details.currentPopularity)}
             <span className="text-sm ml-1">
               ({details.currentPopularity}%)
             </span>
           </p>
         )}
         
         {details?.photoUrls && (
           <PhotoSlider 
             photos={details.photoUrls}
             placeName={details.name}
           />
         )}
         
         {details?.rating && (
           <div className="flex items-center mb-2">
             <span className="text-yellow-500">★</span>
             <span className="ml-1">{details.rating}</span>
             <span className="text-gray-500 ml-2">
               ({details.userRatingsTotal} reviews)
             </span>
           </div>
         )}
         
         {details?.address && (
           <div className="text-gray-600 mb-2">
             <div className="font-semibold">住所:</div>
             <div>{details.address}</div>
           </div>
         )}

         {details?.openingHours && details.openingHours.length > 0 && (
           <div className="text-gray-600">
             <div className="font-semibold">営業時間:</div>
             <div className="text-xs">
               {details.openingHours.map((hours, index) => (
                 <div key={index}>{hours}</div>
               ))}
             </div>
           </div>
         )}
       </div>
     </Popup>
   </Marker>
 );
})}

        {/* バス停のマーカー */}
        {stops && stops.map((stop: GTFSStop) => (
          <Marker
            key={stop.stop_id}
            position={[stop.stop_lat, stop.stop_lon] as LatLngTuple}
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

        {/* バスの現在位置マーカー */}
        // バスの現在位置マーカーの部分を修正
        {vehicles &&
  vehicles.map((vehicle) => {
    if (!vehicle.vehicle?.position) return null;

    const routeId = vehicle.vehicle?.trip?.routeId;
    const routeInfo = routes.find((r) => {
        return r.route_id === vehicle.vehicle?.trip?.routeId;
      });
    // デバッグログを追加
    console.log('Current RouteId:', routeId);
    console.log('All Routes:', routes);
    console.log('Found RouteInfo:', routeInfo);
    
    const position: LatLngTuple = [
      vehicle.vehicle.position.latitude,
      vehicle.vehicle.position.longitude
    ];
    // デバッグ用
    console.log('RouteInfo for', routeId, ':', routeInfo);
    return (
      <Marker
        key={vehicle.id}
        position={position}
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
            <p className={`mb-1 ${getOccupancyStatusColor(vehicle.vehicle?.occupancyStatus || "")}`}>
  混雑度: {getOccupancyStatusText(vehicle.vehicle?.occupancyStatus || "")}
</p>
            {vehicle.vehicle.position.speed !== undefined && (
              <p className="mb-1">
                速度: {Math.round(vehicle.vehicle.position.speed)} m/s
              </p>
            )}
            {vehicle.vehicle.timestamp && (
              <p>
                更新: {new Date(
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