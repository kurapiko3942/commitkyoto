//地図表示関連の定数

export const MAP_CONSTANTS = {
    KYOTO_CENTER: {
      lat: 35.0116,
      lng: 135.7681
    },
    DEFAULT_ZOOM: 13,
    UPDATE_INTERVAL: 30000, // 30秒ごとに更新
    TILE_LAYER: {
      URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ATTRIBUTION: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
  };