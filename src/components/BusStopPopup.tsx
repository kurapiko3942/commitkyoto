"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GTFSStop, GTFSStopTime, GTFSRoute, GTFSTrip } from "@/types/gtfsTypes";
import { Object3D } from "three/webgpu";

export const BusStopPopup = ({
  stop,
  stopTimes,
  routes,
  trips,
}: {
  stop: GTFSStop;
  stopTimes: GTFSStopTime[];
  routes: GTFSRoute[];
  trips: GTFSTrip[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // このバス停の時刻表を取得・整理する関数
  const getScheduleInfo = () => {
    // 現在時刻を取得
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

    // このバス停の時刻表を取得
    const stopSchedules = stopTimes
      .filter(time => time.stop_id === stop.stop_id && time.departure_time >= currentTime)
      .slice(0, 10); // 次の10便を取得

    // 時刻表を路線情報と結合
    return stopSchedules.map(schedule => {
      const trip = trips.find(t => t.trip_id === schedule.trip_id);
      const route = routes.find(r => r.route_id === trip?.route_id);

      return {
        time: schedule.departure_time,
        routeName: route?.route_short_name || '不明',
        destination: trip?.trip_headsign || '不明',
        tripId: schedule.trip_id
      };
    });
  };

  
  useEffect(() => {
    if (!containerRef.current) return;

    // シーン、カメラ、レンダラーのセットアップ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3.5);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // ライトの設定
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    

    // GLTFLoader で3Dモデルをロード
    const loader = new GLTFLoader();
    let model: Object3D;

    const modelPath =
      stop.stop_id === "55"
        ? "/model1.glb"
        : stop.stop_id === "56"
        ? "/model2.glb"
        : stop.stop_id === "61_2"
        ? "/C6.glb"
        : stop.stop_id === "61"
        ? "/D3.glb"
        : stop.stop_id === "61_1"
        ? "/C3.glb"
        : stop.stop_id === "61_3"
        ? "/D2.glb"
        : stop.stop_id === "55_4"
        ? "/E.glb"
        : stop.stop_id === "55_1"
        ? "/B.glb"
        : stop.stop_id === "55"
        ? "/C.glb"
        : stop.stop_id === "73_1"
        ? "/siA.glb"
        : stop.stop_id === "73_3"
        ? "/siA.glb"
        : stop.stop_id === "127"
        ? "/ki2.glb"
        : stop.stop_id === "127_1"
        ? "/ki3.glb"
        : "/default.glb";
    

    loader.load(
      modelPath,
      (gltf: GLTF) => {
        model = gltf.scene;
        model.scale.set(0.2, 0.2, 0.2);
        model.position.set(0, 0, 0);
        scene.add(model);
        animate();
      },
      undefined,
      (error: Error) => {
        console.error("Error loading model:", error);
      }
    );

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.005;
      renderer.render(scene, camera);
    };

    // クリーンアップ
    return () => {
      renderer.dispose();
      scene.clear();
    };
  }, [stop.stop_id]);

  const scheduleInfo = getScheduleInfo();

  return (
    <div className="text-sm max-h-[500px]">
      <div className="mb-2">
        <h3 className="font-bold text-base">バス停: {stop.stop_name}</h3>
        <p className="text-xs text-gray-600">ID: {stop.stop_id}</p>
      </div>

      {/* 3Dモデルを表示するコンテナ */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "150px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "8px"
        }}
      ></div>

      {/* 時刻表 */}
      <div>
        <h4 className="font-semibold text-sm mb-2 text-gray-700">次のバス</h4>
        <div className="overflow-y-auto max-h-[180px]">
          {scheduleInfo.length > 0 ? (
            <div className="space-y-1.5">
              {scheduleInfo.map((info, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-2 rounded hover:bg-gray-100 transition-colors"
                >
                  {/* 路線番号と時刻を1行目に配置 */}
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-base">{info.routeName}</span>
                    <span className="text-base">{info.time}</span>
                  </div>
                  {/* 行き先を2行目に配置 */}
                  <div className="text-xs text-gray-600 truncate">
                    →{info.destination}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-2 text-sm">
              本日の運行は終了しました
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
