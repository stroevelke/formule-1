import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { F1Driver, F1Position, F1Location, F1Session } from "@shared/schema";
import Header from "@/components/Header";
import LoadingScreen from "@/components/LoadingScreen";
import CircuitSelection from "@/components/CircuitSelection";
import TrackMap from "@/components/TrackMap";
import { useToast } from "@/hooks/use-toast";

export default function TrackPage() {
  const { toast } = useToast();
  const [sessionKey, setSessionKey] = useState<string>("latest");
  const [selectedDriver, setSelectedDriver] = useState<F1Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'selected'>('all');
  
  // Fetch session data
  const { data: sessions, refetch: refetchSessions } = useQuery<F1Session[]>({
    queryKey: ['/api/sessions'],
    initialData: [],
  });

  // Fetch drivers for session
  const { data: drivers, refetch: refetchDrivers } = useQuery<F1Driver[]>({
    queryKey: [`/api/drivers?session_key=${sessionKey}`],
    initialData: [],
  });

  // Fetch positions
  const { data: positions, refetch: refetchPositions } = useQuery<F1Position[]>({
    queryKey: [`/api/positions?session_key=${sessionKey}`],
    initialData: [],
  });

  // Fetch location data
  const { data: locations, refetch: refetchLocations } = useQuery<F1Location[]>({
    queryKey: [`/api/locations?session_key=${sessionKey}`],
    initialData: [],
  });
  
  // Get active session details
  const activeSession = sessions.find(s => s.session_key.toString() === sessionKey);
  const circuitName = activeSession?.circuit_short_name || "Unknown Circuit";

  // When session changes, update selected driver
  useEffect(() => {
    if (drivers.length > 0 && !selectedDriver) {
      // Default to first driver
      setSelectedDriver(drivers[0]);
    }
  }, [drivers, selectedDriver]);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle session change
  const handleSessionChange = (newSessionKey: string) => {
    setSessionKey(newSessionKey);
    setSelectedDriver(null);
    setIsLoading(true);
    
    // Give a brief loading period to fetch new data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Handle driver selection
  const handleDriverSelect = (driver: F1Driver) => {
    setSelectedDriver(driver);
    // When selecting a driver from the list, auto switch to driver focus mode
    setViewMode('selected');
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    
    // Refetch all data
    Promise.all([
      refetchSessions(),
      refetchDrivers(),
      refetchPositions(),
      refetchLocations(),
    ]).then(() => {
      setIsLoading(false);
      toast({
        title: "Track Data Refreshed",
        description: "The latest position data has been loaded",
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

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(viewMode === 'all' ? 'selected' : 'all');
  };

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
              
              <div className="mb-6 bg-f1-dark rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-f1 text-2xl font-bold">LIVE TRACK MAP</h2>
                  
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-3">
                      <select 
                        className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2.5 focus:outline-none"
                        value={selectedDriver?.driver_number.toString() || ''}
                        onChange={(e) => {
                          const driver = drivers.find(d => d.driver_number.toString() === e.target.value);
                          if (driver) handleDriverSelect(driver);
                        }}
                      >
                        <option value="">Select Driver</option>
                        {drivers.map(driver => (
                          <option key={driver.driver_number} value={driver.driver_number}>
                            {driver.position ? `P${driver.position} - ` : ''}{driver.name_acronym} ({driver.driver_number})
                          </option>
                        ))}
                      </select>
                      
                      <button
                        onClick={toggleViewMode}
                        className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        {viewMode === 'all' ? "Focus Selected Driver" : "Show All Drivers"}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="aspect-video w-full h-full relative bg-gray-900 rounded-lg overflow-hidden">
                  <TrackMap 
                    drivers={viewMode === 'all' ? drivers : (selectedDriver ? [selectedDriver] : [])}
                    positions={positions}
                    locations={locations}
                    selectedDriver={selectedDriver}
                    circuitName={circuitName}
                    countryName={activeSession?.country_name || "Unknown Country"}
                  />
                  
                  {/* Driver info overlay */}
                  {selectedDriver && (
                    <motion.div 
                      className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg max-w-xs"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: "spring" }}
                    >
                      <div className="flex items-center mb-2">
                        <div 
                          className="w-4 h-4 mr-2 rounded-full"
                          style={{ backgroundColor: `#${selectedDriver.team_colour}` }}
                        />
                        <h3 className="font-f1 text-lg font-bold">{selectedDriver.broadcast_name}</h3>
                      </div>
                      <div className="text-sm">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <div>
                            <span className="text-gray-400">Team:</span>
                          </div>
                          <div>{selectedDriver.team_name}</div>
                          
                          <div>
                            <span className="text-gray-400">Driver #:</span>
                          </div>
                          <div>{selectedDriver.driver_number}</div>
                          
                          <div>
                            <span className="text-gray-400">Position:</span>
                          </div>
                          <div>
                            {positions.find(p => p.driver_number === selectedDriver.driver_number)?.position || '-'}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {/* Driver dots legend */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {drivers.slice(0, 10).map(driver => (
                    <div 
                      key={driver.driver_number}
                      className={`flex items-center rounded px-2 py-1 cursor-pointer ${
                        selectedDriver?.driver_number === driver.driver_number ? 'bg-gray-800' : ''
                      }`}
                      onClick={() => handleDriverSelect(driver)}
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: `#${driver.team_colour}` }}
                      />
                      <span className="text-xs">{driver.name_acronym}</span>
                    </div>
                  ))}
                  {drivers.length > 10 && (
                    <div className="text-xs text-gray-500 flex items-center">
                      +{drivers.length - 10} more
                    </div>
                  )}
                </div>
              </div>
              
              {/* Stats Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <motion.div 
                  className="bg-f1-dark rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="font-f1 text-xl font-bold mb-4">SESSION INFO</h3>
                  {activeSession && (
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-400">CIRCUIT</div>
                        <div className="font-medium">{activeSession.circuit_short_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">SESSION</div>
                        <div className="font-medium">{activeSession.session_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">GRAND PRIX</div>
                        <div className="font-medium">{activeSession.meeting_name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">DATE</div>
                        <div className="font-medium">
                          {new Date(activeSession.date_start).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
                
                <motion.div 
                  className="bg-f1-dark rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-f1 text-xl font-bold mb-4">STANDINGS</h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {[...positions]
                      .sort((a, b) => a.position - b.position)
                      .slice(0, 10)
                      .map(position => {
                        const driver = drivers.find(d => d.driver_number === position.driver_number);
                        if (!driver) return null;
                        
                        return (
                          <div 
                            key={position.driver_number}
                            className={`flex items-center p-2 rounded ${
                              selectedDriver?.driver_number === driver.driver_number ? 'bg-gray-800' : ''
                            }`}
                            onClick={() => handleDriverSelect(driver)}
                          >
                            <div className="w-6 text-center font-medium">P{position.position}</div>
                            <div 
                              className="w-2 h-6 mx-3" 
                              style={{ backgroundColor: `#${driver.team_colour}` }}
                            />
                            <div className="flex-1 flex flex-col">
                              <div className="font-medium">{driver.name_acronym}</div>
                              <div className="text-xs text-gray-400">{driver.team_name}</div>
                            </div>
                            <div className="w-8 text-center bg-gray-800 rounded text-xs py-1">
                              {driver.driver_number}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-f1-dark rounded-lg p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="font-f1 text-xl font-bold mb-4">LOCATION DATA</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-xs text-gray-400">TOTAL LOCATIONS</div>
                      <div className="font-medium">{locations.length}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">DRIVERS TRACKED</div>
                      <div className="font-medium">{
                        new Set(locations.map(loc => loc.driver_number)).size
                      }</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">LAST UPDATE</div>
                      <div className="font-medium">
                        {locations.length > 0 
                          ? new Date(locations[locations.length - 1].date).toLocaleTimeString() 
                          : 'No data'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">TRACK DATA</div>
                      <div className="font-medium flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          locations.length > 100 ? 'bg-f1-green' : 'bg-f1-yellow'
                        } mr-2`}></span>
                        {locations.length > 100 ? 'Good Quality' : 'Limited Data'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}