import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { F1Driver, F1CarData, F1Position, F1Lap, F1Location, F1Session, F1TeamRadio } from "@shared/schema";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import CircuitSelection from "@/components/CircuitSelection";
import DriverSelection from "@/components/DriverSelection";
import ActiveDriverHeader from "@/components/ActiveDriverHeader";
import TelemetryGauges from "@/components/TelemetryGauges";
import TrackMap from "@/components/TrackMap";
import LapComparisonChart from "@/components/LapComparisonChart";
import TeamRadio from "@/components/TeamRadio";
import MobileNav from "@/components/MobileNav";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sessionKey, setSessionKey] = useState<string>("7953"); // Default to Bahrain GP Race
  const [selectedDriver, setSelectedDriver] = useState<F1Driver | null>(null);
  const [comparisonDrivers, setComparisonDrivers] = useState<F1Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllDrivers, setShowAllDrivers] = useState(true);

  // Fetch session data
  const { 
    data: sessions = [], 
    refetch: refetchSessions,
    isLoading: isLoadingSessions,
    isError: isErrorSessions
  } = useQuery<F1Session[]>({
    queryKey: ['/api/sessions'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch drivers for session
  const { 
    data: drivers = [], 
    refetch: refetchDrivers,
    isLoading: isLoadingDrivers,
    isError: isErrorDrivers
  } = useQuery<F1Driver[]>({
    queryKey: [`/api/drivers?session_key=${sessionKey}`],
    enabled: sessionKey !== '',
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch positions
  const { 
    data: positions = [], 
    refetch: refetchPositions,
    isLoading: isLoadingPositions,
    isError: isErrorPositions 
  } = useQuery<F1Position[]>({
    queryKey: [`/api/positions?session_key=${sessionKey}`],
    enabled: sessionKey !== '',
    staleTime: 10 * 1000, // 10 seconds for dynamic position data
  });

  // Fetch recent lap data
  const { 
    data: laps = [], 
    refetch: refetchLaps,
    isLoading: isLoadingLaps,
    isError: isErrorLaps
  } = useQuery<F1Lap[]>({
    queryKey: [`/api/laps?session_key=${sessionKey}`],
    enabled: sessionKey !== '',
    staleTime: 10 * 1000, // 10 seconds for dynamic lap data
  });

  // Fetch location data
  const { 
    data: locations = [], 
    refetch: refetchLocations,
    isLoading: isLoadingLocations,
    isError: isErrorLocations
  } = useQuery<F1Location[]>({
    queryKey: [`/api/locations?session_key=${sessionKey}`],
    enabled: sessionKey !== '',
    staleTime: 10 * 1000, // 10 seconds for dynamic track position data
  });

  // Fetch car telemetry data for selected driver
  const { 
    data: carData = null, 
    refetch: refetchCarData,
    isLoading: isLoadingCarData,
    isError: isErrorCarData
  } = useQuery<F1CarData | null>({
    queryKey: [
      `/api/car_data?session_key=${sessionKey}${selectedDriver ? `&driver_number=${selectedDriver.driver_number}` : ''}`
    ],
    enabled: !!selectedDriver && sessionKey !== '',
    staleTime: 5 * 1000, // 5 seconds for real-time telemetry
  });

  // Fetch team radio data
  const { 
    data: teamRadio = [], 
    refetch: refetchTeamRadio,
    isLoading: isLoadingTeamRadio,
    isError: isErrorTeamRadio
  } = useQuery<F1TeamRadio[]>({
    queryKey: [
      `/api/team_radio?session_key=${sessionKey}${selectedDriver ? `&driver_number=${selectedDriver.driver_number}` : ''}`
    ],
    enabled: !!selectedDriver && sessionKey !== '',
    staleTime: 60 * 1000, // 1 minute for team radio messages
  });

  // When session changes, update selected driver
  useEffect(() => {
    if (drivers.length > 0 && !selectedDriver) {
      // Default to first driver (usually P1)
      setSelectedDriver(drivers[0]);
      
      // Set up comparison drivers (top 3 if available)
      const topDrivers = drivers.slice(0, Math.min(3, drivers.length));
      setComparisonDrivers(topDrivers);
    }
  }, [drivers, selectedDriver]);

  // Track loading state for all data
  useEffect(() => {
    const allDataLoading = 
      isLoadingSessions || 
      isLoadingDrivers || 
      isLoadingPositions || 
      isLoadingLaps || 
      isLoadingLocations;
    
    // Set to not loading once all data has loaded
    if (!allDataLoading && isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Slight delay for smoother transition
    }
    
    // If the saved session (7953) is not found in sessions, pick a valid one
    if (sessions.length > 0 && !sessions.find(s => s.session_key.toString() === sessionKey)) {
      // Find a race session if possible, otherwise use first session
      const raceSession = sessions.find(s => s.session_name === 'Race');
      const bestSession = raceSession || sessions[0];
      console.log(`Session ${sessionKey} not found, using ${bestSession.session_key}`);
      setSessionKey(bestSession.session_key.toString());
    }
    
    // Show toast for errors
    if (isErrorSessions || isErrorDrivers || isErrorPositions) {
      toast({
        title: "Error Loading Data",
        description: "There was a problem loading F1 data. Please try refreshing.",
        variant: "destructive"
      });
    }
  }, [
    isLoadingSessions, isLoadingDrivers, isLoadingPositions, 
    isLoadingLaps, isLoadingLocations, sessions, 
    isErrorSessions, isErrorDrivers, isErrorPositions, 
    isLoading, sessionKey, toast
  ]);

  // Handle session change
  const handleSessionChange = (newSessionKey: string) => {
    setSessionKey(newSessionKey);
    setSelectedDriver(null); // Reset selected driver when session changes
    setComparisonDrivers([]);
    setIsLoading(true);
    
    // Give a brief loading period to fetch new data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle driver selection
  const handleDriverSelect = (driver: F1Driver) => {
    setSelectedDriver(driver);
    
    // If driver isn't in comparison drivers and we have fewer than 3, add them
    if (!comparisonDrivers.find(d => d.driver_number === driver.driver_number) && comparisonDrivers.length < 3) {
      setComparisonDrivers([...comparisonDrivers, driver]);
    }
    
    // When selecting a driver, stop showing all drivers if we were
    if (showAllDrivers) {
      setShowAllDrivers(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Refetch all data
    Promise.all([
      refetchSessions(),
      refetchDrivers(),
      refetchPositions(),
      refetchLaps(),
      refetchLocations(),
      refetchCarData(),
      refetchTeamRadio()
    ]).then(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "The latest telemetry data has been loaded",
      });
    }).catch(error => {
      setIsLoading(false);
      toast({
        title: "Error Refreshing Data",
        description: "There was an error loading the latest data",
        variant: "destructive"
      });
    });
  };

  // Handle toggle for showing all drivers
  const toggleDriverVisibility = () => {
    setShowAllDrivers(!showAllDrivers);
  };

  // Get active session details
  const activeSession = sessions.find(s => s.session_key.toString() === sessionKey);
  const circuitName = activeSession?.circuit_short_name || "Unknown Circuit";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LoadingScreen isLoading={isLoading} />
      
      <Header 
        onRefresh={handleRefresh}
        activeCircuit={circuitName}
      />
      
      <main className="container mx-auto px-4 py-6 mb-20">
        <AnimatePresence>
          {!isLoading && (
            <>
              <CircuitSelection 
                sessions={sessions}
                selectedSession={sessionKey}
                onSessionChange={handleSessionChange}
              />
              
              <DriverSelection 
                drivers={drivers}
                positions={positions}
                laps={laps}
                selectedDriver={selectedDriver}
                onSelectDriver={handleDriverSelect}
              />
              
              {selectedDriver && (
                <>
                  <ActiveDriverHeader 
                    driver={selectedDriver}
                    positions={positions}
                    laps={laps.filter(lap => lap.driver_number === selectedDriver.driver_number)}
                  />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    <TelemetryGauges 
                      carData={carData}
                      driverNumber={selectedDriver.driver_number}
                    />
                    
                    <motion.div className="flex flex-col gap-6">
                      <TrackMap 
                        drivers={showAllDrivers ? drivers : [selectedDriver]}
                        positions={positions}
                        locations={locations}
                        selectedDriver={selectedDriver}
                        circuitName={circuitName}
                        countryName={activeSession?.country_name || "Unknown Country"}
                      />
                    
                      <div className="text-right">
                        <button
                          onClick={toggleDriverVisibility}
                          className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                        >
                          {showAllDrivers ? "Show Only Selected Driver" : "Show All Drivers"}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    <LapComparisonChart 
                      drivers={drivers}
                      laps={laps}
                      selectedDrivers={comparisonDrivers}
                    />
                    
                    <TeamRadio 
                      driver={selectedDriver}
                      sessionKey={sessionKey}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </AnimatePresence>
      </main>
      
      <MobileNav />
    </div>
  );
}
