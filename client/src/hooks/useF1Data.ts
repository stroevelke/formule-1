import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { F1Driver, F1CarData, F1Position, F1Lap, F1Location, F1Session } from "@shared/schema";

interface UseF1DataOptions {
  sessionKey: string;
  driverNumber?: number;
  refreshInterval?: number;
}

interface UseF1DataResult {
  sessions: F1Session[];
  drivers: F1Driver[];
  positions: F1Position[];
  laps: F1Lap[];
  locations: F1Location[];
  carData: F1CarData | null;
  isLoading: boolean;
  isError: boolean;
  refresh: () => void;
}

export function useF1Data({ sessionKey, driverNumber, refreshInterval = 0 }: UseF1DataOptions): UseF1DataResult {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch session data
  const sessionsQuery = useQuery<F1Session[]>({
    queryKey: ['/api/sessions'],
    refetchInterval: refreshInterval,
  });

  // Fetch drivers for session
  const driversQuery = useQuery<F1Driver[]>({
    queryKey: [`/api/drivers?session_key=${sessionKey}`],
    refetchInterval: refreshInterval,
  });

  // Fetch positions
  const positionsQuery = useQuery<F1Position[]>({
    queryKey: [`/api/positions?session_key=${sessionKey}`],
    refetchInterval: refreshInterval,
  });

  // Fetch recent lap data
  const lapsQuery = useQuery<F1Lap[]>({
    queryKey: [`/api/laps?session_key=${sessionKey}`],
    refetchInterval: refreshInterval,
  });

  // Fetch location data
  const locationsQuery = useQuery<F1Location[]>({
    queryKey: [`/api/locations?session_key=${sessionKey}`],
    refetchInterval: refreshInterval,
  });

  // Fetch car telemetry data for selected driver
  const carDataQuery = useQuery<F1CarData | null>({
    queryKey: [
      `/api/car_data?session_key=${sessionKey}${driverNumber ? `&driver_number=${driverNumber}` : ''}`
    ],
    refetchInterval: refreshInterval,
    enabled: !!driverNumber,
  });

  // Combined loading state
  const isLoading = 
    sessionsQuery.isLoading || 
    driversQuery.isLoading || 
    positionsQuery.isLoading || 
    lapsQuery.isLoading || 
    locationsQuery.isLoading || 
    (!!driverNumber && carDataQuery.isLoading) ||
    isRefreshing;

  // Combined error state
  const isError = 
    sessionsQuery.isError || 
    driversQuery.isError || 
    positionsQuery.isError || 
    lapsQuery.isError || 
    locationsQuery.isError || 
    (!!driverNumber && carDataQuery.isError);

  // Manual refresh function
  const refresh = async () => {
    setIsRefreshing(true);
    
    await Promise.all([
      sessionsQuery.refetch(),
      driversQuery.refetch(),
      positionsQuery.refetch(),
      lapsQuery.refetch(),
      locationsQuery.refetch(),
      driverNumber ? carDataQuery.refetch() : Promise.resolve(),
    ]);
    
    setIsRefreshing(false);
  };

  return {
    sessions: sessionsQuery.data || [],
    drivers: driversQuery.data || [],
    positions: positionsQuery.data || [],
    laps: lapsQuery.data || [],
    locations: locationsQuery.data || [],
    carData: carDataQuery.data || null,
    isLoading,
    isError,
    refresh,
  };
}
