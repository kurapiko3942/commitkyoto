// utils/distanceUtils.ts
export const distanceUtils = {
  // 2点間の距離をメートル単位で計算（ヘルシン公式）
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // 地球の半径（メートル）
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  },

  // 徒歩時間を計算（分単位）
  calculateWalkingTime(distance: number, speed: number = 80): number {
    return Math.ceil(distance / speed); // 80m/分として計算
  }
};