// context/RouteContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';
import { GTFSRoute, GTFSStop } from "@/types/gtfsTypes";

interface SelectedRoute {
  routeId: string | null;
  fromStop: GTFSStop | null;
  toStop: GTFSStop | null;
}

interface RouteContextType {
  selectedRoute: SelectedRoute | null;
  setSelectedRoute: (route: SelectedRoute | null) => void;
}

const RouteContext = createContext<RouteContextType>({
  selectedRoute: null,
  setSelectedRoute: () => {},
});

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const [selectedRoute, setSelectedRoute] = useState<SelectedRoute | null>(null);

  return (
    <RouteContext.Provider value={{ selectedRoute, setSelectedRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export const useRoute = () => useContext(RouteContext);