"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, LatLngTuple } from "leaflet";
import { useGTFSData } from "@/hooks/useGTFSData";
import SideBar from "@/components/layouts/SideBar";
import { GTFSStop, MAP_ICONS } from "@/types/gtfsTypes";
import { PhotoSlider } from "./PhotoSlider";
import { getOccupancyStatusColor, getOccupancyStatusText } from "@/utils/occupancyStatus";
import { BusStopPopup } from "./BusStopPopup";
import BusLegend from "./BusLegend";

// 京都市の中心座標
const KYOTO_CENTER: LatLngTuple = [35.0116, 135.7681];

// バスの混雑度に応じたアイコンを設定
const busIcons = {
  empty: new Icon({
    iconUrl: "/bus-icon-1.svg",  // #0CF947 - 明るい緑
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  }),
  manySeatsAvailable: new Icon({
    iconUrl: "/bus-icon-2.svg",  // #0CF9ED - 水色
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  }),
  fewSeatsAvailable: new Icon({
    iconUrl: "/bus-icon-3.svg",  // #3CFF91 - 淡い緑
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  }),
  standingRoomOnly: new Icon({
    iconUrl: "/bus-icon-4.svg",  // #9EFFAA - より淡い緑
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  }),
  crushedStandingRoomOnly: new Icon({
    iconUrl: "/bus-icon-5.svg",  // #CB41F9 - 紫
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  }),
  fullStandingRoomOnly: new Icon({
    iconUrl: "/bus-icon-6.svg",  // #F90C0C - 赤
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  }),
  notAcceptingPassengers: new Icon({
    iconUrl: "/bus-icon-7.svg",  // #FF8859 - オレンジ
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  }),
  default: new Icon({
    iconUrl: "/bus-icon.svg",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  })
};

const getBusIconByOccupancy = (occupancyStatus: string) => {
  switch (occupancyStatus) {
    case 'EMPTY':
      return busIcons.empty;
    case 'MANY_SEATS_AVAILABLE':
      return busIcons.manySeatsAvailable;
    case 'FEW_SEATS_AVAILABLE':
      return busIcons.fewSeatsAvailable;
    case 'STANDING_ROOM_ONLY':
      return busIcons.standingRoomOnly;
    case 'CRUSHED_STANDING_ROOM_ONLY':
      return busIcons.crushedStandingRoomOnly;
    case 'FULL_STANDING_ROOM_ONLY':
      return busIcons.fullStandingRoomOnly;
    case 'NOT_ACCEPTING_PASSENGERS':
      return busIcons.notAcceptingPassengers;
    default:
      return busIcons.default;
  }
};

const userLocationIcon = new Icon({
    iconUrl: "/user_location.svg",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'animate-pulse opacity-90'
  });

