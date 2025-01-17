"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GTFSStop, GTFSStopTime, GTFSRoute } from "@/types/gtfsTypes";

export const BusStopPopup = ({
  stop,
  stopTimes,
  routes,
}: {
  stop: GTFSStop;
  stopTimes: GTFSStopTime[];
  routes: GTFSRoute[];
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // シーン、カメラ、レンダラーのセットアップ
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60, // FOVを少し広げる（デフォルトは75）
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 3.5); // カメラの距離を少し遠くに設定
    camera.lookAt(0, 1, 0); // モデルの中心にカメラを向ける

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
    let model: THREE.Object3D;

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
      (gltf: { scene: any; }) => {
        model = gltf.scene;
        model.scale.set(0.2, 0.2, 0.2); // モデルのスケールを少し小さめに設定
        model.position.set(0, 0, 0); // モデルの中央を基準に配置
        scene.add(model);
        animate();
      },
      undefined,
      (error: any) => {
        console.error("Error loading model:", error);
      }
    );

    // アニメーションループ
    const animate = () => {
      requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.005; // モデルをゆっくり回転
      renderer.render(scene, camera);
    };

    // クリーンアップ
    return () => {
      renderer.dispose();
      scene.clear();
    };
  }, [stop.stop_id]);

  return (
    <div className="text-sm">
      <h3 className="font-bold mb-1">バス停: {stop.stop_name}</h3>
      <p>ID: {stop.stop_id}</p>

      {/* 3Dモデルを表示するコンテナ */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "200px", // 高さを固定
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      ></div>

      <div className="mt-2">
        <h4 className="font-semibold">次の出発時刻</h4>
        {stopTimes.slice(0, 3).map((time, index) => (
          <div key={index} className="text-gray-600">
            {time.departure_time}
          </div>
        ))}
      </div>
    </div>
  );
};
