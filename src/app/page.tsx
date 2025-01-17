"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Map を動的に読み込み
const Map = dynamic(() => import("../components/Map"), { ssr: false });
export default function Home() {
  const [showMap, setShowMap] = useState(false);

  if (showMap) {
    return <Map />;
  }

  return (
    <div className="swiper-container">
      <Swiper modules={[Pagination]} pagination={{ clickable: true }}>
        <SwiperSlide>
          <div className="slide-img">
            <img src="/slide1.png" alt="スライド1" />
          </div>
          <p>混みにコミットで、快適な京都観光を！</p>
        </SwiperSlide>
        <SwiperSlide>
          <div className="slide-img">
            <img src="/slide1.png" alt="スライド1" />
          </div>
          <p>リアルタイムでバスの位置が分かり、モヤモヤしなくていい！</p>
        </SwiperSlide>
        <SwiperSlide>
          <div className="slide-img">
            <img src="/slide1.png" alt="スライド1" />
          </div>
          <button className="start-button" onClick={() => setShowMap(true)}>
            START!
          </button>
        </SwiperSlide>
      </Swiper>
    </div>
  );
}
