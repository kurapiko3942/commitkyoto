// utils/fareCalculator.ts
import { GTFSFareAttribute, GTFSFareRule } from '../types/gtfsTypes';

export const calculateFare = (
  routeId: number,
  fareAttributes: GTFSFareAttribute[],
  fareRules: GTFSFareRule[]
): number => {
  const rule = fareRules.find(r => r.route_id === routeId);
  if (!rule) return 0;

  const fareAttribute = fareAttributes.find(f => f.fare_id === rule.fare_id);
  return fareAttribute ? fareAttribute.price : 0;
};