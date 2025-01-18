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
            <a href="#app-overview" className="block text-blue-600 hover:underline">
              2. アプリの主な機能
            </a>
            <a href="#bus-icon" className="block text-blue-600 hover:underline">
              3. バスアイコン
            </a>
            <a href="#bus-stop" className="block text-blue-600 hover:underline">
              4. バス停機能
            </a>
            <a href="#route-search" className="block text-blue-600 hover:underline">
              5. 経路検索ツール
            </a>
          </nav>
        </section>

        {/* 各セクション */}
        <div className="space-y-16">
          {/* はじめに */}
          <section id="introduction" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">1. はじめに</h2>
            <div className="prose max-w-none space-y-6">
              <h3 className="text-xl font-semibold">『混みっと京都』とは</h3>
              <p>
                『混みっと京都』は、京都の「混み」にCommitする革新的なバス状況案内アプリです。
                リアルタイムで京都市内のバスの移動を反映し、効率的で快適な公共交通機関の利用をサポートします。
              </p>
              <p>
                複雑な京都の公共交通機関をシンプルに、そして分かりやすく。
                バスの現在地、混雑状況、最適なルートをワンタッチで確認できます。
              </p>
            </div>
          </section>

          {/* アプリ概要 */}
          <section id="app-overview" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">2. アプリの主な機能</h2>
            <div className="prose max-w-none space-y-6">
              <p>このアプリは、3つの主要な機能で京都の移動をサポートします：</p>
              <ul>
                <li>リアルタイムで移動する『バスアイコン』</li>
                <li>詳細な情報を提供する『バス停アイコン』</li>
                <li>最適なルートを見つける『経路検索ツール』</li>
              </ul>
            </div>
          </section>

          {/* バスアイコン */}
          <section id="bus-icon" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">3. バスアイコン</h2>
            <div className="prose max-w-none space-y-6">
              <p>
                公共交通GTFSリアルタイムデータに基づき、十数秒おきにバスの位置を更新します。
                各バスアイコンには、以下の詳細情報が含まれています：
              </p>
              <ul>
                <li>正確な位置情報</li>
                <li>バスの路線名</li>
                <li>現在の混雑度</li>
                <li>移動速度（停車中は0m/s）</li>
              </ul>
              <p>
                特に混雑度は、バスアイコンの色によって直感的に理解できるよう設計されています。
                一目で空席状況が分かり、快適な移動計画を立てられます。
              </p>
            </div>
          </section>

          {/* バス停アイコン */}
          <section id="bus-stop" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">4. バス停機能</h2>
            <div className="prose max-w-none space-y-6">
              <p>
                京都市内の各バス停を詳細に表示。バス停をタップすることで、以下の情報にアクセスできます：
              </p>
              <ul>
                <li>実際のバス停を模した3Dモデル</li>
                <li>通過するバス路線</li>
                <li>次に到着するバスの時刻</li>
              </ul>
              <p>
                複雑に集中するバス停の中でも、目的の場所を迷わず見つけられます。
              </p>
            </div>
          </section>

          {/* 経路検索ツール */}
          <section id="route-search" className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-6">5. 経路検索ツール</h2>
            <div className="prose max-w-none space-y-6">
              <p>画面右上の経路検索ツールで、最適な移動ルートを簡単に見つけられます。</p>
              <h3 className="text-xl font-semibold">経路検索の手順</h3>
              <ol>
                <li>出発地点と目的地点を設定</li>
                <li>出発地点・到着地点から探索範囲（メートル）を指定</li>
                <li>「経路を検索」ボタンをクリック</li>
                <li>複数のルートが表示される</li>
                <li>各ルートの詳細を確認
                  <ul>
                    <li>バスの路線</li>
                    <li>発着バス停</li>
                    <li>バスの混雑度</li>
                  </ul>
                </li>
                <li>比較して最適なルートを選択</li>
              </ol>
              <p>
                異なる路線の混雑状況を一目で比較し、快適な移動を計画できます。
              </p>
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