"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";

const ManualPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-2xl font-bold">アプリケーションマニュアル</h1>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => router.push("/")}
          >
            <HomeIcon className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-6 py-8">
        {/* 目次セクション */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">目次</h2>
          <nav className="space-y-2">
            <a href="#introduction" className="block text-blue-600 hover:underline">
              1. はじめに
            </a>
            <a href="#getting-started" className="block text-blue-600 hover:underline">
              2. 使い方
            </a>
            <a href="#features" className="block text-blue-600 hover:underline">
              3. 主な機能
            </a>
            
          </nav>
        </section>

        {/* 各セクション */}
        <div className="space-y-16">
          {/* はじめに */}
          <section id="introduction" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">1. はじめに</h2>
            <div className="prose max-w-none space-y-6">
              <p>ここにアプリケーションの概要や目的を記述します。</p>
              
              {/* アプリケーション概要図 */}
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
               
              </div>
            </div>
          </section>

          {/* 使い方 */}
          <section id="getting-started" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">2. 使い方</h2>
            <div className="prose max-w-none space-y-8">
              {/* 手順1 */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">2.1 初期設定</h3>
                <p>初期設定の手順を説明します。</p>
                {/* スクリーンショット */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src="/setup-step1.png"
                      alt="初期設定ステップ1"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src="/setup-step2.png"
                      alt="初期設定ステップ2"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 主な機能 */}
          <section id="features" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">3. 主な機能</h2>
            <div className="prose max-w-none space-y-8">
              {/* 機能1 */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">3.1 マップ機能</h3>
                <p>地図上でバスの位置をリアルタイムで確認できます。</p>
                {/* 機能のスクリーンショット */}
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src="/map-feature.png"
                    alt="マップ機能の説明"
                    fill
                    className="object-contain"
                  />
                </div>
                {/* 補足説明 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src="/map-detail1.png"
                      alt="マップ詳細1"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 w-full bg-black/50 p-2">
                      <p className="text-white text-sm">①ピン表示</p>
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src="/map-detail2.png"
                      alt="マップ詳細2"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 w-full bg-black/50 p-2">
                      <p className="text-white text-sm">②情報表示</p>
                    </div>
                  </div>
                  <div className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <Image
                      src="/map-detail3.png"
                      alt="マップ詳細3"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 w-full bg-black/50 p-2">
                      <p className="text-white text-sm">③ルート表示</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          
        </div>
      </main>

      {/* フッター */}
      <footer className="border-t bg-background/95 backdrop-blur">
        <div className="container mx-auto px-6 py-4 text-center text-sm text-muted-foreground">
          © 2025 DoshishaUniversity Miyazaki Zemi. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default ManualPage;