interface UserLocation {
  position: LatLngTuple;
  accuracy: number;
  heading: number | null;
}

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
  photoUrls: string[];
  iconUrl: string;
  photoUrl: string;
  rating: number;
  userRatingsTotal: number;
  address: string;
  openingHours: string[];
  currentPopularity?: number;
}
// ファイル冒頭部分に既存コードの下に追加
const HowToUseButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        bottom: "2rem",
        right: "2rem",
        zIndex: 1000,
      }}
    >
      {/* "使い方"ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "1rem 2rem",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          borderRadius: ".5rem",
          cursor: "pointer",
        }}
      >
        {isOpen ? "閉じる ×" : "使い方"}
      </button>

      {/* アコーディオン内容 */}
      {isOpen && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1.5rem",
            backgroundColor: "white",
            border: ".1rem solid #ddd",
            borderRadius: ".5rem",
            boxShadow: "0px .4rem .6rem rgba(0, 0, 0, 0.1)",
            width: "30rem",
          }}
        >
          <h3 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>アプリの使い方</h3>
          <div>
            {/* アコーディオンアイテム */}
            <AccordionItem
              question="ルートを検索したい"
              answer="右上の「観光地間ルート検索」を押すと快適なバスのルートを検索することができます。動いているバスをクリックすると快適度を見ることができます。"
            />
            <AccordionItem
              question="バス停の情報を見たい"
              answer="バス停をクリックするとバス停の3Dモデルや時刻表、名前が表示されます。"
            />
            <AccordionItem
              question="今から乗るバスの快適さを知りたい"
              answer="動いているバスをクリックすると快適度を見ることができます。"
            />
          </div>
        </div>
      )}
    </div>
  );
};
const AccordionItem = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      style={{
        border: ".1rem solid #ddd",
        borderRadius: ".5rem",
        marginBottom: "1rem",
        overflow: "hidden",
        boxShadow: isExpanded ? "0px .4rem .6rem rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      {/* 質問部分 */}
      <div
        style={{
          backgroundColor: isExpanded ? "#f9f9f9" : "#fff",
          padding: "1rem",
          cursor: "pointer",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>Q: {question}</span>
        <span>{isExpanded ? "▲" : "▼"}</span>
      </div>

      {/* 回答部分（開閉可能） */}
      {isExpanded && (
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#fff",
            borderTop: "1px solid #ddd",
          }}
        >
          <span style={{ color: "#007BFF", fontWeight: "bold" }}>A:</span>{" "}
          {answer}
        </div>
      )}
    </div>
  );
};


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
  const { routes, stops, vehicles, stopTimes, loading, error } = useGTFSData();
  const [placeDetails, setPlaceDetails] = useState<Record<string, PlaceDetails>>({});
  const [landmarkIcons, setLandmarkIcons] = useState<Record<string, Icon>>({});
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

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

  // 位置情報の取得
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }
  
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: UserLocation = {
          position: [position.coords.latitude, position.coords.longitude],
          accuracy: position.coords.accuracy,
          heading: position.coords.heading
        };
        setUserLocation(newLocation);
      },
      (err: GeolocationPositionError) => {
        const errorMessage = {
          1: "位置情報の使用が許可されていません",
          2: "位置情報を取得できません",
          3: "位置情報の取得がタイムアウトしました"
        }[err.code] || "位置情報の取得に失敗しました";
        
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Geolocation error: ${errorMessage}`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

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
        
        {/* 現在位置のマーカー */}
        {userLocation && (
          <Marker
            position={userLocation.position}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold mb-1">現在地</h3>
                <p className="text-gray-600">精度: {Math.round(userLocation.accuracy)}m</p>
                {userLocation.heading !== null && (
                  <p className="text-gray-600">
                    方角: {Math.round(userLocation.heading)}°
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* 観光地のマーカー */}
        {TOURIST_LANDMARKS.map((landmark) => {
          const details = placeDetails[landmark.id];
          const icon = details?.iconUrl ? 
            createLandmarkIcon(details.iconUrl) : 
            createLandmarkIcon('/landmark-default.svg');

          const getCrowdLevel = (popularity: number | undefined) => {
            if (popularity === undefined) return "データなし";
            if (popularity < 30) return "空いています";
            if (popularity < 60) return "やや混雑";
            if (popularity < 85) return "混雑";
            return "大変混雑";
          };

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
              <BusStopPopup 
                stop={stop}
                stopTimes={stopTimes}
                routes={routes}
              />
            </Popup>
          </Marker>
        ))}

        {/* バスの現在位置マーカー */}
        {vehicles && vehicles.map((vehicle) => {
          if (!vehicle.vehicle?.position) return null;

          const routeId = vehicle.vehicle?.trip?.routeId;
          const routeInfo = routes.find((r) => {
            return r.route_id == vehicle.vehicle?.trip?.routeId;
          });
          
          const position: LatLngTuple = [
            vehicle.vehicle.position.latitude,
            vehicle.vehicle.position.longitude
          ];

          // 混雑度に基づいてアイコンを選択
          const currentIcon = getBusIconByOccupancy(vehicle.vehicle?.occupancyStatus || "");

          return (
            <Marker
              key={vehicle.id}
              position={position}
              icon={currentIcon}
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

      {/* "使い方"ボタン */}
      <HowToUseButton />
      {/* 混雑度早見表 */}
    <BusLegend />
    </div>
  );
}