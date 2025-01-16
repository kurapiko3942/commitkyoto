import { GTFSStop, GTFSStopTime, GTFSRoute } from "@/types/gtfsTypes";
import { useState } from "react";

// components/BusStopPopup.tsx
export const BusStopPopup = ({ 
    stop, 
    stopTimes, 
    routes 
  }: {
    stop: GTFSStop;
    stopTimes: GTFSStopTime[];
    routes: GTFSRoute[];
  }) => {
    const [showAllTimes, setShowAllTimes] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  
    // このバス停の時刻表を取得
    const stopTimesForThisStop = stopTimes.filter(st => st.stop_id === stop.stop_id);
  
    // 次の3便を取得
    const nextDepartures = stopTimesForThisStop
      .slice(0, 3)
      .sort((a, b) => a.departure_time.localeCompare(b.departure_time));
  
    return (
      <div className="text-sm">
        <h3 className="font-bold mb-1">バス停: {stop.stop_name}</h3>
        <p>ID: {stop.stop_id}</p>
        
        <div className="mt-2">
          <h4 className="font-semibold">次の出発時刻</h4>
          {!showAllTimes ? (
            <>
              {nextDepartures.map((time, index) => (
                <div key={index} className="text-gray-600">
                  {time.departure_time}
                </div>
              ))}
              <button
                onClick={() => setShowAllTimes(true)}
                className="text-blue-500 text-sm mt-2"
              >
                すべての時刻を表示
              </button>
            </>
          ) : (
            <>
              {stopTimesForThisStop.map((time, index) => (
                <div key={index} className="text-gray-600">
                  {time.departure_time}
                </div>
              ))}
              <button
                onClick={() => setShowAllTimes(false)}
                className="text-blue-500 text-sm mt-2"
              >
                表示を縮小
              </button>
            </>
          )}
        </div>
      </div>
    );
  };