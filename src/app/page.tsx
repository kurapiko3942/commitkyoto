'use client'

import dynamic from 'next/dynamic'

// Leafletはクライアントサイドでのみ動作するため、dynamic importを使用
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
})

export default function Home() {
  return (
    
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Map/>
      </main>  
    
  );
}
