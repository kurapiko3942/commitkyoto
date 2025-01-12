'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useGTFSData } from '@/hooks/useGTFSData';

// 京都市の中心座標
const KYOTO_CENTER = { lat: 35.0116, lng: 135.7681 };

// デフォルトのマーカーアイコンを使用
const defaultIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Map() {
  const { routes, vehicles, loading, error } = useGTFSData();

  useEffect(() => {
    console.log('Vehicles data:', vehicles);
  }, [vehicles]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="w-full h-screen">
      <MapContainer
        center={[KYOTO_CENTER.lat, KYOTO_CENTER.lng]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {vehicles && vehicles.map((vehicle) => {
          if (!vehicle.vehicle?.position) return null;
          
          const routeInfo = routes.find(r => r.route_id === vehicle.vehicle?.trip?.route_id);
          
          return (
            <Marker
              key={vehicle.id}
              position={[
                vehicle.vehicle.position.latitude,
                vehicle.vehicle.position.longitude
              ]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold mb-1">バス ID: {vehicle.id}</h3>
                  <p>路線: {routeInfo?.route_long_name || vehicle.vehicle.trip?.route_id || '不明'}</p>
                  {vehicle.vehicle.position.speed !== undefined && (
                    <p>速度: {Math.round(vehicle.vehicle.position.speed)} m/s</p>
                  )}
                  {vehicle.vehicle.timestamp && (
                    <p>
                      更新: {
                        new Date(parseInt(vehicle.vehicle.timestamp) * 1000)
                          .toLocaleString('ja-JP')
                      }
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