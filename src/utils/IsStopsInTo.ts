import { GTFSStop } from "../types/gtfsTypes";
/**
 * 目的地の停留所をルート内のバス停に含まれているかどうかを確認する
 * @param stops 一つのルートが止まるバス停
 * @param toStops 目的地のバス停の配列
 * @returns 目的地のバス停がルート内のバス停に含まれているかどうか
 */
export const IsStopsInTo = (stops: GTFSStop[], toStops: GTFSStop[]): bool => {
  return toStops.some((toStop) => stops.includes(toStop));
};
